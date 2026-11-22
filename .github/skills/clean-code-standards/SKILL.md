---
name: clean-code-standards
description: Clean code rules for all code in this repo (naming, functions, DRY, TypeScript strictness, error handling). Use when writing or reviewing any code.
---

# Clean Code Standards

## Naming
- Intention-revealing names; no abbreviations or noise (`data`, `tmp`, `manager`).
- Booleans read as questions (`isVisible`, `hasError`); functions are verbs; types are nouns.

## Functions & modules
- One job per function; aim for <20 lines and ≤3 parameters (use an options object beyond that).
- One level of abstraction per function; early returns over deep nesting.
- Files stay focused (<300 lines); one main export per file.
- No duplication: extract on the second repetition of real logic.
- No dead code, no commented-out code, no magic numbers (named constants).

## TypeScript
- `strict` on; avoid `any` (use `unknown` + narrowing); prefer `readonly`, union types, discriminated unions.
- Explicit types on public APIs; infer locally.

## Errors
- Fail fast, validate at boundaries, never swallow errors; error messages say what and why.

## Comments
- Explain *why*, not *what*. Code should be self-explanatory.

## Before committing
Build passes, tests pass, no stray `console.log`, no unrelated changes.
