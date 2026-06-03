import { randomUUID } from "node:crypto";
import { AppError, ErrorCodes } from "../domain/errors.js";
import type { Order, OrderLine } from "../domain/types.js";
import type { MemoryStore } from "../store/memory-store.js";
import type { CartService } from "./cart.service.js";

export class CheckoutService {
  constructor(
    private readonly store: MemoryStore,
    private readonly cartService: CartService,
  ) {}

  checkout(customerId: string, discountCode?: string): Order {
    const cart = this.cartService.getCart(customerId);
    if (cart.items.length === 0) {
      throw new AppError(400, ErrorCodes.EMPTY_CART, "Cannot checkout an empty cart");
    }

    if (discountCode !== undefined && discountCode.length > 0) {
      throw new AppError(404, ErrorCodes.UNKNOWN_DISCOUNT_CODE, `Discount code not found: ${discountCode}`);
    }

    const items: OrderLine[] = cart.items.map((item) => ({ ...item }));
    const subtotalCents = cart.subtotalCents;
    const discountCents = 0;
    const totalCents = subtotalCents;

    const order: Order = {
      id: randomUUID(),
      orderNumber: this.store.nextOrderNumber,
      customerId,
      items,
      subtotalCents,
      discountCents,
      totalCents,
      createdAt: new Date().toISOString(),
    };

    this.store.addOrder(order);
    this.store.setCartEntries(customerId, []);
    return order;
  }
}
