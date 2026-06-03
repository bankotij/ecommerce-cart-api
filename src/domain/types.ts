export type Product = {
  id: string;
  name: string;
  priceCents: number;
};

export type CartLine = {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type CartView = {
  customerId: string;
  items: CartLine[];
  subtotalCents: number;
};

export type OrderLine = {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type Order = {
  id: string;
  orderNumber: number;
  customerId: string;
  items: OrderLine[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  discountCode?: string;
  createdAt: string;
};

export type DiscountCodeStatus = "active" | "used";

export type DiscountCode = {
  code: string;
  percentOff: number;
  status: DiscountCodeStatus;
  milestoneOrderNumber: number;
  createdAt: string;
  usedAt?: string;
  usedOnOrderId?: string;
  usedOnOrderNumber?: number;
  discountCentsApplied?: number;
};

export type DiscountCodeSummary = {
  code: string;
  percentOff: number;
  status: DiscountCodeStatus;
  milestoneOrderNumber: number;
  createdAt: string;
  usedAt?: string;
  usedOnOrderNumber?: number;
  discountCentsApplied?: number;
};

export type AdminStats = {
  completedOrderCount: number;
  itemsPurchasedCount: number;
  grossRevenueCents: number;
  netRevenueCents: number;
  totalDiscountCents: number;
  discountCodes: DiscountCodeSummary[];
};
