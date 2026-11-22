---
name: feature-planning
description: Break a feature into small, testable tasks with acceptance criteria and a definition of done. Use when starting a new feature.
---

# Feature Planning

1. Restate the feature goal and the user value in 1–2 sentences.
2. Write acceptance criteria as Given/When/Then, each independently verifiable.
3. Identify reusable existing code and needed ADRs (ask `architect` if unsure).
4. Split into tasks of ≤ half a day each, ordered by dependency; each task = one commit-sized, testable change.
5. Note risks, open questions and out-of-scope items.

## Output template
```markdown
## Feature: <name>  (branch: feature/<name>)
Goal:
### Acceptance criteria
- [ ] Given… When… Then…
### Tasks
1. <task> – files, tests
### Risks / questions
### Definition of Done
- [ ] Build + tests green  - [ ] QA PASS  - [ ] Reviewer APPROVED  - [ ] Docs updated  - [ ] User approved merge
```
