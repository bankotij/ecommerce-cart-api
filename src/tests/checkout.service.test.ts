import { describe, expect, it } from "vitest";
import { AppError, ErrorCodes } from "../domain/errors.js";
import { CartService } from "../services/cart.service.js";
import { CheckoutService } from "../services/checkout.service.js";
import { DiscountService } from "../services/discount.service.js";
import { createStore } from "../store/memory-store.js";

function createCheckoutStack() {
  const store = createStore();
  const cartService = new CartService(store);
  const discountService = new DiscountService(store);
  const checkoutService = new CheckoutService(store, cartService, discountService);
  return { store, cartService, discountService, checkoutService };
}

describe("CheckoutService", () => {
  it("rejects checkout for empty cart", () => {
    const { checkoutService } = createCheckoutStack();

    expect(() => checkoutService.checkout("cust_1")).toThrow(AppError);
    try {
      checkoutService.checkout("cust_1");
    } catch (error) {
      expect(error).toMatchObject({
        statusCode: 400,
        code: ErrorCodes.EMPTY_CART,
      });
    }
  });

  it("checks out without coupon", () => {
    const { cartService, checkoutService, store } = createCheckoutStack();
    cartService.addItem("cust_1", "prod_1", 1);

    const order = checkoutService.checkout("cust_1");

    expect(order.orderNumber).toBe(1);
    expect(order.subtotalCents).toBe(1500);
    expect(order.discountCents).toBe(0);
    expect(order.totalCents).toBe(1500);
    expect(store.completedOrderCount).toBe(1);
    expect(cartService.getCart("cust_1").items).toHaveLength(0);
  });

  it("rejects unknown coupon", () => {
    const { cartService, checkoutService } = createCheckoutStack();
    cartService.addItem("cust_1", "prod_1", 1);

    expect(() => checkoutService.checkout("cust_1", "SAVE10-UNKNOWN")).toThrow(AppError);
    try {
      checkoutService.checkout("cust_1", "SAVE10-UNKNOWN");
    } catch (error) {
      expect(error).toMatchObject({
        statusCode: 404,
        code: ErrorCodes.UNKNOWN_DISCOUNT_CODE,
      });
    }
  });

  it("applies a valid coupon and prevents reuse", () => {
    const { cartService, checkoutService, discountService, store } = createCheckoutStack();

    for (let i = 0; i < 3; i++) {
      cartService.addItem("cust_1", "prod_1", 1);
      checkoutService.checkout("cust_1");
    }

    const coupon = discountService.generateDiscountCode();

    cartService.addItem("cust_1", "prod_1", 1);
    const order = checkoutService.checkout("cust_1", coupon.code);

    expect(order.discountCents).toBe(150);
    expect(order.totalCents).toBe(1350);
    expect(store.findDiscountCode(coupon.code)?.status).toBe("used");

    cartService.addItem("cust_1", "prod_1", 1);
    expect(() => checkoutService.checkout("cust_1", coupon.code)).toThrow(AppError);
    try {
      checkoutService.checkout("cust_1", coupon.code);
    } catch (error) {
      expect(error).toMatchObject({
        statusCode: 400,
        code: ErrorCodes.DISCOUNT_CODE_USED,
      });
    }
  });
});
