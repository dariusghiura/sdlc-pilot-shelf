---
name: explore-design
description: Stage B1, design Phase 1 only. Renders three genuinely distinct visual directions for the same two representative screens of the approved PRD, stops for the owner to choose or refine one, then writes the design brief and versioned previews for approval. Does not write the UI spec or tokens.
disable-model-invocation: true
argument-hint: "[explore | refine <direction> <notes> | brief <direction>]"
allowed-tools: Bash(node .sdlc/scripts/capture-previews.mjs *), Bash(node .sdlc/scripts/validate-docs.mjs *), Bash(node .sdlc/scripts/validate-docs.mjs), Bash(node .sdlc/scripts/gate.mjs *)
---

# explore-design: design Phase 1 (visual exploration → design brief)

**Gate (computed before you read this):**

!`node .sdlc/scripts/gate.mjs require PRD`

**Requested mode:** `$ARGUMENTS` (empty means `explore`).

Phase 1 decides the product's visual identity and intended UX. It does **not** produce `ui-spec.md` or `tokens.json` (that is Phase 2, after the brief is approved), and it never changes product scope. If the PRD is unclear or contradictory, stop and draft a change request (see `AGENTS.md`).

Read these before doing anything else:
- `AGENTS.md`
- the approved PRD (the version shown by the gate)
- anything already in `docs/design/`
- [references/frontend-design.md](references/frontend-design.md): design craft. Apply its plan → self-review → build → critique process to **each** direction.
- [references/prototypes.md](references/prototypes.md): file layout, HTML skeleton, content, accessibility floor and the distinctness check.

## Mode `explore` (default)

1. **Clarify only what changes the outcome.** Visual personality, information density, platforms (is mobile in scope?), brand constraints, accessibility needs beyond the PRD, and themes (light only, or light and dark). Skip anything the PRD already answers. Ask at most five questions in one message, each with a proposed default, and wait for the answers.
2. **Pick two representative screens.** Choose the screen for the primary job plus one that stresses input, density or state. Name them, cite their FR IDs, and say why they represent the product. Write the shared content to `docs/design/explorations/content.md`.
3. **Define three directions.** For each, give a name, a one-line concept, and where it sits on every axis of the distinctness table. Fill in the pairwise comparison. If any pair differs on fewer than three axes, replace a direction before building. Write each `direction.md`.
4. **Build the prototypes.** Both screens for each direction, following `references/prototypes.md`. Same content, comparable fidelity. Make them responsive if mobile is in scope, and implement the dark theme if themes are in scope.
5. **Render real previews:**
   ```bash
   node .sdlc/scripts/capture-previews.mjs docs/design/explorations --viewports desktop,mobile --themes light,dark --index
   ```
   Drop `mobile` or `dark` only if they are out of scope. Every capture must report a layout viewport equal to the requested one. If the script fails, show its output and stop. Never substitute text descriptions for images.
6. **Critique and fix.** Open each PNG (Read the image file), and check it against the PRD's primary job, the distinctness table, the accessibility floor and the anti-patterns in `frontend-design.md`. Fix, re-render, and log what changed in `direction.md`.
7. **Present, then STOP.**
   - A comparison table: direction | concept | navigation & layout | typography | density | strengths | risks | accessibility notes.
   - The contact sheet path `docs/design/explorations/index.html` and the PNG paths, all taken from the capture log.
   - Your recommendation and why, tied to PRD personas and goals.
   - Then end with: *Choose with `/explore-design brief <direction-folder>`, ask for changes with `/explore-design refine <direction-folder> <notes>`, or ask for new directions.* Do not write the brief, and do not assume a choice.

## Mode `refine <direction> <notes>`

1. Check that `docs/design/explorations/<direction>/` exists. Copy it to the next free `<direction>-r<k>/` and apply **only** the requested changes there. The original stays as the record.
2. Re-render with the same command as explore step 5, so the contact sheet includes the refinement.
3. Show before/after paths and what changed. Then **STOP** with the same three options.

## Mode `brief <direction>`

The owner's choice is the argument. Don't proceed on your own preference.

1. Check that `docs/design/explorations/<direction>/` exists. If `docs/design/design-brief.md` already exists and is approved, this is a reopen: it needs an approved change request. If none exists, stop.
2. Pick `N` = 1 + the highest existing `docs/design/previews/v*`, or 1. Copy the chosen direction's HTML files to `docs/design/previews/v<N>/` and render them there (same viewports and themes):
   ```bash
   node .sdlc/scripts/capture-previews.mjs docs/design/previews/v<N> --viewports desktop,mobile --themes light,dark
   ```
3. Write `docs/design/design-brief.md` from `.sdlc/templates/design-brief.md`. Fill every section from the chosen direction, the owner's refinements and the critique log. Set:
   - `based_on` = the approved PRD version shown by the gate
   - `status: in-review`
   - `version: 1.0.0` for a new brief, or the bumped version for a reopen
   - links to the `previews/v<N>/` PNGs
   - the decision log: date, chosen direction, refinements, rejected directions and why

   Leave `approved_by` and `approved_on` empty.
4. Run `node .sdlc/scripts/validate-docs.mjs` and fix every error you introduced.
5. **STOP.** Summarise the brief, list the preview files, and ask the owner to review the brief **and** the previews. To approve, the owner sets `status: approved`, `approved_by` and `approved_on` themselves. Agents can't. Phase 2 (`ui-spec.md`, `tokens.json`) starts only after that approval.

## Never

- Present options without rendered images, or claim an image exists that the capture log doesn't list.
- Create `ui-spec.md` or `tokens.json`, or edit the PRD.
- Write approval metadata or pick the direction for the owner.
