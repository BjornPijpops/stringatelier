---
name: design-patterns-guide
description: Guidance on choosing and applying design patterns and SOLID principles in TypeScript. Use when designing modules or reviewing structure.
---

# Design Patterns Guide

Patterns solve a concrete problem; never add one "just in case" (YAGNI).

## SOLID
- **S**ingle responsibility: one reason to change per module.
- **O**pen/closed: extend via composition/config, not edits.
- **L**iskov: subtypes are substitutable.
- **I**nterface segregation: small focused interfaces/types.
- **D**ependency inversion: depend on abstractions; inject dependencies.

## Pattern picker
| Problem | Pattern |
|---|---|
| Multiple interchangeable algorithms | Strategy |
| Object creation varies | Factory |
| Wrap third-party API / adapt shape | Adapter |
| Add behavior without subclassing | Decorator / composition |
| Notify many consumers | Observer / events |
| Hide complex subsystem | Facade |
| Data access abstraction | Repository |
| UI composition | Composition over inheritance, container/presentational split |

## Rules
- Prefer pure functions and immutable data.
- Separate concerns: UI, state, data access, domain logic.
- Keep dependencies pointing inward (domain knows nothing of UI/IO).
- Document non-obvious pattern use in a comment or ADR.
