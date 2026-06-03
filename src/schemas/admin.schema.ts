export const discountCodeSchema = {
  type: "object",
  properties: {
    code: { type: "string" },
    percentOff: { type: "integer" },
    status: { type: "string" },
    milestoneOrderNumber: { type: "integer" },
    createdAt: { type: "string" },
    usedAt: { type: "string" },
    usedOnOrderId: { type: "string" },
    usedOnOrderNumber: { type: "integer" },
    discountCentsApplied: { type: "integer" },
  },
} as const;

export const adminStatsSchema = {
  type: "object",
  properties: {
    completedOrderCount: { type: "integer" },
    itemsPurchasedCount: { type: "integer" },
    grossRevenueCents: { type: "integer" },
    netRevenueCents: { type: "integer" },
    totalDiscountCents: { type: "integer" },
    discountCodes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          code: { type: "string" },
          percentOff: { type: "integer" },
          status: { type: "string" },
          milestoneOrderNumber: { type: "integer" },
          createdAt: { type: "string" },
          usedAt: { type: "string" },
          usedOnOrderNumber: { type: "integer" },
          discountCentsApplied: { type: "integer" },
        },
      },
    },
  },
} as const;
