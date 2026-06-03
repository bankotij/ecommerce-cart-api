export const checkoutBodySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    discountCode: { type: "string", minLength: 1 },
  },
} as const;

export const orderSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    orderNumber: { type: "integer" },
    customerId: { type: "string" },
    items: { type: "array" },
    subtotalCents: { type: "integer" },
    discountCents: { type: "integer" },
    totalCents: { type: "integer" },
    discountCode: { type: "string" },
    createdAt: { type: "string" },
  },
} as const;
