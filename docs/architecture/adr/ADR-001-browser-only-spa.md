---
id: ADR-001
title: Browser-only single-page app (React, Vite, TypeScript, IndexedDB, static hosting)
status: approved
version: 1.0.0
based_on: { ARCH: 1.0.0 }
approved_by: dariusghiura
approved_on: 2026-10-29
---

# ADR-001: Browser-only single-page app (React, Vite, TypeScript, IndexedDB, static hosting)

**Decided by:** dariusghiura, 2026-10-29. This is the owner's stack decision; this ADR records it and the alternatives considered.

## Context

- Shelf needs no sign-in and must collect no personal data, with no analytics, tracking or third-party content (NFR-004, A11).
- The approved assumption A1 says the library belongs to the browser and device where it was created, with no sync.
- The library must persist between visits (FR-006) and work in phone and desktop browsers (NFR-002) for 500 books (NFR-003).
- PRD Q10 asked whether a server's logs would be compatible with NFR-004 if the architecture needed a server.
- C1 keeps the MVP tiny.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **Browser-only SPA:** React + Vite + TypeScript, books in IndexedDB, static hosting, no backend, no HTTP API, no Docker | Nothing leaves the device and there is no identifier, which matches NFR-004 and A1 exactly. Nothing to run or secure server-side. Free static hosting. The smallest scope. | The library is tied to one browser profile (accepted in A1). There is no backup until the Later export/import. Persistence needs real-browser tests. |
| Spring Boot + React + PostgreSQL, with an anonymous per-browser ID | The owner's familiar stack. Server-side storage and backups. | A persistent browser identifier (cookie or stored ID) sent with every request, plus server logs with IP addresses, conflict with NFR-004 and A1 as approved. A server, database, secrets and deployment to run, beyond C1. Clearing site data still loses the ID, and with it the reader's access to their books. **Rejected.** |
| Server app with accounts | Libraries across devices | Requires sign-in: violates NFR-004 and is a PRD non-goal. **Rejected.** |

## Decision

Build Shelf as a single-page app in React and TypeScript, built with Vite. It stores books in the browser's IndexedDB and is served as static files. It has no backend, no HTTP API and no containers. Storage, routing, styling, fonts, hosting and tooling are decided in ADR-002 to ADR-007.

## Consequences

- **Positive:**
  - NFR-004 holds by construction: the only network traffic is the browser fetching Shelf's own files.
  - Hosting is free and static.
  - The codebase is one small TypeScript app.
- **Negative:**
  - Data lives only on the reader's device. Clearing site data, private windows and browser eviction lose it (PRD R1; ARCH §13).
  - Read and write failures come from the browser, not from a server we control (change request [#6](https://github.com/dariusghiura/sdlc-pilot-shelf/issues/6)).
- **Harder:** sync, sharing or backups would need a new identity and storage design.
- **Revisit if:** the PRD adds multi-device access or server-side backup. That reopens NFR-004 and A1 first.
