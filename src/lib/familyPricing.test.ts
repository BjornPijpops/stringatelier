import { describe, expect, it } from 'vitest';
import type { StringFamily } from '../data/pricing';
import { summarizeFamilyPrice } from './familyPricing';

const SERVICE_CENTS = 1200;

function familyWith(...prices: number[]): StringFamily {
  return {
    id: 'test',
    name: 'Test',
    tagline: '',
    ratings: { power: 3, control: 3, durability: 3 },
    gauge: '',
    feel: '',
    bestFor: '',
    variants: prices.map((priceCents, index) => ({
      id: `test-${index}`,
      colour: `kleur ${index}`,
      priceCents,
    })),
  };
}

describe('summarizeFamilyPrice', () => {
  it('adds the string price to the service price', () => {
    expect(summarizeFamilyPrice(familyWith(450), SERVICE_CENTS)).toEqual({
      stringCents: 450,
      totalCents: 1650,
      differs: false,
    });
  });

  it('does not flag a difference when all variants cost the same', () => {
    const summary = summarizeFamilyPrice(familyWith(450, 450), SERVICE_CENTS);

    expect(summary.differs).toBe(false);
  });

  it('uses the cheapest variant and flags a difference when prices vary', () => {
    const summary = summarizeFamilyPrice(familyWith(600, 450), SERVICE_CENTS);

    expect(summary).toEqual({
      stringCents: 450,
      totalCents: 1650,
      differs: true,
    });
  });

  it('throws for a family without variants', () => {
    expect(() => summarizeFamilyPrice(familyWith(), SERVICE_CENTS)).toThrow(
      /no variants/,
    );
  });
});
