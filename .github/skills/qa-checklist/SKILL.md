---
name: qa-checklist
description: Feature verification checklist for QA - acceptance criteria, accessibility, responsiveness, performance, SEO, cross-browser. Use when signing off a feature.
---

# QA Checklist

- [ ] Each acceptance criterion verified, with evidence
- [ ] Build and full test suite pass
- [ ] Edge cases: empty/long/invalid input, errors, slow or failed network
- [ ] Accessibility: keyboard navigation, focus order, alt text, labels, contrast, headings
- [ ] Responsive: mobile, tablet, desktop
- [ ] Cross-browser: latest Chrome, Firefox, Safari/Edge
- [ ] Performance: no oversized assets, lazy loading, no layout shift
- [ ] SEO: title, meta description, semantic structure, valid links
- [ ] No console errors/warnings, no regressions in existing features
- [ ] Docs updated

## Report
`QA PASS` or `QA FAIL`, then defects as: title, steps to reproduce, expected, actual, severity.
