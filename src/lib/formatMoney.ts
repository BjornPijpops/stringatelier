import type { Cents } from '../data/pricing';

const euroFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
});

const wholeEuroFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Formats cents as a Dutch euro amount, e.g. 450 -> "€ 4,50". */
export function formatMoney(cents: Cents): string {
  return euroFormatter.format(cents / 100);
}

/**
 * Formats a whole-euro amount without decimals, e.g. 1200 -> "€ 12".
 * Meant for running text; amounts with cents are rounded, so use {@link formatMoney} for those.
 */
export function formatWholeEuros(cents: Cents): string {
  return wholeEuroFormatter.format(cents / 100);
}
