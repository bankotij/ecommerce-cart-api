import { describe, expect, it } from "vitest";
import { AppError, ErrorCodes } from "../domain/errors.js";
import { CartService } from "../services/cart.service.js";
import { createStore } from "../store/memory-store.js";

describe("CartService", () => {
  it("adds a valid item to cart", () => {
    const store = createStore();
    const cartService = new CartService(store);

    const cart = cartService.addItem("cust_1", "prod_1", 2);

    expect(cart.customerId).toBe("cust_1");
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({
      productId: "prod_1",
      quantity: 2,
      unitPriceCents: 1500,
      lineTotalCents: 3000,
    });
    expect(cart.subtotalCents).toBe(3000);
  });

  it("merges quantities when the same product is added twice", () => {
    const store = createStore();
    const cartService = new CartService(store);

    cartService.addItem("cust_1", "prod_1", 1);
    const cart = cartService.addItem("cust_1", "prod_1", 2);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]?.quantity).toBe(3);
    expect(cart.subtotalCents).toBe(4500);
  });

  it.each([0, -1, 1.5])("rejects invalid quantity %s", (quantity) => {
    const store = createStore();
    const cartService = new CartService(store);

    expect(() => cartService.addItem("cust_1", "prod_1", quantity)).toThrow(AppError);
    try {
      cartService.addItem("cust_1", "prod_1", quantity);
    } catch (error) {
      expect(error).toMatchObject({
        statusCode: 400,
        code: ErrorCodes.INVALID_QUANTITY,
      });
    }
    expect(cartService.getCart("cust_1").items).toHaveLength(0);
  });

  it("rejects unknown product", () => {
    const store = createStore();
    const cartService = new CartService(store);

    expect(() => cartService.addItem("cust_1", "prod_missing", 1)).toThrow(AppError);
    try {
      cartService.addItem("cust_1", "prod_missing", 1);
    } catch (error) {
      expect(error).toMatchObject({
        statusCode: 404,
        code: ErrorCodes.UNKNOWN_PRODUCT,
      });
    }
  });
});
