export const addCartItemBodySchema = {
  type: "object",
  required: ["productId", "quantity"],
  additionalProperties: false,
  properties: {
    productId: { type: "string", minLength: 1 },
    quantity: { type: "integer", minimum: 1 },
  },
} as const;

export const customerIdParamsSchema = {
  type: "object",
  required: ["customerId"],
  properties: {
    customerId: { type: "string", minLength: 1 },
  },
} as const;

export const cartViewSchema = {
  type: "object",
  properties: {
    customerId: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          productId: { type: "string" },
          name: { type: "string" },
          unitPriceCents: { type: "integer" },
          quantity: { type: "integer" },
          lineTotalCents: { type: "integer" },
        },
      },
    },
    subtotalCents: { type: "integer" },
  },
} as const;
