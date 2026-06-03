import type { FastifyInstance } from "fastify";
import { adminStatsSchema, discountCodeSchema } from "../schemas/admin.schema.js";
import type { DiscountService } from "../services/discount.service.js";
import type { StatsService } from "../services/stats.service.js";

export function registerAdminRoutes(
  app: FastifyInstance,
  discountService: DiscountService,
  statsService: StatsService,
): void {
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

  app.get(
    "/admin/stats",
    {
      schema: {
        response: { 200: adminStatsSchema },
      },
    },
    async () => statsService.getStats(),
  );
}
