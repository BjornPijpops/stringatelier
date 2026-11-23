import type { Cents, StringFamily } from '../data/pricing';

export interface FamilyPriceSummary {
  /** Price of the cheapest variant's string alone. */
  readonly stringCents: Cents;
  /** Service plus the cheapest variant: what the customer pays per racket at minimum. */
  readonly totalCents: Cents;
  /** True when the variants are priced differently, so the total should read "vanaf". */
  readonly differs: boolean;
}

/**
 * Summarises what a racket costs with a string of this family.
 * @throws if the family has no variants.
 */
export function summarizeFamilyPrice(
  family: StringFamily,
  servicePriceCents: Cents,
): FamilyPriceSummary {
  if (family.variants.length === 0) {
    throw new Error(`String family ${family.id} has no variants`);
  }
  const prices = family.variants.map((variant) => variant.priceCents);
  const stringCents = Math.min(...prices);

  return {
    stringCents,
    totalCents: servicePriceCents + stringCents,
    differs: Math.max(...prices) !== stringCents,
  };
}
