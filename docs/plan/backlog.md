---
id: BACKLOG
title: Shelf — MVP Backlog
status: approved
version: 1.0.1
based_on: { PRD: 1.1.0, UI-SPEC: 1.1.0, ARCH: 1.0.1 }
approved_by: dariusghiura
approved_on: 2026-10-29
---

# MVP backlog

This backlog splits the Now scope of the [PRD](../product/prd.md) v1.1.0 into small vertical slices: FR-001 to FR-006 (including FR-006 AC-4), under NFR-001 to NFR-004. It was planned against [UI-SPEC](../design/ui-spec.md) v1.1.0 (UX-001 to UX-006, UX-101 to UX-107, focus rules F1 to F15), [TOKENS](../design/tokens.json) v1.0.0, [DESIGN-BRIEF](../design/design-brief.md) v1.0.1, [ARCH](../architecture/architecture.md) v1.0.1, [DATA-MODEL](../architecture/data-model.md) v1.0.0, [GUIDELINES](../architecture/implementation-guidelines.md) v1.0.0 and ADR-001 to ADR-007. It adds no requirement. Nothing is published to GitHub until this document is approved (section 6).

**Conventions.**

- **Keys:** slices are keyed `S-01` to `S-17` in dependency order. A slice may start only when every slice in its "Blocked by" column is merged.
- **Types:** `feature` slices change what the reader sees and are checked end to end in the running app. `chore` slices are foundation work that ARCH or GUIDELINES mark as planned and that no feature slice can reasonably carry. Each chore names the feature slice that first needs it.
- **Areas** match the repository labels: `frontend` (UI, so `gate.mjs issue` also requires DESIGN-BRIEF, UI-SPEC and TOKENS), `db` (storage) and `infra` (build, test harness, CI, deploy).
- **AC references:** "FR-003 AC-4" is a PRD acceptance criterion, "UX-003 VAC-4" a UI-SPEC visual acceptance criterion, and "F5" a UI-SPEC §2 focus rule. ARCH §7 rules are cited as "ARCH §7 rule 2".
- **Interim behaviour:** some slices land before the page a link opens. Until then, that link's route falls back to the library (the "unknown route" rule of ADR-003). Each slice states its interim behaviour under "Out of scope".

## 1. Milestones / epics

| Milestone | Goal | Slices |
|---|---|---|
| M1 — First visit | Shelf opens on its own design, reads the stored library, and shows the empty library or the read failure (J1 step 1). | S-01, S-02, S-03, S-04, S-05, S-06, S-07 |
| M2 — Library and adding books | The reader sees every book in title order and can add one, with validation and save-failure handling; J1 runs end to end in a real browser (J1). | S-08, S-09, S-10, S-11, S-12, S-13 |
| M3 — Edit, delete and release readiness | The reader can edit and delete books (J2, J3); end-to-end checks cover J2, J3 and 500 books; a deploy workflow exists for the owner to run. | S-14, S-15, S-16, S-17 |

## 2. Slices (dependency order)

| Key | Title (outcome) | Type | Area | Size | Prio | Requirements | UX | ADRs | Blocked by | Issue # |
|---|---|---|---|---|---|---|---|---|---|---|
| S-01 | Design tokens become CSS, and raw values are rejected | chore | frontend | S | P0 | NFR-001 | UX-101 (base styles) | ADR-004 | — | #10 |
| S-02 | Shelf opens on its own page frame, set in Literata | feature | frontend | S | P0 | NFR-001, NFR-002, NFR-004 (FR-001 Loading state) | UX-101, UX-001 (Loading) | ADR-004, ADR-005, ADR-007 | S-01 | #11 |
| S-03 | Production builds carry the Content-Security-Policy | chore | infra | XS | P0 | NFR-004 | — | ADR-006, ADR-003 | S-02 | #12 |
| S-04 | Books are stored in IndexedDB behind the `BookRepository` port | chore | db | M | P0 | FR-006, NFR-003, NFR-004 | — | ADR-002, ADR-007 | — | #13 |
| S-05 | A first visit shows the empty library | feature | frontend | S | P0 | FR-002, FR-006, NFR-001, NFR-002 | UX-002, UX-101, UX-103 | ADR-002, ADR-003, ADR-007 | S-02, S-04 | #14 |
| S-06 | When the library can't be read, Shelf says so and offers to try again | feature | frontend | S | P0 | FR-006, FR-002, NFR-001, NFR-002 | UX-006, UX-101, UX-103 | ADR-002, ADR-003 | S-05 | #15 |
| S-07 | A QA build seeds the sample library and can make writes fail | chore | infra | S | P0 | NFR-004 | — | ADR-003 | S-05 | #16 |
| S-08 | The library lists every book in title order | feature | frontend | M | P0 | FR-001, NFR-001, NFR-002, NFR-003 | UX-001, UX-101, UX-102, UX-103, UX-104 | ADR-003, ADR-004 | S-07 | #17 |
| S-09 | The reader can open the add form and cancel back to the library | feature | frontend | M | P0 | FR-001, FR-002, FR-003, NFR-001, NFR-002 | UX-003, UX-101, UX-103, UX-104, UX-105, UX-106 | ADR-003 | S-08 | #18 |
| S-10 | The reader can save a new book and see it in the library | feature | frontend | S | P0 | FR-003, FR-001, FR-006 | UX-003, UX-001, UX-102 | ADR-002, ADR-003 | S-09 | #19 |
| S-11 | The add form says what to fix when the details break the rules | feature | frontend | S | P0 | FR-003, NFR-001 | UX-003, UX-105 | — | S-10 | #20 |
| S-12 | A new book that can't be stored is reported, not shown as saved | feature | frontend | S | P0 | FR-006, FR-003, NFR-001 | UX-003, UX-107 | ADR-002 | S-10 | #21 |
| S-13 | End-to-end checks run J1 in a real browser | chore | infra | M | P0 | FR-006, NFR-001, NFR-002, NFR-004 | UX-001, UX-002, UX-003, UX-006 | ADR-007, ADR-006 | S-03, S-06, S-11, S-12 | #22 |
| S-14 | The reader can edit a book | feature | frontend | M | P0 | FR-004, FR-001, FR-006, NFR-001, NFR-002 | UX-004, UX-101, UX-103, UX-104, UX-105, UX-106, UX-107 | ADR-002, ADR-003 | S-11, S-12, S-13 | #23 |
| S-15 | The reader can delete a book after confirming | feature | frontend | M | P0 | FR-005, FR-002, FR-001, FR-006, NFR-001, NFR-002 | UX-005, UX-002, UX-101, UX-103, UX-104, UX-107 | ADR-002, ADR-003 | S-12 | #24 |
| S-16 | End-to-end checks cover J2, J3, Back and a 500-book library | chore | infra | S | P0 | NFR-003, NFR-001, NFR-002, FR-004, FR-005, FR-006 | UX-004, UX-005 | ADR-007 | S-13, S-14, S-15 | #25 |
| S-17 | An owner-run deploy workflow publishes Shelf to GitHub Pages (owner runs it) | chore | infra | S | P1 | NFR-004, NFR-002 | — | ADR-006 | S-03, S-16 | #26 |

**Parallel work.** S-04 has no blocker and can run beside S-01 to S-03. S-03 and S-07 can run beside S-06. S-11 and S-12 can run side by side. S-14 and S-15 can run side by side once their blockers are merged.

## 3. Slice details

Every slice uses this **Definition of Done:** CI green; ACs covered by tests; PR links issue, IDs and spec versions; reviewer findings addressed or accepted by the human. UI slices add screenshots at the reference viewports and themes listed under "Visual QA", as the feature-slice issue form requires. Slice-specific additions are listed per slice.

Visual QA uses the UI-SPEC §2 comparison viewports: desktop 1440×900, mobile 390×844 and 320×640, in light and dark. "capture-previews" means `node .sdlc/scripts/capture-previews.mjs --url <name>=<url> --out <dir> --viewports desktop,mobile,320x640 --themes light,dark` against `npm run preview` (GUIDELINES §7). It can't type or submit, so states behind a form submission are captured with Playwright once S-13 exists, or by hand before it (ARCH §10).

### S-01 — Design tokens become CSS, and raw values are rejected

- **Type / area / size:** chore, frontend, S. First needed by S-02.
- **In scope:**
  - `app/scripts/build-tokens.mjs` with the ADR-004 mapping (rules 1 to 6) and a `--check` mode; the generated, committed `app/src/styles/tokens.css` with its "generated from TOKENS v1.0.0, do not edit" header.
  - `app/scripts/check-css.mjs` with the ADR-004 allow-list.
  - An `npm run tokens` script; `npm run lint` also runs `build-tokens.mjs --check` and `check-css.mjs` (ADR-004), so `app-check` needs no workflow change.
  - Vitest's `test.include` extended to `scripts/*.test.mjs`, where ADR-004 puts the script tests (the skeleton includes only `src/**`).
  - `app/src/styles/base.css`: the reset, the `:focus-visible` outline from the `--focus-*` properties, no outline on `[tabindex="-1"]` targets, the shared visually-hidden class, and the page background and text colours from the theme roles (ARCH §5.3, UI-SPEC §2 focus indicator). `main.tsx` imports `tokens.css` and `base.css`.
- **Out of scope:** fonts (S-02); any component CSS (S-02 onwards); changes to `tokens.json` (TOKENS is approved and frozen).
- **Acceptance criteria:**
  - **AC-1** Given TOKENS v1.0.0, when `npm run tokens` runs, then `tokens.css` defines every non-palette token as a custom property following ADR-004 rules 1 to 6: theme roles as `--color-*` on `:root` with `color-scheme: light`, redefined under `@media (prefers-color-scheme: dark)` with `color-scheme: dark`; responsive pairs redefined under `@media (min-width: 48rem)`; and no `color.palette.*` property.
  - **AC-2** Given `tokens.css` differs from what `tokens.json` produces, when `npm run lint` runs, then it fails and names `tokens.css`.
  - **AC-3** Given a CSS file other than `tokens.css` contains a colour literal (`#…`, `rgb(`, `hsl(`, a named colour) or a px, rem or em length, when `npm run lint` runs, then it fails naming the file and line; `0`, percentages, `fr`, `auto` and `(min-width: 48rem)` pass (ADR-004).
  - **AC-4** Given the built skeleton in either colour scheme, when it is opened, then the page uses `{theme.*.surface.page}` as its background and `{theme.*.text.primary}` as its text colour, and the browser draws scrollbars in the matching scheme (UI-SPEC §2 Themes).
- **Test expectations:** unit tests in `app/scripts/build-tokens.test.mjs` (alias resolution, palette omitted, theme mapping, responsive pair, value formats, `--check` exit code) and `app/scripts/check-css.test.mjs` (each forbidden literal, each allowed value). Names cite ADR-004, for example `it('ADR-004 rule 4: emits a responsive pair once with a 48rem override', …)`. AC-4 is a manual check in the PR.
- **Visual QA:** n/a (no component yet). AC-4 is checked by eye in both schemes.
- **Relies on:** ADR-004; TOKENS v1.0.0; ARCH §5.3; GUIDELINES §2 (property names), §5.
- **Blocked by:** none.
- **New commands / dependencies:** `npm run tokens` (planned in GUIDELINES §7); the `--check` mode and the CSS check inside `npm run lint`. No new dependency.
- **Definition of Done:** as above, plus the PR records the new commands as run (see BQ-2).

### S-02 — Shelf opens on its own page frame, set in Literata

- **Type / area / size:** feature, frontend, S.
- **In scope:**
  - `PageFrame` (UX-101): the sheet, the two-column grid and the margin rule (out of the accessibility tree), the masthead (`header`) with its minimum height, the wordmark `text` variant, the skip link "Skip to your library", and `main` with `tabIndex={-1}`.
  - The app shell's first file in `src/app/`, rendering the UX-001 Loading state (the frame with an empty `main`). It replaces the skeleton's `App.tsx` and `App.test.tsx`, as GUIDELINES §1 plans.
  - Self-hosted Literata per ADR-005: `@fontsource-variable/literata` at an exact version, `src/styles/fonts.css` with one `@font-face` per subset for normal and italic over the package's `opsz` files and `font-display: swap`, `font-optical-sizing: auto` on the body, and the package licence copied into the build as `fonts/OFL.txt`.
  - `@testing-library/user-event` for keyboard tests.
- **Out of scope:** reading storage and any `h1` (S-05); the "Add a book" header action (S-08); the wordmark `link` variant (S-09); the Content-Security-Policy (S-03).
- **Acceptance criteria:**
  - **AC-1** (UX-001 Loading state) Given Shelf is opened, when the page renders, then it shows the sheet, the margin rule and a masthead holding only the wordmark "Shelf" as plain text, and `main` is empty: no heading, count line, list, empty-library message, spinner or placeholder.
  - **AC-2** (F1) Given Shelf has just loaded, when nothing has been pressed, then no element has focus; when the reader presses Tab, the skip link "Skip to your library" receives focus and appears at `{space.2}` from the top and `{layout.gutter.*}` from the left on `{theme.*.surface.accent}` (UX-101).
  - **AC-3** (F13) Given the skip link has focus, when the reader activates it, then `main` receives focus, shows no outline and is in view, and the URL is unchanged.
  - **AC-4** (UI-SPEC §2 focus indicator) Given the skip link has keyboard focus, then it shows a `{focus.width}` solid outline in `{theme.*.focus.ring}`, `{focus.offset}` outside it.
  - **AC-5** (NFR-004, ADR-005) Given the production build under `npm run preview`, when the page loads, then every font file comes from Shelf's own origin, the wordmark renders in Literata italic, and no request goes to another origin.
  - **AC-6** (UI-SPEC §2 Themes and reflow, NFR-002) Given a dark colour-scheme preference, when Shelf is opened, then the frame uses the `theme.dark` roles; given a 320×640 viewport, nothing scrolls sideways (`scrollWidth` ≤ 320).
- **Test expectations:** component tests `PageFrame.test.tsx` and the shell's test, for example `it('UX-101 F13: the skip link focuses main', …)`, `it('UX-001 Loading: renders the frame with an empty main', …)`, `it('F1: moves no focus on load', …)`, and landmark checks (`header`, `main`). AC-5 and AC-6 are manual checks in the browser, reported in the PR.
- **Visual QA:** there is no reference image of the Loading state. capture-previews `--url frame=http://localhost:4173/` at all three viewports and both themes; compare the masthead band and the margin rule with the top of `docs/design/ui-states/empty-library-{desktop,mobile,320x640}-{light,dark}.png` (wordmark right-aligned in the margin when wide, at the start of the text column when narrow; the rule in the same place).
- **Relies on:** ADR-004 (S-01's tokens), ADR-005, ADR-007 (user-event); ARCH §5.4, §5.6; UI-SPEC §2, UX-101.
- **Blocked by:** S-01.
- **New commands / dependencies:** runtime `@fontsource-variable/literata` (approved by ADR-005); dev `@testing-library/user-event` (approved by ADR-007). Both pinned exactly, resolved with `--before` 7 days back, licence-checked, with `npm audit` in the PR (GUIDELINES §8).
- **Definition of Done:** as above.

### S-03 — Production builds carry the Content-Security-Policy

- **Type / area / size:** chore, infra, XS. First needed by S-13 (which fails on CSP violations) and S-17 (which ships the build).
- **In scope:** the Vite plugin with `apply: 'build'` that inserts the ADR-006 CSP `<meta>` as the first element of `<head>`, plus `<meta name="referrer" content="no-referrer">`; `base: './'` and `build.assetsInlineLimit: 0` in `vite.config.ts` (ARCH §5.2, §9).
- **Out of scope:** response headers (impossible on GitHub Pages, ADR-006); the deploy workflow (S-17).
- **Acceptance criteria:**
  - **AC-1** (NFR-004, ADR-006) Given `npm run build`, when `dist/index.html` is inspected, then the first element of `<head>` is the CSP `<meta>` with exactly the ADR-006 policy, followed by the referrer `<meta>`.
  - **AC-2** Given `npm run dev`, when the page is served, then it carries no CSP `<meta>` (the dev server needs inline scripts and a WebSocket).
  - **AC-3** Given `npm run preview`, when Shelf loads, then scripts, styles and fonts load, no `securitypolicyviolation` is reported in the console, and no asset is a `data:` URI.
  - **AC-4** (ADR-003) Given the build is served from a sub-path, when Shelf loads, then every asset URL resolves relative to `index.html`.
- **Test expectations:** a unit test of the plugin's HTML transform (`it('NFR-004: inserts the ADR-006 policy first in head', …)`). AC-2 to AC-4 are manual checks in the PR; S-13 automates the CSP-violation check.
- **Visual QA:** n/a.
- **Relies on:** ADR-006, ADR-003; ARCH §9.
- **Blocked by:** S-02 (so the font files are verified under the policy).
- **New commands / dependencies:** none.
- **Definition of Done:** as above.

### S-04 — Books are stored in IndexedDB behind the `BookRepository` port

- **Type / area / size:** chore, db, M. First needed by S-05.
- **In scope:**
  - `src/books/book.ts`: `Book`, `BookDetails`, `ReadingStatus`, `BookId` and the status labels (ARCH §7, GUIDELINES §2).
  - `src/storage/bookRepository.ts`: the port exactly as ARCH §7, re-exporting the domain types.
  - `src/storage/schema.ts` (`SCHEMA_VERSION = 1`, `migrateTo1`) and `src/storage/indexedDbBookRepository.ts`, following ARCH §7 rules 1 to 8 and DATA-MODEL §2, §3 and §5: commit before success with `durability: 'strict'`, one record per transaction, `get` and `put` in one transaction for updates, idempotent deletes, the connection rules, the `VersionError` fallback, the 10-second `blocked` report, the shape check on read, the error mapping and logging without book details.
  - `src/test/fakeBookRepository.ts` (in memory, told to fail reads or writes) and `src/test/fixtures/sampleLibrary.ts` (the 12 books of `content.md`), per GUIDELINES §6.
  - `fake-indexeddb` as a dev dependency.
- **Out of scope:** wiring the repository into `main.tsx` and the shell (S-05); `sortLibrary` (S-08); validation (S-10).
- **Acceptance criteria:**
  - **AC-1** (FR-006 AC-1, AC-2; ARCH §7 rule 2) Given `addBook` resolved `ok: true`, when a new repository instance over the same database calls `listBooks`, then the book is returned with the same title, author and status.
  - **AC-2** (ARCH §7 rule 5; supports FR-001 AC-3) Given books were added in a known order, when `listBooks` resolves, then they are in creation order (ascending `id`).
  - **AC-3** (FR-006 AC-3; ARCH §7 rule 1) Given a write fails with a simulated DOMException, when it is called, then it resolves `ok: false` with the mapped `kind` and never rejects, and a later `listBooks` does not contain the change.
  - **AC-4** (FR-006 AC-4; ARCH §7 rule 7; DATA-MODEL §5) Given opening fails, then `listBooks` resolves `ok: false` with `kind` `unavailable` for a missing `indexedDB`, `SecurityError`, or `UnknownError`/`InvalidStateError` on open; `newer-version` for a `VersionError` when the fallback open finds no `books` store; `blocked` when an upgrade still waits after 10 seconds; and `failed` when a stored record is not a valid book.
  - **AC-5** (FR-006 edge case: reading never changes or deletes stored books) Given `listBooks` succeeds or fails, then the stored records are unchanged.
  - **AC-6** (DATA-MODEL §3) Given no book has the id, when `updateBook` is called, then it resolves `ok: true` with `null` and creates no record; when `deleteBook` is called, it resolves `ok: true`.
  - **AC-7** (DATA-MODEL §5) Given an empty origin, when the repository first opens, then database `shelf` version 1 has one store `books` with key path `id` and auto-increment, and no index; given a newer database that has the `books` store, it opens and works.
  - **AC-8** (ARCH §7 rule 4) Given another tab triggers `versionchange`, then the connection closes, and the next call opens a new one.
  - **AC-9** (NFR-004; ARCH §7 rule 8) Given any failure, then it is logged with `console.error` naming the operation and the DOMException name, and never a title or author.
  - **AC-10** (NFR-003) Given 500 stored books, when `listBooks` resolves, then all 500 are returned once.
- **Test expectations:** storage contract tests with `fake-indexeddb`, imported per test file, in `src/storage/indexedDbBookRepository.test.ts`; names cite the requirement or rule, for example `it('FR-006 AC-2: a committed add is read back by a new connection', …)` and `it('ARCH §7 rule 7: maps SecurityError on open to unavailable', …)`. A short test proves the fake repository honours the port.
- **Visual QA:** n/a.
- **Relies on:** ADR-002, ADR-007; ARCH §7 (the contract); DATA-MODEL v1.0.0 §2, §3, §5, §6.
- **Blocked by:** none.
- **New commands / dependencies:** dev `fake-indexeddb` (approved by ADR-002 and ADR-007), with the GUIDELINES §8 checks.
- **Definition of Done:** as above, plus the PR cites DATA-MODEL v1.0.0.

### S-05 — A first visit shows the empty library

- **Type / area / size:** feature, frontend, S.
- **In scope:**
  - `main.tsx` as the composition root: it creates the IndexedDB repository and renders the shell (ARCH §3).
  - The shell's library reducer (`loading`, `ready`, `unreadable`) and the start-up read (ARCH §4 steps 1 to 3, §5.1).
  - `src/app/router.ts` parsing the library route; other routes are replaced by the library for now (ADR-003).
  - `LibraryPage` empty variant (UX-002): `h1` "Your library is empty", the sentence, and the "Add a book" filled button in `main` (UX-103 `link` variant, `href` `./?page=add`). The masthead keeps only the plain-text wordmark.
  - The document title "Your library is empty — Shelf" (UI-SPEC §1).
  - `axe-core` checks in component tests.
- **Out of scope:**
  - The read-failure page (S-06). Until it lands, a failed read keeps the Loading frame, never UX-002.
  - A library with books (S-08). Until it lands, a non-empty library keeps the Loading frame; no book can be added before S-10.
  - The add page (S-09). Until it lands, "Add a book" leads back to the library.
- **Acceptance criteria:**
  - **AC-1** (FR-002 AC-1; UX-002) Given the library contains no books, when the reader opens Shelf, then once the read completes the page shows the `h1` "Your library is empty", the sentence "Add the books you want to read, are reading or have finished." and one "Add a book" filled button in `main`; the masthead holds only the wordmark as plain text, and there is no count line.
  - **AC-2** (FR-002 edge case, A10) Given a first visit, when Shelf has opened, then no sample book has been added: the store is still empty.
  - **AC-3** (UX-002 Loading state) Given the read has not completed, when the page renders, then `main` is empty, so the empty library never flashes before the read completes.
  - **AC-4** (FR-006 AC-4, first half) Given the read fails, when Shelf opens, then the empty library is not shown.
  - **AC-5** (F1; UI-SPEC §2 focus order) Given UX-002 has rendered, then nothing has focus; Tab reaches the skip link, then "Add a book".
  - **AC-6** (UI-SPEC §1 page titles) Given UX-002 is shown, then the document title is "Your library is empty — Shelf".
  - **AC-7** (NFR-001) Given UX-002, when axe runs in the component test, then it reports no violations.
- **Test expectations:** `LibraryPage.test.tsx` and shell tests with the fake repository, for example `it('FR-002 AC-1: shows the empty library when no books are stored', …)`, `it('FR-006 AC-4: never shows the empty library when the read fails', …)`, `it('UX-002 Loading: renders nothing in main before the read resolves', …)`.
- **Visual QA:** UX-002 VAC-1 to VAC-4 against `docs/design/ui-states/empty-library-{desktop,mobile,320x640}-{light,dark}.png`. capture-previews `--url empty=http://localhost:4173/` (each run starts with a fresh profile, so the library is empty).
- **Relies on:** ADR-002 (the port from S-04), ADR-003, ADR-007 (axe-core); ARCH §4 start-up, §5.1.
- **Blocked by:** S-02, S-04.
- **New commands / dependencies:** dev `axe-core` (approved by ADR-007), with the GUIDELINES §8 checks.
- **Definition of Done:** as above.

### S-06 — When the library can't be read, Shelf says so and offers to try again

- **Type / area / size:** feature, frontend, S.
- **In scope:**
  - The read-failure page (UX-006) in place of whichever page was asked for while the shell is `unreadable`, with the address left unchanged (ARCH §4 step 4, UI-SPEC §1).
  - Its skip link "Skip to the message", the plain-text wordmark with no "Add a book", the `h1`, the sentence, and the "Try again" filled button (UX-103 `button` variant, `type="button"`).
  - "Try again" reads again without a reload; UX-006 stays as it is while the read runs, and a second activation is ignored (UI-SPEC D14).
  - The one-shot focus-intent mechanism of ARCH §5.5 (`src/app/focus.ts`), with its first rule, F15.
  - `popstate` while `unreadable` renders UX-006 again.
  - The document title "Your library couldn't be opened — Shelf".
- **Out of scope:** F15 for the add, edit and delete pages, which their own slices (S-09, S-14, S-15) add.
- **Acceptance criteria:**
  - **AC-1** (FR-006 AC-4; UX-006) Given the stored library can't be read when Shelf opens, when the library page is shown, then it shows the `h1` "Your library couldn't be opened", the sentence "Your browser didn't let Shelf read the books saved here. Try again, or check that this browser allows sites to store data." and one "Try again" button; there is no count line, list, empty-library message or "Add a book", and nothing sits in the margin except the wordmark.
  - **AC-2** (FR-006 AC-4; UI-SPEC §1) Given Shelf is opened at `./?page=add` and the read fails, then UX-006 is shown and the address stays `./?page=add`; no control on the page adds, edits or deletes books.
  - **AC-3** (F1) Given UX-006 first appears, then nothing has focus; Tab reaches the skip link, then "Try again".
  - **AC-4** (F15; D14) Given UX-006, when the reader activates "Try again" and the read fails again, then the page is unchanged and focus is on its `h1`; a second activation while the read runs starts no second read.
  - **AC-5** (F15; FR-006 edge cases) Given UX-006, when the reader activates "Try again" and the read succeeds, then the page that was asked for is shown (UX-002 or, once S-08 lands, UX-001), focus is on its `h1`, and the stored books are unchanged.
  - **AC-6** (UI-SPEC §1) Given UX-006, when the reader uses Back or Forward between Shelf's pages, then UX-006 is shown again; a reload reads the library again from the start (F1).
  - **AC-7** (UI-SPEC §1; NFR-001) Given UX-006, then the document title is "Your library couldn't be opened — Shelf", and axe reports no violations in the component test.
- **Test expectations:** shell and page tests with the fake repository failing reads, for example `it('FR-006 AC-4: shows UX-006 in place of the requested page', …)`, `it('UX-006 F15: focuses the h1 when the retry fails again', …)`, `it('UX-006 D14: ignores a second Try again while reading', …)`.
- **Visual QA:** UX-006 VAC-1 to VAC-5 against `docs/design/ui-states/library-unreadable-{desktop,mobile,320x640}-{light,dark}.png`. ARCH §10 defines no QA fixture for a failed read and capture-previews can't block storage, so the PR's screenshots are taken by hand in Chrome with site data blocked for `localhost` (Chromium reports this as an open failure, ARCH §7 rule 7), at the three sizes in device mode. S-13 automates them (BQ-3).
- **Relies on:** ADR-002, ADR-003; ARCH §4 step 4, §5.5.
- **Blocked by:** S-05.
- **New commands / dependencies:** none.
- **Definition of Done:** as above.

### S-07 — A QA build seeds the sample library and can make writes fail

- **Type / area / size:** chore, infra, S. First needed by S-08 (the sample library for visual QA) and S-12 (failed writes).
- **In scope:**
  - The QA build `vite build --mode qa` (ARCH §10), exposed as an npm script whose name and verified run the PR records (BQ-2).
  - `src/qa/`, which reads the `fixture` URL parameter at start-up: `sample` seeds the 12 books of `content.md`, in that order, into an empty database; `fail-writes` wraps the repository so every write resolves `ok: false` with `kind: 'failed'`.
  - Exclusion from production builds through `import.meta.env.MODE`, and a test that the production bundle contains no sample title (ARCH §10).
- **Out of scope:** a fixture for failed reads (ARCH §10 defines none; BQ-3); any production behaviour.
- **Acceptance criteria:**
  - **AC-1** Given the QA build and an empty database, when Shelf opens with `?fixture=sample`, then the 12 sample books are stored once; opening it again with the fixture adds nothing more.
  - **AC-2** Given the QA build, when Shelf opens with `?fixture=fail-writes`, then every add, update and delete resolves `ok: false` with `kind: 'failed'`, and reads still work.
  - **AC-3** (NFR-004) Given a production build, when `dist/` is inspected, then it contains no `src/qa` code and no sample title.
  - **AC-4** (ADR-003) Given any route, when `fixture` or `theme` is present, then the router ignores it.
- **Test expectations:** unit tests for the seeding and the write-failing wrapper over the fake repository; the production-bundle check from ARCH §10. Names state what they prove, for example `it('ARCH §10: production bundle contains no sample title', …)`.
- **Visual QA:** n/a.
- **Relies on:** ADR-003; ARCH §10; DATA-MODEL §5 (seed data only in QA builds).
- **Blocked by:** S-05.
- **New commands / dependencies:** the QA build command (planned in GUIDELINES §7). No new dependency.
- **Definition of Done:** as above.

### S-08 — The library lists every book in title order

- **Type / area / size:** feature, frontend, M.
- **In scope:**
  - `src/books/order.ts`: `sortLibrary` with the shared collator of DATA-MODEL §2.
  - `LibraryPage` with books (UX-001): the "Add a book" header action in the masthead (UX-101 `headerAction`, UX-103 `link`), the `h1` "Your library", the count line with English plurals and thousands separators, and the list (`ul` with `role="list"`).
  - `LibraryEntry` (UX-102): the status note with a hidden "Status: ", the title and author with `dir="auto"`, and the "Edit" and "Delete" text links (UX-104) with the hidden title suffix and `href`s `./?page=edit&book=<id>` and `./?page=delete&book=<id>`; wide and narrow layouts.
  - The document title "Your library — Shelf".
- **Out of scope:** the add, edit and delete pages (S-09, S-14, S-15). Until they land, their links lead back to the library.
- **Acceptance criteria:**
  - **AC-1** (FR-001 AC-1) Given the library contains books, when the reader opens Shelf, then every book is listed exactly once with its title, its author when it has one, and its reading status.
  - **AC-2** (FR-001 AC-2) Given books titled "beta", "Alpha" and "gamma", when the library is shown, then they are listed "Alpha", "beta", "gamma".
  - **AC-3** (FR-001 AC-3; DATA-MODEL §2 test cases) Given two books with the same title, when the library is shown, then the one added first is listed first; "dune" (id 9) follows "Dune" (id 4).
  - **AC-4** (FR-001 AC-4; UX-102) Given the library is shown, when the reader looks at any book, then it has links "Edit <title>" and "Delete <title>" whose accessible names start with the visible word and which point to that book's edit and delete pages.
  - **AC-5** (FR-001 AC-5) Given the library is shown, then the masthead holds the "Add a book" filled button, a link to the add page.
  - **AC-6** (FR-001 edge cases; UX-001 VAC-4) Given a title and an author of 200 characters, or "The Hundred-Year-Old Man Who Climbed Out of the Window and Disappeared" at 320 px, when the library is shown, then they wrap in full and never hide the status note or the actions; titles in any script are shown as entered.
  - **AC-7** (UX-001 VAC-6; UI-SPEC §2 copy) Given 12, 1 and 1,000 books, then the count line reads "12 books. Saved in this browser on this device.", "1 book. Saved in this browser on this device." and "1,000 books. Saved in this browser on this device."
  - **AC-8** (NFR-003; UI-SPEC §2) Given 500 books, when the library is shown, then all 500 are list items in FR-001 order, with no pagination or "load more".
  - **AC-9** (UX-001 accessibility; UI-SPEC §2 focus order) Given the library, then each entry reads in order "Status: <status>", title, author, "Edit <title>", "Delete <title>"; a book without an author has no author line in the accessibility tree; the Tab order is skip link, "Add a book", then Edit and Delete per book; axe reports no violations.
  - **AC-10** (UX-001 VAC-5) Given the sample library in either theme, then the two "Reading" notes are heavier and in `{theme.*.text.primary}`, every other note is in `{theme.*.text.muted}`, and nothing uses colour alone, a dot, a badge or an icon.
- **Test expectations:** `order.test.ts` (`it('FR-001 AC-2: lists titles A–Z ignoring case', …)`, the three DATA-MODEL §2 cases); `LibraryEntry.test.tsx` and `LibraryPage.test.tsx` with the fake repository and the sample fixture, including a 500-book render.
- **Visual QA:** UX-001 VAC-1 to VAC-6 against `docs/design/previews/v1/library-{desktop,mobile}-{light,dark}.png`; at 320×640 the narrow layout of the mobile images (VAC-4, no separate image). capture-previews on the QA build: `--url library="http://localhost:4173/?fixture=sample"`.
- **Relies on:** ADR-003 (link targets), ADR-004; DATA-MODEL §2.
- **Blocked by:** S-07.
- **New commands / dependencies:** none.
- **Definition of Done:** as above.

### S-09 — The reader can open the add form and cancel back to the library

- **Type / area / size:** feature, frontend, M.
- **In scope:**
  - Navigation in `src/app/router.ts`: `pushState` when a page opens from the library, `popstate`, link interception for unmodified primary clicks only, and `history.scrollRestoration = 'manual'` (ADR-003, ARCH §5.2).
  - Focus intents F2, F10 and F12, and the remembered library scroll position (ARCH §5.5).
  - `AddBookPage` default state (UX-003): the wordmark `link` variant (UX-101), the skip link "Skip to the form", the `h1` "Add a book", a `novalidate` form named by its `h1`, `TextField` Title and Author without errors (UX-105: `required` on Title, `autocomplete="off"`, no length limit), `StatusRadioGroup` (UX-106, token-drawn, with the forced-colours fallback), the "Add book" submit button (UX-103) and the "Cancel" link (UX-104).
  - Cancel and the wordmark: `history.back()` when the page was opened from the library in this tab, otherwise a replace to the library (ARCH §4).
  - F15 for the add route, and the document title "Add a book — Shelf".
- **Out of scope:** saving (S-10). Until it lands, "Add book" and Enter store nothing and leave the form as it is. Field errors (S-11) and the save-failure message (S-12).
- **Acceptance criteria:**
  - **AC-1** (FR-001 AC-5, FR-002 AC-2, F2) Given the library (UX-001) or the empty library (UX-002), when the reader activates "Add a book", then the add page opens as a new history entry, at the top, with focus on the `h1` "Add a book".
  - **AC-2** (FR-003 AC-1; UX-003 VAC-7) Given the add page has opened, then Title and Author are empty, "Want to read" is checked and no message is shown.
  - **AC-3** (FR-003 AC-7, F10) Given the add form has details entered, when the reader activates "Cancel" or the wordmark, then no book is added, the library is unchanged, it is at its scroll position from before the form opened, and focus is on the "Add a book" control that opened the form.
  - **AC-4** (F12) Given the add page was opened from the library, when the reader uses the browser's Back, then the library is shown as in AC-3.
  - **AC-5** (UI-SPEC §2 focus order and keyboard; UX-106) Given the add page, then the Tab order is skip link, "Shelf", Title, Author, Reading status (one stop), "Add book", "Cancel"; arrow keys move and select within the status group; activating any part of a status row selects it.
  - **AC-6** (UX-106) Given either theme, then the radios are drawn with `{size.radio}`, `{border-width.radio}` and the `{theme.*.control.*}` roles; under `forced-colors: active` they fall back to the browser-drawn control.
  - **AC-7** (ADR-003; F15) Given Shelf is opened directly at `./?page=add`, then the add page is shown (a later Cancel replaces the entry with the library); given that the read failed there, when "Try again" succeeds, then the add page is shown with focus on its `h1`.
  - **AC-8** (UI-SPEC §1; NFR-001) Given the add page, then the document title is "Add a book — Shelf", and axe reports no violations.
- **Test expectations:** router unit tests (`it('ADR-003: parses ./?page=add and ignores theme', …)`); `AddBookPage.test.tsx`, `TextField.test.tsx`, `StatusRadioGroup.test.tsx` and shell tests with user-event, for example `it('UX-003 F2: focuses the h1 when the add page opens', …)`, `it('FR-003 AC-7: Cancel adds nothing and returns focus to Add a book (F10)', …)`.
- **Visual QA:** UX-003 VAC-5 and VAC-7, with VAC-6 for the default state, against `docs/design/ui-states/add-book-two-errors-{desktop,mobile,320x640}-{light,dark}.png` without their two errors. capture-previews `--url add="http://localhost:4173/?page=add"`.
- **Relies on:** ADR-003; ARCH §4 (Cancel, wordmark and Back), §5.2, §5.5, §5.6.
- **Blocked by:** S-08.
- **New commands / dependencies:** none.
- **Definition of Done:** as above.

### S-10 — The reader can save a new book and see it in the library

- **Type / area / size:** feature, frontend, S.
- **In scope:**
  - `src/books/validate.ts`: `validateBookDetails` with trimming, grapheme counting (`Intl.Segmenter`) and the three UI-SPEC messages as data (DATA-MODEL §2, GUIDELINES §4).
  - On a valid save, `onSave` → `addBook`; on success the shell adds the stored book to memory, replaces the history entry with the library and applies F7 (ARCH §4 Add).
  - Enter in a field saves; a second activation while a save is in flight is ignored (a ref; the button is never disabled).
  - The UX-001 "Returning after a save" state.
- **Out of scope:** showing field errors (S-11): until it lands, an invalid save stores nothing and leaves the form as entered, with no message. The save-failure message (S-12): until it lands, a failed store leaves the form open with nothing stored and no message.
- **Acceptance criteria:**
  - **AC-1** (FR-003 AC-2, F7) Given the add form, when the reader enters "Dune", "Frank Herbert", chooses "Reading" and saves, then the form closes and the library lists "Dune" by Frank Herbert with the status "Reading" at its FR-001 position; that entry is wholly in view and focused with no visible outline, the count line is current, and Back does not reopen the form.
  - **AC-2** (FR-003 AC-3) Given the add form, when the reader saves with a title and an empty Author, then the book is listed without an author.
  - **AC-3** (FR-003 AC-6) Given the title "  Dune  ", when the reader saves, then the book is listed as "Dune".
  - **AC-4** (FR-003 edge case, A6) Given a book "Dune" by Frank Herbert exists, when the reader adds the same title and author, then a second, separate book is listed.
  - **AC-5** (FR-003 AC-4, AC-5: nothing stored) Given Title is empty or only spaces, or Title or Author is over 200 characters after trimming, when the reader saves, then no book is added and the form stays open.
  - **AC-6** (UX-003 validation rules; UX-103) Given valid details, when the reader activates "Add book" twice in quick succession, then the book is added once.
  - **AC-7** (FR-006 AC-2) Given a book was just saved, when the reader reloads Shelf, then the book is listed (manual in this slice; automated by S-13).
- **Test expectations:** `validate.test.ts` (trimming; 200 and 201 characters; an emoji or a combining sequence counts as one; an empty Author is valid); `AddBookPage.test.tsx` and shell tests with the fake repository, for example `it('FR-003 AC-2: saves and focuses the new entry in title order (F7)', …)`, `it('UX-003: a double activation adds the book once', …)`.
- **Visual QA:** UX-001 "Returning after a save": after saving "Dune" to the sample library on the QA build, a screenshot at desktop and mobile in light and dark shows the entry in view with no outline. Taken by hand, because capture-previews can't submit.
- **Relies on:** ADR-002 (`addBook`), ADR-003 (`replaceState`); ARCH §4 Add, §5.5 F7; DATA-MODEL §2.
- **Blocked by:** S-09.
- **New commands / dependencies:** none.
- **Definition of Done:** as above.

### S-11 — The add form says what to fix when the details break the rules

- **Type / area / size:** feature, frontend, S.
- **In scope:** `TextField` error state (UX-105): `aria-invalid`, `aria-describedby`, the `{border-width.field-invalid}` `{theme.*.border.field-invalid}` border at the same outer size, the hidden "Error: " prefix, the three messages word for word, margin placement when wide (`{layout.field-error-offset}`) and above the field when narrow. Each save clears earlier messages; after a failed save the fields show their trimmed values (D12); focus F5.
- **Out of scope:** the edit form's use of the same errors (S-14).
- **Acceptance criteria:**
  - **AC-1** (FR-003 AC-4, F5) Given Title is empty or only spaces, when the reader saves, then no book is added, the form stays with everything entered (trimmed), the message "Enter a title. A book can't be added without one." is shown next to Title, and focus is on Title.
  - **AC-2** (FR-003 AC-5) Given Title or Author is over 200 characters after trimming, when the reader saves, then no book is added, the form stays with everything entered, and "Title must be 200 characters or fewer." or "Author must be 200 characters or fewer." is shown next to that field.
  - **AC-3** (F5; UX-105) Given both Title and Author fail, when the reader saves, then focus is on Title; given only Author fails, focus is on Author; the focused field's accessible description is its message, starting with "Error: ".
  - **AC-4** (UX-003 validation rules) Given errors are shown, when the reader fixes them and saves, then the earlier messages are gone and the book is added as in S-10; nothing is checked while typing or on leaving a field.
  - **AC-5** (UX-105) Given a 218-character Author, then the whole text stays in the field (no length limit).
  - **AC-6** (NFR-001) Given the form with two errors, then axe reports no violations.
- **Test expectations:** `TextField.test.tsx` and `AddBookPage.test.tsx`, for example `it('FR-003 AC-4: keeps the form and shows the title message when Title is only spaces', …)`, `it('UX-003 F5: focuses Title before Author when both fail', …)`, with `toHaveAccessibleDescription()`.
- **Visual QA:** UX-003 VAC-1 to VAC-3 against `docs/design/previews/v1/add-book-{desktop,mobile}-{light,dark}.png` (except the radios, VAC-5), and VAC-4 and VAC-6 against `docs/design/ui-states/add-book-two-errors-{desktop,mobile,320x640}-{light,dark}.png`. These states need a submission: screenshots by hand before S-13, by Playwright after it.
- **Relies on:** GUIDELINES §4 (validation pattern); UI-SPEC UX-003 validation rules, UX-105.
- **Blocked by:** S-10.
- **New commands / dependencies:** none.
- **Definition of Done:** as above.

### S-12 — A new book that can't be stored is reported, not shown as saved

- **Type / area / size:** feature, frontend, S.
- **In scope:** `SaveFailureMessage` (UX-107): the message word for word with a hidden "Error: ", `tabIndex={-1}`, placed above the actions with `{space.4}` between. On the add form: shown when `onSave` resolves `ok: false`, with focus F6 and memory unchanged; the UX-107 retry behaviour; Cancel still discards.
- **Out of scope:** the edit and delete pages' use of UX-107 (S-14, S-15).
- **Acceptance criteria:**
  - **AC-1** (FR-006 AC-3, F6) Given valid details that can't be stored, when the reader saves, then no book is added and the library is unchanged, the form keeps everything entered, the message "This change wasn't saved. Your browser didn't let Shelf store it. Try again, or check that this browser allows sites to store data." appears above the actions, and focus is on it.
  - **AC-2** (UX-107 behaviour) Given the message is shown, when the next save fails to store, then the message is shown and focused again; when it fails validation, the message is removed and the field errors are shown; when it succeeds, the library is shown as in F7.
  - **AC-3** (FR-003 AC-7) Given the message is shown, when the reader activates "Cancel", then no book is added.
  - **AC-4** (FR-006 AC-3) Given a failed save, when the reader reloads Shelf, then the book is not listed.
- **Test expectations:** `SaveFailureMessage.test.tsx` and `AddBookPage.test.tsx` with the fake repository failing writes, for example `it('FR-006 AC-3: shows the save-failure message and focuses it (F6)', …)`.
- **Visual QA:** there is no add-form reference for this state. On the QA build with `?page=add&fixture=fail-writes`, screenshots at the three viewports and both themes, compared with the message's placement in `docs/design/ui-states/edit-book-save-failed-{desktop,mobile,320x640}-{light,dark}.png` (UX-107 layout). By hand before S-13, by Playwright after it.
- **Relies on:** ADR-002 (results as values); ARCH §4 Add step 5, §11.
- **Blocked by:** S-10 (S-07's `fail-writes` fixture is already merged through S-08).
- **New commands / dependencies:** none.
- **Definition of Done:** as above.

### S-13 — End-to-end checks run J1 in a real browser

- **Type / area / size:** chore, infra, M. First needed by S-14 (captures of states behind a submission).
- **In scope:**
  - `@playwright/test` and `@axe-core/playwright` as dev dependencies; a Playwright configuration that runs against `npm run preview` of the production build, and of the QA build where a spec needs fixtures; the `npm run test:e2e` script; `npx playwright install chromium` documented as the explicit browser download (GUIDELINES §8).
  - `app/e2e/` specs: J1 (first visit, add, reload); the NFR-004 checks of ARCH §9; axe in the browser; 320 px reflow.
  - Playwright screenshots, at the reference sizes and themes and named like the references, for the states capture-previews can't reach: the add form with field errors (S-11), the add form after a failed store (S-12), and UX-006 by making `indexedDB.open` fail through a test-only init script (BQ-3).
  - An e2e step in `app-check` on Chromium (ARCH §10). This edits `.github/workflows/app-check.yml`, which the owner confirms.
- **Out of scope:** J2, J3, Back and 500 books (S-16); Firefox and WebKit runs before release (Stage G).
- **Acceptance criteria:**
  - **AC-1** (J1: FR-002 AC-1, FR-003 AC-2, FR-006 AC-1, AC-2) Given a fresh browser profile, when the test opens Shelf, adds "Dune" by Frank Herbert as "Reading", and reloads, then the empty library is shown first, and after the reload the library lists that book.
  - **AC-2** (NFR-004; ARCH §9 verification) Given J1 runs, then no request leaves Shelf's origin, no `securitypolicyviolation` event fires, and IndexedDB holds only the `books` store with records of exactly `id`, `title`, `author` and `status`.
  - **AC-3** (NFR-001, automated part) Given UX-001 (sample library), UX-002, UX-003 (default and with two errors) and UX-006, in light and dark, when axe runs in the browser, then it reports no Level A or AA violation.
  - **AC-4** (NFR-001 reflow; NFR-002) Given a 320×640 viewport, then on UX-001, UX-002, UX-003 and UX-006 the document's `scrollWidth` is at most 320.
  - **AC-5** Given `npm run test:e2e` runs in `app-check`, then it runs on Chromium and fails the job when a spec fails.
- **Test expectations:** `app/e2e/*.spec.ts` with names citing IDs, for example `test('FR-006 AC-2: a saved book survives a reload', …)`, `test('NFR-004: no request leaves the origin during J1', …)`.
- **Visual QA:** produces the screenshots for UX-003 VAC-1 to VAC-4 and VAC-6, UX-107 on the add form and UX-006 VAC-1 to VAC-5; the PR sets them beside the references.
- **Relies on:** ADR-007, ADR-006; ARCH §9, §10.
- **Blocked by:** S-03, S-06, S-11, S-12.
- **New commands / dependencies:** `npm run test:e2e` and `npx playwright install chromium` (planned in GUIDELINES §7); dev `@playwright/test` and `@axe-core/playwright` (approved by ADR-007), with the GUIDELINES §8 checks; the `app-check` workflow change (owner confirms).
- **Definition of Done:** as above, plus the owner has confirmed the workflow edit.

### S-14 — The reader can edit a book

- **Type / area / size:** feature, frontend, M.
- **In scope:**
  - `EditBookPage` (UX-004) at `./?page=edit&book=<id>`: as UX-003, with the `h1` "Edit book", the book's current details, the "Save changes" button and the document title "Edit book — Shelf".
  - Focus F3, F7, F11, F12, F14 and F15 for the edit route.
  - `updateBook` with the `null` result handled as F14; the same validation, messages (UI-SPEC UQ-4) and UX-107 as the add form.
- **Out of scope:** J2 end to end and the edit page's axe and reflow checks in the browser (S-16).
- **Acceptance criteria:**
  - **AC-1** (FR-004 AC-1, FR-001 AC-4, F3) Given a book in the library, when the reader activates "Edit <title>", then the edit page opens as a new history entry with that book's title, author and status, and focus on the `h1` "Edit book".
  - **AC-2** (FR-004 AC-2, F7) Given the edit form, when the reader changes the status to "Finished" and saves, then the form closes, the library shows that book as "Finished" with its entry focused and in view, and every other book is unchanged.
  - **AC-3** (FR-004 AC-3, F7) Given the edit form, when the reader changes the title and saves, then the library shows the new title at its new FR-001 position, focused there.
  - **AC-4** (FR-004 AC-4, F5) Given details that break FR-003 AC-4 or AC-5, when the reader saves, then the stored book is unchanged, the form stays with everything entered, the FR-003 messages are shown, and focus is on the first failing field.
  - **AC-5** (FR-004 AC-5, F11, F12) Given changed details, when the reader activates "Cancel", the wordmark or Back, then the book is unchanged, the library is at its earlier scroll position, and focus is on that book's "Edit" link.
  - **AC-6** (FR-006 AC-3, F6) Given valid details that can't be stored, when the reader saves, then the stored book and the library are unchanged and the save-failure message is shown and focused.
  - **AC-7** (F14; UI-SPEC §1) Given the edit page is opened for a book that no longer exists, or with a missing or malformed `book`, then the library is shown with focus on its `h1` and no message; given `updateBook` returns `null`, the same happens and no book is re-created.
  - **AC-8** (FR-004 edge cases) Given the edit form, when the reader saves without changing anything, then the book stays as it was; leading and trailing spaces are removed as in FR-003 AC-6.
  - **AC-9** (F15; UI-SPEC §1) Given the read failed on an edit page, when "Try again" succeeds, then the edit page is shown with focus on its `h1` (or the library, as F14, if the book is gone).
- **Test expectations:** `EditBookPage.test.tsx` and shell tests with the fake repository, for example `it('FR-004 AC-3: a new title moves the book to its new place and focuses it (F7)', …)`, `it('UX-004 F14: a missing book leads to the library h1', …)`.
- **Visual QA:** UX-004 VAC-1 to VAC-5 against `docs/design/ui-states/edit-book-save-failed-{desktop,mobile,320x640}-{light,dark}.png`. Playwright, on the QA build, seeds with `?fixture=sample`, then opens Dune's edit page with `?fixture=fail-writes` in the same browser context, chooses "Finished" and saves; the default state (VAC-5) is captured without the failure.
- **Relies on:** ADR-002 (`updateBook`), ADR-003; ARCH §4 Edit, §5.5.
- **Blocked by:** S-11, S-12, S-13.
- **New commands / dependencies:** none.
- **Definition of Done:** as above.

### S-15 — The reader can delete a book after confirming

- **Type / area / size:** feature, frontend, M.
- **In scope:**
  - `DeleteBookPage` (UX-005) at `./?page=delete&book=<id>`: the skip link "Skip to the confirmation", the wordmark link, the `h1` "Delete “<title>”?" with curly quotes, the sentence, the "Delete book" submit button and "Cancel".
  - The document title "Delete “<title>”? — Shelf". Reaching the page removes nothing.
  - `deleteBook`; on success memory, `replaceState` and F8 or F9; on failure UX-107 with F6; a second activation ignored.
  - Focus F4, F11, F12, F14 and F15 for the delete route.
- **Out of scope:** J3 end to end and the delete page's axe and reflow checks in the browser (S-16).
- **Acceptance criteria:**
  - **AC-1** (FR-005 AC-1, FR-001 AC-4, F4) Given a book in the library, when the reader activates "Delete <title>", then a confirmation page opens naming the book in its `h1`, with focus on that `h1`, and the book is not removed.
  - **AC-2** (FR-005 AC-2, F8) Given the confirmation, when the reader activates "Delete book", then the book is removed, every other book is unchanged, the count line is one lower, and focus is on the entry now at the deleted book's place, or on the last entry if the deleted book was last.
  - **AC-3** (FR-002 AC-3, F9) Given the library holds exactly one book, when the reader confirms its deletion, then the empty library is shown with focus on its `h1`.
  - **AC-4** (FR-005 AC-3, F11, F12) Given the confirmation, when the reader activates "Cancel", the wordmark or Back, then the book stays unchanged, the library is at its earlier scroll position, and focus is on that book's "Delete" link.
  - **AC-5** (FR-006 AC-3, F6) Given the deletion can't be stored, when the reader confirms, then the book is not removed, the save-failure message is shown and focused, and the library is unchanged when the reader returns to it.
  - **AC-6** (F14) Given the delete page is opened for a book that no longer exists, then the library is shown with focus on its `h1` and no message.
  - **AC-7** (UX-005 VAC-4) Given a 200-character title at 320×640, then the heading wraps in full and nothing scrolls sideways.
  - **AC-8** (F15; FR-005 edge case) Given the read failed on a delete page, when "Try again" succeeds, then the delete page is shown with focus on its `h1` (or the library, as F14); after a confirmed deletion there is no undo.
- **Test expectations:** `DeleteBookPage.test.tsx` and shell tests with the fake repository, for example `it('FR-005 AC-1: opening the confirmation removes nothing', …)`, `it('FR-002 AC-3: deleting the only book shows the empty library (F9)', …)`, `it('UX-005 F8: focuses the next entry after a delete', …)`.
- **Visual QA:** UX-005 VAC-1 to VAC-4 against `docs/design/ui-states/delete-book-{desktop,mobile,320x640}-{light,dark}.png`. capture-previews on the QA build: `--url delete="http://localhost:4173/?page=delete&book=4&fixture=sample"` (Dune is the fourth sample book, so id 4 on a fresh database). The failed-store state has no reference; a screenshot shows UX-107 placed as on UX-004.
- **Relies on:** ADR-002 (`deleteBook`), ADR-003; ARCH §4 Delete, §5.5.
- **Blocked by:** S-12.
- **New commands / dependencies:** none.
- **Definition of Done:** as above.

### S-16 — End-to-end checks cover J2, J3, Back and a 500-book library

- **Type / area / size:** chore, infra, S. Completes the NFR-003 verification and the automated part of NFR-001 before release.
- **In scope:** e2e specs for J2 and J3, browser Back from the add, edit and delete pages, reloading the edit and delete pages, a 500-book library seeded by test-only code in the browser context, and axe and reflow checks on UX-004 and UX-005.
- **Out of scope:** the manual keyboard and screen-reader walkthroughs and the phone and desktop browser runs of NFR-001 and NFR-002, which the owner does before each release (Stage G).
- **Acceptance criteria:**
  - **AC-1** (J2: FR-004 AC-2, FR-006 AC-1, AC-2) Given a book with the status "Reading", when the test edits it to "Finished" and reloads, then the library shows it as "Finished".
  - **AC-2** (J3: FR-005 AC-2, FR-002 AC-3, FR-006 AC-2) Given two books, when the test deletes one with confirmation and reloads, then it stays gone; when it deletes the last one, the empty library is shown, also after a reload.
  - **AC-3** (F12; UI-SPEC §1) Given the add, edit or delete page was opened from the library, when the test uses Back, then the library is shown with focus as F10 or F11; after a save or a delete, Back does not reopen the form or the confirmation; reloading an edit or delete page shows the same page.
  - **AC-4** (NFR-003) Given 500 stored books, when the library is shown on desktop and mobile viewports, then all 500 are listed once in FR-001 order; J2 and J3 pass on that library, and all remaining books are intact after a reload.
  - **AC-5** (NFR-001, NFR-002) Given UX-004 and UX-005 in light and dark, then axe reports no Level A or AA violation, and at 320×640 `scrollWidth` is at most 320.
- **Test expectations:** `app/e2e/*.spec.ts`, for example `test('NFR-003: lists 500 books once and in order', …)`, `test('F12: Back from the edit page returns focus to Edit', …)`.
- **Visual QA:** n/a beyond S-14 and S-15.
- **Relies on:** ADR-007; ARCH §10.
- **Blocked by:** S-13, S-14, S-15.
- **New commands / dependencies:** none.
- **Definition of Done:** as above.

### S-17 — An owner-run deploy workflow publishes Shelf to GitHub Pages (owner runs it)

- **Type / area / size:** chore, infra, S. **The owner runs it.** No agent triggers a deployment (AGENTS.md §6). Releasing is Stage G and not in this backlog.
- **In scope:** `.github/workflows/deploy.yml` as ADR-006 and ARCH §12 describe: `workflow_dispatch` only, from a release tag `vX.Y.Z`; `npm ci` and `npm run build` in `app/`; `actions/upload-pages-artifact` and `actions/deploy-pages` pinned by commit SHA; minimal permissions; the `github-pages` environment. The PR lists the repository settings only the owner changes: Pages source "GitHub Actions" and the environment's required reviewer.
- **Out of scope:** running the workflow, enabling Pages, creating tags or releases, and changing repository settings (all owner-only); a custom domain (ARCH OQ-2).
- **Acceptance criteria:**
  - **AC-1** (ADR-006) Given the workflow file, then its only trigger is `workflow_dispatch`, and it stops unless the selected ref is a tag matching `vX.Y.Z`.
  - **AC-2** (ADR-006) Given the workflow file, then every third-party action is pinned by commit SHA, and the job requests only `contents: read`, `pages: write` and `id-token: write`.
  - **AC-3** (NFR-004, NFR-002) Given a run, then it uploads `app/dist` from the production build, which carries the S-03 policy, to the `github-pages` environment served over HTTPS.
  - **AC-4** Given the PR, then it states that the owner enables Pages, protects the environment and runs the workflow, and that the agent ran none of these.
- **Test expectations:** no automated test. The PR shows the workflow parsed (for example `gh workflow view` after the owner merges) and the commands that ran locally (`npm run build`).
- **Visual QA:** n/a.
- **Relies on:** ADR-006; ARCH §12.
- **Blocked by:** S-03, S-16.
- **New commands / dependencies:** the deploy workflow (planned in GUIDELINES §7, owner-run only). The workflow file is an edit the owner confirms.
- **Definition of Done:** as above, plus the owner has confirmed the workflow edit. A first deployment is not part of this slice.

## 4. Coverage check

Every Now acceptance criterion, NFR, UX ID and focus rule maps to at least one slice. Nothing in the Now scope is uncovered.

| Requirement | Covered by slices |
|---|---|
| FR-001 AC-1 | S-08 |
| FR-001 AC-2 | S-08 |
| FR-001 AC-3 | S-08 (S-04 provides creation order) |
| FR-001 AC-4 | S-08 (links), S-14 (edit opens), S-15 (delete opens) |
| FR-001 AC-5 | S-08 (button), S-09 (opens the form) |
| FR-001 edge cases (long text, any script) | S-08 |
| FR-002 AC-1 | S-05, S-13 |
| FR-002 AC-2 | S-09 |
| FR-002 AC-3 | S-15, S-16 |
| FR-002 edge case (no sample books) | S-05 |
| FR-003 AC-1 | S-09 |
| FR-003 AC-2 | S-10, S-13 |
| FR-003 AC-3 | S-10 |
| FR-003 AC-4 | S-10 (nothing stored), S-11 (message, F5) |
| FR-003 AC-5 | S-10 (nothing stored), S-11 (message, F5) |
| FR-003 AC-6 | S-10 |
| FR-003 AC-7 | S-09, S-12 |
| FR-003 edge case (duplicates) | S-10 |
| FR-004 AC-1 to AC-5 and edge cases | S-14; AC-2 also S-16 |
| FR-005 AC-1 to AC-3 and edge cases | S-15; AC-2 also S-16 |
| FR-006 AC-1 | S-04, S-13, S-16 |
| FR-006 AC-2 | S-04, S-10, S-13, S-16 |
| FR-006 AC-3 | S-04, S-12, S-14, S-15 |
| FR-006 AC-4 and its edge cases | S-04, S-05, S-06; F15 per page in S-09, S-14, S-15 |
| NFR-001 | Automated per screen in S-02, S-05, S-06, S-08, S-09, S-11, S-13, S-16; manual walkthroughs before release (Stage G) |
| NFR-002 | Visual QA at three viewports in every UI slice; e2e reflow in S-13, S-16; phone and desktop browser runs before release (Stage G) |
| NFR-003 | S-04, S-08, S-16 |
| NFR-004 | S-02, S-03, S-04, S-07, S-13, S-17 |

| UX ID | Covered by slices |
|---|---|
| UX-001 | S-02 (Loading), S-08 (Success), S-10 (Returning after a save), S-15 (Returning after a delete) |
| UX-002 | S-05, S-15 |
| UX-003 | S-09, S-10, S-11, S-12 |
| UX-004 | S-14 |
| UX-005 | S-15 |
| UX-006 | S-06 |
| UX-101 | S-01 (base styles), S-02, S-08 (header action), S-09 (wordmark link) |
| UX-102 | S-08 |
| UX-103 | S-05 (link), S-06 (button), S-09 (submit) |
| UX-104 | S-08 (Edit, Delete), S-09 (Cancel) |
| UX-105 | S-09 (default), S-11 (error) |
| UX-106 | S-09 |
| UX-107 | S-12, S-14, S-15 |

| Focus rule | Covered by slices |
|---|---|
| F1 | S-02, S-05, S-06 |
| F2 | S-09 |
| F3 | S-14 |
| F4 | S-15 |
| F5 | S-11, S-14 |
| F6 | S-12, S-14, S-15 |
| F7 | S-10, S-14 |
| F8 | S-15 |
| F9 | S-15 |
| F10 | S-09 |
| F11 | S-14, S-15 |
| F12 | S-09, S-14, S-15, S-16 |
| F13 | S-02 |
| F14 | S-14, S-15 (S-05 and S-09 route unknown pages to the library) |
| F15 | S-06, S-09, S-14, S-15 |

**Not planned.**

- **FR-007 and FR-008 (Next)** are out of this backlog. UI-SPEC v1.1.0 doesn't specify their controls or no-results states yet (UQ-1), and the PRD says both are to be refined before they enter the backlog. They return in a later BACKLOG version once the PRD and the UI spec are updated and approved.
- **PRD Later items** (export and import, more book details, other sort orders) are not specified.
- **Release (Stage G):** creating tags, running the deploy workflow, the manual NFR-001 walkthroughs and the NFR-002 browser runs belong to the owner's release step, not to a slice.
- **Undefined by the specs and therefore not planned:** two open tabs (PRD Q9), persistent-storage requests (ARCH OQ-1), a custom domain (ARCH OQ-2), a UI for unexpected script errors (ARCH OQ-5).

## 5. Open questions

Each question has a default; the default applies unless the owner changes it in review.

| # | Question | Default | Decide in |
|---|---|---|---|
| BQ-1 | Approved documents are frozen, so the "Issue #" column can't be filled in this version after publishing. How are slice keys tied to issue numbers? | Each issue title starts with its key (`[Slice] S-05 — …`). After publishing, the agent opens a PATCH spec PR, `spec: BACKLOG v1.0.1`, that fills only the "Issue #" column. A PATCH keeps the issues' "BACKLOG v1.0.0" citation valid, because `gate.mjs` compares MAJOR.MINOR, and the draft state lives only on the spec branch, so `main` never holds an unapproved backlog. | Owner review of this backlog |
| BQ-2 | GUIDELINES §7 says the issue that creates a planned command records it in the verified-commands table, but GUIDELINES v1.0.0 is approved and frozen, and implementation PRs must not edit specs. | Implementation PRs (S-01, S-07, S-13) report each new command and its result in the PR body. The owner batches them into a GUIDELINES PATCH spec PR, since ARCH and GUIDELINES already approve the commands; a MINOR bump would make every open issue citing GUIDELINES v1.0.0 fail its gate. | Owner, before S-01 merges |
| BQ-3 | ARCH §10 defines QA fixtures for the sample library and failed writes, but none for a failed read, so UX-006 (S-06) can't be captured with capture-previews. | No new fixture, which would need an ARCH change. S-06 takes screenshots by hand with site data blocked in Chrome; S-13 automates them with a test-only Playwright init script that makes `indexedDB.open` fail. | Owner review of this backlog |
| BQ-4 | The kit has no chore issue form; the feature-slice form applies `type:feature`. | Publish every slice with the feature-slice form's headings. Chore slices get `type:chore` instead of `type:feature`. Every slice still cites an FR or NFR. | Owner, at publishing |
| BQ-5 | Which slices does the pilot implement first? | S-01, then S-02 (section 7). | Owner, when marking an issue `ready` |

## 6. Publishing notes

Nothing is published until the owner approves this backlog. Then each slice becomes one issue, created in key order so blockers already have numbers:

- **Form:** the feature-slice form (`.github/ISSUE_TEMPLATE/feature-slice.yml`). `gate.mjs issue` reads the `### <label>` headings the form renders, so the headings stay unchanged.
- **Title:** `[Slice] S-<nn> — <title>`.
- **Labels:** `type:feature` or `type:chore` (BQ-4), `area:frontend`, `area:db` or `area:infra`, `size:XS`, `size:S` or `size:M`, and `prio:P0` or `prio:P1`. Never `ready`: only the owner adds it.
- **Requirement IDs, UX IDs, Architecture decisions:** from the slice table and details. Requirement IDs always include at least one FR or NFR, because `gate.mjs issue` rejects a feature issue without one.
- **Spec versions:** `PRD v1.1.0`, `ARCH v1.0.1`, `GUIDELINES v1.0.0` and `BACKLOG v1.0.0` on every issue; `area:frontend` issues add `DESIGN-BRIEF v1.0.1`, `UI-SPEC v1.1.0` and `TOKENS v1.0.0`, which the gate then requires; S-04 adds `DATA-MODEL v1.0.0`.
- **Blocked by:** the issue numbers of the blocking slices, written `#<n>`, or `none`. The gate reads only `#<n>` references in this field.
- **In scope, out of scope, acceptance criteria, test expectations, visual QA:** copied from the slice details.

## 7. Recommended first slices for the pilot

**S-01, then S-02.**

- **No user-visible slice is free of blockers.** Every rendered element uses `tokens.css`, which ADR-004 requires to be generated, so the token pipeline comes first.
- **S-01** has no blockers and is small. It exercises the full issue cycle on low-risk code: the gate, a new verified command inside `npm run lint`, CI, and an independent review.
- **S-02** is the first slice a reviewer sees in the running app: Shelf's page frame in self-hosted Literata, in both themes, with the skip link and F1 and F13. It has one blocker (S-01) and is small. It also exercises the parts of the kit a feature slice needs: two approved dependencies under the GUIDELINES §8 policy, component tests named by IDs, and visual QA with capture-previews against the approved references.
- **Not S-05 first:** the empty library is more useful to a reader, but it waits on the storage slice S-04 (size M) as well as S-02, which is too much for a first pilot run. S-04 can run in parallel if the owner wants a second track.

## 8. Change log

| Version | Date | Change | Decided by |
|---|---|---|---|
| 1.0.0 | 2026-10-29 | Initial backlog: 17 slices (10 feature, 7 chore) in three milestones covering the Now scope of PRD v1.1.0 against UI-SPEC v1.1.0 and ARCH v1.0.1, with a coverage check, open questions BQ-1 to BQ-5, publishing notes and a recommended first slice. | Drafted by an AI agent; for owner review |
| 1.0.1 | 2026-10-29 | PATCH: issue numbers after publishing; no content change. Section 2's "Issue #" column now holds #10 to #26 (BQ-1). | Drafted by an AI agent; for owner review |
