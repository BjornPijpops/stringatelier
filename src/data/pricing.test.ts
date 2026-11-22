import { describe, expect, it } from 'vitest';
import { stringFamilies, stringOptions } from './pricing';

describe('stringOptions', () => {
  it('lists every variant of every family with the business names', () => {
    expect(stringOptions.map((o) => o.name)).toEqual([
      'BG-65 wit',
      'BG-65 zwart',
      'BG-80 wit',
      'BG-80 zwart',
      'BG-80 Power wit',
    ]);
  });

  it('uses unique ids', () => {
    const ids = stringOptions.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps the agreed string prices in cents', () => {
    const price = (id: string) =>
      stringOptions.find((o) => o.id === id)?.priceCents;
    expect(price('bg-65-wit')).toBe(450);
    expect(price('bg-65-zwart')).toBe(450);
    expect(price('bg-80-wit')).toBe(600);
    expect(price('bg-80-zwart')).toBe(600);
    expect(price('bg-80-power-wit')).toBe(600);
  });
});

describe('stringFamilies', () => {
  it('gives every family a summary and at least one variant', () => {
    for (const family of stringFamilies) {
      expect(family.summary.length).toBeGreaterThan(0);
      expect(family.variants.length).toBeGreaterThan(0);
    }
  });
});
