import { describe, expect, it } from "vitest";
import { CartService } from "../services/cart.service.js";
import { CheckoutService } from "../services/checkout.service.js";
import { DiscountService } from "../services/discount.service.js";
import { StatsService } from "../services/stats.service.js";
import { createStore } from "../store/memory-store.js";

describe("StatsService", () => {
  it("returns accurate stats after multiple orders", () => {
    const store = createStore();
    const cartService = new CartService(store);
    const discountService = new DiscountService(store);
    const checkoutService = new CheckoutService(store, cartService, discountService);
    const statsService = new StatsService(store);

    for (let i = 0; i < 3; i++) {
      cartService.addItem("cust_1", "prod_1", 1);
      checkoutService.checkout("cust_1");
    }

    const coupon = discountService.generateDiscountCode();
    cartService.addItem("cust_1", "prod_3", 2);
    checkoutService.checkout("cust_1", coupon.code);

    const stats = statsService.getStats();

    expect(stats.completedOrderCount).toBe(4);
    expect(stats.itemsPurchasedCount).toBe(5);
    expect(stats.grossRevenueCents).toBe(1500 * 3 + 999 * 2);
    expect(stats.totalDiscountCents).toBe(199);
    expect(stats.netRevenueCents).toBe(stats.grossRevenueCents - stats.totalDiscountCents);
    expect(stats.discountCodes).toHaveLength(1);
    expect(stats.discountCodes[0]?.status).toBe("used");
    expect(stats.discountCodes[0]?.discountCentsApplied).toBe(199);
  });
});
