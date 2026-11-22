---
name: visual-qa
description: Mandatory visual verification of every UI change in a real browser (screenshots of all pages at mobile size, consistency check). Use for QA sign-off and code review of any UI change.
---

# Visual QA

Automated checks (lint, build, tests) do NOT prove a UI looks right. Every feature that touches UI needs this pass before the user is asked to approve a merge.

## Procedure
1. `npm run build`, then `npm run screenshots` (first time only: `npx playwright install chromium`). It serves `dist/`, screenshots **every page** full-page at 320, 390 (mobile) and 1280 (desktop) wide into the temp folder `stringatelier-shots`, and flags horizontal overflow.
2. **Look at the screenshots** (view them) and compare pages with each other, not just the changed page.
3. Exercise interactive parts with Playwright when changed (e.g. calculator), and delete any temporary scripts you wrote.

## Consistency checklist (all pages)
- [ ] Colors come only from design tokens; no leftover old-brand colors (grep for removed token names AND look for navy/neutral elements that should be brand-colored: headers, table heads, borders, footer, big numbers, links, buttons).
- [ ] Same heading, spacing, card and link styles across pages.
- [ ] Header, nav (active state) and footer identical on every page.
- [ ] No horizontal scroll at 320px, text readable, tap targets >= 44px.
- [ ] Text on colored backgrounds has enough contrast.
- [ ] Interactive parts (e.g. calculator) actually work: change inputs and verify the output.

## Evidence
Report the pages and viewports checked and any defects found. A feature without this evidence is NOT done.
