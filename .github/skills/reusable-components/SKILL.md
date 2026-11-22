---
name: reusable-components
description: Guidelines for building reusable, composable UI components and utilities. Use when creating or modifying components, hooks or shared helpers.
---

# Reusable Components

- Search existing shared code first; extend rather than duplicate.
- Structure: `src/components/<Name>/` (component, types, tests, docs/example), shared helpers in `src/lib/`, design tokens (colors, spacing, typography) in one place.
- Components are small, single-purpose, and configured via typed props; no hard-coded content or styles that belong in tokens.
- Prefer composition (children/slots) over boolean-prop explosions; keep presentational and data-fetching logic separate.
- Accessible by default: semantic HTML, labels, keyboard support, focus states, contrast.
- Responsive by default (mobile-first).
- Avoid premature abstraction: extract on the second real use, with a clear API.
- Every shared component has tests and a usage example.
