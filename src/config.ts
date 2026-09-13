function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid positive integer config value: ${value}`);
  }
  return parsed;
}

export function loadConfig(env: NodeJS.ProcessEnv) {
  const port = parsePositiveInt(env.PORT, 3000);
  const nthOrder = parsePositiveInt(env.NTH_ORDER, 3);
  const discountPercent = parsePositiveInt(env.DISCOUNT_PERCENT, 10);
  if (port > 65535) throw new Error("PORT must be at most 65535");
  if (discountPercent > 100) throw new Error("DISCOUNT_PERCENT must be at most 100");
  return { port, nthOrder, discountPercent } as const;
}

export const config = loadConfig(process.env);
