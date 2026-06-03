import { describe, expect, it } from "vitest";
import { AppError, ErrorCodes } from "../domain/errors.js";
import { CartService } from "../services/cart.service.js";
import { CheckoutService } from "../services/checkout.service.js";
import { calculateDiscountCents, DiscountService } from "../services/discount.service.js";
import { createStore } from "../store/memory-store.js";

function createStack() {
  const store = createStore();
  const cartService = new CartService(store);
  const discountService = new DiscountService(store);
  const checkoutService = new CheckoutService(store, cartService, discountService);
  return { store, cartService, discountService, checkoutService };
}

function placeOrder(checkoutService: CheckoutService, cartService: CartService, customerId = "cust_1") {
  cartService.addItem(customerId, "prod_1", 1);
  checkoutService.checkout(customerId);
}

describe("DiscountService", () => {
  it("floors discount cents for odd subtotals", () => {
    expect(calculateDiscountCents(999, 10)).toBe(99);
  });

  it("fails to generate coupon before nth order", () => {
    const { discountService, checkoutService, cartService } = createStack();
    placeOrder(checkoutService, cartService);
    placeOrder(checkoutService, cartService);

    expect(() => discountService.generateDiscountCode()).toThrow(AppError);
    try {
      discountService.generateDiscountCode();
    } catch (error) {
      expect(error).toMatchObject({
        statusCode: 409,
        code: ErrorCodes.MILESTONE_NOT_ELIGIBLE,
      });
    }
  });

  it("generates coupon after nth order", () => {
    const { discountService, checkoutService, cartService } = createStack();
    placeOrder(checkoutService, cartService);
    placeOrder(checkoutService, cartService);
    placeOrder(checkoutService, cartService);

    const coupon = discountService.generateDiscountCode();
    expect(coupon.milestoneOrderNumber).toBe(3);
    expect(coupon.status).toBe("active");
  });

  it("generates missed milestone coupon after order count moves past nth", () => {
    const { discountService, checkoutService, cartService } = createStack();
    for (let i = 0; i < 4; i++) {
      placeOrder(checkoutService, cartService);
    }

    const coupon = discountService.generateDiscountCode();
    expect(coupon.milestoneOrderNumber).toBe(3);
  });

  it("prevents duplicate generation for the same milestone", () => {
    const { discountService, checkoutService, cartService } = createStack();
    for (let i = 0; i < 3; i++) {
      placeOrder(checkoutService, cartService);
    }

    discountService.generateDiscountCode();
    expect(() => discountService.generateDiscountCode()).toThrow(AppError);
    try {
      discountService.generateDiscountCode();
    } catch (error) {
      expect(error).toMatchObject({
        statusCode: 409,
        code: ErrorCodes.MILESTONE_NOT_ELIGIBLE,
      });
    }
  });

  it("generates next milestone after 2n orders when first milestone was issued", () => {
    const { discountService, checkoutService, cartService } = createStack();
    for (let i = 0; i < 6; i++) {
      placeOrder(checkoutService, cartService);
    }

    const first = discountService.generateDiscountCode();
    expect(first.milestoneOrderNumber).toBe(3);

    const second = discountService.generateDiscountCode();
    expect(second.milestoneOrderNumber).toBe(6);
  });
});
