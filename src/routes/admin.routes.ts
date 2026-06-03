import type { FastifyInstance } from "fastify";
import { discountCodeSchema } from "../schemas/admin.schema.js";
import type { DiscountService } from "../services/discount.service.js";

export function registerAdminDiscountRoutes(app: FastifyInstance, discountService: DiscountService): void {
  app.post(
    "/admin/discount-codes/generate",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
        },
        response: { 201: discountCodeSchema },
      },
    },
    async (_request, reply) => {
      const discountCode = discountService.generateDiscountCode();
      return reply.status(201).send(discountCode);
    },
  );
}
