import { randomBytes } from "node:crypto";
import { config } from "../config.js";
import { AppError, ErrorCodes } from "../domain/errors.js";
import type { DiscountCode } from "../domain/types.js";
import type { MemoryStore } from "../store/memory-store.js";

export function calculateDiscountCents(subtotalCents: number, percentOff: number): number {
  // Floor avoids fractional cent drift on odd subtotals (e.g. 999 @ 10% -> 99).
  return Math.floor((subtotalCents * percentOff) / 100);
}

function generateCodeString(percentOff: number): string {
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `SAVE${percentOff}-${suffix}`;
}

export class DiscountService {
  constructor(private readonly store: MemoryStore) {}

  findNextUnissuedMilestone(): number | null {
    const { nthOrder } = config;
    const { completedOrderCount } = this.store;

    // Walk milestones in order so a missed milestone (e.g. 3) can still be issued after count moves to 4+.
    for (let milestone = nthOrder; milestone <= completedOrderCount; milestone += nthOrder) {
      if (!this.store.hasIssuedMilestone(milestone)) {
        return milestone;
      }
    }
    return null;
  }

  generateDiscountCode(): DiscountCode {
    const milestone = this.findNextUnissuedMilestone();
    if (milestone === null) {
      throw new AppError(
        409,
        ErrorCodes.MILESTONE_NOT_ELIGIBLE,
        "No unissued eligible discount milestone exists yet",
      );
    }

    if (this.store.hasIssuedMilestone(milestone)) {
      throw new AppError(
        409,
        ErrorCodes.MILESTONE_ALREADY_ISSUED,
        `Discount code already issued for milestone order ${milestone}`,
      );
    }

    const discountCode: DiscountCode = {
      code: generateCodeString(config.discountPercent),
      percentOff: config.discountPercent,
      status: "active",
      milestoneOrderNumber: milestone,
      createdAt: new Date().toISOString(),
    };

    this.store.addDiscountCode(discountCode);
    return discountCode;
  }

  resolveActiveDiscount(code: string, subtotalCents: number): {
    discountCents: number;
    record: DiscountCode;
  } {
    const record = this.store.findDiscountCode(code);
    if (!record) {
      throw new AppError(404, ErrorCodes.UNKNOWN_DISCOUNT_CODE, `Discount code not found: ${code}`);
    }
    if (record.status === "used") {
      throw new AppError(400, ErrorCodes.DISCOUNT_CODE_USED, `Discount code already used: ${code}`);
    }

    const discountCents = calculateDiscountCents(subtotalCents, record.percentOff);
    return { discountCents, record };
  }

  markDiscountUsed(
    record: DiscountCode,
    orderId: string,
    orderNumber: number,
    discountCents: number,
  ): void {
    record.status = "used";
    record.usedAt = new Date().toISOString();
    record.usedOnOrderId = orderId;
    record.usedOnOrderNumber = orderNumber;
    record.discountCentsApplied = discountCents;
  }
}
