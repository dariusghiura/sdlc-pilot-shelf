@AGENTS.md

# Claude Code specifics

## Stage commands (project skills in `.claude/skills/`)

Each stage starts only when the human types its command. Skills check their own gates.

| Stage | Command | Notes |
|---|---|---|
| A — PRD | template `.sdlc/templates/prd.md` + prompt | `/create-prd` comes in a later kit increment |
| B1 — Visual exploration and brief | `/explore-design` | Stops after rendering 3 directions, and again after the brief |
| B2 — UI spec and tokens | template + prompt | `/specify-ui` comes later |
| C — Architecture | template + prompt | `/design-architecture` comes later |
| D — Backlog | template + prompt | `/plan-issues` comes later |
| E — Implement | `/implement-issue <n>` | Use a **fresh session**; `/implement-issue <n> fix` addresses review findings |
| F — Review | `/review-pr <n>` | Use a **separate fresh session**. Delegates to the read-only `pr-reviewer` subagent. Advisory only |

## Working rules

- Run `node .sdlc/scripts/validate-docs.mjs` after editing anything in `docs/`, and report its output.
- If the guard hook or a permission rule blocks an action, tell the human what was blocked and why. Don't retry another way.
- For UI work, check rendered output (the built-in browser or `.sdlc/scripts/capture-previews.mjs`) against the approved previews and UI spec before opening a PR.
- Never use `pr-reviewer` to review code written in the same session.
- A kit sync (`bootstrap-project.mjs`) rewrites `.claude/` and `.sdlc/`, so the guard asks the human to confirm it. After a sync changes `.sdlc/KIT_VERSION`, start a fresh session so the updated instructions and skills load.
