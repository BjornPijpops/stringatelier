import type { Cents, StringOption } from '../data/pricing';

export interface PricingData {
  readonly servicePriceCents: Cents;
  readonly stringOptions: readonly StringOption[];
}

export interface QuoteRequest {
  /** Id of the chosen string, or `null` when the customer brings their own. */
  readonly stringId: string | null;
  readonly quantity: number;
}

export interface Quote {
  readonly serviceCents: Cents;
  readonly stringsCents: Cents;
  readonly totalCents: Cents;
}

/**
 * Calculates the cost of stringing `quantity` rackets.
 * The string price is added on top of the service price per racket.
 * @throws if the quantity is not a positive integer or the string id is unknown.
 */
export function calculateTotal(
  request: QuoteRequest,
  pricing: PricingData,
): Quote {
  const { stringId, quantity } = request;

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(`Invalid quantity: ${quantity}`);
  }

  const stringPrice =
    stringId === null ? 0 : findStringPrice(stringId, pricing.stringOptions);
  const serviceCents = pricing.servicePriceCents * quantity;
  const stringsCents = stringPrice * quantity;

  return {
    serviceCents,
    stringsCents,
    totalCents: serviceCents + stringsCents,
  };
}

export interface OrderQuote {
  /** One quote per requested line, in the same order. */
  readonly lines: readonly Quote[];
  readonly serviceCents: Cents;
  readonly stringsCents: Cents;
  readonly totalCents: Cents;
}

/**
 * Calculates the cost of an order that combines several string types,
 * e.g. 2 rackets with BG-65 and 1 racket with the customer's own string.
 * @throws if any line is invalid (see {@link calculateTotal}) or the order is empty.
 */
export function calculateOrder(
  requests: readonly QuoteRequest[],
  pricing: PricingData,
): OrderQuote {
  if (requests.length === 0) {
    throw new Error('An order needs at least one line');
  }

  const lines = requests.map((request) => calculateTotal(request, pricing));
  const sum = (pick: (quote: Quote) => Cents): Cents =>
    lines.reduce((total, quote) => total + pick(quote), 0);

  return {
    lines,
    serviceCents: sum((quote) => quote.serviceCents),
    stringsCents: sum((quote) => quote.stringsCents),
    totalCents: sum((quote) => quote.totalCents),
  };
}

function findStringPrice(
  stringId: string,
  options: readonly StringOption[],
): Cents {
  const option = options.find((candidate) => candidate.id === stringId);
  if (!option) {
    throw new Error(`Unknown string: ${stringId}`);
  }
  return option.priceCents;
}
