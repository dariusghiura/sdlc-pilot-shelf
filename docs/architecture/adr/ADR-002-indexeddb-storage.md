---
id: ADR-002
title: Native IndexedDB behind a BookRepository port, without a wrapper library
status: in-review
version: 1.0.0
based_on: { ARCH: 1.0.0 }
approved_by:
approved_on:
superseded_by:
---

# ADR-002: Native IndexedDB behind a BookRepository port, without a wrapper library

## Context

ADR-001 puts the books in the browser. Storage needs:

- **Persistence:** books survive reloads and later visits (FR-006 AC-1, AC-2).
- **Honest failures:** saves that fail must be reported (FR-006 AC-3), and so must reads that fail (UI-SPEC UQ-2, change request [#6](https://github.com/dariusghiura/sdlc-pilot-shelf/issues/6)).
- **Order:** creation order breaks title ties (FR-001 AC-3).
- **Scale:** 500 books (NFR-003).
- **Privacy:** no other stored data (NFR-004).

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **Native IndexedDB, wrapped by Shelf's own adapter** | Transactional, asynchronous and structured. An auto-increment key gives creation order. No runtime dependency. Errors are DOMExceptions we map ourselves. | We write and test about a hundred lines of promise plumbing. |
| `idb` (ISC, about 1 kB) | A thin, well-known promise wrapper | A runtime dependency to save little code; error handling and mapping are still ours |
| Dexie (Apache-2.0) | Rich queries, live queries, migrations helper | Much larger than the need; another API for one store with no indexes |
| `localStorage` | Simple | Synchronous, strings only, no transactions, a small quota, and blocked in the same situations as IndexedDB. No natural creation order. |
| Origin Private File System | Files, fast | Files are the wrong shape for records; less mature on phones; still needs our own format |

## Decision

- **Port and adapter:** native IndexedDB, behind the `BookRepository` port defined in ARCH §7. The only implementation is `app/src/storage/indexedDbBookRepository.ts`, and no other module touches `indexedDB`. oxlint enforces this with `no-restricted-globals` (GUIDELINES §3).
- **Schema:** one database `shelf` and one object store `books`, keyed by an auto-increment `id`, with no indexes (DATA-MODEL).
- **Order:** all books are read with one `getAll()` and sorted in memory by `src/books`.
- **Writes:** each write is one `readwrite` transaction and resolves after `complete`. `durability: 'strict'` is requested.
- **Failures:** returned as typed values, never thrown.
- **Tests:** contract tests run in Vitest against `fake-indexeddb` (Apache-2.0, a planned dev dependency approved with this ADR), plus real-browser end-to-end tests (ADR-007).

## Consequences

- **Positive:**
  - No runtime storage dependency.
  - The error mapping is explicit and testable, and the rest of the app sees only the port.
- **Negative:**
  - We own the promise wrapping, connection handling (`versionchange`, `close`) and upgrade logic.
  - IndexedDB can't sort by a locale collation, so ordering stays in memory. That is fine at 500 books.
- **Harder:**
  - Query-heavy features would need indexes and more adapter code.
  - FR-007 and FR-008 filter in memory, so they don't need any.
- **Revisit if:** a second store, cross-store transactions or indexed queries appear. `idb` would then be the first candidate.
