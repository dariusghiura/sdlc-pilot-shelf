# Direction 03: Bedside stack

**Concept:** your library drawn as a stack of books lying on their sides. Each book is a cloth-bound spine you read across, the books you are reading have a ribbon marker poking out, and adding or editing happens in a panel beside the stack.

## Position on the distinctness axes

| Axis | Bedside stack |
|---|---|
| Navigation model | Split view. The stack stays on the left; add and edit open a docked panel on the right (desktop) or a bottom sheet (phone). |
| Layout structure | A stack of full-width spines (a list), each slightly different in length, left edges aligned like books pushed against a wall. |
| Information density | Balanced: about 9 books per desktop screen, 6 on a phone. |
| Typographic system | One family with width contrast: Archivo condensed and heavy for the wordmark, headings and spine titles, normal width for authors and controls. Major-third scale (1.25). |
| Composition | Colour blocks of cloth spines carry the page; text sits in gilt on cloth. The eye lands on the stack, then the ribbons. |
| Interaction emphasis | Master–detail. The panel or sheet slides over or beside the stack, so the reader keeps their place. |

## Pairwise distinctness

| Compared with | Axes that differ | Count |
|---|---|---|
| 01 Margin notes | Navigation (split view vs none), layout (stack beside a panel vs column), density (balanced vs spacious), typography (width-contrast sans vs serif), composition (colour blocks vs margin rule), interaction (panel/sheet vs page) | 6 |
| 02 Ledger | Navigation (split view vs toolbar), layout (stack vs table), density (balanced vs compact), typography (width contrast vs weight contrast), composition (colour blocks vs banded grid), interaction (panel/sheet vs inline row) | 6 |

## Design plan

**Colour**

| Role | Light | Dark | Note |
|---|---|---|---|
| Surface (wall) | `#E8EBF0` | `#191B22` | Cool plaster by day, a dim bedroom at night |
| Panel | `#FFFFFF` | `#242733` | The add/edit panel and sheet |
| Text | `#1E2230` | `#E6E8EE` | |
| Text muted | `#4A5163` | `#A7ADBC` | |
| Accent | `#263A66` | `#E3D3A6` | Navy cloth by day, gilt by night |
| Gilt (text on cloth) | `#F3E6C4`, muted `#E2D4B0` | same | Title and author lettering on spines |
| Cloth | oxblood `#6E2433`, bottle `#1F4A3C`, navy `#263A66`, plum `#4B2C5E`, bronze `#6B4A14`, slate `#3D4B55` | same | Decorative; never encodes status |
| Ribbon marker | `#C23A4B` | `#D9586A` | Decorative; "Reading" is always written on the spine too |
| Error | `#A3262A` | `#FF9C9C` | Always paired with text |

**Type:** Archivo variable (open licence, SIL OFL), width axis 62–125. Wordmark 62% width, weight 800. Spine titles 75% width, weight 600, 22px desktop / 20px phone. Authors and UI 100% width, 16px. Page heading 39px / 31px.

**Layout**

```text
desktop (library)                                   desktop (add a book)
Shelf                                               Shelf
Your library                       [Add a book]     Your library                 ┃ Add a book
12 books. Saved in this browser on this device.     ███ A Gentleman in Moscow   ┃ Title
███ A Gentleman in Moscow     Finished  Edit Delete ██ Beowulf                  ┃ [            ]
██ Beowulf               Want to read  Edit Delete  ████ Circe ═╡               ┃ Enter a title…
████ Circe              Reading  Edit Delete ═╡     ...                         ┃ Author (optional)
                                                                                ┃ [Want][Reading][Finished]
phone: the stack fills the width; add/edit is a bottom sheet over a dimmed stack.
```

**Principles**

1. The stack is the one bold idea: colour and shape live in the spines, so everything around them stays plain.
2. Cloth colour is decoration, never information; status is always a word on the spine.
3. The stack keeps its place: adding or editing never navigates away.
4. Titles share one left edge, so the ragged spine lengths never cost scanning.

## Self-review against the brief (before building)

- **Gimmick check.** Spines can tip into a skeuomorphic toy. Changed: no wood grain, no textures, no 3D; flat cloth colours, one pair of thin gilt bands, and a 1px bottom edge.
- **Scanning check.** The first sketch offset each spine sideways, like a messy stack. Dropped: titles now share one left edge and only the right ends vary.
- **Meaning check.** Cloth colours cycling by position would suggest a meaning, and would shift every time a book is added. Changed: in the product the cloth is derived from the book itself (for example from its title), so it is stable; Phase 2 decides the rule. In the prototype, colours are assigned by hand.
- **Generic-default check.** A split view with a white side panel is a common app shell; it is kept because the panel is the interaction idea, but it gets no shadow, card styling or gradient.

## Accessibility notes

- Contrast (WCAG 2.2 ratios computed from the hex values above). Gilt on every cloth: 6.5:1 or better (muted gilt 5.5:1 or better). Light: text 13.3:1, muted 6.6:1, button 11.2:1, error 7.3:1, field border 4.9:1. Dark: text 14.0:1, muted 7.7:1, button 10.7:1, error 7.4:1, field border 4.7:1.
- The stack is a `ul`; spines are list items, not buttons, and contain real Edit and Delete buttons named with the title. Status is text; the ribbon is `aria-hidden`.
- The desktop panel is a labelled region next to the list; the phone sheet is a modal dialog (`role="dialog"`, `aria-modal="true"`). Phase 2 must define focus handling for both.
- Reading status is a radio group with a visible legend; the selected option differs by fill, border and a check mark, not colour alone.
- Focus is a 3px outline (gilt on cloth, accent elsewhere). Hit targets are at least 44×44 px. The sheet's slide-in respects reduced motion.

## Trade-offs and risks

- **Strengths:** the most memorable and the most "my books"; the ribbon makes "what am I reading" visible at a glance; the panel keeps context while adding.
- **Risks:** six cloth colours must stay legible and calm in both themes. Ragged right ends put Edit and Delete at different x positions. The panel and sheet need careful focus management. Heavier to build than 01 or 02.

## Critique log

| Round | What I saw in the renders | What changed |
|---|---|---|
| 1 | The ribbon marker was a small flag high on the spine and read as a notification badge, not a bookmark. | The ribbon is longer (36px), centred on the spine's height, with a swallowtail end. |
| 2 | Dark panel: the invalid Title field lost its error border, because a dark-theme field rule outranked the error rule. | Field borders are now a themed token, so the error border wins in both themes. |
| 1 | Checked: 320px wide (no horizontal scrolling, ribbons stay inside the page gutter), both themes, 44px targets everywhere, gilt text on all six cloths. | No change. |
| — | Kept on purpose: the page's "Add a book" button stays visible while the panel is open. Phase 2 decides whether it hides, or moves focus to the open panel. | Open for Phase 2. |
| — | Archivo has no Cyrillic, so "Мастер и Маргарита" falls back to a system face (below the first screen in the renders). | Phase 2 must choose a fallback stack, or a family with wider script coverage. |
| — | Not visible in the renders: the focus ring on the Title field (the headless capture does not give the page focus). | Phase 2 should capture focus states in the running app. |
