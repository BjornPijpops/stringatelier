# Roadmap

Each item is one feature = one branch = one PR. After each feature the user approves the merge to `main` before the next starts.

| # | Branch | Scope | Acceptance (summary) |
|---|--------|-------|----------------------|
| 1 | `feature/project-scaffold` | Astro + TS strict + Tailwind, Vitest, ESLint/Prettier, CI workflow, replace placeholder `src/index.ts` | `npm run build`, `test`, `lint` pass in CI |
| 2 | `feature/base-layout` | Design tokens, BaseLayout (SEO head), Header/nav, Footer, minimal Home page | Responsive, accessible nav; consistent sporty look |
| 3 | `feature/pricing-overview` | `data/pricing.ts`, money helper, `/prijzen` with service price, own-strings note, string table | Prices match business data; works without JS |
| 4 | `feature/price-calculator` | `calculateTotal` (TDD), Calculator component on `/prijzen` | Correct totals incl. own strings and quantity; keyboard accessible |
| 5 | `feature/contact-page` | `data/contact.ts`, `/contact` with email and phone as `mailto:`/`tel:` links | Links work on mobile; details in one place |
| 6 | `feature/deploy-github-pages` | GitHub Actions deploy, base path config, README deploy docs | Site live on GitHub Pages |

## Open questions
- Is the string price added on top of the €12 service fee? (assumed yes)
- Email address and phone number to publish.
- Business details for the footer (names, location, opening/handover info)?
- Logo or brand colors? (otherwise we pick a clean sporty palette)
