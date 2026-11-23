import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import FamilyPriceList from './FamilyPriceList.astro';
import StringFamilyCard from './StringFamilyCard.astro';
import type { StringFamily } from '../data/pricing';
import type { PriceGroup } from '../lib/familyPricing';

const group = (totalCents: number, colours: string[]): PriceGroup => ({
  stringCents: totalCents - 1200,
  totalCents,
  colours,
});

async function render(
  component: Parameters<AstroContainer['renderToString']>[0],
  props: Record<string, unknown>,
): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(component, { props });
}

const count = (html: string, pattern: RegExp): number =>
  html.match(pattern)?.length ?? 0;

describe('FamilyPriceList', () => {
  it('renders one list item per price group with its colours and price together', async () => {
    const html = await render(FamilyPriceList, {
      groups: [group(1650, ['wit']), group(1800, ['zwart'])],
    });

    const items = html.match(/<li[\s\S]*?<\/li>/g) ?? [];
    expect(items).toHaveLength(2);
    expect(items[0]).toContain('wit');
    expect(items[0]).toContain('16,50');
    expect(items[1]).toContain('zwart');
    expect(items[1]).toContain('18,00');
    expect(items[0]).not.toContain('zwart');
  });

  it('adds a screen-reader "per racket" and a visible caption for several groups', async () => {
    const html = await render(FamilyPriceList, {
      groups: [group(1650, ['wit']), group(1800, ['zwart'])],
    });

    expect(count(html, /class="sr-only">per racket /g)).toBe(2);
    expect(html).toContain('per racket, kleur naar keuze');
  });

  it('shows a big price and the joined colours for a single group', async () => {
    const html = await render(FamilyPriceList, {
      groups: [group(1650, ['wit', 'zwart'])],
    });

    expect(html).not.toContain('<li');
    expect(html).not.toContain('kleur naar keuze');
    expect(html).toContain('text-3xl');
    expect(html).toContain('16,50');
    expect(html).toContain('wit, zwart');
  });

  it('shows the colour name but no dot for an unknown colour', async () => {
    const html = await render(FamilyPriceList, {
      groups: [group(1650, ['paars'])],
    });

    expect(html).toContain('paars');
    expect(html).not.toContain('rounded-full');
  });

  it('shows a dot for known colours', async () => {
    const html = await render(FamilyPriceList, {
      groups: [group(1650, ['wit', 'zwart'])],
    });

    expect(count(html, /rounded-full/g)).toBe(2);
  });
});

describe('StringFamilyCard', () => {
  const family: StringFamily = {
    id: 'test',
    name: 'Test',
    tagline: 'Tagline',
    ratings: { power: 3, control: 3, durability: 3 },
    gauge: '0,70 mm',
    feel: 'Zacht',
    bestFor: 'Iedereen',
    variants: [
      { id: 'test-wit', colour: 'wit', priceCents: 450 },
      { id: 'test-zwart', colour: 'zwart', priceCents: 600 },
    ],
  };

  it('keeps exactly five direct children when the card has several price groups', async () => {
    const html = await render(StringFamilyCard, { family });

    const article = html.match(/<article[^>]*>([\s\S]*)<\/article>/);
    expect(article).not.toBeNull();
    const body = article![1]!;

    // Count top-level elements by tracking nesting depth over open/close tags.
    let depth = 0;
    let topLevel = 0;
    for (const [, closing, tag] of body.matchAll(
      /<(\/?)([a-z][a-z0-9]*)\b[^>]*?(?<!\/)>/g,
    )) {
      if (['span', 'div', 'p', 'ul', 'li'].includes(tag!) || tag === 'svg') {
        if (closing) {
          depth -= 1;
        } else {
          if (depth === 0) topLevel += 1;
          depth += 1;
        }
      }
    }
    expect(topLevel).toBe(5);
  });
});
