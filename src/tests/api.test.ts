import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createStore } from "../store/memory-store.js";

describe("HTTP API", () => {
  it("runs happy path through Fastify inject", async () => {
    const store = createStore();
    const app = buildApp({ store });
    await app.ready();

    const health = await app.inject({ method: "GET", url: "/health" });
    expect(health.statusCode).toBe(200);
    expect(health.json()).toEqual({ status: "ok" });

    const products = await app.inject({ method: "GET", url: "/products" });
    expect(products.statusCode).toBe(200);
    expect(products.json().products.length).toBeGreaterThan(0);

    const addItem = await app.inject({
      method: "POST",
      url: "/customers/cust_1/cart/items",
      payload: { productId: "prod_1", quantity: 1 },
    });
    expect(addItem.statusCode).toBe(200);

    for (let i = 0; i < 3; i++) {
      const checkout = await app.inject({
        method: "POST",
        url: "/customers/cust_1/checkout",
        payload: {},
      });
      expect(checkout.statusCode).toBe(201);
      if (i < 2) {
        await app.inject({
          method: "POST",
          url: "/customers/cust_1/cart/items",
          payload: { productId: "prod_1", quantity: 1 },
        });
      }
    }

    const generate = await app.inject({
      method: "POST",
      url: "/admin/discount-codes/generate",
      payload: {},
    });
    expect(generate.statusCode).toBe(201);
    const code = generate.json().code as string;

    await app.inject({
      method: "POST",
      url: "/customers/cust_1/cart/items",
      payload: { productId: "prod_1", quantity: 1 },
    });

    const discountedCheckout = await app.inject({
      method: "POST",
      url: "/customers/cust_1/checkout",
      payload: { discountCode: code },
    });
    expect(discountedCheckout.statusCode).toBe(201);
    expect(discountedCheckout.json().discountCents).toBeGreaterThan(0);

    const stats = await app.inject({ method: "GET", url: "/admin/stats" });
    expect(stats.statusCode).toBe(200);
    expect(stats.json().completedOrderCount).toBe(4);

    await app.close();
  });
});
