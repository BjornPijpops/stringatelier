import type { Cents, StringFamily } from '../data/pricing';

/** Variants of one family that share the same string price. */
export interface PriceGroup {
  /** Price of the string alone. */
  readonly stringCents: Cents;
  /** Service plus string: what the customer pays per racket. */
  readonly totalCents: Cents;
  /** Colours at this price, in data order. */
  readonly colours: string[];
}

/**
 * Groups a family's variants by identical string price, cheapest group first.
 * @throws if the family has no variants.
 */
export function groupFamilyPrices(
  family: StringFamily,
  servicePriceCents: Cents,
): PriceGroup[] {
  if (family.variants.length === 0) {
    throw new Error(`String family ${family.id} has no variants`);
  }
  const byPrice = new Map<Cents, string[]>();
  for (const { priceCents, colour } of family.variants) {
    byPrice.set(priceCents, [...(byPrice.get(priceCents) ?? []), colour]);
  }

  return [...byPrice]
    .sort(([a], [b]) => a - b)
    .map(([stringCents, colours]) => ({
      stringCents,
      totalCents: servicePriceCents + stringCents,
      colours,
    }));
}
