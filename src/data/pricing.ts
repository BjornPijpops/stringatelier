/** Money is always stored as integer cents to avoid floating-point errors. */
export type Cents = number;

export interface StringOption {
  readonly id: string;
  readonly name: string;
  readonly priceCents: Cents;
}

/** Cost of the stringing service per racket. */
export const servicePriceCents: Cents = 1200;

/** Strings we offer. Price is for the string only, on top of the service price. */
export const stringOptions: readonly StringOption[] = [
  { id: 'bg-65-wit', name: 'BG-65 wit', priceCents: 450 },
  { id: 'bg-80-wit', name: 'BG-80 wit', priceCents: 600 },
  { id: 'bg-65-zwart', name: 'BG-65 zwart', priceCents: 450 },
  { id: 'bg-80-zwart', name: 'BG-80 zwart', priceCents: 600 },
  { id: 'bg-80-power-wit', name: 'BG-80 Power wit', priceCents: 600 },
];
