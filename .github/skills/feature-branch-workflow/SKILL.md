---
name: feature-branch-workflow
description: Git workflow for this repo - one branch per feature, Conventional Commits, PRs, and mandatory user approval before anything reaches main. Use for any git branching, commit, push or merge action.
---

# Feature Branch Workflow

Repo: https://github.com/BjornPijpops/stringatelier.git  (default branch: `main`)

## Start a feature
```
git switch main; git pull --ff-only
git switch -c feature/<short-kebab-name>
```
Prefixes: `feature/`, `fix/`, `chore/`, `docs/`, `refactor/`.

## While working
- Commit small and often: `feat(scope): summary`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Include trailer: `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`.
- `git push -u origin <branch>` is allowed for feature branches.
- Keep the branch current: `git fetch; git rebase origin/main` (only on your own unpushed/feature branch; never force-push `main`).

## Finish a feature
1. Build + tests green, QA PASS, reviewer APPROVED, docs updated.
2. Open a PR to `main` (`gh pr create` if available) summarizing changes and test evidence.
3. **STOP and ask the user for approval** (ask_user) showing the summary.
4. Only after explicit approval: merge (prefer squash merge) and delete the branch.

## Hard rules
- NEVER commit or push to `main` without explicit user approval for that specific merge.
- NEVER force-push shared branches; never skip hooks.
- One feature = one branch = one PR.
