---
id: UI-SPEC
title: <Product name> — UI Specification (Phase 2)
status: draft
version: 0.1.0
based_on: { PRD: 0.0.0, DESIGN-BRIEF: 0.0.0 }
approved_by:
approved_on:
---

# <Product name> — UI Specification (Phase 2: implementation contract)

<!--
Guidance:
- Translate the APPROVED brief and previews into unambiguous instructions. Do not redesign or add scope.
  If the brief is insufficient, raise a change request instead of deciding.
- Define each UX ID once, as a heading "### UX-001 — Screen or component name".
  Every UX entry MUST reference at least one FR-### (validate-docs enforces this).
- All visual values come from tokens.json by token path (e.g. {color.surface.default}); never raw hex here.
-->

## 1. Navigation and screen inventory

| UX ID | Screen / route | Purpose | Requirements | Preview |
|---|---|---|---|---|

## 2. Global rules

- **Layout grid and breakpoints:**
- **Comparison viewports for visual QA:** desktop 1440×900, mobile 390×844 <!-- adjust only if the brief says so -->
- **Themes:** <!-- light only | light + dark: mapping rules -->
- **Focus and keyboard:**
- **Motion:** <!-- durations/easings by token; reduced-motion behaviour -->
- **Copy conventions:**

## 3. Screens

### UX-001 — <Screen name>

- **Implements:** FR-001
- **Route:** `/…`
- **Reference:** [preview](previews/v1/<screen>-desktop-light.png)
- **Hierarchy:** <!-- ordered component tree -->
- **Primary / secondary actions:**
- **States:**

  | State | Trigger | What the user sees | Tokens / components |
  |---|---|---|---|
  | Loading | | | |
  | Empty | | | |
  | Error | | | |
  | Success | | | |
  | Disabled / no permission | | | |

- **Validation rules:**
- **Responsive behaviour:**
- **Accessibility:** <!-- landmarks, labels, focus order, announcements -->
- **Visual acceptance criteria:**
  - **VAC-1** At 1440×900 light, <observable criterion> matches the reference preview.
- **Implementation freedoms:** <!-- what the implementer may decide alone -->

## 4. Components

### UX-101 — <Component name>

- **Used by:** UX-001 — implements FR-001
- **Variants / props contract:**
- **States:** default, hover, focus-visible, active, disabled, error
- **Tokens:**

## 5. Open questions

## 6. Decisions and change log

| Version | Date | Change | Decided by |
|---|---|---|---|
| 0.1.0 | | Initial draft | |
