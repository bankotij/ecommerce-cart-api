import type { AdminStats, DiscountCodeSummary } from "../domain/types.js";
import type { MemoryStore } from "../store/memory-store.js";

export class StatsService {
  constructor(private readonly store: MemoryStore) {}

  getStats(): AdminStats {
    const orders = this.store.orders;

    const completedOrderCount = orders.length;
    const itemsPurchasedCount = orders.reduce(
      (sum, order) => sum + order.items.reduce((lineSum, item) => lineSum + item.quantity, 0),
      0,
    );
    const grossRevenueCents = orders.reduce((sum, order) => sum + order.subtotalCents, 0);
    const netRevenueCents = orders.reduce((sum, order) => sum + order.totalCents, 0);
    const totalDiscountCents = orders.reduce((sum, order) => sum + order.discountCents, 0);

    const discountCodes: DiscountCodeSummary[] = this.store.discountCodes.map((code) => ({
      code: code.code,
      percentOff: code.percentOff,
      status: code.status,
      milestoneOrderNumber: code.milestoneOrderNumber,
      createdAt: code.createdAt,
      usedAt: code.usedAt,
      usedOnOrderNumber: code.usedOnOrderNumber,
      discountCentsApplied: code.discountCentsApplied,
    }));

    return {
      completedOrderCount,
      itemsPurchasedCount,
      grossRevenueCents,
      netRevenueCents,
      totalDiscountCents,
      discountCodes,
    };
  }
}
