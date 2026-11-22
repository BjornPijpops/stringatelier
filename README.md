# StringAtelier

TypeScript website project, built by an AI team with a strict quality workflow.

## Setup
```
npm install
npm run build
```

## AI team
Agents (`.github/agents`): `architect`, `tech-lead`, `developer`, `qa`, `reviewer`.
Skills (`.github/skills`): architecture-decision-records, design-patterns-guide, clean-code-standards, feature-planning, feature-branch-workflow, documentation-standards, reusable-components, testing-practices, qa-checklist, code-review-checklist.
Global rules: `.github/copilot-instructions.md`.

## Workflow
One `feature/<name>` branch per feature → QA → review → PR → **user approval** → merge to `main`.
Nothing is pushed to `main` without explicit approval.

## Docs
- `docs/architecture.md` (to be created by the architect)
- `docs/adr/` – architecture decision records
