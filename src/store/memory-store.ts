import type { DiscountCode, Order, Product } from "../domain/types.js";
import { SEED_PRODUCTS } from "./seed-products.js";

type CartEntry = {
  productId: string;
  quantity: number;
};

export class MemoryStore {
  readonly products: Map<string, Product>;
  private readonly carts = new Map<string, CartEntry[]>();
  readonly orders: Order[] = [];
  readonly discountCodes: DiscountCode[] = [];
  private readonly issuedMilestones = new Set<number>();

  constructor(products: Product[] = SEED_PRODUCTS) {
    this.products = new Map(products.map((p) => [p.id, p]));
  }

  getCartEntries(customerId: string): CartEntry[] {
    return this.carts.get(customerId) ?? [];
  }

  setCartEntries(customerId: string, entries: CartEntry[]): void {
    if (entries.length === 0) {
      this.carts.delete(customerId);
      return;
    }
    this.carts.set(customerId, entries);
  }

  get completedOrderCount(): number {
    return this.orders.length;
  }

  get nextOrderNumber(): number {
    return this.orders.length + 1;
  }

  hasIssuedMilestone(milestone: number): boolean {
    return this.issuedMilestones.has(milestone);
  }

  markMilestoneIssued(milestone: number): void {
    this.issuedMilestones.add(milestone);
  }

  findDiscountCode(code: string): DiscountCode | undefined {
    return this.discountCodes.find((c) => c.code === code);
  }

  addDiscountCode(discountCode: DiscountCode): void {
    this.discountCodes.push(discountCode);
    this.markMilestoneIssued(discountCode.milestoneOrderNumber);
  }

  addOrder(order: Order): void {
    this.orders.push(order);
  }
}

export function createStore(): MemoryStore {
  return new MemoryStore();
}
