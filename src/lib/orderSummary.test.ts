import { describe, expect, it } from 'vitest';
import { MAX_QUANTITY, OWN_STRING_VALUE } from './calculatorConfig';
import {
  addToCart,
  formatRacketCount,
  removeLine,
  setLineQuantity,
  stepQuantity,
  summarizeOrder,
  type Cart,
} from './orderSummary';

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
      rows: [
        {
          ...own,
          quantity: 2,
          label: '2 × Eigen snaar',
          unitCents: 1200,
          totalCents: 2400,
        },
      ],
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
      {
        ...bg65,
        quantity: 1,
        label: '1 × BG-65 wit',
        unitCents: 1650,
        totalCents: 1650,
      },
      {
        ...bg80,
        quantity: 1,
        label: '1 × BG-80 wit',
        unitCents: 1800,
        totalCents: 1800,
      },
    ]);
    expect(summary?.totalCents).toBe(3450);
    expect(summary?.racketCount).toBe(2);
  });
});

describe('addToCart', () => {
  it('appends a new string with quantity 1', () => {
    const result = addToCart([], bg65);

    expect(result).toEqual({
      cart: [{ ...bg65, quantity: 1 }],
      outcome: 'added',
    });
  });

  it('keeps insertion order for different strings', () => {
    const first = addToCart([], bg80).cart;
    const second = addToCart(first, own).cart;
    const third = addToCart(second, bg65).cart;

    expect(third.map((line) => line.id)).toEqual([bg80.id, own.id, bg65.id]);
  });

  it('merges a duplicate into one line with quantity + 1', () => {
    const cart = addToCart(addToCart([], bg65).cart, own).cart;
    const result = addToCart(cart, bg65);

    expect(result.outcome).toBe('merged');
    expect(result.cart).toEqual([
      { ...bg65, quantity: 2 },
      { ...own, quantity: 1 },
    ]);
  });

  it('does nothing when the line is at the maximum', () => {
    const full: Cart = [{ ...bg65, quantity: MAX_QUANTITY }];
    const result = addToCart(full, bg65);

    expect(result.outcome).toBe('maxed');
    expect(result.cart).toBe(full);
  });

  it('reaches but never exceeds the maximum', () => {
    let cart: Cart = [];
    for (let index = 0; index < MAX_QUANTITY + 5; index += 1) {
      cart = addToCart(cart, bg65).cart;
    }

    expect(cart).toEqual([{ ...bg65, quantity: MAX_QUANTITY }]);
  });

  it('does not mutate the given cart', () => {
    const cart: Cart = Object.freeze([{ ...bg65, quantity: 1 }]);

    expect(() => addToCart(cart, bg65)).not.toThrow();
    expect(cart[0].quantity).toBe(1);
  });
});

describe('setLineQuantity', () => {
  const cart: Cart = [
    { ...own, quantity: 1 },
    { ...bg65, quantity: 2 },
  ];

  it('sets the quantity of one line', () => {
    expect(setLineQuantity(cart, bg65.id, 5)[1].quantity).toBe(5);
  });

  it('clamps the quantity to the maximum', () => {
    expect(setLineQuantity(cart, bg65.id, 99)[1].quantity).toBe(MAX_QUANTITY);
  });

  it('removes the line when the quantity drops below 1', () => {
    expect(setLineQuantity(cart, bg65.id, 0)).toEqual([
      { ...own, quantity: 1 },
    ]);
  });

  it('leaves the cart unchanged for an unknown id', () => {
    expect(setLineQuantity(cart, 'nope', 3)).toEqual(cart);
  });
});

describe('removeLine', () => {
  it('removes only the line with that id and keeps the order', () => {
    const cart: Cart = [
      { ...own, quantity: 1 },
      { ...bg65, quantity: 2 },
      { ...bg80, quantity: 1 },
    ];

    expect(removeLine(cart, bg65.id).map((line) => line.id)).toEqual([
      own.id,
      bg80.id,
    ]);
  });

  it('returns an empty cart after removing the last line', () => {
    expect(removeLine([{ ...own, quantity: 1 }], own.id)).toEqual([]);
  });
});

describe('formatRacketCount', () => {
  it('uses the singular for one racket', () => {
    expect(formatRacketCount(1)).toBe('1 racket');
  });

  it('uses the plural otherwise', () => {
    expect(formatRacketCount(3)).toBe('3 rackets');
  });
});
