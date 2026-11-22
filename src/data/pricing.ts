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

/** Score from 1 (low) to 5 (high). */
export type Rating = 1 | 2 | 3 | 4 | 5;

export interface StringRatings {
  readonly power: Rating;
  readonly control: Rating;
  readonly durability: Rating;
}

/** A string type (e.g. BG-65) that comes in one or more colours. */
export interface StringFamily {
  readonly id: string;
  readonly name: string;
  /** Short character description shown under the name. */
  readonly tagline: string;
  readonly ratings: StringRatings;
  /** Thickness, e.g. "0,70 mm". */
  readonly gauge: string;
  readonly feel: string;
  readonly bestFor: string;
  readonly variants: readonly StringVariant[];
}

/** Cost of the stringing service per racket. */
export const servicePriceCents: Cents = 1200;

/** Strings we offer, grouped by type. Prices are for the string only, on top of the service price. */
export const stringFamilies: readonly StringFamily[] = [
  {
    id: 'bg-65',
    name: 'BG-65',
    tagline: 'Allround en comfortabel',
    ratings: { power: 3, control: 3, durability: 5 },
    gauge: '0,70 mm',
    feel: 'Zacht en vergevingsgezind',
    bestFor: 'Beginners, clubspelers en wie een duurzame snaar zoekt',
    variants: [
      { id: 'bg-65-wit', colour: 'wit', priceCents: 450 },
      { id: 'bg-65-zwart', colour: 'zwart', priceCents: 450 },
    ],
  },
  {
    id: 'bg-80',
    name: 'BG-80',
    tagline: 'Scherp, strak en precies',
    ratings: { power: 4, control: 4, durability: 2 },
    gauge: '0,68 mm',
    feel: 'Stevig en strak',
    bestFor: 'Gevorderde spelers die controle en feedback willen',
    variants: [
      { id: 'bg-80-wit', colour: 'wit', priceCents: 600 },
      { id: 'bg-80-zwart', colour: 'zwart', priceCents: 600 },
    ],
  },
  {
    id: 'bg-80-power',
    name: 'BG-80 Power',
    tagline: 'Krachtig en explosief',
    ratings: { power: 5, control: 3, durability: 3 },
    gauge: '0,68 mm',
    feel: 'Stevig, iets stugger en puncheriger',
    bestFor: 'Smashers en aanvallende spelers die extra punch willen',
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
