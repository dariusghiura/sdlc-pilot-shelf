---
id: ADR-007
title: "Quality toolchain: oxlint, TypeScript, Vitest, Testing Library, jsdom; Playwright and axe-core planned"
status: approved
version: 1.0.0
based_on: { ARCH: 1.0.0 }
approved_by: dariusghiura
approved_on: 2026-10-29
superseded_by:
---

# ADR-007: Quality toolchain: oxlint, TypeScript, Vitest, Testing Library, jsdom; Playwright and axe-core planned

## Context

- **Commands:** GUIDELINES lists only commands that have been run. The walking skeleton comes from the official generator, `create-vite` 9.3.1 with the `react-ts` template, which ships oxlint and TypeScript 6.
- **Module boundaries:** ARCH §3 sets the boundaries and NFR-004 bans network and other storage APIs. Both need enforcement.
- **Accessibility:** NFR-001 needs automated checks on every screen and state.
- **Real browsers:** FR-006 and F12 can only be proven in a real browser.
- **Node version:** the owner's machine runs Node 22.13.1 (Windows 11). CI uses the latest Node 22.

## Options considered

| Concern | Option | Pros | Cons |
|---|---|---|---|
| Lint | **oxlint 1.89.0 (generator default)** | Fast. Built-in react, typescript and jsx-a11y plugins. Per-directory `overrides` with `no-restricted-imports`, `no-restricted-globals` and `react/no-danger`, all tested with deliberate violations on 2026-10-29. | Fewer third-party plugins than ESLint |
| | ESLint + typescript-eslint + plugins | The largest rule ecosystem | Several more dependencies, replacing what the generator chose |
| Unit and component tests | **Vitest 5.0.5 + Testing Library + jsdom** | Uses Vite's config and transforms; Testing Library's queries match how the UI spec names things (roles, accessible names) | jsdom has no layout, no IndexedDB and no real focus-visible |
| | Jest | Familiar | A second transform pipeline beside Vite |
| DOM environment | **jsdom 29.1.1** | Supports Node `^22.13.0`, so it runs on the owner's Node 22.13.1 | One major behind |
| | jsdom 30.1.3 | Latest | Requires Node `^22.22.2`. On Node 22.13.1, Vitest failed while loading undici. Tested 2026-10-29. |
| | happy-dom | Faster | Less complete accessibility-tree behaviour |
| End-to-end | **Playwright (planned)** | Chromium, Firefox and WebKit; real IndexedDB, reloads and Back; screenshots at exact sizes | Large browser downloads (an explicit `npx playwright install`) |
| | Cypress | Popular | Weaker multi-browser support; heavier |
| Automated accessibility | **axe-core (planned): directly in component tests and through `@axe-core/playwright`** | The standard rule engine; contrast checks in the real browser | MPL-2.0, acceptable because it is dev-only and never shipped |

## Decision

**In the skeleton now, exact pins:**

- `oxlint` 1.89.0, with the boundary rules in `app/.oxlintrc.json` and `--deny-warnings`
- `typescript` 6.0.3, run as `tsc -b`
- `vitest` 5.0.5 with `jsdom` 29.1.1
- `@testing-library/react` 16.3.3, `@testing-library/dom` 10.4.2 and `@testing-library/jest-dom` 7.0.1
- `vite` 8.3.5 and `@vitejs/plugin-react` 6.1.2

**Planned dev dependencies, approved with this ADR.** Each is added at an exact version by the issue that first needs it, after the licence check in GUIDELINES §8:

| Package | Licence | Purpose |
|---|---|---|
| `fake-indexeddb` | Apache-2.0 | Storage contract tests (ADR-002) |
| `@testing-library/user-event` | MIT | Keyboard and pointer interaction in component tests |
| `axe-core` | MPL-2.0 | Accessibility checks in component tests |
| `@playwright/test` | Apache-2.0 | End-to-end tests and screenshots of interactive states |
| `@axe-core/playwright` | MPL-2.0 | Accessibility checks in the real browser |

The planned runtime dependency `@fontsource-variable/literata` is approved by ADR-005.

**Formatting.** There is no formatter. Code keeps the generator's style: two-space indent, single quotes, no semicolons, trailing commas. Adding one (for example Prettier) would be a dependency change.

## Consequences

- **Positive:**
  - Few, fast tools.
  - Boundaries and privacy rules are machine-checked from the first feature.
  - The owner's current Node works.
- **Negative:**
  - jsdom stays one major behind until local Node reaches 22.22.2 (ARCH OQ-4).
  - Formatting is by convention only.
- **Harder:** jsdom can't prove layout, contrast or reflow. Those wait for Playwright and visual QA.
- **Revisit if:**
  - Local Node is updated: move to jsdom 30.
  - A needed rule exists only in ESLint.
