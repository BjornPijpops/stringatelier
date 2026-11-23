# 0002. Pricing display: overview plus calculator

- Status: accepted
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
- A small calculator: one row per string type ("Eigen snaar" plus every string) with a − / + stepper for the number of rackets, so strings can be combined; it shows a breakdown and the total. It works with the price list as the fallback when JS is off.

Both read from **one typed pricing data module** (`src/data/pricing.ts`). Calculation lives in pure functions (`src/lib/calculateTotal.ts`, plus `src/lib/orderSummary.ts` for the calculator's rows) with unit tests. No price is hard-coded in components.

## Pricing rule

`total per racket = service price (€12) + string price`; with own strings: `€12`. Quantity multiplies the total. Unchanged by the row-per-string calculator: each row is priced with this rule and the order total is the sum of the rows.

## Consequences

- Price changes happen in one file.
- Each feature (overview, calculator) ships separately.
- Money handled as integer cents to avoid floating-point errors.
