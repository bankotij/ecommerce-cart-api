import { randomUUID } from "node:crypto";
import { AppError, ErrorCodes } from "../domain/errors.js";
import type { Order, OrderLine } from "../domain/types.js";
import type { MemoryStore } from "../store/memory-store.js";
import type { CartService } from "./cart.service.js";
import type { DiscountService } from "./discount.service.js";

export class CheckoutService {
  constructor(
    private readonly store: MemoryStore,
    private readonly cartService: CartService,
    private readonly discountService: DiscountService,
  ) {}

  checkout(customerId: string, discountCode?: string): Order {
    const cart = this.cartService.getCart(customerId);
    if (cart.items.length === 0) {
      throw new AppError(400, ErrorCodes.EMPTY_CART, "Cannot checkout an empty cart");
    }

    const items: OrderLine[] = cart.items.map((item) => ({ ...item }));
    const subtotalCents = cart.subtotalCents;

    let discountCents = 0;
    let appliedCode: string | undefined;
    let discountRecord;

    if (discountCode !== undefined && discountCode.length > 0) {
      const resolved = this.discountService.resolveActiveDiscount(discountCode, subtotalCents);
      discountCents = resolved.discountCents;
      discountRecord = resolved.record;
      appliedCode = discountCode;
    }

    const totalCents = subtotalCents - discountCents;

    const order: Order = {
      id: randomUUID(),
      orderNumber: this.store.nextOrderNumber,
      customerId,
      items,
      subtotalCents,
      discountCents,
      totalCents,
      discountCode: appliedCode,
      createdAt: new Date().toISOString(),
    };

    this.store.addOrder(order);

    if (discountRecord) {
      this.discountService.markDiscountUsed(
        discountRecord,
        order.id,
        order.orderNumber,
        discountCents,
      );
    }

    this.store.setCartEntries(customerId, []);
    return order;
  }
}
