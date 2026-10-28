---
id: ADR-004
title: tokens.json to CSS custom properties with a dependency-free build script
status: in-review
version: 1.0.0
based_on: { ARCH: 1.0.0 }
approved_by:
approved_on:
superseded_by:
---

# ADR-004: tokens.json to CSS custom properties with a dependency-free build script

## Context

UI-SPEC §2 requires every colour, size and spacing value to be a token from `docs/design/tokens.json` (TOKENS v1.0.0, in DTCG format). The token file has:

- **Themes:** colour roles under `theme.light` and `theme.dark` with identical paths, aliasing `color.palette.*`. Light and dark follow `prefers-color-scheme`, with no switch.
- **Responsive values:** two values per token in `.narrow`/`.wide` pairs that change at `layout.breakpoint` (48rem).
- **Units:** the few `em` values (letter spacing, underline offset) are relative to the element's own font size.

The token file changes only through approved spec changes, so drift between it and the CSS must be impossible to miss.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A small Node script in `app/scripts/`, with no dependencies, writing a committed `tokens.css` and offering a `--check` mode** | Exactly our mapping in about 120 lines. The output is reviewable in diffs. The check fails CI on drift. No dependency. | We maintain the script and its tests. |
| Style Dictionary (Apache-2.0) | The standard tool; many output formats | A dependency, with its own configuration and DTCG-version handling, for about 80 tokens and one output |
| A Vite plugin that generates CSS on the fly (a virtual module) | Always in sync, nothing committed | The output isn't visible in reviews; the unit tests and the CSS check can't see it |
| Hand-written CSS with copied values | No tooling | Drift is invisible, against UI-SPEC §2 |

## Decision

**Generation.** `app/scripts/build-tokens.mjs` (planned, created by the tokens issue) reads `../docs/design/tokens.json` and writes `app/src/styles/tokens.css`. The output starts with a "generated from TOKENS v<version>, do not edit" comment. The mapping:

1. **Aliases.** `{a.b}` aliases are resolved to final values.
2. **Palette.** `color.palette.*` is not emitted. Components reach colours only through theme roles.
3. **Theme roles.** `theme.light.<path>` becomes `--color-<path>` on `:root`, with `color-scheme: light`. `theme.dark.<path>` redefines the same names inside `@media (prefers-color-scheme: dark) { :root { … } }`, with `color-scheme: dark`. Example: `--color-text-primary`.
4. **Responsive pairs.** A group with `narrow` and `wide` children becomes one property: the narrow value on `:root`, the wide value inside `@media (min-width: 48rem)`, where 48rem is `layout.breakpoint`. Example: `--font-size-title`.
5. **Everything else.** Every other token becomes `--<path joined by ->`, for example `--space-4: 1rem`, `--font-weight-reading: 650`, `--font-line-height-title: 1.25` and `--size-target-min: 2.75rem`.
6. **Value formats.**
   - `fontFamily` arrays become a comma list, with names quoted when they contain spaces.
   - Numbers stay unitless; dimensions keep their units.
   - `$description` and `$extensions` are ignored.

**Checks.**

- `--check` compares instead of writing and exits 1 when the file is stale.
- `app/scripts/check-css.mjs` fails on colour literals (`#…`, `rgb(`, `hsl(`, named colours) and on px, rem or em lengths in any CSS file except `tokens.css`. The allow-list covers `0`, percentages, `fr`, `auto`, and the media query `(min-width: 48rem)`.
- Both checks run inside `npm run lint`, so the `app-check` workflow doesn't change.

**Breakpoint literal.** CSS custom properties can't be used in media queries, so component CSS writes the literal `@media (min-width: 48rem)`. The CSS check allows only that one value.

## Consequences

- **Positive:**
  - Token changes show up as CSS diffs.
  - CI fails on drift, and raw values can't creep into component CSS.
  - No dependency.
- **Negative:**
  - We own a small generator with tests, which live in `scripts/*.test.mjs` and run under `npm test`.
  - The breakpoint is duplicated as a literal, guarded by the check.
- **Harder:** composite DTCG types (`typography`, `shadow`) would need new mapping rules. TOKENS v1.0.0 uses none.
- **Revisit if:** tokens gain several output targets, such as native apps or another theme dimension.
