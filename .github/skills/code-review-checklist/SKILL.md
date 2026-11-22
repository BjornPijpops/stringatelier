---
name: code-review-checklist
description: Structured checklist for reviewing a branch diff before merge. Use for every code review.
---

# Code Review Checklist

Run `git diff main...HEAD` and review the whole change.

1. **Correctness**: meets acceptance criteria, handles edge cases and errors.
2. **Design**: follows architecture/ADRs, right abstractions, no over-engineering, SOLID.
3. **Clean code**: naming, small functions, no duplication, no dead code or debug output.
4. **Reuse**: existing components/utilities used; new shared code is generic and placed correctly.
5. **Tests**: new behavior covered, meaningful assertions, build and tests pass.
6. **Docs**: README/docs/TSDoc/ADR/CHANGELOG updated.
7. **Security**: input validation, no secrets, no unsafe HTML injection, dependencies justified.
8. **Accessibility & performance** for UI changes.
9. **Git hygiene**: feature branch, focused Conventional Commits, no unrelated changes.

## Output
List findings as `[blocker|should-fix|nit] file:line – issue – suggestion`, then verdict **APPROVED** or **CHANGES REQUESTED**.
