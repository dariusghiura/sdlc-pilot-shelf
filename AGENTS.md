# Repository contract for AI coding agents

This repository follows a spec-driven lifecycle with human approval gates. These rules apply to every agent (Claude Code, Codex, Cursor, …) and override convenience. When a rule blocks you, stop and tell the human. Do not work around it.

## 1. Lifecycle and gates

`PRD → design exploration (you pick a direction) → design brief + previews → UI spec + tokens → architecture + ADRs → backlog → one issue per PR → CI + independent review → human merge → human-approved release`

A stage may start only when its inputs are **approved**. Check with:

```bash
node .sdlc/scripts/gate.mjs require <DOC-ID> [<DOC-ID> ...]   # e.g. require PRD DESIGN-BRIEF
node .sdlc/scripts/gate.mjs issue <number>                    # before implementing an issue
```

A non-zero exit means **stop**. Report the gate output to the human; don't try to satisfy the gate yourself.

## 2. Sources of truth

Approved, version-controlled files are the only product and technical source of truth. Chat history, drafts, and skills are not.

| ID | File | Defines |
|---|---|---|
| `PRD` | `docs/product/prd.md` | Scope, users, `FR-###`, `NFR-###`, acceptance criteria |
| `DESIGN-BRIEF` | `docs/design/design-brief.md` + `docs/design/previews/` | Visual intent (Phase 1) |
| `UI-SPEC` | `docs/design/ui-spec.md` | Implementable UI behaviour, `UX-###` (Phase 2) |
| `TOKENS` | `docs/design/tokens.json` | Approved design token values (Phase 2) |
| `ARCH` | `docs/architecture/architecture.md` | System design, boundaries, deployment |
| `ADR-###` | `docs/architecture/adr/ADR-###-*.md` | Individual technical decisions |
| `GUIDELINES` | `docs/architecture/implementation-guidelines.md` | Structure, conventions, **verified commands** |
| `DATA-MODEL` | `docs/architecture/data-model.md` | Entities, constraints, migrations (if any) |
| — | `docs/api/openapi.yaml` | HTTP contract (if any), approved as part of `ARCH` |
| `BACKLOG` | `docs/plan/backlog.md` | Approved issue plan |

**Hierarchy:** PRD → design brief → UI spec/tokens → architecture/ADRs/API → issue (a subset). If two sources conflict, **do not pick one**. Escalate (section 5).

**IDs** are stable and never reused: `FR-001`, `NFR-001`, `UX-001`, `ADR-001`. Define each ID exactly once, as a heading in its owning document (`### FR-001 — Title` in the PRD, `### UX-001 — Name` in the UI spec). ADRs are defined by their file name. Everywhere else an ID is a reference, including tables, issues, PR bodies, and test names where practical. `validate-docs` rejects duplicate definitions and references to undefined IDs.

## 3. Approval metadata belongs to the human

Each gate document has front matter (`id`, `status`, `version`, `based_on`, `approved_by`, `approved_on`). `tokens.json` keeps the same fields under `$extensions.sdlc`.

- Agents create and edit documents only as `draft` or `in-review`. **Never write `status: approved`, `approved_by` or `approved_on`.** The human does that.
- An approved document is frozen. To change one, follow the change-request protocol. Reopening means setting `status: draft` and bumping `version` (MAJOR = scope or intent change, MINOR = additive clarification, PATCH = wording), which fails every downstream gate until re-approved.
- `based_on` records the upstream versions a document was written against. Keep it accurate.
- Templates live in `.sdlc/templates/`. Copy one when a stage starts. Never create empty placeholder documents.

**Spec PRs: how documents reach approval.** `main` only accepts pull requests with a green `docs-check`.
1. The agent works on a branch named `spec/<doc-id>-v<version>` (e.g. `spec/prd-v1.0.0`). The document has `status: in-review`, and `validate-docs` must be clean.
2. The agent pushes and opens a PR titled `spec: <DOC-ID> v<version>`, then stops.
3. The human reviews. To approve, the human sets `status: approved`, `approved_by` and `approved_on` on that branch, in the GitHub editor or locally, and merges once `docs-check` passes.
4. The next stage starts from an up-to-date `main` (`git switch main && git pull --ff-only`).

## 4. Implementing an issue

1. Work on exactly one issue labelled `ready` whose gate passes. Use a short-lived branch `issue-<number>-<slug>` from an up-to-date `main`.
2. **Read before editing:** this file, the issue, every document and ID it cites (approved versions only), `implementation-guidelines.md`, and the existing code and tests you'll touch. For UI work, read the design brief and previews for intent, then the UI spec and tokens for exact behaviour and values.
3. Make the smallest coherent change that satisfies the acceptance criteria. Add tests for each criterion and for important edge cases.
4. **Not allowed without an approved change request:** new dependencies, architecture or contract changes, auth or security model changes, new product behaviour, or touching files unrelated to the issue.
5. Run the verified commands from `implementation-guidelines.md`. Report exactly what ran, what passed, what failed, and what could not run. Never claim a check you did not run.
6. Open a PR using the repository template (link the issue, requirement IDs, spec versions read, test results, screenshots for UI, deviations). **Stop there.**

## 5. Change requests (gaps, conflicts, contradictions)

Missing or contradictory specs and failed dependencies are **blocking**. Stop, then draft a `spec-change-request` issue: affected documents and IDs, the problem, the proposed change, and which gates it reopens. Ask the human to approve it. Resume only after the affected documents are updated and re-approved.

## 6. Git and GitHub boundaries

Agents never:

- merge PRs, approve PRs, or push to `main`/`master`
- force-push or rewrite published history
- add the `ready` label (the human marks issues ready)
- create releases, trigger deployments, or read or modify secrets and variables
- edit guardrails: `.claude/settings*.json`, `.claude/hooks/`, `.sdlc/`

The guard hook and permission rules enforce most of this locally. They are a safety net, not permission to probe them.

## 7. Verified commands

The only commands to treat as project commands are those listed in the approved `docs/architecture/implementation-guidelines.md`. Until that document is approved, there are none. Don't invent build or test scripts.
