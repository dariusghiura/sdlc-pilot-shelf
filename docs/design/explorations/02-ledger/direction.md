# Direction 02: Ledger

**Concept:** a compact reading register. Every book takes one line, status is a circle that fills as you read, and the whole thing is built to scan a 500-book library on a phone. Adding and editing happen in place, row by row, like writing in a ledger.

## Position on the distinctness axes

| Axis | Ledger |
|---|---|
| Navigation model | A sticky top toolbar: wordmark, where the library lives, and "Add a book". The column headings stick under it. |
| Layout structure | A table: Title, Author, Status, actions. On phones each row becomes two lines (title, then author and status) with icon actions. |
| Information density | Compact: about 16 rows per desktop screen, about 10 on a phone. |
| Typographic system | One family, Atkinson Hyperlegible (designed for low-vision readers). Major-second scale (1.125), everything between 16 and 29px, contrast by weight (bold titles, regular authors), not by size. |
| Composition | Left-aligned full-width grid. The eye runs down the title column. Alternating pale bands, like green-bar continuous paper, keep the reader on the line. |
| Interaction emphasis | Inline. "Add a book" opens a new row at the top of the ledger; "Edit" turns a row into fields. The list never leaves the screen. |

## Pairwise distinctness

| Compared with | Axes that differ | Count |
|---|---|---|
| 01 Margin notes | Navigation (toolbar vs none), layout (table vs column), density (compact vs spacious), typography (hyperlegible sans 1.125 vs serif 1.333), composition (grid vs margin asymmetry), interaction (inline vs page) | 6 |
| 03 Bedside stack | Navigation (toolbar vs split view), layout (table vs stack beside a panel), density (compact vs balanced), typography (one-width sans, weight contrast vs condensed/normal width contrast), composition (banded grid vs colour blocks), interaction (inline row vs side panel/sheet) | 6 |

## Design plan

**Colour**

| Role | Light | Dark | Note |
|---|---|---|---|
| Surface | `#FFFFFF` | `#121C17` | Plain paper; deep green at night |
| Band | `#EEF5EF` | `#1A2A21` | Alternate rows, after green-bar paper |
| Text | `#1C2420` | `#E5EEE8` | |
| Text muted | `#4D5A53` | `#A6B8AD` | Authors, column headings |
| Accent (register green) | `#1E6A49` | `#9CCFB3` | Buttons, links, focus. Desaturated sage in dark, not neon |
| Error | `#B42318` | `#FF9C8F` | Always paired with text |

**Type:** Atkinson Hyperlegible 400 and 700 (open licence, SIL OFL). Row text 16px. Heading 25px, wordmark 20px bold. No uppercase anywhere.

**Layout**

```text
desktop
┌ Shelf                 Saved in this browser on this device.   [Add a book] ┐  sticky
  Your library  12 books
  Title                          Author              Status
  A Gentleman in Moscow          Amor Towles         ● Finished      Edit Delete   (band)
  Beowulf                                            ○ Want to read  Edit Delete
  Circe                          Madeline Miller     ◐ Reading       Edit Delete   (band)

phone
  Shelf                                   [Add a book]
  Your library  12 books
  Saved in this browser on this device.
  A Gentleman in Moscow                       ✎  🗑
  Amor Towles               ● Finished
```

**Principles**

1. Every row is one glance: title, author, status, actions, always in the same place.
2. The bands are the one bold idea; there are no cards, shadows or containers.
3. Status is a shape and a word: an empty, half and full circle for Want to read, Reading and Finished.
4. Editing never takes you away from the list.

## Self-review against the brief (before building)

- **Generic-default check.** A dense list pulls towards the SaaS data-table kit (trait 4): a card around the table, uppercase grey headers, coloured status pills, a sidebar. Changed: no container, sentence-case headings, status as a glyph plus a word instead of a coloured pill, and no sidebar.
- **Dark theme check.** A green identity on a dark surface risks trait 2 (near-black with an acid accent). Changed: the dark surface is a clear deep green, not near-black, and the accent is a soft sage.
- **Dropped:** a monospace face for the count and a typewriter face for "ledger" flavour. Both are template tells; the bands carry the ledger idea alone.
- **Personality check.** This is the least "warm notebook" of the three. It is here to show the density end of the range the owner asked for.

## Accessibility notes

- Contrast (WCAG 2.2 ratios computed from the hex values above), on both the surface and the band. Light: text 14.3:1 or better, muted 6.5:1, accent 5.9:1, error 5.9:1, field border 4.3:1. Dark: text 12.7:1, muted 7.2:1, accent 8.6:1, error 7.5:1, field border 4.7:1.
- The ledger uses explicit `role="table"`, `row`, `columnheader` and `cell`, so the semantics survive the two-line phone layout. Phase 2 must confirm this with a screen reader, or use a real `table` on wide screens and a list on narrow ones.
- Status glyphs are `aria-hidden`; the word is always there. On phones, Edit and Delete are icons with accessible names ("Edit Dune"), at least 44×44 px.
- The inline add row has visible labels, `aria-invalid` and `aria-describedby` on Title, and a visually hidden "Error:" prefix. "Add a book" reports `aria-expanded`.
- Focus is a 3px accent outline. Motion: none in the prototype; reduced motion respected.

## Trade-offs and risks

- **Strengths:** the best fit for NFR-003 and R2 (500 books, no search yet). Fastest to scan and fastest to edit. The most legible type.
- **Risks:** the least personal; it can read as a tool rather than a reader's own list. Inline editing in a two-line phone row is tight, and a table that reflows needs careful screen-reader testing.

## Critique log

| Round | What I saw in the renders | What changed |
|---|---|---|
| 1 | *(filled in after the first render)* | |
