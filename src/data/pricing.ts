/** Money is always stored as integer cents to avoid floating-point errors. */
export type Cents = number;

export interface StringOption {
  readonly id: string;
  readonly name: string;
  readonly priceCents: Cents;
}

export interface StringVariant {
  readonly id: string;
  /** Colour, shown next to the family name, e.g. "wit". */
  readonly colour: string;
  readonly priceCents: Cents;
}

/** A string type (e.g. BG-65) that comes in one or more colours. */
export interface StringFamily {
  readonly id: string;
  readonly name: string;
  /** One-line explanation for visitors who don't know the string. */
  readonly summary: string;
  readonly variants: readonly StringVariant[];
}

/** Cost of the stringing service per racket. */
export const servicePriceCents: Cents = 1200;

/** Strings we offer, grouped by type. Prices are for the string only, on top of the service price. */
export const stringFamilies: readonly StringFamily[] = [
  {
    id: 'bg-65',
    name: 'BG-65',
    summary:
      'Een veelgebruikte, duurzame snaar met een comfortabel gevoel. Een goede keuze voor wie regelmatig speelt en niet te vaak wil herbespannen.',
    variants: [
      { id: 'bg-65-wit', colour: 'wit', priceCents: 450 },
      { id: 'bg-65-zwart', colour: 'zwart', priceCents: 450 },
    ],
  },
  {
    id: 'bg-80',
    name: 'BG-80',
    summary:
      'Een dunnere snaar met een strakker, scherper gevoel en meer controle bij je slagen. Voor wie een directere feel zoekt.',
    variants: [
      { id: 'bg-80-wit', colour: 'wit', priceCents: 600 },
      { id: 'bg-80-zwart', colour: 'zwart', priceCents: 600 },
    ],
  },
  {
    id: 'bg-80-power',
    name: 'BG-80 Power',
    summary:
      'Gebaseerd op de BG-80, maar gemaakt voor extra kracht in je slagen.',
    variants: [{ id: 'bg-80-power-wit', colour: 'wit', priceCents: 600 }],
  },
];

/** Flat list of every string, used by the price calculator. */
export const stringOptions: readonly StringOption[] = stringFamilies.flatMap(
  (family) =>
    family.variants.map((variant) => ({
      id: variant.id,
      name: `${family.name} ${variant.colour}`,
      priceCents: variant.priceCents,
    })),
);
