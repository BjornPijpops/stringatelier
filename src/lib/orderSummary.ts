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
  /** e.g. "2 × BG-65 wit". */
  readonly label: string;
  readonly totalCents: Cents;
}

export interface OrderSummary {
  readonly rows: readonly SummaryRow[];
  readonly racketCount: number;
  readonly totalCents: Cents;
}

/** Applies a step to a quantity and keeps the result between 0 and {@link MAX_QUANTITY}. */
export function stepQuantity(current: number, step: number): number {
  return Math.min(MAX_QUANTITY, Math.max(0, current + step));
}

/**
 * Prices the selections that have at least one racket.
 * Returns `null` for an empty order, so callers never show a meaningless total.
 */
export function summarizeOrder(
  selections: readonly Selection[],
  pricing: PricingData,
): OrderSummary | null {
  const chosen = selections.filter((selection) => selection.quantity > 0);
  if (chosen.length === 0) return null;

  const order = calculateOrder(
    chosen.map(({ id, quantity }) => ({
      stringId: id === OWN_STRING_VALUE ? null : id,
      quantity,
    })),
    pricing,
  );

  return {
    rows: chosen.map(({ name, quantity }, index) => ({
      label: `${quantity} × ${name}`,
      totalCents: order.lines[index].totalCents,
    })),
    racketCount: chosen.reduce((sum, { quantity }) => sum + quantity, 0),
    totalCents: order.totalCents,
  };
}
