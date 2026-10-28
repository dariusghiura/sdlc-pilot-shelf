---
id: ADR-006
title: GitHub Pages hosting, a meta-tag Content-Security-Policy, owner-only deploys
status: in-review
version: 1.0.0
based_on: { ARCH: 1.0.0 }
approved_by:
approved_on:
superseded_by:
---

# ADR-006: GitHub Pages hosting, a meta-tag Content-Security-Policy, owner-only deploys

## Context

ADR-001 needs a static host with these constraints:

- **No third parties (NFR-004, A11):** no analytics, tracking or third-party content, and every request goes to Shelf's own origin.
- **HTTPS (NFR-002):** phones and desktops reach it over HTTPS. IndexedDB and `crypto` features need a secure context.
- **No new accounts:** the owner already uses GitHub for the repository.
- **Owner-only releases (AGENTS.md §6):** deployments are human-only. Agents never trigger them.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **GitHub Pages project site** | Free with the repository, HTTPS by default, no new third party, deploys from Actions | No custom response headers and no rewrites. The origin `dariusghiura.github.io` is shared by every Pages site of the account. Host request logs (as with any host). |
| Cloudflare Pages or Netlify | `_headers` (real CSP, `frame-ancestors`), SPA rewrites | A new third-party account and its logs; optional analytics features to keep off |
| Own server (nginx) | Full header control | A server to run and patch, against ADR-001's intent |

## Decision

- **Host.** GitHub Pages serves the project site from `app/dist`, at `https://dariusghiura.github.io/sdlc-pilot-shelf/`.
- **Build settings.** Vite builds with `base: './'` (works with ADR-003's routes) and `build.assetsInlineLimit: 0`, so no asset becomes a `data:` URI.
- **Content-Security-Policy.** A small Vite plugin with `apply: 'build'` and `transformIndexHtml` inserts, as the first element of `<head>`:

  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'">
  <meta name="referrer" content="no-referrer">
  ```

  The dev server is excluded, because it relies on inline scripts and a hot-reload WebSocket. `form-action 'none'` is safe because forms are handled by script and never submitted natively.
- **Deploys.** A deploy workflow comes later, in its own issue, after the owner approves it. It is not part of the ARCH PR:
  - `workflow_dispatch` only, from a release tag
  - `actions/upload-pages-artifact` and `actions/deploy-pages`, pinned by commit SHA
  - the `github-pages` environment, with the owner as required reviewer
- **Owner settings.** Enabling Pages, the environment and its protection are repository settings that the owner changes.

## Consequences

- **Positive:**
  - Free HTTPS hosting with no new accounts.
  - The CSP blocks any request off Shelf's origin, even from a compromised dependency.
- **Negative:**
  - `frame-ancestors`, `report-to` and `sandbox` can't be delivered by a `<meta>` tag, so framing can't be prevented. That is accepted (ARCH §13).
  - The shared `github.io` origin means the owner's other Pages sites could read Shelf's database (ARCH OQ-2).
  - GitHub logs requests for the files (ARCH OQ-3).
- **Harder:** inline scripts and styles are impossible in production. That is the intent.
- **Revisit if:** Shelf is shared beyond the owner (custom domain, OQ-2), or real response headers become necessary.
