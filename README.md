# StringAtelier

TypeScript website project, built by an AI team with a strict quality workflow.

## Setup

```
npm install
npm run dev
```

Stack: Astro, TypeScript (strict), Tailwind CSS, Vitest (see `docs/adr/0001-tech-stack.md`).

| Script                | Purpose                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------- |
| `npm run dev`         | Local dev server                                                                            |
| `npm run build`       | Production build to `dist/`                                                                 |
| `npm run check`       | Astro/TypeScript type check                                                                 |
| `npm test`            | Unit tests                                                                                  |
| `npm run test:e2e`    | Mobile browser tests (needs `npm run build` first; once: `npx playwright install chromium`) |
| `npm run lint`        | ESLint                                                                                      |
| `npm run screenshots` | Screenshots every page (visual QA)                                                          |
| `npm run format`      | Prettier (`format:check` to verify)                                                         |

CI (`.github/workflows/ci.yml`) runs lint, format check, type check, unit tests, build and the mobile browser tests on every push and PR.

## Deployment

The site is published at https://bjornpijpops.github.io/stringatelier/ through GitHub Pages. Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the site and deploys `dist/`. This needs repository Settings → Pages → Source set to **GitHub Actions**. When adding internal links or assets, build them from `import.meta.env.BASE_URL` so they work under `/stringatelier`.

```

## AI team

Agents (`.github/agents`): `architect`, `ux-designer`, `tech-lead`, `developer`, `qa`, `reviewer`.
Skills (`.github/skills`): architecture-decision-records, design-patterns-guide, clean-code-standards, feature-planning, feature-branch-workflow, documentation-standards, reusable-components, testing-practices, qa-checklist, visual-qa, ux-design-principles, code-review-checklist.
Global rules: `.github/copilot-instructions.md`.

## Workflow

One `feature/<name>` branch per feature → QA → review → PR → **user approval** → merge to `main`.
Nothing is pushed to `main` without explicit approval.

## Docs

- `docs/architecture.md` (to be created by the architect)
- `docs/adr/` – architecture decision records
```
