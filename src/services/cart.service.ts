import { AppError, ErrorCodes } from "../domain/errors.js";
import type { CartLine, CartView } from "../domain/types.js";
import type { MemoryStore } from "../store/memory-store.js";

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

export class CartService {
  constructor(private readonly store: MemoryStore) {}

  addItem(customerId: string, productId: string, quantity: number): CartView {
    if (!isPositiveInteger(quantity)) {
      throw new AppError(400, ErrorCodes.INVALID_QUANTITY, "Quantity must be a positive integer");
    }

    const product = this.store.products.get(productId);
    if (!product) {
      throw new AppError(404, ErrorCodes.UNKNOWN_PRODUCT, `Product not found: ${productId}`);
    }

    const entries = [...this.store.getCartEntries(customerId)];
    const existing = entries.find((e) => e.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      entries.push({ productId, quantity });
    }

    this.store.setCartEntries(customerId, entries);
    return this.getCart(customerId);
  }

  getCart(customerId: string): CartView {
    const entries = this.store.getCartEntries(customerId);
    const items: CartLine[] = entries.map((entry) => {
      const product = this.store.products.get(entry.productId);
      if (!product) {
        throw new AppError(404, ErrorCodes.UNKNOWN_PRODUCT, `Product not found: ${entry.productId}`);
      }
      const lineTotalCents = product.priceCents * entry.quantity;
      return {
        productId: product.id,
        name: product.name,
        unitPriceCents: product.priceCents,
        quantity: entry.quantity,
        lineTotalCents,
      };
    });

    const subtotalCents = items.reduce((sum, item) => sum + item.lineTotalCents, 0);
    return { customerId, items, subtotalCents };
  }
}
