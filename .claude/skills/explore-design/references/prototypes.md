# Prototype conventions for design exploration

## Files

```text
docs/design/explorations/
  content.md                  # the shared, realistic sample content every direction uses
  01-<slug>/                  # one folder per direction, numbered in presentation order
    direction.md              # concept, axes, rationale, trade-offs, accessibility notes, critique log
    <screen-a>.html           # e.g. library.html
    <screen-b>.html           # e.g. add-book.html
    <screen>-<viewport>-<theme>.png   # written by capture-previews.mjs, never by hand
    previews.json             # capture evidence, written by capture-previews.mjs
  01-<slug>-r1/               # a refinement round: a copy of the direction, edited (the original is kept)
  index.html                  # contact sheet, written by capture-previews.mjs --index
docs/design/previews/v<N>/    # the approved direction's final HTML + PNG + previews.json (brief mode)
```

Screen file names are the same in every direction, so the contact sheet compares like with like.

## HTML skeleton

Each screen is one self-contained file. Use inline CSS and JS, no frameworks, and no network dependencies other than Google Fonts.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Library — Direction 01 Quiet Shelf</title>
  <script>
    // Theme hook used by capture-previews.mjs (?theme=light|dark); falls back to the OS preference.
    const q = new URLSearchParams(location.search).get('theme');
    document.documentElement.dataset.theme = q || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  </script>
  <style>
    :root {
      /* Semantic custom properties. Phase 2 turns these into tokens.json, so name them by role, not by value. */
      --color-surface: …; --color-text: …; --color-accent: …;
      --font-body: …; --space-1: …; --radius-control: …;
    }
    :root[data-theme="dark"] { --color-surface: …; --color-text: …; }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
  </style>
</head>
<body>…</body>
</html>
```

## Content

- Use realistic content from the PRD: its personas, journeys and FR acceptance criteria. No lorem ipsum, and no fake metrics the PRD doesn't support.
- Every direction uses the **same** content from `content.md`. The comparison is about design, not data.
- Show the states the PRD makes important (for example an empty state or a validation error) in at least one screen.

## Accessibility floor (every direction)

Semantic landmarks and headings, labelled controls, visible `:focus-visible` styles, body text contrast ≥ 4.5:1 and large text ≥ 3:1 in each theme, hit targets ≥ 24×24 px, and no information conveyed by colour alone. Record the checks in `direction.md`.

## Distinctness check

Directions must be genuinely different products to look at, not one layout with three palettes. For **each pair** of directions, record how they differ on these axes. They must differ on **at least three**:

| Axis | Examples |
|---|---|
| Navigation model | sidebar · top bar · bottom tab bar · command/search-first · none (single flow) |
| Layout structure | single column · split view · master–detail · table · board · timeline |
| Information density | spacious editorial · balanced · compact data-dense |
| Typographic system | families, scale ratio, weight contrast, case, line length |
| Composition | alignment, grid, asymmetry, whitespace rhythm, where the eye lands first |
| Interaction emphasis | inline editing · modal flows · progressive disclosure · keyboard-first |

These do **not** count as differences on their own: palette, border radius, shadows, icon set, illustrations.

Reject the generic defaults: the SaaS dashboard shell, card soup, KPI tiles the PRD doesn't call for, gradients as decoration, and the tells listed in `frontend-design.md`.
