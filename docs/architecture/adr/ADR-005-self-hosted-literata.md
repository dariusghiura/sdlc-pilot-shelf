---
id: ADR-005
title: Self-hosted Literata from Fontsource, with the weight and optical-size axes
status: in-review
version: 1.0.0
based_on: { ARCH: 1.0.0 }
approved_by:
approved_on:
superseded_by:
---

# ADR-005: Self-hosted Literata from Fontsource, with the weight and optical-size axes

## Context

**Approved inputs:**

- **The family:** the design brief (§6) names one family, Literata (SIL Open Font License), self-hosted, with no font service (NFR-004, A11). It must cover Latin, Cyrillic, Greek and Vietnamese, for titles in any script (FR-001 edge cases).
- **Weight axis:** UI-SPEC D5 approves regular and italic with the variable weight axis. The weights used are 400, 450, 500, 600 and 650 (TOKENS `font.weight`).
- **Optical size (TQ-1):** the previews were rendered with Literata's optical-size axis (opsz 7–72) and `font-optical-sizing: auto`. The approved default is to self-host it too, with the file size settled here.

**Fontsource sizes.** Sizes are in bytes from `@fontsource-variable/literata` 5.3.0, published 2026-07-19 (OFL-1.1), listed with jsDelivr's package API on 2026-10-29:

| Subset | opsz + weight, normal | opsz + weight, italic | weight only, normal | weight only, italic |
|---|---|---|---|---|
| latin | 110,080 | 113,180 | 52,496 | 53,728 |
| latin-ext | 89,668 | 91,424 | 42,656 | 43,256 |
| cyrillic | 61,688 | 62,708 | 28,068 | 29,264 |
| cyrillic-ext | 21,172 | 20,764 | 9,728 | 9,612 |
| greek | 41,144 | 42,040 | 19,252 | 19,364 |
| greek-ext | 22,984 | 25,344 | 12,192 | 12,912 |
| vietnamese | 22,312 | 21,960 | 11,408 | 11,248 |

The package's `opsz` files are byte-identical in size to its `standard` files, and its `opsz.css` declares the full weight range. That indicates the files carry both axes. The tokens issue verifies both axes by rendering, comparing a 650 weight and a 44px heading with the previews.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **`@fontsource-variable/literata`, pinned, with Shelf's own `@font-face` rules over its `opsz` files** | A versioned npm package with a licence and per-subset WOFF2 files. Vite bundles and fingerprints the files, which are served from Shelf's origin. `unicode-range` downloads only the subsets a page uses. | A dependency (font data only, no code). Twice the bytes of weight-only files. |
| The same package, weight-only files | About half the size: 106 kB for Latin in both styles | Large headings and 16px notes render differently from the approved previews (TQ-1) |
| Upstream variable TTFs from the googlefonts/literata repository, subset and compressed by us | Full control | We'd maintain a font build (pyftsubset, woff2) and commit binaries, with weaker provenance |
| Google Fonts CDN | Nothing to host | Violates NFR-004, and the brief forbids it. **Rejected.** |

## Decision

**Package.** Add `@fontsource-variable/literata` at an exact version as a runtime dependency (approved with this ADR). The tokens issue adds it.

**Declarations.** `app/src/styles/fonts.css` declares `@font-face` rules for the family name `Literata`, the first entry of `font.family.body`:

- `font-style: normal` and `italic`
- `font-weight: 200 900`
- `font-display: swap`
- one rule per subset, with `src` set to the package's `files/literata-<subset>-opsz-<style>.woff2` and the `unicode-range` copied from the package's `opsz.css` and `opsz-italic.css`

The package's own CSS, with its family name "Literata Variable", isn't imported.

**Usage.** The body sets `font-optical-sizing: auto`. There is no preload in v1.

**Licence.** The package's `LICENSE` (OFL-1.1) is copied into the build as `fonts/OFL.txt`.

## Consequences

- **Positive:**
  - The product matches the previews' type, with no third-party requests.
  - Script coverage is complete.
  - Fonts are cached after the first visit.
- **Negative:**
  - The first visit downloads about 223 kB for an English library (the Latin normal and italic files; italic is used for authors and notes).
  - With `swap`, text first shows in Georgia and may shift once Literata arrives.
- **Harder:** changing families means a new ADR and a DESIGN-BRIEF change.
- **Revisit if:** NFR-003 gains a load-time target (PRD Q8). Preloading the Latin files, or `font-display: optional`, would be the first steps.
