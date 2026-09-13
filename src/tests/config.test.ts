import { describe, expect, it } from 'vitest';
import { loadConfig } from '../config.js';

describe('configuration', () => {
  it.each(['3orders', '3.5', '1e3', '-1', '', '9007199254740993'])('rejects malformed integer %s', value => {
    expect(() => loadConfig({ NTH_ORDER: value })).toThrow();
  });
  it('rejects discounts that would produce negative order totals', () => {
    expect(() => loadConfig({ DISCOUNT_PERCENT: '101' })).toThrow(/at most 100/);
    expect(loadConfig({ DISCOUNT_PERCENT: '100' }).discountPercent).toBe(100);
  });
  it('validates the listening port before boot', () => {
    expect(() => loadConfig({ PORT: '65536' })).toThrow(/65535/);
    expect(loadConfig({})).toEqual({ port: 3000, nthOrder: 3, discountPercent: 10 });
  });
});
