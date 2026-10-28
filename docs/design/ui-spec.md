---
id: UI-SPEC
title: Shelf — UI Specification (Phase 2)
status: approved
approved_by: dariusghiura
approved_on: 2026-10-29
version: 1.0.0
based_on: { PRD: 1.0.0, DESIGN-BRIEF: 1.0.0 }
---

# Shelf — UI Specification (Phase 2: implementation contract)

This spec turns the approved [design brief](design-brief.md) (direction "Margin notes") and its [previews](previews/v1/) into exact behaviour for every Now requirement of the [PRD](../product/prd.md): FR-001 to FR-006, under NFR-001 to NFR-004. Every visual value is a token from [tokens.json](tokens.json) (TOKENS v1.0.0). The spec is framework-neutral: the stack is chosen in architecture (Stage C).

Reference images:

- `previews/v1/` (approved with DESIGN-BRIEF v1.0.0): the library and the add form after a failed save, at desktop and mobile, in light and dark.
- `ui-states/` (new with this spec, approved with it): the states the brief did not render. These are the [empty library](ui-states/empty-library-desktop-light.png), the [delete confirmation](ui-states/delete-book-desktop-light.png), the [edit form after a save failure](ui-states/edit-book-save-failed-desktop-light.png) and the [add form with two field errors](ui-states/add-book-two-errors-desktop-light.png). Each was rendered at 1440×900, 390×844 and 320×640 in both themes by `capture-previews.mjs` (evidence in `ui-states/previews.json`, contact sheet `ui-states/index.html`). The prototypes share `ui-states/shelf.css`, whose custom properties carry the token values.

The sample content for every screen is the shared content in [content.md](explorations/content.md): the 12-book library and the copy.

## 1. Navigation and screen inventory

| UX ID | Screen / route | Purpose | Requirements | Preview |
|---|---|---|---|---|
| UX-001 | Library (the root page) | See every book and its status in title order; reach add, edit and delete. | FR-001, FR-006 | [library-desktop-light](previews/v1/library-desktop-light.png) |
| UX-002 | Empty library (the root page with no books) | Say the library is empty and offer the one next step. | FR-002 | [empty-library-desktop-light](ui-states/empty-library-desktop-light.png) |
| UX-003 | Add a book (a page of its own) | Record a new book. | FR-003, FR-006 | [add-book-desktop-light](previews/v1/add-book-desktop-light.png), [add-book-two-errors-desktop-light](ui-states/add-book-two-errors-desktop-light.png) |
| UX-004 | Edit book (a page of its own, for one book) | Change one book's details. | FR-004, FR-006 | [edit-book-save-failed-desktop-light](ui-states/edit-book-save-failed-desktop-light.png) |
| UX-005 | Delete confirmation (a page of its own, for one book) | Confirm before a book is removed. | FR-005, FR-006 | [delete-book-desktop-light](ui-states/delete-book-desktop-light.png) |

```text
Library (UX-001, or UX-002 when empty)
  ├─ "Add a book" ─────► Add a book (UX-003) ──── "Add book" saved ─────► Library, the saved book in view
  ├─ "Edit <title>" ───► Edit book (UX-004) ───── "Save changes" saved ─► Library, the saved book in view
  └─ "Delete <title>" ─► Delete "<title>"? (UX-005) ─ "Delete book" ────► Library (or the empty library)
"Cancel", the "Shelf" wordmark or the browser's Back on UX-003/004/005 ──► Library, unchanged
```

Navigation rules:

- **No navigation bar.** The only ways between pages are the controls above and the browser's Back and Forward. Nothing is shown in a modal dialog or overlay (brief §4 principle 4).
- **Each page is its own browser history entry**, so Back from UX-003, UX-004 or UX-005 returns to the library. The exact paths are an implementation freedom (Stage C). The Edit and Delete pages identify their book, so they can be reloaded.
- **After a successful save or a confirmed delete,** the library replaces the form or confirmation page in the history. Back from that library does not reopen the submitted form or the confirmation.
- **A book that no longer exists** (for example a reloaded Edit page after the book was deleted) leads to the library, as if Cancel had been chosen, with no message (F14 in §2).
- **Page titles** (the document title) are the page's `h1` followed by " — Shelf": "Your library — Shelf", "Your library is empty — Shelf", "Add a book — Shelf", "Edit book — Shelf", "Delete “Dune”? — Shelf".

## 2. Global rules

- **Token notation:** `{path}` is a token in [tokens.json](tokens.json). `{theme.*.x}` means `theme.light.x` in the light theme and `theme.dark.x` in the dark theme. `{group.*}` on a responsive token means its `.narrow` value below `{layout.breakpoint}` and its `.wide` value at or above it. Nothing in this spec or in the product may use a colour, size or spacing that is not a token.
- **Layout grid and breakpoints** (component UX-101):
  - One centred sheet, at most `{layout.margin-width.*}` + `{layout.margin-gap.*}` + `{layout.measure}` + 2 × `{layout.gutter.*}` wide (57.75rem on desktop), padded `{layout.gutter.*}` left and right and `{space.7}` at the bottom.
  - Every block is a two-column grid: the margin column (`{layout.margin-width.*}`), a gap (`{layout.margin-gap.*}`) and the text column (the rest, which may shrink to 0). Content sits in the text column unless this spec puts it in the margin.
  - The margin rule is a `{border-width.margin-rule}` vertical line in `{theme.*.decoration.margin-rule}`. It runs the full height of the sheet, with its left edge `{layout.gutter.*}` + `{layout.margin-width.*}` from the sheet's left edge. It is decorative, so it stays out of the accessibility tree.
  - **Wide (at or above `{layout.breakpoint}`, 768px):** the margin holds the wordmark, the status notes and the field errors. They are right-aligned, `{layout.margin-inset}` clear of the rule.
  - **Narrow (below 768px):** the margin is a thin strip with nothing in it. Status notes move above the title, field errors move between the label and the field, and the wordmark moves to the start of the text column.
- **Comparison viewports for visual QA:** desktop 1440×900 and mobile 390×844, plus 320×640, the narrowest supported width (A8, NFR-001 reflow). To compare, capture the running app with `node .sdlc/scripts/capture-previews.mjs --url <name>=<url> --out <dir> --viewports desktop,mobile,320x640 --themes light,dark`, loaded with the same sample content, and set the result beside the reference images. A VAC passes when every observable it lists holds. Differences in anti-aliasing and sub-pixel text rendering do not count.
- **Themes:** light and dark follow the device's `prefers-color-scheme`. There is no switch in Shelf and no stored preference. Both themes share every layout, size and type decision; only the `{theme.*}` colours change. The page declares the matching `color-scheme` (light or dark), so browser-drawn parts such as scrollbars and the text caret follow the theme.
- **Typography:** one family, `{font.family.body}`, Literata self-hosted in regular and italic with the variable weight axis. No font service is used (NFR-004). For the optical-size axis see TQ-1 in §5. Every text role uses exactly this style:

  | Role | Size | Weight | Style | Line height | Colour | Other |
  |---|---|---|---|---|---|---|
  | Wordmark "Shelf" | `{font.size.wordmark.*}` | `{font.weight.medium}` | italic | `{font.line-height.body}` | `{theme.*.text.primary}` | letter-spacing `{font.letter-spacing.wordmark}` |
  | Page heading (`h1`) | `{font.size.heading.*}` | `{font.weight.heading}` | normal | `{font.line-height.heading}` | `{theme.*.text.primary}` | letter-spacing `{font.letter-spacing.heading}`; wraps anywhere |
  | Line under the heading (count line, empty-library sentence, delete sentence) | `{font.size.body}` | `{font.weight.regular}` | normal | `{font.line-height.body}` | `{theme.*.text.muted}` | `{space.3}` below the heading |
  | Book title | `{font.size.title.*}` | `{font.weight.medium}` | normal | `{font.line-height.title}` | `{theme.*.text.primary}` | wraps anywhere |
  | Author | `{font.size.author}` | `{font.weight.regular}` | italic | `{font.line-height.body}` | `{theme.*.text.muted}` | `{space.1}` above; wraps anywhere |
  | Status note: Want to read, Finished | `{font.size.note}` | `{font.weight.regular}` | italic | `{font.line-height.note}` | `{theme.*.text.muted}` | |
  | Status note: Reading | `{font.size.note}` | `{font.weight.reading}` | italic | `{font.line-height.note}` | `{theme.*.text.primary}` | |
  | Field label, status legend | `{font.size.field}` | `{font.weight.semibold}` | normal | `{font.line-height.body}` | `{theme.*.text.primary}` | `{space.2}` below |
  | Typed text | `{font.size.field}` | `{font.weight.regular}` | normal | `{font.line-height.field}` | `{theme.*.text.primary}` | |
  | Radio label | `{font.size.field}` | `{font.weight.regular}` | normal | `{font.line-height.body}` | `{theme.*.text.primary}` | |
  | Field error, save-failure message | `{font.size.note}` | `{font.weight.semibold}` | italic | `{font.line-height.note}` | `{theme.*.text.error}` | |
  | Filled button label | `{font.size.control}` | `{font.weight.semibold}` | normal | `{font.line-height.control}` | `{theme.*.text.on-accent}` | |
  | Text link | `{font.size.control}` | `{font.weight.medium}` | normal | `{font.line-height.control}` | `{theme.*.text.accent}` | underline `{border-width.underline}`, offset `{text.underline-offset}` |
  | Skip link | `{font.size.body}` | `{font.weight.regular}` | normal | `{font.line-height.body}` | `{theme.*.text.on-accent}` | underlined |

  Body text is never smaller than `{font.size.body}` (16px). Optical sizing is automatic (`font-optical-sizing: auto`).
- **Book text:** titles and authors are shown exactly as stored: trimmed, never truncated, never re-cased. They wrap at any character when a word is longer than the line, and they never push the status note or the actions out of view (FR-001 edge cases). Each title and author is isolated for bidirectional text (`dir="auto"`), so a right-to-left title keeps its own reading order. They carry no `lang` attribute because Shelf doesn't record their language. The `lang` attributes in the preview markup are sample data only.
- **Focus indicator:** every focusable control shows, on `:focus-visible`, a `{focus.width}` solid outline in `{theme.*.focus.ring}`, `{focus.offset}` outside the control (`{focus.offset-field}` on text fields). The outline follows the control's own shape: `{radius.control}` on buttons and fields, a circle on radio buttons, and `{radius.focus}` corners on links and the wordmark link. Because of the offset, the outline always sits on `{theme.*.surface.page}` (contrast in the table below). Programmatic focus targets that are not controls (a page's `h1`, a library entry, the save-failure message, `main`) get `tabindex="-1"`, are not in the Tab order, and show no outline.
- **Focus order** (Tab order equals reading order equals visual order, in both layouts):
  - UX-001: skip link → "Add a book" → for each book in title order: "Edit <title>", "Delete <title>".
  - UX-002: skip link → "Add a book".
  - UX-003 and UX-004: skip link → "Shelf" (wordmark link) → Title → Author → Reading status (one Tab stop, the checked option) → "Add book" or "Save changes" → "Cancel".
  - UX-005: skip link → "Shelf" → "Delete book" → "Cancel".
- **Focus movement** (the previews cannot show it; these rules are exact):

  | # | Event | Focus moves to | Scroll |
  |---|---|---|---|
  | F1 | Shelf is opened or reloaded, on any page | Nowhere: the browser default (document start). The first Tab reaches the skip link. | Top |
  | F2 | "Add a book" activated (UX-001 or UX-002) | The `h1` "Add a book" of UX-003 | Top |
  | F3 | "Edit <title>" activated | The `h1` "Edit book" of UX-004 | Top |
  | F4 | "Delete <title>" activated | The `h1` "Delete “<title>”?" of UX-005 | Top |
  | F5 | Save with details that break FR-003 AC-4 or AC-5 (UX-003, UX-004) | The first field with an error, in page order (Title before Author). Its error is announced through `aria-describedby`. | Brought into view by the focus move |
  | F6 | A save or a delete could not be stored (FR-006 AC-3) | The save-failure message (UX-107) | Brought into view by the focus move |
  | F7 | Save succeeded, adding or editing | The saved book's entry (UX-102) on the library, at its place in title order (FR-001). After an edit that changes the title, that is its new place. | The whole entry is in view |
  | F8 | Delete confirmed, and books remain | The entry that now holds the deleted book's place (the next book in title order), or the last entry if the deleted book was last | The whole entry is in view |
  | F9 | Delete confirmed for the only book | The `h1` "Your library is empty" (UX-002) | Top |
  | F10 | "Cancel" or the wordmark on UX-003 | The "Add a book" control that opened the form (on UX-001 or UX-002) | The library's scroll position before the form opened |
  | F11 | "Cancel" or the wordmark on UX-004 or UX-005 | That book's "Edit" or "Delete" link | The library's scroll position before the page opened |
  | F12 | Browser Back from UX-003, UX-004 or UX-005 | As F10 or F11 when Shelf renders the library itself. When the browser restores the page from its own cache, the browser's focus and scroll restoration is acceptable. | As F10 or F11 |
  | F13 | Skip link activated | `main` | `main` in view |
  | F14 | UX-004 or UX-005 opened for a book that no longer exists | The library's `h1` (UX-001 or UX-002) | Top |

  No live regions are used. A message is announced because focus moves to it or to its field. The count line is not announced when it changes (open question UQ-3).
- **Keyboard:** links open with Enter, and buttons activate with Enter or Space. Inside the status group, the arrow keys move and select, and Space selects. Enter in a text field saves the form, like its filled button. Escape does nothing: there are no overlays to close. Every function is reachable by keyboard alone (NFR-001).
- **Motion:** none. Shelf has no transitions, animations or smooth scrolling, including when it scrolls to a saved book. There are no motion tokens, so `prefers-reduced-motion` needs no special case.
- **Hover, pressed and disabled:** hover and press change nothing but the pointer cursor (shown on buttons, links and radio rows), as rendered (open question TQ-2). No control is ever disabled. Validation runs on save (FR-003 AC-4), so the save button always works.
- **Copy conventions:** sentence case everywhere, and no all caps. The wording is exactly the copy in [content.md](explorations/content.md), with straight apostrophes ("can't", "wasn't") and curly quotes around the title in the delete heading (“Dune”). The count line pluralises in English with thousands separators: "1 book.", "12 books.", "1,000 books.", each followed by " Saved in this browser on this device." A visually hidden "Error: " starts every error message, and a visually hidden "Status: " starts every status note. The interface is English only (A12), with `lang="en"` on the document.
- **Landmarks and structure:** every page has a skip link, a `header` (the masthead), a `main` and exactly one `h1`. The library is a list (`ul` with list semantics kept: `role="list"`, because the list style is removed). Each form has an accessible name from its `h1`. The only form controls are native ones: `input type="text"`, `input type="radio"` in a `fieldset` with a `legend`, and `button`.
- **Reflow, zoom and spacing:** at 320 CSS px, and at 400% zoom of 1280px, nothing scrolls sideways: the document's `scrollWidth` is never larger than the viewport. Sizes are in rem, so browser text-size settings scale the whole layout. Heights are minimums, never fixed, so WCAG text-spacing overrides never clip text. At 200% zoom on a 1440px window the layout is the narrow one.
- **Targets:** every link, button and radio row is at least `{size.target-min}` (44px) tall, and every link and button is at least 44px wide. The smallest measured on the references is the "Shelf" wordmark link, 51×44px on phones. A whole radio row, label included, selects its option; the 20px circle is not the only target.
- **500 books (NFR-003):** the library is one list, with no pagination and no "load more". Every entry is in the document, so the browser's find-in-page and a screen reader's browse mode reach all 500. The rendering technique is an implementation freedom within that rule.
- **No third-party content (NFR-004):** the font and every other asset come from Shelf itself. The reference prototypes load Literata from Google Fonts for convenience only, as the brief's previews did. Text fields set `autocomplete="off"`, so the browser offers no unrelated autofill (for example a "title" honorific).

### Contrast (WCAG 2.2, measured)

Ratios were computed with the WCAG relative-luminance formula from the token values in [tokens.json](tokens.json). Foreground and background are `theme.*` roles, measured in each theme. Text must reach 4.5:1 (every text in Shelf is at least 16px, so no large-text exception is used). Component boundaries, states and the focus indicator must reach 3:1 against each adjacent colour (1.4.11).

| Foreground | Background | Where | Light | Dark | Needs | Result |
|---|---|---|---|---|---|---|
| `text.primary` | `surface.page` | Headings, titles, labels, radio labels, the wordmark, the Reading note | 14.57:1 | 14.27:1 | 4.5:1 | Pass |
| `text.muted` | `surface.page` | Authors, the other status notes, the line under the heading | 6.29:1 | 7.91:1 | 4.5:1 | Pass |
| `text.accent` | `surface.page` | Edit, Delete, Cancel | 7.64:1 | 9.10:1 | 4.5:1 | Pass |
| `text.on-accent` | `surface.accent` | Filled-button labels, the skip link | 8.23:1 | 9.10:1 | 4.5:1 | Pass |
| `text.error` | `surface.page` | Field errors, the save-failure message | 7.00:1 | 8.82:1 | 4.5:1 | Pass |
| `text.primary` | `surface.field` | Typed text | 15.69:1 | 13.00:1 | 4.5:1 | Pass |
| `border.field` | `surface.page` | Text-field boundary, outside | 5.46:1 | 5.73:1 | 3:1 | Pass |
| `border.field` | `surface.field` | Text-field boundary, inside | 5.88:1 | 5.22:1 | 3:1 | Pass |
| `border.field-invalid` | `surface.page` | Invalid field boundary, outside (it also gets thicker) | 7.00:1 | 8.82:1 | 3:1 | Pass |
| `border.field-invalid` | `surface.field` | Invalid field boundary, inside | 7.55:1 | 8.03:1 | 3:1 | Pass |
| `control.radio-border` | `surface.page` | Unchecked radio ring, outside (UX-106) | 5.46:1 | 5.73:1 | 3:1 | Pass |
| `control.radio-border` | `control.radio-fill` | Unchecked radio ring, inside (UX-106) | 5.88:1 | 5.22:1 | 3:1 | Pass |
| `control.radio-checked` | `surface.page` | Checked radio ring, outside | 7.64:1 | 9.10:1 | 3:1 | Pass |
| `control.radio-checked` | `control.radio-fill` | Checked ring inside and the dot | 8.23:1 | 8.29:1 | 3:1 | Pass |
| `focus.ring` | `surface.page` | Focus outline (the offset puts it on the page) | 7.64:1 | 9.10:1 | 3:1 | Pass |
| `surface.accent` | `surface.page` | Filled-button shape (the label already identifies it) | 7.64:1 | 9.10:1 | 3:1 | Pass |
| `surface.field` | `surface.page` | Text-field fill | 1.08:1 | 1.10:1 | — | Not needed: the border identifies the field |
| `decoration.margin-rule` | `surface.page` | The margin rule | 2.05:1 | 2.72:1 | — | Exempt: decorative, carries no information |

**The browser-drawn radio buttons in the approved previews** were measured from the pixels of `previews/v1/add-book-desktop-*.png` and `add-book-mobile-*.png` (Chrome 156). Neither theme has token values for them.

- Light: a 1px anti-aliased mid-grey ring on a white fill. Its strongest pixel reaches 4.04:1 against the page and 4.35:1 against the fill, so it passes.
- Dark: a 1px anti-aliased grey ring around a dark-grey fill that is not one of Shelf's colours.
  - The fill is 1.54:1 against the page, so it does not identify the control.
  - The ring is 2.95:1 against its own fill even at its strongest pixel, and 1.37:1 at its darkest common pixels. Against the page it ranges from 4.56:1 to 2.11:1.
  - This fails 1.4.11: the ring is below 3:1 against the adjacent fill, which is why it looks faint.
  - The sampled pixel values are listed in the spec PR.

Browser-drawn radios also differ between browsers (NFR-002), so their contrast cannot be guaranteed. UX-106 therefore draws the radio with tokens in both themes. In the new references the ring renders exactly at `{theme.*.control.radio-border}` (`ui-states/add-book-two-errors-desktop-dark.png`, sampled), which gives the 5.73:1 and 5.22:1 above.

## 3. Screens

### UX-001 — Library

- **Implements:** FR-001 (AC-1 to AC-5 and the edge cases), FR-006 (where the library lives: A1, R1), NFR-003.
- **Route:** the root page.
- **Reference:** [desktop light](previews/v1/library-desktop-light.png), [desktop dark](previews/v1/library-desktop-dark.png), [mobile light](previews/v1/library-mobile-light.png), [mobile dark](previews/v1/library-mobile-dark.png).
- **Hierarchy:**
  1. Skip link "Skip to your library" (UX-101)
  2. Masthead (`header`, UX-101): the wordmark "Shelf" as plain text, and the "Add a book" filled button (UX-103), a link to UX-003
  3. `main`:
     1. `h1` "Your library"
     2. The count line: "<n> books. Saved in this browser on this device."
     3. The list of books (`ul`): one entry (UX-102) per book, in FR-001 order (title A–Z ignoring case; same titles in the order they were added)
- **Primary / secondary actions:** primary "Add a book" (the page's one filled button). Secondary: "Edit <title>" and "Delete <title>" on every entry (UX-104).
- **States:**

  | State | Trigger | What the user sees | Tokens / components |
  |---|---|---|---|
  | Loading | Shelf is opened and the stored books have not been read yet | The page frame and the masthead with the wordmark only. `main` stays empty: no heading, count, list or empty message, so the empty library never flashes before the books appear. There is no spinner and no placeholder. | UX-101 |
  | Empty | The library has no books (first visit, or the last book deleted) | UX-002 | UX-002 |
  | Error | Reading the stored library fails | Not specified in v1.0.0: the PRD defines no behaviour for a failed read (open question UQ-2). | — |
  | Success | One or more books | As the references: every book exactly once, in FR-001 order | UX-101, UX-102, UX-103, UX-104 |
  | Returning after a save | F7 | The library with the saved book's entry wholly in view and focused (no visible outline). The count line is current. | UX-102 |
  | Returning after a delete | F8 | The library without the deleted book. The count line is one lower, and the next entry is focused and in view. | UX-102 |
  | Disabled / no permission | — | Not used: Shelf has no sign-in (NFR-004) and no control is ever disabled. | — |

- **Validation rules:** none on this page.
- **Responsive behaviour:**
  - Wide: the wordmark sits right-aligned in the margin and "Add a book" at the right end of the text column, on one line. Status notes hang in the margin. Edit and Delete sit at the right end of the author line (UX-102).
  - Narrow: the wordmark and "Add a book" share the top line at the two ends of the text column. Status notes sit above the titles, and Edit and Delete under the author.
- **Accessibility:**
  - Landmarks are `header` and `main`; the skip link goes to `main`. The list is announced as a list with its item count.
  - Each entry reads, in order: "Status: <status>", title, author, "Edit <title>", "Delete <title>".
  - The page's own text is never a link: the wordmark is plain text here.
- **Visual acceptance criteria** (with the 12-book sample from [content.md](explorations/content.md)):
  - **VAC-1** At 1440×900 light, the first screen matches [library-desktop-light.png](previews/v1/library-desktop-light.png):
    - The wordmark is right-aligned in the margin, and "Add a book" is at the right end of the text column, on the same line.
    - The `h1` "Your library" starts 116px from the top, with the count line under it.
    - Six entries start on the first screen; the sixth, "Klara and the Sun", is cut by the fold. Each status note is right-aligned in the margin on the first baseline of its title.
    - Edit and Delete sit at the right end of each author line. For Beowulf, which has no author, they sit on the line below the title.
  - **VAC-2** At 1440×900 dark, the same holds against [library-desktop-dark.png](previews/v1/library-desktop-dark.png); only colours differ.
  - **VAC-3** At 390×844 light and dark, the first screen matches [library-mobile-light.png](previews/v1/library-mobile-light.png) and [library-mobile-dark.png](previews/v1/library-mobile-dark.png):
    - The wordmark and "Add a book" share the top line.
    - Each status note sits above its title, and Edit and Delete sit under the author.
    - The margin is an empty strip left of the rule.
    - Four entries are visible.
  - **VAC-4** At 320×640 in both themes, the layout is the narrow one of [library-mobile-light.png](previews/v1/library-mobile-light.png) and [library-mobile-dark.png](previews/v1/library-mobile-dark.png); there is no separate 320px image. Nothing scrolls sideways (`scrollWidth` ≤ 320). "The Hundred-Year-Old Man Who Climbed Out of the Window and Disappeared" wraps in full, and every status note, Edit and Delete in the list stays visible.
  - **VAC-5** In both themes, as in [library-desktop-light.png](previews/v1/library-desktop-light.png) and [library-desktop-dark.png](previews/v1/library-desktop-dark.png), the two "Reading" notes (Circe, Dune) are heavier and in `{theme.*.text.primary}`, and every other note is `{theme.*.text.muted}`. No note, title or action uses colour alone, a dot, a badge or an icon.
  - **VAC-6** The count line reads "12 books. Saved in this browser on this device.", as in every library reference. With one book it reads "1 book. Saved in this browser on this device."
- **Implementation freedoms:** the URL scheme, how the "Loading" state is detected, and how the list is rendered, within the 500-book rule in §2.

### UX-002 — Empty library

- **Implements:** FR-002 (AC-1, AC-2, AC-3 and the edge case: no sample books, A10).
- **Route:** the root page, when the library has no books.
- **Reference:** [desktop light](ui-states/empty-library-desktop-light.png), [desktop dark](ui-states/empty-library-desktop-dark.png), [mobile light](ui-states/empty-library-mobile-light.png), [mobile dark](ui-states/empty-library-mobile-dark.png), [320 light](ui-states/empty-library-320x640-light.png), [320 dark](ui-states/empty-library-320x640-dark.png).
- **Hierarchy:**
  1. Skip link "Skip to your library"
  2. Masthead: the wordmark "Shelf" as plain text, and nothing else. The page's one "Add a book" button is in `main`, so the page never shows two.
  3. `main`:
     1. `h1` "Your library is empty"
     2. The sentence "Add the books you want to read, are reading or have finished." in the line-under-the-heading style
     3. The "Add a book" filled button (UX-103), a link to UX-003, `{space.6}` below the sentence and aligned with the text column
- **Primary / secondary actions:** primary "Add a book". There is no secondary action.
- **States:**

  | State | Trigger | What the user sees | Tokens / components |
  |---|---|---|---|
  | Loading | As UX-001 | As UX-001: the empty library is never shown before the read completes | UX-101 |
  | Empty | No books | As the references: heading, sentence, button. There is no count line and no illustration, and nothing sits in the margin except the wordmark. | UX-101, UX-103 |
  | Error | Reading fails | Not specified in v1.0.0 (UQ-2) | — |
  | Success | — | A library with books is UX-001 | UX-001 |
  | Disabled / no permission | — | Not used | — |

- **Validation rules:** none.
- **Responsive behaviour:** the same in both layouts, apart from the wordmark's position (UX-101). On phones the heading wraps to two lines.
- **Accessibility:** the heading states the condition and the button names the action. After the last book is deleted, focus is on this `h1` (F9), so a screen reader announces "Your library is empty" and the next Tab reaches "Add a book".
- **Visual acceptance criteria:**
  - **VAC-1** At 1440×900 light, the page matches [empty-library-desktop-light.png](ui-states/empty-library-desktop-light.png):
    - Only the wordmark is in the masthead.
    - The `h1` starts 116px from the top, at the same place as "Your library" on UX-001.
    - The sentence sits below it in `{theme.*.text.muted}`, with one filled "Add a book" button `{space.6}` below the sentence.
    - The margin and the rest of the page are empty.
  - **VAC-2** At 1440×900 dark, the same holds against [empty-library-desktop-dark.png](ui-states/empty-library-desktop-dark.png).
  - **VAC-3** At 390×844 light and dark, the page matches [empty-library-mobile-light.png](ui-states/empty-library-mobile-light.png) and [empty-library-mobile-dark.png](ui-states/empty-library-mobile-dark.png): the heading wraps to two lines, and the button is at the start of the text column.
  - **VAC-4** At 320×640 light and dark, the page matches [empty-library-320x640-light.png](ui-states/empty-library-320x640-light.png) and [empty-library-320x640-dark.png](ui-states/empty-library-320x640-dark.png). Nothing scrolls sideways.
- **Implementation freedoms:** none beyond UX-001's.

### UX-003 — Add a book

- **Implements:** FR-003 (AC-1 to AC-7 and the duplicate edge case, A6), FR-006 (AC-2, AC-3).
- **Route:** the add page.
- **Reference:**
  - After saving with an empty Title (the brief's preview): [desktop light](previews/v1/add-book-desktop-light.png), [desktop dark](previews/v1/add-book-desktop-dark.png), [mobile light](previews/v1/add-book-mobile-light.png), [mobile dark](previews/v1/add-book-mobile-dark.png).
  - With two field errors and the UX-106 radio buttons: [desktop light](ui-states/add-book-two-errors-desktop-light.png), [desktop dark](ui-states/add-book-two-errors-desktop-dark.png), [mobile light](ui-states/add-book-two-errors-mobile-light.png), [mobile dark](ui-states/add-book-two-errors-mobile-dark.png), [320 light](ui-states/add-book-two-errors-320x640-light.png), [320 dark](ui-states/add-book-two-errors-320x640-dark.png).
- **Hierarchy:**
  1. Skip link "Skip to the form"
  2. Masthead: the wordmark "Shelf" as a link to the library (UX-101)
  3. `main` holds the form (`novalidate`, named by its `h1`):
     1. `h1` "Add a book"
     2. Title field (UX-105), label "Title"
     3. Author field (UX-105), label "Author (optional)"
     4. Reading status group (UX-106), legend "Reading status"
     5. The save-failure message (UX-107), only after a failed store
     6. Actions: the "Add book" filled button (UX-103, submit), then "Cancel" (UX-104, a link to the library)
- **Primary / secondary actions:** primary "Add book", secondary "Cancel". The wordmark and the browser's Back behave as Cancel.
- **States:**

  | State | Trigger | What the user sees | Tokens / components |
  |---|---|---|---|
  | Default | "Add a book" activated (F2) | An empty Title, an empty Author, "Want to read" checked and no message (FR-003 AC-1). Focus is on the `h1`. | UX-105, UX-106 |
  | Error: validation | Save with a Title that is empty or only spaces, or a Title or Author over 200 characters after trimming (FR-003 AC-4, AC-5) | No book is added. The form stays, the fields show what the reader entered (trimmed), and each failing field shows its error (UX-105). Focus moves to the first failing field (F5). | UX-105 |
  | Error: not stored | The details are valid but cannot be stored (FR-006 AC-3) | No book is added and nothing in the library changes. The form stays with everything entered, the save-failure message appears above the actions, and focus moves to it (F6). | UX-107 |
  | Success | Valid details stored | The library, with the new book at its place in title order, in view and focused (F7, FR-003 AC-2, AC-3, AC-6) | UX-001 |
  | Cancelled | "Cancel", the wordmark or Back | The library, unchanged (FR-003 AC-7), with no "discard changes?" prompt (F10, F12) | UX-001 |
  | Loading / disabled | — | Not used: the page has nothing to load and no disabled control | — |

- **Validation rules:**
  - Validation runs only when the reader saves (button or Enter). Nothing is checked while typing or on leaving a field.
  - Each save clears every earlier message and shows only those that apply now.
  - Title: trimmed of leading and trailing spaces, it must have 1–200 characters. Author: trimmed, at most 200 characters, and may be empty. Status: always one of the three.
  - Messages, word for word:
    - Title empty: "Enter a title. A book can't be added without one."
    - Title too long: "Title must be 200 characters or fewer."
    - Author too long: "Author must be 200 characters or fewer."
  - The fields accept more than 200 characters, so the reader can see the message rather than have their text cut off.
  - A duplicate title and author is not an error (A6).
  - Activating save twice in quick succession adds the book once.
- **Responsive behaviour:**
  - Wide: field errors hang in the margin beside their field, right-aligned. Their first line is level with the field's text.
  - Narrow: errors sit between the label and the field (UX-105). The actions wrap if they don't fit side by side.
- **Accessibility:** errors are tied to their fields (`aria-invalid`, `aria-describedby`). Title is marked `required` for assistive technology, while `novalidate` keeps the browser's own validation bubbles away. The status group is a `fieldset` with a `legend`. No live regions are used (see F5, F6).
- **Visual acceptance criteria:**
  - **VAC-1** At 1440×900 light, in the preview's state (an empty Title after saving, Author "Becky Chambers", status "Reading"), the page matches [add-book-desktop-light.png](previews/v1/add-book-desktop-light.png), except for the radio buttons (VAC-5):
    - The wordmark link is alone in the masthead, and the `h1` starts 116px from the top.
    - The Title field has a `{border-width.field-invalid}` `{theme.*.border.field-invalid}` border. Its error sits right-aligned in the margin, with its first line level with the field's text, and the field keeps its height.
    - Below come the Author field and three 44px status rows, then "Add book" and "Cancel".
  - **VAC-2** At 1440×900 dark, the same holds against [add-book-desktop-dark.png](previews/v1/add-book-desktop-dark.png), except for the radio buttons.
  - **VAC-3** At 390×844 light and dark, the page matches [add-book-mobile-light.png](previews/v1/add-book-mobile-light.png) and [add-book-mobile-dark.png](previews/v1/add-book-mobile-dark.png), except for the radio buttons: the Title error sits between the label "Title" and the field.
  - **VAC-4** With an empty Title and a 218-character Author, the page matches [add-book-two-errors-desktop-light.png](ui-states/add-book-two-errors-desktop-light.png), [-desktop-dark](ui-states/add-book-two-errors-desktop-dark.png), [-mobile-light](ui-states/add-book-two-errors-mobile-light.png), [-mobile-dark](ui-states/add-book-two-errors-mobile-dark.png), [-320x640-light](ui-states/add-book-two-errors-320x640-light.png) and [-320x640-dark](ui-states/add-book-two-errors-320x640-dark.png). Each error sits beside or above its own field, and neither overlaps the other or a label.
  - **VAC-5** In both themes, the radio buttons follow UX-106 and match the radios in the `ui-states/add-book-two-errors-*` and `edit-book-save-failed-*` references, not the browser-drawn radios in `previews/v1/`:
    - 20px circles with a `{border-width.radio}` `{theme.*.control.radio-border}` ring on `{theme.*.control.radio-fill}`
    - the checked one with a `{theme.*.control.radio-checked}` ring and a 10px dot in the same colour
  - **VAC-6** At 320×640 in both themes, the page matches [add-book-two-errors-320x640-light.png](ui-states/add-book-two-errors-320x640-light.png) and [add-book-two-errors-320x640-dark.png](ui-states/add-book-two-errors-320x640-dark.png). Nothing scrolls sideways, in the default state or with errors.
  - **VAC-7** Opened from the library, the form shows an empty Title, an empty Author, "Want to read" checked and no message. This is the [add-book-two-errors-desktop-light.png](ui-states/add-book-two-errors-desktop-light.png) layout without its two errors.
- **Implementation freedoms:** how double activation is prevented; whether the page is rendered on the server or the client.

### UX-004 — Edit book

- **Implements:** FR-004 (AC-1 to AC-5 and the edge cases), FR-006 (AC-2, AC-3).
- **Route:** the edit page for one book.
- **Reference:** after a failed store, with the status changed from Reading to Finished: [desktop light](ui-states/edit-book-save-failed-desktop-light.png), [desktop dark](ui-states/edit-book-save-failed-desktop-dark.png), [mobile light](ui-states/edit-book-save-failed-mobile-light.png), [mobile dark](ui-states/edit-book-save-failed-mobile-dark.png), [320 light](ui-states/edit-book-save-failed-320x640-light.png), [320 dark](ui-states/edit-book-save-failed-320x640-dark.png).
- **Hierarchy:** as UX-003, with these differences:
  - The `h1` is "Edit book".
  - The fields open with the book's current title, author and status (FR-004 AC-1).
  - The filled button is "Save changes".
  - The page title is "Edit book — Shelf".
- **Primary / secondary actions:** primary "Save changes", secondary "Cancel". The wordmark and Back behave as Cancel.
- **States:**

  | State | Trigger | What the user sees | Tokens / components |
  |---|---|---|---|
  | Default | "Edit <title>" activated (F3) | The book's current details, with its status checked. Focus is on the `h1`. | UX-105, UX-106 |
  | Error: validation | As UX-003 (FR-004 AC-4) | The stored book is unchanged. The same messages and placement as UX-003, with focus on the first failing field (F5). | UX-105 |
  | Error: not stored | Valid details cannot be stored (FR-006 AC-3) | The stored book is unchanged and nothing in the library changes. The form keeps everything entered, the save-failure message appears above the actions, and focus moves to it (F6). | UX-107 |
  | Success | Stored | The library, with the edited book at its place in title order (a new place if the title changed), in view and focused (F7, FR-004 AC-2, AC-3). Saving without changes behaves the same, and the book stays as it was. | UX-001 |
  | Cancelled | "Cancel", the wordmark or Back | The library, with the book unchanged (FR-004 AC-5). Focus is on that book's "Edit" link (F11). | UX-001 |
  | Not found | The page is opened for a book that no longer exists | The library (F14) | UX-001 |

- **Validation rules:** exactly those of UX-003, including the message "Enter a title. A book can't be added without one.", because FR-004 AC-4 requires the same messages (UQ-4).
- **Responsive behaviour:** as UX-003.
- **Accessibility:** as UX-003. The failed-store message is focused and announced (F6).
- **Visual acceptance criteria:**
  - **VAC-1** At 1440×900 light, the edit form for "Dune" by Frank Herbert after a failed store, with Finished checked, matches [edit-book-save-failed-desktop-light.png](ui-states/edit-book-save-failed-desktop-light.png):
    - The `h1` "Edit book" starts 116px from the top, and the Title and Author fields are filled in.
    - Finished shows the UX-106 checked radio.
    - The save-failure message is in the text column, `{space.6}` below the status group and `{space.4}` above "Save changes" and "Cancel", with nothing in the margin beside it.
  - **VAC-2** At 1440×900 dark, the same holds against [edit-book-save-failed-desktop-dark.png](ui-states/edit-book-save-failed-desktop-dark.png).
  - **VAC-3** At 390×844 light and dark, the page matches [edit-book-save-failed-mobile-light.png](ui-states/edit-book-save-failed-mobile-light.png) and [edit-book-save-failed-mobile-dark.png](ui-states/edit-book-save-failed-mobile-dark.png).
  - **VAC-4** At 320×640 light and dark, after focus has moved to the message, the screen matches [edit-book-save-failed-320x640-light.png](ui-states/edit-book-save-failed-320x640-light.png) and [edit-book-save-failed-320x640-dark.png](ui-states/edit-book-save-failed-320x640-dark.png): the message and both actions are in view. Nothing scrolls sideways.
  - **VAC-5** Without a failure, the page is the same without the message: "Save changes" and "Cancel" sit `{space.6}` below the status group, as on UX-003.
- **Implementation freedoms:** as UX-003; how the page identifies its book.

### UX-005 — Delete confirmation

- **Implements:** FR-005 (AC-1 to AC-3 and the edge cases), FR-002 AC-3, FR-006 (AC-2, AC-3).
- **Route:** the delete page for one book. Reaching it removes nothing (FR-005 AC-1); only "Delete book" removes the book.
- **Reference:** [desktop light](ui-states/delete-book-desktop-light.png), [desktop dark](ui-states/delete-book-desktop-dark.png), [mobile light](ui-states/delete-book-mobile-light.png), [mobile dark](ui-states/delete-book-mobile-dark.png), [320 light](ui-states/delete-book-320x640-light.png), [320 dark](ui-states/delete-book-320x640-dark.png).
- **Hierarchy:**
  1. Skip link "Skip to the confirmation"
  2. Masthead: the wordmark "Shelf" as a link to the library
  3. `main` holds a form named by its `h1`:
     1. `h1` "Delete “<title>”?", with the title exactly as stored and wrapping in full
     2. The sentence "It will be removed from your library. This can't be undone." in the line-under-the-heading style
     3. The save-failure message (UX-107), only after a failed store
     4. Actions, `{space.6}` below the sentence: the "Delete book" filled button (UX-103, submit), then "Cancel" (UX-104, a link to the library)
- **Primary / secondary actions:** primary "Delete book", secondary "Cancel". The wordmark and Back behave as Cancel. The button uses the one filled-button style; there is no separate red "danger" variant, because error red is reserved for messages (brief §6).
- **States:**

  | State | Trigger | What the user sees | Tokens / components |
  |---|---|---|---|
  | Default | "Delete <title>" activated (F4) | The question naming the book, the sentence and the two actions. Focus is on the `h1`. | UX-101, UX-103, UX-104 |
  | Error: not stored | The deletion cannot be stored (FR-006 AC-3) | The book is not removed, and the library is unchanged when the reader returns to it. The save-failure message appears above the actions, and focus moves to it (F6). | UX-107 |
  | Success | Deletion stored | The library without the book. Focus is on the next entry (F8), or on the empty library if it was the only book (F9, FR-002 AC-3). | UX-001, UX-002 |
  | Cancelled | "Cancel", the wordmark or Back | The library with the book unchanged (FR-005 AC-3). Focus is on that book's "Delete" link (F11). | UX-001 |
  | Not found | The page is opened for a book that no longer exists | The library (F14) | UX-001 |
  | Loading / disabled | — | Not used | — |

- **Validation rules:** none. There is no typed confirmation and no undo afterwards (A7).
- **Responsive behaviour:** the same in both layouts, apart from the wordmark's position. A long title wraps in the heading.
- **Accessibility:** focus on the `h1` makes a screen reader announce the question with the book's title (F4). The next Tab reaches "Delete book", then "Cancel".
- **Visual acceptance criteria:**
  - **VAC-1** At 1440×900 light, with the book "Dune", the page matches [delete-book-desktop-light.png](ui-states/delete-book-desktop-light.png):
    - The wordmark link is alone in the masthead.
    - The `h1` "Delete “Dune”?" starts 116px from the top, with the sentence under it in `{theme.*.text.muted}`.
    - "Delete book" and "Cancel" sit `{space.6}` below the sentence, and nothing is in the margin.
  - **VAC-2** At 1440×900 dark, the same holds against [delete-book-desktop-dark.png](ui-states/delete-book-desktop-dark.png).
  - **VAC-3** At 390×844 light and dark, the page matches [delete-book-mobile-light.png](ui-states/delete-book-mobile-light.png) and [delete-book-mobile-dark.png](ui-states/delete-book-mobile-dark.png).
  - **VAC-4** At 320×640 light and dark, the page matches [delete-book-320x640-light.png](ui-states/delete-book-320x640-light.png) and [delete-book-320x640-dark.png](ui-states/delete-book-320x640-dark.png). With a 200-character title, the heading wraps in full and nothing scrolls sideways.
- **Implementation freedoms:** how the page identifies its book; whether deletion is a form post or a script action, provided only "Delete book" removes the book.

## 4. Components

### UX-101 — Page frame: sheet, margin rule, masthead, skip link

- **Used by:** UX-001 to UX-005, which implement FR-001, FR-002, FR-003, FR-004 and FR-005.
- **Variants / props contract:**
  - `wordmark`: `text` on the library pages (UX-001, UX-002), or `link` on UX-003, UX-004 and UX-005, where it returns to the library like Cancel.
  - `headerAction`: the "Add a book" button on UX-001 only; none elsewhere.
  - `skipLinkLabel`: "Skip to your library" (UX-001, UX-002), "Skip to the form" (UX-003, UX-004) or "Skip to the confirmation" (UX-005).
- **Layout:**
  - The sheet, grid and margin rule follow §2.
  - Masthead (`header`): padded `{space.5}` top and bottom, and at least `{size.target-min}` + 2 × `{space.5}` tall whether or not it holds the button, so every `h1` starts at the same place (116px from the top). Items are centred vertically.
    - Wide: the wordmark is right-aligned in the margin column, `{layout.margin-inset}` from the rule, and the header action sits at the right end of the text column.
    - Narrow: the wordmark is at the start of the text column, with the header action at its right end, `{space.4}` apart at least.
  - Wordmark link: `{size.target-min}` tall, not underlined, in the wordmark text style.
  - Intro block (the `h1` and the line under it): `{space.6}` above. Below it, `{space.6}` on UX-001, UX-002 and UX-005, or `{space.5}` on the forms.
  - Skip link: the first focusable element, off-screen until focused. Focused, it shows at `{space.2}` from the top and `{layout.gutter.*}` from the left, padded `{space.2}` `{space.4}`, on `{theme.*.surface.accent}`. Activating it focuses `main` (F13).
- **States:** default. The skip link is visible only while focused, and the wordmark link has focus-visible (§2).
- **Tokens:** `layout.*`, `space.5`, `space.6`, `space.7`, `size.target-min`, `border-width.margin-rule`, `theme.*.surface.page`, `theme.*.decoration.margin-rule`, `theme.*.surface.accent`, `theme.*.text.on-accent`, `font.size.wordmark.*`, `font.letter-spacing.wordmark`.

### UX-102 — Library entry

- **Used by:** UX-001, which implements FR-001 (AC-1, AC-4 and the edge cases), FR-004 (the way in to edit) and FR-005 (the way in to delete).
- **Variants / props contract:**
  - `status`: one of Want to read, Reading or Finished.
  - `title`: required.
  - `author`: optional. With no author, the author line is left out of the accessibility tree.
- **Content and order:**
  1. The status note, with a visually hidden "Status: " before it
  2. The title
  3. The author
  4. The actions: "Edit" (a link to UX-004) and "Delete" (a link to UX-005), each a UX-104 link `{space.2}` apart. Each link's accessible name is its visible word followed by the title in visually hidden text ("Edit Dune", "Delete Dune"), so the name starts with the visible label (WCAG 2.5.3).
- **Layout:**
  - Wide: the entry is a grid row padded `{space.5}` top and bottom. The status note sits in the margin column, right-aligned, `{layout.margin-inset}` from the rule, on the title's first baseline. The title and the byline sit in the text column.
    - The byline is the author at the start and the actions at the end of the same line, `{space.5}` apart at least. The actions wrap below the author when the line is too short, and they sit on the line below the title when there is no author.
    - The actions' inner padding overhangs the column end, so the text of "Delete" ends at the column edge.
  - Narrow: the entry is padded `{space.4}` above and `{space.3}` below. The note sits above the title with `{space.1}` under it, and the actions sit under the author (or under the title). Their padding overhangs the column start, so "Edit" lines up with the title.
  - There are no dividers, cards, backgrounds or icons between or on entries (brief §7).
- **States:**
  - Default.
  - Focused as a programmatic target (F7, F8): `tabindex="-1"`, with no visible outline.
  - No hover, selection or disabled state.
- **Tokens:** `font.size.note`, `font.weight.reading`, `font.size.title.*`, `font.size.author`, `space.1` to `space.5`, `layout.margin-inset`, `theme.*.text.primary`, `theme.*.text.muted`.

### UX-103 — Filled button

- **Used by:** UX-001 and UX-002 ("Add a book", a link to UX-003), UX-003 ("Add book", submit), UX-004 ("Save changes", submit) and UX-005 ("Delete book", submit). Together they implement FR-001 AC-5, FR-002 AC-2, FR-003, FR-004 and FR-005.
- **Variants / props contract:**
  - `label`: one of the strings above.
  - `as`: `link` (navigates) or `submit` (submits its form).
  - Exactly one filled button per page.
- **Visual:**
  - Shape: at least `{size.target-min}` tall, padded `{space.5}` left and right, with a `{border-width.button}` solid `{theme.*.border.accent}` border and `{radius.control}` corners.
  - Fill and label: `{theme.*.surface.accent}` fill, with the label in the filled-button text style, centred.
  - Width: the label plus the padding; never full width.
- **States:**
  - Default and focus-visible (§2: the outline keeps `{radius.control}`).
  - Hover and pressed: no change beyond the pointer cursor (TQ-2).
  - Disabled: not used. While a save is being stored, a second activation is ignored rather than drawn differently.
  - Error: not applicable.
- **Tokens:** `size.target-min`, `space.5`, `border-width.button`, `radius.control`, `theme.*.surface.accent`, `theme.*.border.accent`, `theme.*.text.on-accent`, `font.size.control`, `font.weight.semibold`, `font.line-height.control`.

### UX-104 — Text link action

- **Used by:** UX-102 ("Edit <title>", "Delete <title>"), UX-003, UX-004 and UX-005 ("Cancel"). Together they implement FR-003 AC-7, FR-004 AC-5, FR-005 AC-1 and AC-3.
- **Variants / props contract:**
  - `label`: the visible word.
  - `hiddenSuffix`: optional; the visually hidden title on Edit and Delete.
  - Always a link, because every use navigates.
  - "Cancel" follows the filled button, `{space.4}` after it.
- **Visual:** at least `{size.target-min}` tall, padded `{space.3}` left and right, in the text-link text style, and always underlined (links are told apart by the underline, not by colour alone).
- **States:**
  - Default and focus-visible (§2: `{radius.focus}` corners).
  - Hover and pressed: no change beyond the pointer cursor (TQ-2).
  - Disabled: not used.
- **Tokens:** `size.target-min`, `space.3`, `space.4`, `theme.*.text.accent`, `font.size.control`, `font.weight.medium`, `font.line-height.control`, `border-width.underline`, `text.underline-offset`, `radius.focus`.

### UX-105 — Text field with error

- **Used by:** UX-003 and UX-004, which implement FR-003 (AC-1, AC-4, AC-5, AC-6) and FR-004 (AC-1, AC-4).
- **Variants / props contract:**
  - Title: label "Title", `required`.
  - Author: label "Author (optional)".
  - Both: `type="text"`, `autocomplete="off"`, and no maximum length of 200 or less.
  - `value`: as entered. After a failed save, each field shows its entered value trimmed of leading and trailing spaces, so a Title of only spaces shows empty, as in the preview. Nothing else is changed or cut off.
  - `error`: none, or one of the three messages in UX-003.
- **Layout:**
  - The field block is padded `{space.4}` top and bottom, with the label above the input and `{space.2}` between them.
  - The input spans the text column. It is at least `{size.field-min-height}` tall, padded `{space.2}` `{space.3}`, with a `{border-width.field}` `{theme.*.border.field}` border, `{radius.control}` corners and a `{theme.*.surface.field}` fill, in the typed-text style.
  - Error placement:
    - Wide: the message sits in the margin column beside the input, right-aligned, `{layout.margin-inset}` from the rule. Its top is `{layout.field-error-offset}` below the input's top, so its first line is level with the field's text. The input keeps its own height and aligns to the top of its row; a long message makes the row taller below the field, never the field taller.
    - Narrow: the message sits between the label and the input, with `{space.2}` under it.
- **States:**
  - Default and focus-visible: the outline at `{focus.offset-field}`.
  - Error:
    - `aria-invalid="true"`, with the message linked by `aria-describedby`.
    - The border becomes `{border-width.field-invalid}` in `{theme.*.border.field-invalid}`, and the field's outer size is unchanged.
    - The message is in the error text style, starting with a visually hidden "Error: ".
  - Error with focus-visible: both together.
  - No placeholder text, hover or disabled state.
- **Tokens:** `space.2` to `space.4`, `size.field-min-height`, `border-width.field`, `border-width.field-invalid`, `radius.control`, `layout.field-error-offset`, `layout.margin-inset`, `focus.offset-field`, `theme.*.surface.field`, `theme.*.border.field`, `theme.*.border.field-invalid`, `theme.*.text.error`, `font.size.field`, `font.size.note`.

### UX-106 — Reading status radio group

- **Used by:** UX-003 and UX-004, which implement FR-003 (AC-1, AC-2) and FR-004 (AC-1, AC-2).
- **Variants / props contract:**
  - A `fieldset` with the `legend` "Reading status", holding three native radio inputs in this order: Want to read, Reading, Finished.
  - Exactly one is always checked: "Want to read" on UX-003, or the book's status on UX-004.
- **Layout:**
  - Each option is a label row at least `{size.target-min}` tall, with `{space.1}` between rows.
  - In each row the radio comes first, then the label text `{space.3}` after it.
  - The whole row is the target.
- **Drawing:** the radio keeps its native semantics and keyboard behaviour but is drawn with tokens, because the browser-drawn radio fails WCAG 1.4.11 in the dark theme (§2 contrast) and differs between browsers. The drawing is the same in both themes; only colours change.
  - Unchecked: a `{size.radio}` circle with a `{border-width.radio}` ring in `{theme.*.control.radio-border}` and a `{theme.*.control.radio-fill}` inside.
  - Checked: the ring turns `{theme.*.control.radio-checked}`, and a centred `{size.radio-dot}` dot in `{theme.*.control.radio-checked}` appears.
  - Focus-visible: the §2 outline, following the circle.
  - Forced colours (Windows contrast themes, `forced-colors: active`): the radio falls back to the browser-drawn control in system colours, so the checked state never disappears.
  - This is a deliberate difference from the pixels of `previews/v1/add-book-*.png`, approved with this spec (D6).
- **States:**
  - Unchecked, checked, and focus-visible on either.
  - No error state (one option is always checked), no disabled state and no hover.
- **Tokens:** `size.radio`, `size.radio-dot`, `border-width.radio`, `size.target-min`, `space.1`, `space.3`, `theme.*.control.radio-border`, `theme.*.control.radio-fill`, `theme.*.control.radio-checked`, `theme.*.focus.ring`, `font.size.field`.

### UX-107 — Save-failure message

- **Used by:** UX-003, UX-004 and UX-005, which implement FR-006 AC-3.
- **Variants / props contract:**
  - One message, word for word, starting with a visually hidden "Error: ": "This change wasn't saved. Your browser didn't let Shelf store it. Try again, or check that this browser allows sites to store data."
  - It is shown only after validation passed and storing the change failed.
- **Layout:**
  - The message sits in the text column, directly above the page's actions, with `{space.4}` between it and the actions.
  - The space above the actions block is unchanged: `{space.6}` below the status group on the forms, or below the sentence on UX-005.
  - It uses the error text style, with no box, border, icon or background (brief §7). Nothing sits in the margin beside it.
- **Behaviour:**
  - The page stays as it was, with every value as entered. The change is not shown as saved anywhere, and the library is unchanged (FR-006 AC-3).
  - Focus moves to the message (`tabindex="-1"`, no outline), which brings it into view (F6).
  - The message stays until the next attempt.
    - A successful retry continues as F7, F8 or F9.
    - A retry that fails to store shows the message again and moves focus to it again.
    - A retry that fails validation removes it and shows the field errors instead.
  - "Cancel" still works and discards the change.
- **States:** hidden and shown. No hover or disabled state.
- **Tokens:** `space.4`, `space.6`, `theme.*.text.error`, `font.size.note`, `font.weight.semibold`, `font.line-height.note`.

## 5. Open questions

None of these block approval of v1.0.0. The proposed default applies unless the owner changes it in review.

| # | Question | Proposed default | Decide in |
|---|---|---|---|
| UQ-1 | FR-007 (filter by status) and FR-008 (search) are Next, and the PRD says both are "to be refined before it enters the backlog". | Out of v1.0.0. Their controls and no-results states will be specified in a MINOR version (1.1.0) once the PRD refines them, in this spec's style. | When FR-007 and FR-008 are refined |
| UQ-2 | Reading the stored library could fail (storage blocked or unreadable). The PRD defines no behaviour: FR-006 AC-3 covers saving only. | No read-failure UI in v1.0.0. Stage C states whether the chosen storage can fail on read. If it can, a PRD change request adds the behaviour and this spec gains a state. | Architecture (Stage C) |
| UQ-3 | Should screen readers hear an explicit "Saved" or "Deleted" confirmation? No such copy exists. | No: moving focus to the saved book (F7) or to the next book (F8) is the confirmation, with no new copy. | Owner review |
| UQ-4 | On the edit form, the Title message says "A book can't be added without one", because FR-004 AC-4 requires the same messages as FR-003. | Keep the PRD's rule and the same copy. | Owner review |
| TQ-1 | Literata's optical-size axis (opsz 7–72): the previews were rendered with it, while the brief's default names only the weight axis. | Self-host it too, so the product matches the approved previews. | Owner review; file size in Stage C |
| TQ-2 | Hover and pressed styles for buttons and links: the brief and previews define none. | None, as rendered: pointer cursor only. | Owner review |
| TQ-3 | The radio drawing (UX-106) and its dot size (`{size.radio-dot}`, measured from the preview render, not in its CSS). | As specified. | Owner review |

TQ-1 to TQ-3 are also recorded in `tokens.json` under `$extensions.sdlc.open_questions`. Behaviour with Shelf open in two tabs at once stays undefined (PRD Q9) and has no UI in v1.0.0.

## 6. Decisions and change log

Decisions taken in this spec. The first five apply the brief's approved defaults (brief §11); D6 to D12 are the agent's, for the owner to review with this spec.

| # | Decision | Source |
|---|---|---|
| D1 | The delete confirmation is a page of its own in the form's style (UX-005), not an overlay. On phones it is one heading, one sentence and two actions, with nothing awkward. | Brief §11 default |
| D2 | The empty library is a heading, one sentence and the one "Add a book" button, with nothing in the margin (UX-002). The save failure is one error-styled sentence above the actions (UX-107). Both use the copy in content.md. | Brief §11 default |
| D3 | The density stays spacious, as rendered; phone spacing is not tightened. | Brief §11 default |
| D4 | After saving, the reader lands on the library with the saved book in view at its place in title order, and focused (F7). | Brief §11 default |
| D5 | Literata is self-hosted in regular and italic with the variable weight axis; no font service. The optical-size axis is TQ-1. | Brief §11 default, NFR-004 |
| D6 | Radio buttons are drawn with tokens in both themes (UX-106), because the browser-drawn dark radio measures 2.95:1 against its own fill. | NFR-001, measured |
| D7 | The masthead is always at least one 44px row tall, so every page's heading starts at the same place, as in both approved previews. | Previews |
| D8 | On every page change, focus moves to the new page's `h1`, not into the first field. A failed save focuses the first failing field, as the brief requires. | NFR-001, brief §10 |
| D9 | The save-failure message sits above the actions it belongs to, so the fields the reader was looking at don't move. | NFR-001 |
| D10 | The Author field's length error uses the same placement as the Title error: in the margin on desktop, above the field on phones. | Brief §8 ("field errors") |
| D11 | Edit and Delete are links (they open pages); "Add book", "Save changes" and "Delete book" are submit buttons. | Semantics of D1 and brief §4 |
| D12 | After a failed save, the fields show the entered values trimmed of leading and trailing spaces, as content.md describes for the preview. | content.md, FR-003 AC-4 |

| Version | Date | Change | Decided by |
|---|---|---|---|
| 1.0.0 | 2026-10-29 | Initial UI spec from DESIGN-BRIEF v1.0.0 and PRD v1.0.0. It covers FR-001 to FR-006 with all their states, applies the brief's five approved defaults (D1 to D5), and adds the token-drawn radio (D6) after measuring contrast. New state references are in `ui-states/`. | Drafted by an AI agent; for owner review |
