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
