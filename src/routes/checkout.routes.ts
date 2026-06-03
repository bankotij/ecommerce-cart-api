import type { FastifyInstance } from "fastify";
import { customerIdParamsSchema } from "../schemas/cart.schema.js";
import { checkoutBodySchema, orderSchema } from "../schemas/checkout.schema.js";
import type { CheckoutService } from "../services/checkout.service.js";

export function registerCheckoutRoutes(app: FastifyInstance, checkoutService: CheckoutService): void {
  app.post(
    "/customers/:customerId/checkout",
    {
      schema: {
        params: customerIdParamsSchema,
        body: checkoutBodySchema,
        response: { 201: orderSchema },
      },
    },
    async (request, reply) => {
      const { customerId } = request.params as { customerId: string };
      const body = (request.body ?? {}) as { discountCode?: string };
      const order = checkoutService.checkout(customerId, body.discountCode);
      return reply.status(201).send(order);
    },
  );
}
