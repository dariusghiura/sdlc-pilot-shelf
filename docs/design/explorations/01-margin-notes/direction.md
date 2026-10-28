# Direction 01: Margin notes

**Concept:** the library as a page of the reader's own notebook. Titles are written large in a calm reading serif down one column, and each book's status is jotted in the left margin, beside a single ruled margin line.

## Position on the distinctness axes

| Axis | Margin notes |
|---|---|
| Navigation model | None: a single flow. The header holds only the wordmark and "Add a book"; adding and editing open a page of their own. |
| Layout structure | One column at a reading measure (about 40rem), with a hanging left margin that holds status notes and field errors. |
| Information density | Spacious and editorial: about 6 books per desktop screen, 5 on a phone. |
| Typographic system | One family, Literata (a serif designed for long-form screen reading), perfect-fourth scale (1.333), low weight contrast, italic authors and notes. |
| Composition | Asymmetric. The margin rule splits the page; notes hang right-aligned against it, titles start just after it. The eye lands on the first title. |
| Interaction emphasis | Page to page. "Add a book" and "Edit" open a full page that reads like a new notebook entry; nothing overlays the list. |

## Pairwise distinctness

| Compared with | Axes that differ | Count |
|---|---|---|
| 02 Ledger | Navigation (none vs sticky toolbar), layout (column vs table), density (spacious vs compact), typography (serif 1.333 vs hyperlegible sans 1.125), composition (margin asymmetry vs full-width grid), interaction (page vs inline row) | 6 |
| 03 Bedside stack | Navigation (none vs split view with panel), layout (column vs stack of spines beside a panel), density (spacious vs balanced), typography (serif vs width-contrast sans), composition (margin rule vs colour blocks), interaction (page vs side panel/sheet) | 6 |

## Design plan

**Colour** (semantic names; Phase 2 turns them into tokens)

| Role | Light | Dark | Note |
|---|---|---|---|
| Surface (paper) | `#F5F7F4` | `#141A2C` | Cool, slightly grey-green recycled paper; deep blue-black page at night |
| Text (ink) | `#1B2140` | `#E7E9F1` | Blue-black fountain-pen ink |
| Text muted (pencil) | `#545B6E` | `#A9AFC3` | Authors and notes |
| Accent (ink blue) | `#2A47A6` | `#A8B9FF` | Buttons, links, focus |
| Margin rule | `#E39AAE` | `#8E4A61` | Decorative only; never carries meaning |
| Error | `#A1203A` | `#FF9DB0` | Always paired with text |

**Type:** Literata throughout (open licence, SIL OFL). Title 28px desktop / 22px phone, weight 500. Author 18px italic. Margin notes 16px italic. Page heading 44px / 34px, weight 450. Body never below 16px. Lines stay under 70 characters.

**Layout**

```text
desktop                                   phone
          Shelf │                [Add a book]      │ Shelf        [Add a book]
                │ Your library                     │ Your library
                │ 12 books. Saved in this browser… │ 12 books. Saved in this…
       Finished │ A Gentleman in Moscow            │ Finished
                │ Amor Towles           Edit Delete│ A Gentleman in Moscow
   Want to read │ Beowulf                          │ Amor Towles
                │                       Edit Delete│ Edit  Delete
        Reading │ Circe                            │
                │ Madeline Miller       Edit Delete│
```

Left-aligned text against the rule; margin notes right-aligned against it on desktop and above the title on phones, where the margin shrinks to a thin strip.

**Principles**

1. The margin is the one bold idea: status, the wordmark and field errors live there. Nothing else decorates.
2. Read like a page, not a screen: generous leading, a real measure, whitespace between entries instead of dividers.
3. Words carry status ("Reading", not a coloured dot); weight sets "Reading" apart, colour never does.
4. One thing per page: the list, or the entry you are writing.

## Self-review against the brief (before building)

- **Generic-default check.** A "bookish notebook" brief pulls towards trait 1 in `frontend-design.md`: cream paper, high-contrast display serif, terracotta accent. Changed: the paper is a cool grey-green (`#F5F7F4`), the serif is a text face built for screen reading, not a display face, and the accent is blue-black ink.
- **Dropped:** faint ruled lines across the whole page. They read as twee stationery and as broadsheet hairlines (trait 3). Only the single margin rule stays.
- **Dropped:** a numbered list (01, 02 …). The order is alphabetical, not a sequence a reader cares about.
- **Kept, with care:** a separate add/edit page. It is slower than inline editing, but it matches the calm, one-thing-at-a-time personality, and it keeps the list uncluttered on phones.

## Accessibility notes

- Contrast (WCAG 2.2 ratios computed from the hex values above). Light: text 14.6:1, muted 6.3:1, accent 7.6:1, error 7.0:1, field border 5.5:1. Dark: text 14.3:1, muted 7.9:1, accent 9.1:1, error 8.8:1, field border 5.7:1. The margin rule (2.1:1) is decorative and carries no information.
- Landmarks: `header`, `main`; one `h1` per page; a skip link to the library.
- The list is a `ul`. Each entry's status is real text, and every Edit and Delete has an accessible name that includes the title.
- The form uses visible labels, a `fieldset` and `legend` for status, `aria-invalid` and `aria-describedby` on the Title error, and a visually hidden "Error:" prefix.
- Focus is a 3px accent outline, offset 3px. Hit targets are at least 44×44 px. No motion.

## Trade-offs and risks

- **Strengths:** the calmest and most personal of the three; long titles and any script wrap gracefully; the margin gives status a natural, non-colour home.
- **Risks:** low density. With 500 books (NFR-003) and no search until FR-008, scrolling on a phone is long (R2). Page-to-page adding costs a navigation each time. The serif is a matter of taste.

## Critique log

| Round | What I saw in the renders | What changed |
|---|---|---|
| 1 | *(filled in after the first render)* | |
