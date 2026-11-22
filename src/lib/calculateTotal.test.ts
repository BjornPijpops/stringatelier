import { describe, expect, it } from 'vitest';
import { calculateTotal } from './calculateTotal';
import type { StringOption } from '../data/pricing';

const options: readonly StringOption[] = [
  { id: 'a', name: 'A', priceCents: 450 },
  { id: 'b', name: 'B', priceCents: 600 },
];
const pricing = { servicePriceCents: 1200, stringOptions: options };

describe('calculateTotal', () => {
  it('adds the string price on top of the service price', () => {
    const result = calculateTotal({ stringId: 'a', quantity: 1 }, pricing);

    expect(result).toEqual({
      serviceCents: 1200,
      stringsCents: 450,
      totalCents: 1650,
    });
  });

  it('charges only the service price when the customer brings own strings', () => {
    const result = calculateTotal({ stringId: null, quantity: 1 }, pricing);

    expect(result).toEqual({
      serviceCents: 1200,
      stringsCents: 0,
      totalCents: 1200,
    });
  });

  it('multiplies the total by the number of rackets', () => {
    const result = calculateTotal({ stringId: 'b', quantity: 3 }, pricing);

    expect(result).toEqual({
      serviceCents: 3600,
      stringsCents: 1800,
      totalCents: 5400,
    });
  });

  it('throws for an unknown string', () => {
    expect(() =>
      calculateTotal({ stringId: 'x', quantity: 1 }, pricing),
    ).toThrow(/unknown string/i);
  });

  it.each([0, -1, 1.5, Number.NaN])(
    'throws for invalid quantity %s',
    (quantity) => {
      expect(() =>
        calculateTotal({ stringId: 'a', quantity }, pricing),
      ).toThrow(/quantity/i);
    },
  );
});
