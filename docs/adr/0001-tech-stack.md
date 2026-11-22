# 0001. Tech stack

- Status: proposed
- Date: 2026-11-22

## Context

StringAtelier is a small side business (badminton racket stringing). The site is clean and sporty, is mostly static content (prices, contact details), and has one small interactive element (price calculator). It is maintained by non-specialists in spare time, so it should be cheap, fast, low-maintenance and easy to extend. The repo already uses TypeScript.

## Options considered

1. **Astro + TypeScript + Tailwind CSS** – ships zero JS by default, excellent performance/SEO, component model for reuse, static output, tiny interactive "islands" where needed.
2. **Next.js (React)** – powerful, but a server/React runtime is overkill for a static site; heavier, more upkeep.
3. **Plain HTML/CSS/JS** – simplest, but weak reuse (layout/components duplicated) and poor scaling as features grow.
4. **WordPress / site builder** – easy editing, but not code-based, slower, security/maintenance burden, conflicts with our quality workflow.

## Decision

- **Astro** (static output) with **TypeScript strict**.
- **Tailwind CSS** with design tokens in the theme config for the clean/sporty look and consistent reuse.
- **Vitest** for unit tests, **ESLint + Prettier** for quality, **GitHub Actions** for CI.
- **Hosting: GitHub Pages** (free, same repo, deploy from `main` via Actions). Custom domain can be added later; moving to Netlify/Cloudflare Pages stays trivial because output is static.
- Language: **Dutch** (target audience and product names are Dutch). i18n is out of scope for now.

## Consequences

- Fast, accessible, SEO-friendly site with near-zero hosting cost.
- Business logic (price calculation) is plain TypeScript, framework-independent and unit-testable.
- No backend: the contact page shows details only (no form). A form would need a third-party service and a new ADR.
- Team must learn Astro basics (small).
