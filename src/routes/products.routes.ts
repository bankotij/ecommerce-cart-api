import type { FastifyInstance } from "fastify";
import type { MemoryStore } from "../store/memory-store.js";

export function registerProductRoutes(app: FastifyInstance, store: MemoryStore): void {
  app.get("/products", async () => ({
    products: [...store.products.values()],
  }));
}
