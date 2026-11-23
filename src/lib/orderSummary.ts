import { calculateOrder, type PricingData } from './calculateTotal';
import { MAX_QUANTITY, OWN_STRING_VALUE } from './calculatorConfig';
import type { Cents } from '../data/pricing';

/** A string type the customer picked, with the number of rackets. */
export interface Selection {
  /** Id of the string, or {@link OWN_STRING_VALUE} for the customer's own string. */
  readonly id: string;
  /** Display name, e.g. "BG-65 wit". */
  readonly name: string;
  readonly quantity: number;
}

export interface SummaryRow {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  /** Price of one racket on this line (service plus string). */
  readonly unitCents: Cents;
  readonly totalCents: Cents;
}

export interface OrderSummary {
  readonly rows: readonly SummaryRow[];
  readonly racketCount: number;
  readonly totalCents: Cents;
}

/** The customer's picks in the order they were added; one entry per string id. */
export type Cart = readonly Selection[];

export type AddOutcome = 'added' | 'merged' | 'maxed';

export interface AddResult {
  readonly cart: Cart;
  /** `maxed` means the line was already at {@link MAX_QUANTITY} and nothing changed. */
  readonly outcome: AddOutcome;
}

/** Keeps a quantity between 0 and {@link MAX_QUANTITY}. */
function clampQuantity(quantity: number): number {
  return Math.min(MAX_QUANTITY, Math.max(0, quantity));
}

/**
 * Adds one racket for `item`. A new id is appended; a known id gets quantity + 1,
 * up to {@link MAX_QUANTITY}. Never mutates the given cart.
 */
export function addToCart(
  cart: Cart,
  item: Pick<Selection, 'id' | 'name'>,
): AddResult {
  const existing = cart.find((line) => line.id === item.id);
  if (!existing) {
    return { cart: [...cart, { ...item, quantity: 1 }], outcome: 'added' };
  }
  if (existing.quantity >= MAX_QUANTITY) {
    return { cart, outcome: 'maxed' };
  }
  return {
    cart: setLineQuantity(cart, item.id, existing.quantity + 1),
    outcome: 'merged',
  };
}

/**
 * Sets the quantity of a line, clamped to {@link MAX_QUANTITY}.
 * A quantity below 1 removes the line. Unknown ids leave the cart unchanged.
 */
export function setLineQuantity(
  cart: Cart,
  id: string,
  quantity: number,
): Cart {
  if (quantity < 1) return removeLine(cart, id);
  const clamped = clampQuantity(quantity);
  return cart.map((line) =>
    line.id === id ? { ...line, quantity: clamped } : line,
  );
}

/** Removes the line with this id; other lines keep their order. */
export function removeLine(cart: Cart, id: string): Cart {
  return cart.filter((line) => line.id !== id);
}

/** Dutch racket count, e.g. "1 racket", "3 rackets". */
export function formatRacketCount(count: number): string {
  return `${count} ${count === 1 ? 'racket' : 'rackets'}`;
}

/**
 * Prices every line of the cart (a cart never holds a line without rackets).
 * Returns `null` for an empty cart, so callers never show a meaningless total.
 */
export function summarizeOrder(
  cart: Cart,
  pricing: PricingData,
): OrderSummary | null {
  if (cart.length === 0) return null;

  const order = calculateOrder(
    cart.map(({ id, quantity }) => ({
      stringId: id === OWN_STRING_VALUE ? null : id,
      quantity,
    })),
    pricing,
  );

  return {
    rows: cart.map(({ id, name, quantity }, index) => {
      const { totalCents } = order.lines[index];
      return {
        id,
        name,
        quantity,
        unitCents: totalCents / quantity,
        totalCents,
      };
    }),
    racketCount: cart.reduce((sum, { quantity }) => sum + quantity, 0),
    totalCents: order.totalCents,
  };
}
