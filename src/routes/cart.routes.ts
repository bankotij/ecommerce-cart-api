import type { FastifyInstance } from "fastify";
import {
  addCartItemBodySchema,
  cartViewSchema,
  customerIdParamsSchema,
} from "../schemas/cart.schema.js";
import type { CartService } from "../services/cart.service.js";

export function registerCartRoutes(app: FastifyInstance, cartService: CartService): void {
  app.post(
    "/customers/:customerId/cart/items",
    {
      schema: {
        params: customerIdParamsSchema,
        body: addCartItemBodySchema,
        response: { 200: cartViewSchema },
      },
    },
    async (request) => {
      const { customerId } = request.params as { customerId: string };
      const { productId, quantity } = request.body as { productId: string; quantity: number };
      return cartService.addItem(customerId, productId, quantity);
    },
  );

  app.get(
    "/customers/:customerId/cart",
    {
      schema: {
        params: customerIdParamsSchema,
        response: { 200: cartViewSchema },
      },
    },
    async (request) => {
      const { customerId } = request.params as { customerId: string };
      return cartService.getCart(customerId);
    },
  );
}
