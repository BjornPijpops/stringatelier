# 0002. Pricing display: overview plus calculator

- Status: proposed
- Date: 2026-11-22

## Context
Service price is €12 per racket. Strings cost extra: BG-65 white/black €4.50, BG-80 white/black €6.00, BG-80 Power white €6.00. Customers may bring their own strings and then pay only the service cost. Visitors mainly want to know "what will it cost me?".

## Options considered
1. **Static price table only** – simplest, no JS, but customers must add up the total themselves, especially for several rackets.
2. **Calculator only** – answers the question directly, but hides the full price list, which hurts scanning, SEO and no-JS visitors.
3. **Overview + calculator on one Prices page** – table is the always-visible, accessible source of truth; calculator is a progressive enhancement.

## Decision
Option 3. One `/prijzen` page with:
- A price overview: service price, "own strings" note, and the string table.
- A small calculator: choose string (or "own strings"), number of rackets, and see the total. It works with the table as the fallback when JS is off.

Both read from **one typed pricing data module** (`src/data/pricing.ts`). Calculation lives in a pure function (`src/lib/pricing/calculateTotal.ts`) with unit tests. No price is hard-coded in components.

## Pricing rule (confirmed by the user)
`total per racket = service price (€12) + string price`; with own strings: `€12`. Quantity multiplies the total.

## Consequences
- Price changes happen in one file.
- Each feature (overview, calculator) ships separately.
- Money handled as integer cents to avoid floating-point errors.
