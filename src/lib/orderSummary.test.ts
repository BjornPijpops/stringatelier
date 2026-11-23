import { describe, expect, it } from 'vitest';
import { MAX_QUANTITY, OWN_STRING_VALUE } from './calculatorConfig';
import { stepQuantity, summarizeOrder } from './orderSummary';

const pricing = {
  servicePriceCents: 1200,
  stringOptions: [
    { id: 'bg-65-wit', name: 'BG-65 wit', priceCents: 450 },
    { id: 'bg-80-wit', name: 'BG-80 wit', priceCents: 600 },
  ],
};

const own = { id: OWN_STRING_VALUE, name: 'Eigen snaar' };
const bg65 = { id: 'bg-65-wit', name: 'BG-65 wit' };
const bg80 = { id: 'bg-80-wit', name: 'BG-80 wit' };

describe('stepQuantity', () => {
  it('adds the step to the quantity', () => {
    expect(stepQuantity(1, 1)).toBe(2);
    expect(stepQuantity(3, -1)).toBe(2);
  });

  it('never goes below zero', () => {
    expect(stepQuantity(0, -1)).toBe(0);
  });

  it('never goes above the maximum', () => {
    expect(stepQuantity(MAX_QUANTITY, 1)).toBe(MAX_QUANTITY);
  });
});

describe('summarizeOrder', () => {
  it('returns null when nothing is selected', () => {
    const selections = [
      { ...own, quantity: 0 },
      { ...bg65, quantity: 0 },
    ];

    expect(summarizeOrder(selections, pricing)).toBeNull();
  });

  it('returns null for an empty list', () => {
    expect(summarizeOrder([], pricing)).toBeNull();
  });

  it('prices a single own-string row at the service price', () => {
    const summary = summarizeOrder([{ ...own, quantity: 2 }], pricing);

    expect(summary).toEqual({
      rows: [{ label: '2 × Eigen snaar', totalCents: 2400 }],
      racketCount: 2,
      totalCents: 2400,
    });
  });

  it('combines rows and skips the ones at zero', () => {
    const summary = summarizeOrder(
      [
        { ...own, quantity: 0 },
        { ...bg65, quantity: 1 },
        { ...bg80, quantity: 1 },
      ],
      pricing,
    );

    expect(summary?.rows).toEqual([
      { label: '1 × BG-65 wit', totalCents: 1650 },
      { label: '1 × BG-80 wit', totalCents: 1800 },
    ]);
    expect(summary?.totalCents).toBe(3450);
    expect(summary?.racketCount).toBe(2);
  });
});
