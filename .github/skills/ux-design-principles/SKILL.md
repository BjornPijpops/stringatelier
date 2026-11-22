---
name: ux-design-principles
description: Practical UI/UX rules for the StringAtelier site. Use when designing or reviewing any page, component or interaction.
---

# UX design principles

## Start from the visitor
1. Write the visitor's goal in one sentence before designing.
2. The answer to the most common question (price, place, contact) must be visible without scrolling or tapping on a phone.
3. Lead with the outcome, then the detail. A tool the visitor will use (calculator) comes before reference material (full table).

## Pick the right pattern
| Situation | Pattern |
| --- | --- |
| Jargon or optional detail (what is BG-65?) | Small "?" button that toggles an inline explanation. Works by tap, not only hover. |
| Related choices with one decision | Grouped cards or segmented choice, with the differences visible side by side |
| Long secondary content | Accordion (`<details>`) |
| Numeric input | Stepper buttons (+/-), sensible default, live result |
| Result the user is waiting for | Highlighted result near the input, updated instantly |
| Third-party content (maps) | Load on demand, show a placeholder |

Hover is a bonus on desktop only. Every hover hint needs a tap/keyboard equivalent.

## Visual balance
- Alternate section backgrounds (white, soft blue, brand blue) to create rhythm; do not leave a page as a white sheet.
- Use the brand colour for actions and key numbers, not for everything. One primary action per screen.
- Use whitespace and size contrast to show hierarchy; fewer, larger elements beat many small ones.
- Check every page against the others for consistency (see `visual-qa`).

## Content
- Dutch, short, friendly, concrete. Put units next to numbers ("per racket").
- Label things the way visitors say them ("Eigen snaar", not "Geen snaar").

## Accessibility is part of UX
- Native elements first (`details`, `button`, `fieldset`). Visible focus. 44px tap targets. Contrast at least AA.
- Interactive hints expose state with `aria-expanded` and `aria-controls`.
- The page must still show the key information with JavaScript disabled.

## Design brief template
Goal / Journey / Mobile layout / Desktop layout / Interactions / Copy / States / Left out and why.
