---
name: documentation-standards
description: Documentation rules - README, docs folder, doc comments, changelog. Use whenever code or behavior changes.
---

# Documentation Standards

- `README.md`: what the project is, setup, scripts, structure, how to contribute (workflow summary).
- `docs/architecture.md`: modules, diagrams (Mermaid), conventions. `docs/adr/`: decisions.
- Public functions, components and types get a short TSDoc comment (purpose, params, returns, throws).
- Reusable components document props/usage with a small example.
- Update docs in the same branch/PR as the code change; stale docs are a review blocker.
- Keep `CHANGELOG.md` (Keep a Changelog format) with a line per user-visible change.
- Write concisely: short sentences, examples over prose.
