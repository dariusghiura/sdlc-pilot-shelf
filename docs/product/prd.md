---
id: PRD
title: Shelf — Product Requirements
status: in-review        # draft | in-review | approved | superseded  (only the human sets approved)
version: 1.0.0
based_on: {}
approved_by:
approved_on:
---

# Shelf — Product Requirements

## 1. Summary

People who read for pleasure lose track of which books they want to read, which they are reading, and which they have finished. Notes apps, spreadsheets and memory work, but they are clumsy, especially on a phone in a bookshop. Shelf is a personal reading list in the browser: one library of books, each with a title, an author and a reading status, that the reader can add to, edit and prune, and that is still there on their next visit. It needs no account and collects no personal data. The MVP is deliberately tiny (one list and one form over one entity) because Shelf is the pilot product for validating a spec-driven AI SDLC kit end to end; filtering and search follow next.

## 2. Users and jobs to be done

| Persona | Context | Job to be done | Current workaround |
|---|---|---|---|
| Casual reader | Reads for pleasure and keeps hearing about books to read next. Checks the list on a phone (in a bookshop, on the commute) or on a laptop at home. | Keep one simple list of the books I want to read, am reading and have finished, so I remember what to read next and where I am. | A notes app, a spreadsheet, photos of book covers, or memory. |

## 3. Goals and non-goals

**Goals** (observable outcomes):

- A reader can record a book, change its reading status and remove it, and finds the library exactly as they left it on their next visit in the same browser.
- A first-time visitor sees an empty library that tells them how to add their first book.
- Every MVP flow can be completed on a phone and on a desktop, by keyboard and with a screen reader, to WCAG 2.2 Level AA.
- The MVP stays small enough to carry through every stage of the SDLC pilot (design, architecture, backlog, implementation, review) quickly.

**Non-goals** (explicitly out of scope, with reasons):

- Accounts, sign-in and syncing a library across devices or browsers: the product must work without sign-in and without personal data (NFR-004).
- Sharing libraries, social features and recommendations: Shelf is a personal list for one reader.
- Looking books up in online catalogues (ISBN search, cover images, automatic metadata): it adds third-party dependencies and scope the pilot does not need.
- Extra book details such as ratings, reviews, notes, reading dates or progress: the MVP keeps one minimal entity; candidates for Later.
- Several lists or shelves per reader: one library is enough to validate the product.
- Native phone or desktop apps: Shelf runs in phone and desktop web browsers (NFR-002).

## 4. User journeys

**J1 — First visit and first book**

1. I open Shelf for the first time and see that my library is empty, with a clear way to add a book (FR-002).
2. I add a book by entering its title, optionally its author, and its reading status (FR-003).
3. I see the book in my library (FR-001).
4. I come back the next day in the same browser and the book is still there (FR-006).

**J2 — Update a book**

1. I open Shelf and find the book in my library (FR-001).
2. I edit it, for example changing its status from Reading to Finished or fixing a typo in the title (FR-004).
3. My library shows the updated book (FR-001), and the change is still there on my next visit (FR-006).

**J3 — Remove a book**

1. I find the book in my library (FR-001) and choose to delete it.
2. Shelf asks me to confirm before anything is removed (FR-005).
3. I confirm and the book disappears; if it was my last book, I see the empty library again (FR-002).
4. The book stays gone on my next visit (FR-006).

**J4 — Find a book in a large library (Next)**

1. My library has grown to hundreds of books.
2. I show only the books I am currently reading (FR-007).
3. I type part of a title or author to find a specific book (FR-008).

## 5. Scope and priorities

| Priority | Requirements |
|---|---|
| Now (MVP) | FR-001, FR-002, FR-003, FR-004, FR-005, FR-006. NFR-001, NFR-002, NFR-003 and NFR-004 apply to every Now and Next requirement. |
| Next | FR-007, FR-008 |
| Later | Parked, not specified: back up and restore the library (export/import); more book details (for example notes or a rating); other sort orders. |

## 6. Functional requirements

A **book** has exactly these details (assumptions A2–A4):

| Detail | Required | Rules |
|---|---|---|
| Title | Yes | Free text. Leading and trailing spaces are removed; the result must contain 1–200 characters. |
| Author | No | Free text. Leading and trailing spaces are removed; at most 200 characters. May be left empty. |
| Reading status | Yes | One of **Want to read**, **Reading**, **Finished**. New books start as **Want to read**. |

### FR-001 — View the library

- **Priority:** Now
- **User story:** As a casual reader, I want to see all my books in one list so that I know what I want to read, am reading and have finished.
- **Acceptance criteria:**
  - **AC-1** Given the library contains one or more books, when the reader opens Shelf, then every book in the library is listed exactly once, each showing its title, its author (when it has one) and its reading status.
  - **AC-2** Given the library contains books titled "beta", "Alpha" and "gamma", when the library is shown, then they are listed in the order "Alpha", "beta", "gamma" (title A–Z, ignoring upper and lower case).
  - **AC-3** Given two books have the same title, when the library is shown, then the book that was added first is listed first.
  - **AC-4** Given the library is shown, when the reader looks at any listed book, then they can start editing it (FR-004) and deleting it (FR-005) from the library.
  - **AC-5** Given the library is shown, when the reader looks at the library, then they can start adding a book (FR-003).
- **Edge cases:** Long titles and authors (up to 200 characters) are shown in full or wrap; they never hide the book's status or its actions. Titles and authors in any language or script are shown as entered.
- **Notes / dependencies:** The order is assumption A5. Behaviour with 500 books is covered by NFR-003.

### FR-002 — Empty library

- **Priority:** Now
- **User story:** As a first-time visitor, I want an empty library to tell me what to do so that I can add my first book straight away.
- **Acceptance criteria:**
  - **AC-1** Given the library contains no books, when the reader opens Shelf, then a message says the library is empty and an action to add a book is shown.
  - **AC-2** Given the empty library is shown, when the reader activates the add action, then the add-book form opens (FR-003).
  - **AC-3** Given the library contains exactly one book, when the reader deletes it (FR-005), then the empty library is shown.
- **Edge cases:** A first visit starts with an empty library; Shelf adds no sample books (assumption A10).
- **Notes / dependencies:** Distinct from "no results" for a filter or search (FR-007, FR-008).

### FR-003 — Add a book

- **Priority:** Now
- **User story:** As a casual reader, I want to add a book with its title, author and status so that it is on my list.
- **Acceptance criteria:**
  - **AC-1** Given the library is shown, when the reader chooses to add a book, then a form opens with an empty Title, an empty Author and Reading status set to "Want to read".
  - **AC-2** Given the add form is open, when the reader enters the title "Dune", the author "Frank Herbert", chooses "Reading" and saves, then the form closes and the library lists "Dune" by Frank Herbert with the status "Reading", in the position given by FR-001.
  - **AC-3** Given the add form is open, when the reader saves with a title and leaves Author empty, then the book is added and listed without an author.
  - **AC-4** Given the add form is open and Title is empty or contains only spaces, when the reader saves, then no book is added, the form stays open with everything the reader entered, and a message next to Title says that a title is required.
  - **AC-5** Given the add form is open and Title or Author is longer than 200 characters after removing leading and trailing spaces, when the reader saves, then no book is added, the form stays open with everything the reader entered, and a message next to that field states the 200-character limit.
  - **AC-6** Given the reader enters "  Dune  " as the title, when they save, then the book is listed with the title "Dune".
  - **AC-7** Given the add form is open, when the reader cancels, then no book is added and the library is unchanged.
- **Edge cases:** Adding a book with the same title and author as an existing book creates a second, separate book (assumption A6).
- **Notes / dependencies:** Book details and rules are in the table at the start of this section.

### FR-004 — Edit a book

- **Priority:** Now
- **User story:** As a casual reader, I want to change a book's details so that my list stays accurate, for example when I finish a book.
- **Acceptance criteria:**
  - **AC-1** Given a book is in the library, when the reader chooses to edit it, then a form opens showing that book's current title, author and reading status.
  - **AC-2** Given the edit form is open, when the reader changes the status to "Finished" and saves, then the form closes, the library shows that book with the status "Finished", and every other book is unchanged.
  - **AC-3** Given the edit form is open, when the reader changes the title and saves, then the library shows the new title, in the position given by FR-001.
  - **AC-4** Given the edit form is open with details that break the rules of FR-003 AC-4 or AC-5, when the reader saves, then the stored book is unchanged, the form stays open with everything the reader entered, and the same messages as FR-003 are shown.
  - **AC-5** Given the edit form is open with changed details, when the reader cancels, then the book is unchanged.
- **Edge cases:** Saving without changing anything leaves the book as it was. Leading and trailing spaces are removed as in FR-003 AC-6.
- **Notes / dependencies:** Uses the same book details and rules as FR-003.

### FR-005 — Delete a book with confirmation

- **Priority:** Now
- **User story:** As a casual reader, I want to remove a book I no longer care about, without removing one by accident.
- **Acceptance criteria:**
  - **AC-1** Given a book is in the library, when the reader chooses to delete it, then Shelf asks the reader to confirm deleting that book, naming its title, and the book is not removed yet.
  - **AC-2** Given the confirmation is shown, when the reader confirms, then the book is removed from the library and every other book is unchanged.
  - **AC-3** Given the confirmation is shown, when the reader cancels, then the book stays in the library unchanged.
- **Edge cases:** Deleting the last book shows the empty library (FR-002 AC-3). After confirming, the deletion is permanent; there is no undo or trash (assumption A7).
- **Notes / dependencies:** A deleted book stays deleted on later visits (FR-006).

### FR-006 — Library persists between visits

- **Priority:** Now
- **User story:** As a casual reader, I want my library to be there when I come back so that I don't have to enter my books again.
- **Acceptance criteria:**
  - **AC-1** Given the reader has added, edited or deleted books, when they close Shelf and open it again later in the same browser on the same device, then the library shows exactly the books and details as they were last saved.
  - **AC-2** Given a change has been saved (the form closed after saving, or a deletion was confirmed), when the reader reloads Shelf straight away, then the change is present.
  - **AC-3** Given a change cannot be saved, when the reader saves it, then Shelf tells the reader that the change was not saved and does not show it as saved.
- **Edge cases:** If the reader clears their browser's stored data, or uses another browser or device, they see a different (possibly empty) library (assumption A1, risk R1). Behaviour with Shelf open in two tabs at the same time is not defined for the MVP (open question Q9).
- **Notes / dependencies:** No sign-in (NFR-004), so the library belongs to the browser and device it was created on (assumption A1).

### FR-007 — Filter the library by reading status

- **Priority:** Next
- **User story:** As a casual reader with many books, I want to see only books with one reading status so that I can quickly see what I am reading or want to read next.
- **Acceptance criteria:**
  - **AC-1** Given the library contains books with each reading status, when the reader chooses to show only "Reading", then only books with the status "Reading" are listed, in the order given by FR-001.
  - **AC-2** Given a status filter is active, when the reader chooses to show all books, then every book in the library is listed.
  - **AC-3** Given no book has the chosen status, when the filter is applied, then a message says that no books have that status, distinct from the empty library (FR-002).
  - **AC-4** Given a status filter is active, when the reader edits a book so that it no longer matches, then that book is no longer listed.
- **Edge cases:** Adding a book whose status does not match the active filter must not look like a failed save (to be designed).
- **Notes / dependencies:** Whether the chosen filter is remembered between visits is open question Q11. To be refined before it enters the backlog.

### FR-008 — Search the library

- **Priority:** Next
- **User story:** As a casual reader with many books, I want to find a book by typing part of its title or author so that I don't have to scroll through the whole list.
- **Acceptance criteria:**
  - **AC-1** Given the library contains "The Hobbit" by J. R. R. Tolkien and "Dune" by Frank Herbert, when the reader searches for "hob", then only "The Hobbit" is listed (part of the title, ignoring upper and lower case).
  - **AC-2** Given the same library, when the reader searches for "tolkien", then only "The Hobbit" is listed (part of the author).
  - **AC-3** Given no book matches the search, when the search is applied, then a message says that no books match, with a way to clear the search.
  - **AC-4** Given a search is active, when the reader clears it, then the library lists every book again (or every book matching an active status filter, FR-007).
  - **AC-5** Given a status filter (FR-007) and a search are both active, when the library is shown, then only books matching both are listed.
- **Edge cases:** Leading and trailing spaces in the search text are ignored; an empty search shows every book.
- **Notes / dependencies:** Whether the search text is remembered between visits is open question Q11. To be refined before it enters the backlog.

## 7. Non-functional requirements

### NFR-001 — Accessibility: WCAG 2.2 Level AA

- **Category:** accessibility
- **Requirement:** Every screen and state of the Now and Next requirements (library, empty library, add and edit forms, validation messages, delete confirmation, save failure, and later the filter, search and no-results states) meets WCAG 2.2 Level AA, including use by keyboard only, with a screen reader, and at 320 CSS pixels wide without scrolling in two directions (WCAG 2.2 reflow).
- **Verification:** Automated accessibility checks on every screen and state, plus a manual keyboard-only and screen-reader walkthrough of journeys J1–J3 on phone and desktop before each release. Any Level A or AA failure blocks release.

### NFR-002 — Works in phone and desktop browsers

- **Category:** compatibility
- **Requirement:** Every Now requirement can be completed in phone web browsers (touch, phone-sized screens) and desktop web browsers (mouse and keyboard, desktop-sized screens). No app installation is needed. The supported browsers default to the current stable versions of the major phone and desktop browsers at release (assumption A8).
- **Verification:** Journeys J1–J3 are run on at least one phone browser and one desktop browser from the supported list before each release, at the narrowest supported width and at a typical desktop width.

### NFR-003 — Handles a library of 500 books

- **Category:** performance
- **Requirement:** With 500 books in the library, every Now requirement still works: all 500 books are listed and reachable in the order given by FR-001, and adding, editing, deleting and persistence behave as they do with a small library. 500 is the size that must be supported, not a limit Shelf enforces (assumption A9). No response-time target is set (open question Q8).
- **Verification:** Load a library of 500 books, check that all 500 are listed once and in order on phone and desktop, run journeys J2 and J3 on it, and check that the library is intact after a reload.

### NFR-004 — No sign-in and no personal data

- **Category:** privacy
- **Requirement:** Shelf can be used without creating an account or signing in. It asks for, stores and sends no personal data about the reader; book details are the only data the reader enters. Shelf includes no analytics, tracking or third-party content (assumption A11).
- **Verification:** Review every screen to confirm none asks for an account or personal details, and inspect what Shelf stores and sends while running journeys J1–J3 to confirm it is only book details and the app itself.

## 8. Constraints and assumptions

| # | Assumption / constraint | Source | Risk if wrong |
|---|---|---|---|
| C1 | The MVP is deliberately tiny: one library list with an empty state and one add/edit form over one entity (book). | Owner (discovery) | Larger scope slows the SDLC pilot. |
| C2 | No technology choices are made in this document; they belong to the architecture stage. | Kit lifecycle | — |
| A1 | One reader per browser. The library belongs to the browser and device it was created in; there is no sync across browsers or devices, and clearing the browser's stored data loses the library. | Derived from NFR-004 and FR-006 | If multi-device access is wanted, sign-in or another identity mechanism is needed, which reopens NFR-004 and the architecture. |
| A2 | A book has three details only: title (required), author (optional, one free-text field for any number of authors) and reading status (required). | Agent default (minimal) | More fields later are an additive change (MINOR version). |
| A3 | Reading statuses are exactly "Want to read" (the default for new books), "Reading" and "Finished". | Agent default (minimal) | FR-007 and the UI depend on this set. |
| A4 | Title and author are trimmed of leading and trailing spaces; title must then have 1–200 characters and author at most 200. | Agent default | Too short a limit truncates real titles; too long a limit complicates layout. |
| A5 | The library is sorted by title A–Z, ignoring upper and lower case; books with the same title keep the order they were added in. | Agent default (helps find books before search exists) | Readers may expect newest-first. |
| A6 | Duplicate books (same title and author) are allowed; Shelf does not warn. | Agent default (a reader may own two editions) | Accidental duplicates clutter the list. |
| A7 | Deletion is permanent once confirmed; there is no undo or trash. | Agent default, from "delete with confirmation" | A mistaken confirmation loses the book's details. |
| A8 | Supported browsers are the current stable versions of the major phone and desktop browsers at release; the narrowest supported width is 320 CSS pixels (from WCAG 2.2 reflow). | Agent default | Testing scope and layout decisions change. |
| A9 | 500 books is the library size that must be supported; Shelf enforces no maximum. | Owner (NFR-003), agent interpretation | Larger libraries may perform poorly. |
| A10 | A first visit starts with an empty library; there are no sample books. | Agent default | — |
| A11 | Shelf has no analytics, tracking or third-party content. | Derived from NFR-004 | Usage cannot be measured. |
| A12 | The interface is in English only. | Agent default | Localization is a later change. |

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| R1 — A reader loses their library by clearing browser data or switching device (consequence of A1). | Medium | High for that reader | Owner confirms A1 (Q6); design decides whether to tell readers where their library lives; export/import is parked under Later. |
| R2 — With hundreds of books and no search until Next, finding one book on a phone is slow. | Medium | Medium | Alphabetical order (A5); FR-007 and FR-008 are next in line. |
| R3 — The defaults in section 8 do not match the owner's intent. | Medium | Low before approval, higher after | Owner reviews the open questions before approving this PRD. |
| R4 — Scope grows beyond the tiny MVP during design or implementation. | Low | Medium | The Now list is fixed by this PRD; changes go through a change request. |
| R5 — Accessibility issues found late are costly to fix. | Medium | Medium | NFR-001 is checked on every screen and state, not only before release. |

## 10. Open questions

Each question has a stated default; the default applies unless the owner changes it in review.

| # | Question | Owner | Blocking? |
|---|---|---|---|
| Q1 | Are title (required), author (optional) and reading status the right book details? Should any other detail be in the MVP? | dariusghiura | No: A2 applies |
| Q2 | Are "Want to read", "Reading" and "Finished" the right statuses, with "Want to read" as the default? | dariusghiura | No: A3 applies |
| Q3 | Are the 200-character limits for title and author acceptable? | dariusghiura | No: A4 applies |
| Q4 | Should the library be sorted by title A–Z or by most recently added first? | dariusghiura | No: A5 applies |
| Q5 | Should Shelf warn when adding a book with the same title and author as an existing one? | dariusghiura | No: A6 applies |
| Q6 | Is it acceptable that the library lives only in the browser and device where it was created, with no sync and no backup? | dariusghiura | No for this PRD; must hold before architecture (A1) |
| Q7 | Which phone and desktop browsers (and versions) must be supported? | dariusghiura | No: A8 applies; needed before test planning |
| Q8 | Is there a response-time target for a 500-book library? | dariusghiura | No: none is set (NFR-003) |
| Q9 | What should happen when Shelf is open in two tabs and both change the library? | dariusghiura | No: not defined for the MVP |
| Q10 | If the architecture needs a server, are standard web-server logs (which can include IP addresses) compatible with NFR-004? | dariusghiura | No for this PRD; decide before architecture |
| Q11 | Should the chosen status filter and search text be remembered between visits? | dariusghiura | No: Next only |
| Q12 | Is permanent deletion without undo acceptable? | dariusghiura | No: A7 applies |

## 11. Decisions and change log

| Version | Date | Change | Decided by |
|---|---|---|---|
| 1.0.0 | 2026-10-28 | Initial PRD from discovery: owner accepted the five proposed scope defaults (product, Now, Next, NFRs); remaining details are agent defaults listed in section 8 and section 10. | dariusghiura (scope); drafted by an AI agent |
