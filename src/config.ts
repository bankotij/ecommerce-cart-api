function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid positive integer config value: ${value}`);
  }
  return parsed;
}

export const config = {
  port: parsePositiveInt(process.env.PORT, 3000),
  nthOrder: parsePositiveInt(process.env.NTH_ORDER, 3),
  discountPercent: parsePositiveInt(process.env.DISCOUNT_PERCENT, 10),
} as const;
