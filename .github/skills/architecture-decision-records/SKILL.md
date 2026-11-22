---
name: architecture-decision-records
description: Write ADRs in docs/adr for significant architecture or technology decisions. Use when choosing a framework, library, pattern or structure.
---

# Architecture Decision Records

Create `docs/adr/NNNN-short-title.md` (4-digit sequence, never renumber). Never edit an accepted ADR; supersede it with a new one.

## Template
```markdown
# NNNN. Title
- Status: proposed | accepted | superseded by NNNN
- Date: YYYY-MM-DD

## Context
Forces, constraints, requirements.

## Options considered
1. Option A – pros/cons
2. Option B – pros/cons

## Decision
What we chose and why.

## Consequences
Positive, negative, follow-up work.
```

Write an ADR when a decision is costly to reverse, affects several modules, or adds a dependency.
