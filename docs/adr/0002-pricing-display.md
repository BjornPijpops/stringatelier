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

Option 3. One `/prijzen` page, in this order: page header, string cards, calculator, closing call to action.

- **Price in the intro.** The page header states the stringing price once, in bold brand blue: "Besnaren kost € 12 per racket, plus de snaar die je kiest. Eigen snaar? Dan betaal je alleen die € 12." The separate price card was removed; it repeated the intro and pushed the calculator down.
- **Price on every string card.** Each card shows the all-in price per racket ("€ 16,50 per racket", "vanaf" when colours differ in price) and the breakdown ("besnaren € 12,00 + snaar € 4,50"). This is the main answer to "what will it cost me?".
- **Calculator as a cart.** For several rackets or strings, the calculator on a soft band below the cards has a native `<select>` (own string first, then strings grouped per family with `<optgroup>`) and a "Toevoegen" button. Adding the same string merges into one line (quantity + 1, max 20). Each line has a − / + stepper (the − becomes a trash button at 1), and the total sits below the lines. Nothing is stored; the cart lives in memory.
- Without JavaScript the card is hidden and a `<noscript>` list shows "Eigen snaar (alleen besnaren)" and every string's total.

All of it reads from **one typed pricing data module** (`src/data/pricing.ts`). Calculation lives in pure functions (`src/lib/calculateTotal.ts`, `src/lib/familyPricing.ts` for the cards, `src/lib/orderSummary.ts` for the cart) with unit tests. No price is hard-coded in components.

## Pricing rule

`total per racket = service price (€12) + string price`; with own strings: `€12`. Quantity multiplies the total. Each cart line is priced with this rule and the order total is the sum of the lines.

## Consequences

- Price changes happen in one file.
- Each feature (overview, calculator) ships separately.
- Money handled as integer cents to avoid floating-point errors.
- The picker scales to many strings through optgroups. The cards do not: at roughly 6+ families, consider horizontal scrolling or a disclosure on the cards.
