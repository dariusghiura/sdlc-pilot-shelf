---
id: ADR-003
title: Query-string routes on the History API, without a router library
status: in-review
version: 1.0.0
based_on: { ARCH: 1.0.0 }
approved_by:
approved_on:
superseded_by:
---

# ADR-003: Query-string routes on the History API, without a router library

## Context

UI-SPEC §1 requires:

- **History:** each page (UX-001 to UX-005) is its own history entry. After a save or a confirmed delete, the library replaces the submitted page in the history.
- **Reloadable pages:** the Edit (UX-004) and Delete (UX-005) pages identify their book, so they can be reloaded.
- **Missing books:** a missing book leads to the library (F14).

The focus and scroll rules F2 to F14 need exact control over navigation timing. The host is static, with no rewrite rules (ADR-006). Visual QA uses the kit's `capture-previews.mjs --url` (UI-SPEC §2), which appends the theme to the URL as plain text, with `?theme=` or `&theme=` at its very end.

**Evidence, 2026-10-29.** The walking skeleton was captured under `vite preview` in Chrome 156.

- With hash URLs (`--url skeleton=http://localhost:4173/#/`), the first capture succeeded. The other five failed with "timed out after 30000ms waiting for Page.loadEventFired".
- Cause: the theme lands inside the fragment (`#/?theme=dark`). A fragment-only change is a same-document navigation, which fires no `load` event.
- With query-string URLs (`/`, `/?page=add`, `/?page=edit&book=1`), all 18 captures succeeded (3 pages × 3 viewports × 2 themes, 0 failures).

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **Query-string routes** (`./?page=edit&book=12`), with `pushState`, `replaceState` and `popstate`, in about 80 lines of Shelf code | Every reload requests `index.html`, so any static host answers HTTP 200 without fallbacks. One build works on any base path (`base: './'`). Visual-QA captures work (18 of 18). The fragment stays free for the skip link. Focus and scroll are under our control. | Unconventional URLs; we own a small router and its tests |
| Hash routes (`#/books/12/edit`) | Any static host; a common pattern | Breaks `capture-previews.mjs` after the first capture (above). The skip link's `#main` collides with routes. **Rejected.** |
| Path routes (`/books/12/edit`), with a copy of `index.html` as GitHub Pages' `404.html` | Conventional URLs | Reloading Edit or Delete returns HTTP 404 with the app's HTML. The base path differs between Pages (`/sdlc-pilot-shelf/`) and local preview. The fallback is host-specific. |
| React Router 7, in any of these modes | Well known | A dependency for four routes. Its scroll and focus handling don't implement F7 to F12, so we'd still write that. The URL issues above remain. |

## Decision

Routes are query parameters on one document. The route table is in ARCH §5.2: `./`, `./?page=add`, `./?page=edit&book=<id>` and `./?page=delete&book=<id>`.

**Parsing and module:**

- `src/app/router.ts` parses `location.search` into a typed route: `library`, `add`, or `edit`/`delete` with a book id.
- It ignores unknown parameters, such as `theme` and the QA build's `fixture`.
- It formats routes back into relative URLs.

**Navigation:**

- Opening a page from the library calls `pushState`; a successful save or delete calls `replaceState` to the library.
- Cancel and the wordmark call `history.back()` when the page was opened from the library in this tab. Otherwise they replace the entry.
- `popstate` re-renders.
- An invalid route, or a book that doesn't exist, is replaced by the library (F14).

**Links and scroll:**

- Links keep real `href`s and are intercepted only for unmodified primary clicks.
- `history.scrollRestoration = 'manual'`.

## Consequences

- **Positive:**
  - No dependency. Reloads always work, and so does the kit's capture tool.
  - Routes and focus intents live in one small module, tested with unit and component tests.
- **Negative:**
  - URLs look like `?page=edit&book=12`, not `/books/12/edit`.
  - We maintain the router.
- **Harder:**
  - Nested layouts or data loading per route would need more code.
  - The PRD has neither.
- **Revisit if:**
  - Shelf grows beyond about six routes, or gains nested navigation.
  - The host gains SPA rewrites and the kit's capture tool sets the theme through the URL API. Path routes could then replace these without changing pages.
