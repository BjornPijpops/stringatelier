import type { Cents } from '../data/pricing';

const euroFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
});

/** Formats cents as a Dutch euro amount, e.g. 450 -> "€ 4,50". */
export function formatMoney(cents: Cents): string {
  return euroFormatter.format(cents / 100);
}
