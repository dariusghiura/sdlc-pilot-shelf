# Shared exploration content

Every direction uses exactly this content and copy, so the comparison is about design, not data. Source: PRD v1.0.0. Owner answers to the Phase 1 questions (2026-10-28): all five proposed defaults accepted.

## Owner inputs for Phase 1

| Topic | Decision |
|---|---|
| Personality | Calm and personal, like a reader's own well-kept notebook: warm, quiet, unfussy. Not a productivity dashboard, not a twee "cosy library" pastiche. |
| Density | The three directions span density (spacious, balanced, compact) so the owner can choose by looking. |
| Themes | Light and dark, following the device setting. No in-app switch (the PRD has no such behaviour). |
| Brand | None. "Shelf" is a type-only wordmark; no logo or illustration; open-licence typefaces only. |
| Where the library lives (R1) | One quiet line on the library screen: "Saved in this browser on this device." |
| Platforms | Phone and desktop browsers, down to 320 CSS px (NFR-002, A8). Rendered at desktop 1440×900 and mobile 390×844. |
| Accessibility | WCAG 2.2 AA (NFR-001), plus touch targets of at least 44×44 px on phones, body text of at least 16 px, and reduced motion respected. |
| Third-party content | None in the product (NFR-004, A11). Prototypes load Google Fonts for convenience; the product must self-host the chosen open-licence fonts. |

## Representative screens

| Screen | File | Requirements | Why it represents Shelf |
|---|---|---|---|
| Library | `library.html` | FR-001 (AC-1, AC-2, AC-4, AC-5 and the long-title and any-script edge cases), FR-006 with A1 and R1 | The primary job: every book with its status, in title order, with add, edit and delete in reach. It also carries the long title, a book without an author, and a title in another script. |
| Add a book | `add-book.html` | FR-003 (AC-1, AC-4), whose form FR-004 reuses | The input screen in its hardest state: a save attempt with an empty title. It stresses form layout, validation messaging, and how each direction places adding and editing relative to the library. |

Not given a screen of their own: the empty library (FR-002), the delete confirmation (FR-005) and the save failure (FR-006 AC-3). Their copy is below so Phase 2 can specify them in the chosen direction's style.

## Library sample (12 books, in FR-001 order)

Sorted by title A–Z, ignoring upper and lower case (A5). Titles beginning with "A" or "The" sort under that word, as the PRD specifies.

| # | Title | Author | Reading status |
|---|---|---|---|
| 1 | A Gentleman in Moscow | Amor Towles | Finished |
| 2 | Beowulf | *(none)* | Want to read |
| 3 | Circe | Madeline Miller | Reading |
| 4 | Dune | Frank Herbert | Reading |
| 5 | Educated | Tara Westover | Finished |
| 6 | Klara and the Sun | Kazuo Ishiguro | Want to read |
| 7 | Le Petit Prince | Antoine de Saint-Exupéry | Finished |
| 8 | Piranesi | Susanna Clarke | Finished |
| 9 | The Hobbit | J. R. R. Tolkien | Want to read |
| 10 | The Hundred-Year-Old Man Who Climbed Out of the Window and Disappeared | Jonas Jonasson | Want to read |
| 11 | The Left Hand of Darkness | Ursula K. Le Guin | Want to read |
| 12 | Мастер и Маргарита | Михаил Булгаков | Want to read |

Totals: 6 Want to read, 2 Reading, 4 Finished.

## Copy

### Library (`library.html`)

| Element | Copy |
|---|---|
| Wordmark | Shelf |
| Page heading | Your library |
| Count | 12 books |
| Where it lives | Saved in this browser on this device. |
| Add action | Add a book |
| Per-book actions | Edit, Delete (accessible names include the title: "Edit Dune", "Delete Dune") |
| Status labels | Want to read, Reading, Finished |

### Add a book (`add-book.html`), shown after a failed save

| Element | Copy or state |
|---|---|
| Heading | Add a book |
| Title field | Label "Title". Value: empty (the reader typed only spaces, which are removed). |
| Title error | Enter a title. A book can't be added without one. |
| Author field | Label "Author (optional)". Value: Becky Chambers |
| Status field | Label "Reading status". Options Want to read, Reading, Finished. Value: Reading (changed from the default Want to read) |
| Primary action | Add book |
| Secondary action | Cancel |

Focus is on the Title field, as it would be after the failed save.

### Copy for states without a screen (for Phase 2)

| State | Copy |
|---|---|
| Empty library (FR-002) | Heading "Your library is empty". Text "Add the books you want to read, are reading or have finished." Action "Add a book". |
| Edit form (FR-004) | Heading "Edit book". Primary action "Save changes". Secondary "Cancel". |
| Length errors (FR-003 AC-5) | "Title must be 200 characters or fewer." / "Author must be 200 characters or fewer." |
| Delete confirmation (FR-005) | Heading "Delete “Dune”?" Text "It will be removed from your library. This can't be undone." Actions "Delete book", "Cancel". |
| Save failure (FR-006 AC-3) | "This change wasn't saved. Your browser didn't let Shelf store it. Try again, or check that this browser allows sites to store data." |
