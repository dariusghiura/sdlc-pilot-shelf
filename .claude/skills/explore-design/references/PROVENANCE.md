# Provenance: frontend-design.md

| Field | Value |
|---|---|
| Upstream | https://github.com/anthropics/skills/tree/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/frontend-design |
| Publisher | Anthropic |
| Commit | `dbd4588f9e1033efb41dad4bef2f7947c8993d44` (2026-10-09) |
| Upstream file SHA-256 (SKILL.md, before modification) | `d91970639e9f5c37682ac7ab60094d35f1c7c1f38d731bd56396563aee10c1d` |
| Also identical to | `anthropics/claude-plugins-official` `plugins/frontend-design/skills/frontend-design/SKILL.md` (cached locally 2026-10-16) |
| License | Apache-2.0, see `LICENSE-frontend-design.txt` |
| Vendored | 2026-10-28 |
| Modifications | YAML front matter (`name`, `description`, `license`) removed so it is not discovered as a standalone skill. The body is unchanged. |
| Reviewed for | instructions only: no scripts, no network access, no tool permissions |

**Why vendored as a reference instead of installed as a skill:** its description ("building new UI or reshaping an existing one") would auto-load during Stage E implementation and push for aesthetic risk-taking against the approved UI spec and tokens. Here it is read only by `explore-design`, in Phase 1.

**Updating:** diff the upstream file at a new commit against this copy, review the changes, then update the commit, SHA-256 and date above.
