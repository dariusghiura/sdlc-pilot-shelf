---
id: GUIDELINES
title: Shelf — Implementation Guidelines
status: approved
version: 1.0.0
based_on: { ARCH: 1.0.0 }
approved_by: dariusghiura
approved_on: 2026-10-29
---

# Implementation guidelines

Coding agents follow this document. It applies [ARCH](architecture.md) and [DATA-MODEL](data-model.md). Where this document and an approved spec disagree, the spec wins: stop and raise a change request (AGENTS.md §5).

## 1. Directory structure

The app lives in `app/`. The repository root belongs to the specs (`docs/`) and the SDLC kit (`.sdlc/`, `.claude/`, and the root `.gitignore`, `.gitattributes` and `.github/` files that the kit manages).

```text
app/
  index.html              the one HTML document (ADR-003)
  package.json            exact versions; scripts are the verified commands (section 7)
  package-lock.json       committed; CI installs with npm ci
  .npmrc                  save-exact=true, ignore-scripts=true
  .oxlintrc.json          lint rules, including the module boundaries (section 3)
  tsconfig*.json          TypeScript project references (app, node)
  vite.config.ts          Vite and Vitest configuration
  public/                 copied as is (planned: fonts/OFL.txt, ADR-005)
  scripts/                build-time Node scripts, no dependencies (planned: build-tokens.mjs, check-css.mjs; ADR-004)
  e2e/                    Playwright specs (planned, ADR-007)
  src/
    main.tsx              composition root: creates the repository, imports styles, renders the app
    App.tsx               skeleton placeholder; replaced by src/app/ in the first feature issue
    app/                  app shell: library state, router, focus intents, document title
    books/                domain: types, statuses, validation, order (no React, no storage)
    storage/              BookRepository port, IndexedDB adapter, schema and migrations
    pages/                one component per page (UX-001/002, UX-003, UX-004, UX-005)
    components/           UX-101 to UX-107
    styles/               tokens.css (generated), fonts.css, base.css
    qa/                   visual-QA fixtures, QA builds only (ARCH §10)
    test/                 setup.ts, shared fixtures and fakes
```

Only `src/App.tsx`, `src/App.test.tsx`, `src/main.tsx` and `src/test/setup.ts` exist in the walking skeleton. The rest is created by the issues that need it.

## 2. Naming conventions

- **Files.** React components use PascalCase `.tsx` (`LibraryPage.tsx`, `PageFrame.tsx`). Other modules use camelCase `.ts` (`validate.ts`, `indexedDbBookRepository.ts`). A component's CSS Module sits next to it (`PageFrame.module.css`), and so does its test (`PageFrame.test.tsx`).
- **UX components and pages** carry the UI spec's names. Each file starts with a one-line comment naming its UX ID:

  | UX ID | Component |
  |---|---|
  | UX-001 / UX-002 | `LibraryPage` |
  | UX-003 | `AddBookPage` |
  | UX-004 | `EditBookPage` |
  | UX-005 | `DeleteBookPage` |
  | UX-101 | `PageFrame` |
  | UX-102 | `LibraryEntry` |
  | UX-103 | `FilledButton` |
  | UX-104 | `TextLink` |
  | UX-105 | `TextField` |
  | UX-106 | `StatusRadioGroup` |
  | UX-107 | `SaveFailureMessage` |

- **Code.** Types and interfaces use PascalCase (`Book`, `BookRepository`, `StorageResult`). Functions and variables use camelCase. Constants that encode a spec value use UPPER_SNAKE_CASE (`SCHEMA_VERSION`, `MAX_TITLE_LENGTH = 200`).
- **Status codes** are the DATA-MODEL strings `want-to-read`, `reading` and `finished`. Display labels come only from `src/books`.
- **Exports:** new modules use named exports. The generator's `App` default export stays until `src/app/` replaces it.
- **CSS custom properties** come only from `tokens.css`, named as in ADR-004 (`--color-text-primary`, `--space-4`, `--font-size-title`). CSS Module class names are camelCase.
- **Copy:** every visible or visually hidden string is copied exactly from UI-SPEC and `docs/design/explorations/content.md`, including straight apostrophes and curly quotes. Never paraphrase.

## 3. Dependency rules

Allowed imports between modules in `app/src` (ARCH §3):

| Module | May import | Must not import |
|---|---|---|
| `books/` | Nothing outside itself | React, `app`, `pages`, `components`, `storage` |
| `storage/` | `books` | React, `app`, `pages`, `components` |
| `components/` | `books`, React | `app`, `pages`, `storage` |
| `pages/` | `books`, `components`, React | `app`, `storage` (data and callbacks arrive as props) |
| `app/` | `books`, `storage`, `pages`, `components`, React | — |
| `main.tsx` | `app`, `storage`, `styles` | — |
| `qa/` | `storage`, `books`, `app` | Anything in a production build |

**How they are enforced.** `npm run lint` runs oxlint with `--deny-warnings`, using [`app/.oxlintrc.json`](../../app/.oxlintrc.json):

- **Boundaries:** `no-restricted-imports` per directory (`overrides`).
- **Privacy:** `no-restricted-globals` everywhere for `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `localStorage` and `sessionStorage` (NFR-004). It also bans `indexedDB` outside `src/storage/` (ADR-002).
- **Injection:** `react/no-danger` blocks `dangerouslySetInnerHTML`.
- **Accessibility:** the jsx-a11y plugin, as a first line for NFR-001.
- **Tested:** on 2026-10-29 the rules were tested on throwaway files that broke each one. Every violation was reported, eight in total, and the storage adapter's own `indexedDB` use was allowed.

TypeScript runs in strict-unused mode (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`) through `tsc -b`.

## 4. Patterns to follow

| Situation | Pattern | Example file |
|---|---|---|
| Reading or writing books | Only through `BookRepository` (ARCH §7). Results are values: check `ok`, never `try`/`catch` around repository calls. Show a change only after `ok: true`. | Planned: `app/src/storage/bookRepository.ts` |
| Validating form input | `validateBookDetails(input)` in `src/books` trims, counts grapheme clusters and returns `{ ok, details }` or field errors with the UI-SPEC messages | Planned: `app/src/books/validate.ts` |
| Ordering books | `sortLibrary(books)` with the shared collator from DATA-MODEL §2; never sort elsewhere | Planned: `app/src/books/order.ts` |
| Changing page | `navigate(route, { replace })` from `src/app/router.ts`. Links keep a real `href` and intercept unmodified primary clicks only. | Planned: `app/src/app/router.ts` |
| Moving focus (F1 to F14) | The shell records a `FocusIntent` before navigating, and the next page consumes it in `useLayoutEffect`. Targets that aren't controls get `tabIndex={-1}`. | Planned: `app/src/app/focus.ts` |
| Page props | Pages receive data and async callbacks resolving to `{ ok: true }` or `{ ok: false }`; they never import `app` or `storage` | Planned: `app/src/pages/AddBookPage.tsx` |
| Ignoring double activation | A ref set while a save is in flight; the button is never disabled (UI-SPEC UX-103) | Planned: `app/src/pages/AddBookPage.tsx` |
| Styling | One CSS Module per component, using only `var(--…)` from `tokens.css`. Breakpoint: `@media (min-width: 48rem)`. | Planned: `app/src/components/PageFrame.module.css` |
| Hidden text | The shared visually-hidden class for "Error: ", "Status: " and the hidden titles on Edit/Delete | Planned: `app/src/styles/base.css` |
| Tests | Role and accessible-name queries, with requirement IDs in names (section 6) | [`app/src/App.test.tsx`](../../app/src/App.test.tsx) |

## 5. Patterns to avoid

- **Network and other storage:** any network API, analytics or third-party URL; `localStorage`, `sessionStorage` and cookies (NFR-004; lint).
- **New libraries** for routing, state, forms, CSS or UI kits. Adding a package needs section 8.
- **Unsafe HTML and inline styling:** `dangerouslySetInnerHTML`, `innerHTML`, inline `style` attributes, CSS-in-JS, and colour or length literals outside `tokens.css` (ADR-004, ADR-006).
- **Behaviour the UI spec excludes:**
  - live regions (`aria-live`, `role="status"`/`"alert"`), modal dialogs and overlays
  - disabled controls, `maxLength` on Title or Author, placeholder text, `autoFocus`
  - transitions, animations, smooth scrolling and hover styles (UI-SPEC §2)
- **Focus intents in the URL or in `history.state`**, which would break F1 after a reload.
- **The wrong ordering or validation primitives:** comparing titles with `toLowerCase()`, `localeCompare` without the shared collator, or `.length` for the 200-character limit.
- **Writes without the existence check:** `put` for an update without reading the record in the same transaction, which would re-create a deleted book.
- **Weak typing:** `any`, non-null assertions (except the root element in `main.tsx`), and `as` casts on stored records. Validate the shape instead.
- **Brittle tests:** snapshot tests, and tests of implementation details such as class names or internal state.
- **Editing generated or guarded files:** `tokens.css`, `.sdlc/`, `.claude/settings*.json` and `.claude/hooks/`.

## 6. Testing conventions

- **Location.** Unit and component tests sit next to the code as `*.test.ts` or `*.test.tsx`. Vitest includes `src/**/*.test.{ts,tsx}` (see `vite.config.ts`). End-to-end specs will live in `app/e2e/*.spec.ts`.
- **Names.** `describe` names the module or UX ID. `it` starts with the requirement and AC or rule it proves, for example:
  - `it('FR-001 AC-2: lists titles A–Z ignoring case', …)`
  - `it('FR-003 AC-4: keeps the form and shows the title message when Title is only spaces', …)`
  - `it('UX-003 F5: focuses Title before Author when both fail', …)`

  Tests with no requirement name what they prove (`'walking skeleton …'`).
- **Queries.** Testing Library queries by role and accessible name (`getByRole('link', { name: 'Edit Dune' })`), then by label, then by text. Never by test id or class. Use `toHaveFocus()` for F rules and `toHaveAccessibleName()` and `toHaveAccessibleDescription()` for the a11y contract.
- **Setup.** `src/test/setup.ts` registers jest-dom and runs `cleanup()` after each test. Tests import `describe`, `it` and `expect` from `vitest`; there are no globals.
- **Fixtures.**
  - `src/test/fixtures/sampleLibrary.ts` holds the 12 books of `content.md` in its order.
  - `src/test/fakeBookRepository.ts` is an in-memory `BookRepository` that can be told to fail reads or writes.
  - Component tests use the fake. Only storage tests use `fake-indexeddb`, imported per test file.
- **Independence.** Each test builds its own data. No test depends on order, the clock, the network or the machine's locale; the collator is fixed to `en`.
- **Coverage expectation.** Every AC in an issue has at least one test or a stated manual check in the PR. Every F rule a page owns has a component test.

## 7. Verified commands

Run these from `app/`. The documentation check runs from the repository root. All runs were on 2026-10-29: Windows 11, Git Bash, Node v22.13.1, npm 11.0.0.

| Purpose | Command | Verified on | Result |
|---|---|---|---|
| Install | `npm ci` | 2026-10-29 | Pass: 108 packages from the lockfile, "found 0 vulnerabilities" |
| Format / lint | `npm run lint` (`oxlint --deny-warnings`) | 2026-10-29 | Pass: exit 0, no findings. There is no formatter (ADR-007). |
| Type check | `npm run typecheck` (`tsc -b`) | 2026-10-29 | Pass: exit 0 |
| Unit tests | `npm test` (`vitest run`) | 2026-10-29 | Pass: 1 file, 1 test |
| Integration tests | — | — | None yet. Storage contract tests run under `npm test` once added (planned below). |
| Build | `npm run build` (`tsc -b && vite build`) | 2026-10-29 | Pass: `dist/index.html` 0.31 kB, one JS chunk of 219.62 kB (68.63 kB gzip) |
| Run locally | `npm run dev` (Vite dev server, http://localhost:5173/) | 2026-10-29 | Pass: the placeholder page "Shelf" rendered in the browser, with no console errors |
| Preview the production build | `npm run preview` (http://localhost:4173/, serves `dist/`) | 2026-10-29 | Pass: the placeholder page rendered |
| E2E / visual | From the repository root, with `npm run preview` running: `node .sdlc/scripts/capture-previews.mjs --url <name>=http://localhost:4173/<route> --out <dir> --viewports desktop,mobile,320x640 --themes light,dark` | 2026-10-29 | Capture only: 18 images, 0 failures for `/`, `/?page=add` and `/?page=edit&book=1` (Chrome 156). No product pages exist yet to compare with the references. Hash URLs (`/#/`) fail after the first capture (ADR-003). |
| Documentation check | `node .sdlc/scripts/validate-docs.mjs` (add `--strict` for gates) | 2026-10-29 | Pass: "14 gate document(s), 31 ID(s); 0 error(s), 0 warning(s)", also with `--strict` |
| Licence lookup | `npm view <name>@<version> license` | 2026-10-29 | Pass, for example `@fontsource-variable/literata@5.3.0` reports `OFL-1.1` |

**CI.** The `app-check` job (`.github/workflows/app-check.yml`) runs `npm ci`, `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` in `app/` on the latest Node 22, on every pull request and on pushes to `main`.

**Planned, not yet verified.** These don't exist yet. The issue that creates each one runs it, records it in this table and, where CI should run it, adds it to `app-check` (a workflow change the owner confirms).

- `npm run tokens`, and the `--check` mode inside `npm run lint` (ADR-004)
- The CSS literal check inside `npm run lint` (ADR-004)
- `npm run test:e2e` (Playwright, ADR-007), including `npx playwright install` for the browsers
- Automated accessibility checks with axe-core, in `npm test` and `npm run test:e2e`
- The QA build and preview (`vite build --mode qa`, ARCH §10), and visual QA comparisons against `docs/design/previews/v1/` and `docs/design/ui-states/`
- The deploy workflow (ADR-006), which only the owner runs

## 8. Dependency policy

- **Approval first.** A new package, runtime or dev, needs an approved ADR or ARCH section that names it, or an approved spec-change-request issue (AGENTS.md §4). Approved by ARCH v1.0.0, to be added when first needed:
  - runtime: `@fontsource-variable/literata` (ADR-005)
  - dev: `fake-indexeddb`, `@testing-library/user-event`, `axe-core`, `@playwright/test` and `@axe-core/playwright` (ADR-007)
- **Exact versions.**
  - `app/.npmrc` sets `save-exact=true`, and every version in `package.json` is exact.
  - The lockfile is committed, and CI installs with `npm ci`.
  - Never hand-edit the lockfile.
- **Minimum release age of 7 days.** Resolve with `npm install <name>@<version> --before=<ISO date 7 days ago>`, so nothing published in the last week is pulled in. The skeleton was resolved with `--before=2026-10-22T00:00:00Z`. The generator was `create-vite@9.3.1`, published 2026-10-20; 9.3.2 and 9.3.3 were newer than a week.
- **No install scripts.** `app/.npmrc` sets `ignore-scripts=true`, and the skeleton's tree has no install scripts. A package that needs one, such as a browser download, documents the explicit command instead (`npx playwright install`).
- **Licence check.**
  - Run `npm view <name>@<version> license` for the package and review the licences its lockfile entries add.
  - **Allowed in the shipped app:** MIT, MIT-0, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, 0BSD, and OFL-1.1 for fonts.
  - **Additionally allowed for dev-only tools:** MPL-2.0, BlueOak-1.0.0 and CC0-1.0.
  - Anything else needs the owner's decision.
  - The skeleton's tree has 108 packages besides itself: 91 MIT, 5 Apache-2.0, 2 each of MIT-0, BSD-2-Clause, BSD-3-Clause, ISC and MPL-2.0 (lightningcss, a Vite build dependency), and 1 each of BlueOak-1.0.0 and CC0-1.0. Only React, React DOM and its `scheduler` dependency (all MIT) are shipped.
- **Security.** Report `npm audit` in the PR that adds or updates packages. The skeleton found 0 vulnerabilities.
- **Updates.** One PR per batch of updates, with the reason, the same checks, and every verified command re-run.
- **Node.** `engines.node` is `>=22.13.0`, the floor of the current tree (jsdom 29). Moving to jsdom 30 needs Node 22.22.2 or later (ADR-007).

## 9. Change log

| Version | Date | Change | Decided by |
|---|---|---|---|
| 1.0.0 | 2026-10-29 | Initial guidelines with the walking skeleton (create-vite 9.3.1, react-ts) in `app/`: structure, naming, lint-enforced boundaries, patterns, testing conventions, verified commands and dependency policy. | Drafted by an AI agent; for owner review |
