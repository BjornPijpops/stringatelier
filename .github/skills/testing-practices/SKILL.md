---
name: testing-practices
description: Testing strategy and conventions (test pyramid, naming, AAA, mocks). Use when writing or evaluating tests.
---

# Testing Practices

- Pyramid: many unit tests, fewer integration tests, few end-to-end tests for critical journeys.
- Structure each test as Arrange / Act / Assert; one behavior per test.
- Name: `<unit> <does what> when <condition>`.
- Test behavior, not implementation; mock only at boundaries (network, time, filesystem).
- Cover happy path, edge cases (empty, null, boundaries), and error paths.
- Tests are deterministic, independent and fast; no shared mutable state.
- Fix bugs test-first: write a failing regression test, then fix.
- Co-locate tests with the code (`*.test.ts`); keep coverage meaningful on new code rather than chasing a number.
- Run the full suite and build before declaring work done.
