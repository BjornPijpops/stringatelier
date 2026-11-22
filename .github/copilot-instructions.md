# StringAtelier – Project Instructions

TypeScript website project. Quality bar: clean code, sensible design patterns, reusability, tested, documented.

## Team (agents in `.github/agents`)

Feature flow: **architect → tech-lead → developer → qa → reviewer → user approval → merge to main**.

| Agent       | Responsibility                                                      |
| ----------- | ------------------------------------------------------------------- |
| `architect` | Structure, tech choices, ADRs, patterns                             |
| `tech-lead` | Breaks features into tasks, owns branch/PR flow, enforces standards |
| `developer` | Implements tasks, writes unit tests and docs                        |
| `qa`        | Test strategy, edge cases, verifies acceptance criteria             |
| `reviewer`  | Reviews ALL code before it is merged                                |

Skills live in `.github/skills`. Agents must load the skills listed in their definition.

## Git workflow (mandatory)

1. Never commit directly to `main`.
2. Every feature gets its own branch from an up-to-date `main`: `feature/<short-kebab-name>` (fixes: `fix/…`, chores: `chore/…`, docs: `docs/…`).
3. Small, focused commits using Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
4. Push the feature branch freely; open a PR into `main`.
5. A feature is "done" only when: tests pass, build passes, QA signed off, reviewer approved.
6. **Merging/pushing to `main` ALWAYS requires explicit user approval** (ask via ask_user). Never force-push, never bypass.
7. After a merge, **keep the feature branch** until the user has checked the live result. Delete the finished branch (local and remote) only when the user gives the go to start the next feature. Never delete it earlier.

## Private notes (never published)

- Clarifying questions, answers, open questions and business details (e.g. contact info before it is published) go in `.private/` (git-ignored). Never put Q&A or unfinished notes in `docs/` or commit messages; `docs/` only holds final decisions and their reasoning.
- Check `.private/questions.md` for earlier answers before asking the user again.

## Code standards

- Follow the `clean-code-standards` skill. TypeScript `strict`, no `any` without justification.
- Small single-purpose functions/modules, intention-revealing names, no duplication (DRY), no dead code.
- Reusable components/utilities in shared locations; prefer composition over inheritance.
- Every public module/function has a short doc comment; every feature updates docs (`docs/`, README).
- Significant decisions are recorded as ADRs in `docs/adr/`.
