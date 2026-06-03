import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import { AppError } from "./domain/errors.js";
import { registerAdminDiscountRoutes } from "./routes/admin.routes.js";
import { registerCartRoutes } from "./routes/cart.routes.js";
import { registerCheckoutRoutes } from "./routes/checkout.routes.js";
import { registerProductRoutes } from "./routes/products.routes.js";
import { CartService } from "./services/cart.service.js";
import { CheckoutService } from "./services/checkout.service.js";
import { DiscountService } from "./services/discount.service.js";
import { createStore, type MemoryStore } from "./store/memory-store.js";

export type AppDependencies = {
  store: MemoryStore;
};

export function buildApp(deps: AppDependencies = { store: createStore() }): FastifyInstance {
  const app = Fastify({ logger: false });
  const cartService = new CartService(deps.store);
  const discountService = new DiscountService(deps.store);
  const checkoutService = new CheckoutService(deps.store, cartService, discountService);

  app.get("/health", async () => ({ status: "ok" }));
  registerProductRoutes(app, deps.store);
  registerCartRoutes(app, cartService);
  registerCheckoutRoutes(app, checkoutService);
  registerAdminDiscountRoutes(app, discountService);

  app.setErrorHandler((error: FastifyError, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: error.message, code: error.code });
    }
    if (error.validation) {
      return reply.status(400).send({
        error: "Invalid request",
        code: "INVALID_REQUEST",
      });
    }
    return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_ERROR" });
  });

  return app;
}
