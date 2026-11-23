# Roadmap

Each item is one feature = one branch = one PR. After each feature the user approves the merge to `main` before the next starts.

| #   | Branch                        | Scope                                                                                                                                                                  | Acceptance (summary)                                               |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | `feature/project-scaffold`    | Astro + TS strict + Tailwind, Vitest, ESLint/Prettier, CI workflow (build/test/lint), replace placeholder `src/index.ts`, minimal placeholder page                     | `npm run build`, `test`, `lint` pass in CI                         |
| 2   | `feature/deploy-github-pages` | GitHub Actions build + deploy to Pages (Astro `site`/`base` config), README deploy docs. Done before any content features so every later feature deploys automatically | Placeholder site live on GitHub Pages                              |
| 3   | `feature/base-layout`         | Design tokens, BaseLayout (SEO head), Header/nav, Footer, minimal Home page                                                                                            | Responsive, accessible nav; consistent sporty look                 |
| 4   | `feature/pricing-overview`    | `data/pricing.ts`, money helper, `/prijzen` with service price, own-strings note, string table                                                                         | Prices match business data; works without JS                       |
| 5   | `feature/price-calculator`    | `calculateTotal` (TDD), cart calculator on `/prijzen`: pick strings, quantities per line, running total                                                                | Correct totals incl. own strings and quantity; keyboard accessible |
| 6   | `feature/contact-page`        | `data/contact.ts`, `/contact` with email and phone as `mailto:`/`tel:` links                                                                                           | Links work on mobile; details in one place                         |

Note: the Actions deploy workflow only runs on `main`, so merging feature 2 is what first publishes the site. Feature branches are verified by CI (build/test/lint) only.
