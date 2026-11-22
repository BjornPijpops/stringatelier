# Architecture

See `docs/adr/` for the reasoning behind each decision.

## Overview

Static Astro site (TypeScript, Tailwind) deployed to GitHub Pages. Pages: Home, Prices (`/prijzen`), Contact (`/contact`).

```mermaid
flowchart LR
  Data[src/data: pricing, contact] --> Lib[src/lib: pure logic]
  Data --> Pages
  Lib --> Components
  Components[src/components: reusable UI] --> Pages[src/pages]
  Layout[src/layouts] --> Pages
```

## Structure

```
src/
  data/        single source of truth (pricing.ts, contact.ts)
  lib/         pure, tested logic (pricing/calculateTotal.ts, money formatting)
  components/  reusable UI (Button, Card, PriceTable, Calculator, ...)
  layouts/     BaseLayout (head/SEO, header, footer)
  pages/       index, prijzen, contact
  styles/      Tailwind setup and tokens
docs/          architecture, ADRs, roadmap
```

## Conventions

- Content/prices/contact details only in `src/data`, never inside components.
- Money as integer cents; formatting via one helper (`nl-NL`, EUR).
- Logic in `lib` has no DOM/framework dependencies and is unit tested.
- Components are small, typed (`Props` interface), accessible and mobile-first.
- Design tokens (colors, spacing, fonts) live in the Tailwind theme only. Look: clean, white space, energetic accent color, bold sporty headings.
