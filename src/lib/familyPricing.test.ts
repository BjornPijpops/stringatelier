import { describe, expect, it } from 'vitest';
import type { StringFamily } from '../data/pricing';
import { groupFamilyPrices } from './familyPricing';

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

describe('groupFamilyPrices', () => {
  it('returns one group for a single variant', () => {
    expect(groupFamilyPrices(familyWith(450), SERVICE_CENTS)).toEqual([
      { stringCents: 450, totalCents: 1650, colours: ['kleur 0'] },
    ]);
  });

  it('merges variants with equal prices into one group', () => {
    const groups = groupFamilyPrices(familyWith(450, 450), SERVICE_CENTS);

    expect(groups).toEqual([
      { stringCents: 450, totalCents: 1650, colours: ['kleur 0', 'kleur 1'] },
    ]);
  });

  it('returns separate groups sorted by price, cheapest first', () => {
    const groups = groupFamilyPrices(familyWith(600, 450), SERVICE_CENTS);

    expect(groups.map((group) => group.stringCents)).toEqual([450, 600]);
    expect(groups.map((group) => group.colours)).toEqual([
      ['kleur 1'],
      ['kleur 0'],
    ]);
  });

  it('groups mixed prices and keeps colours in data order', () => {
    const groups = groupFamilyPrices(familyWith(450, 600, 450), SERVICE_CENTS);

    expect(groups).toEqual([
      { stringCents: 450, totalCents: 1650, colours: ['kleur 0', 'kleur 2'] },
      { stringCents: 600, totalCents: 1800, colours: ['kleur 1'] },
    ]);
  });

  it('adds the service price to every group', () => {
    const groups = groupFamilyPrices(familyWith(450, 600), SERVICE_CENTS);

    expect(groups.map((group) => group.totalCents)).toEqual([1650, 1800]);
  });

  it('throws for a family without variants', () => {
    expect(() => groupFamilyPrices(familyWith(), SERVICE_CENTS)).toThrow(
      /no variants/,
    );
  });
});
