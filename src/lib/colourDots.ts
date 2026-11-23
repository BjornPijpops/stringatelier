/**
 * Dot fill (Tailwind class) per known colour name.
 * Unknown colours have no entry on purpose: they show no dot rather than a
 * misleading swatch. Add a mapping here when a new colour appears in the data.
 */
const DOT_FILL_BY_COLOUR: Readonly<Record<string, string>> = {
  wit: 'bg-white',
  zwart: 'bg-ink',
};

/** Tailwind fill class for the colour's dot, or undefined when it has none. */
export function colourDotFill(colour: string): string | undefined {
  return DOT_FILL_BY_COLOUR[colour];
}
