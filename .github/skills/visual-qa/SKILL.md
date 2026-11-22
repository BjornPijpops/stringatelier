---
name: visual-qa
description: Mandatory visual verification of every UI change in a real browser (screenshots of all pages at mobile size, consistency check). Use for QA sign-off and code review of any UI change.
---

# Visual QA

Automated checks (lint, build, tests) do NOT prove a UI looks right. Every feature that touches UI needs this pass before the user is asked to approve a merge.

## Procedure
1. `npm run build`, then serve it: `npm run preview -- --port 4399` (async/background).
2. With Playwright (Chromium), screenshot **every page**, full page, at 390x844 (mobile) and 1280x800 (desktop). Pages come from `navItems` in `src/data/site.ts`, so none are missed.
3. **Look at the screenshots** (view them) and compare pages with each other, not just the changed page.
4. Stop the preview server and delete temporary screenshots/scripts (keep them outside the repo, e.g. `$env:TEMP`).

## Consistency checklist (all pages)
- [ ] Colors come only from design tokens; no leftover old-brand colors (grep for removed token names AND look for navy/neutral elements that should be brand-colored: headers, table heads, borders, footer, big numbers, links, buttons).
- [ ] Same heading, spacing, card and link styles across pages.
- [ ] Header, nav (active state) and footer identical on every page.
- [ ] No horizontal scroll at 320px, text readable, tap targets >= 44px.
- [ ] Text on colored backgrounds has enough contrast.
- [ ] Interactive parts (e.g. calculator) actually work: change inputs and verify the output.

## Evidence
Report the pages and viewports checked and any defects found. A feature without this evidence is NOT done.
