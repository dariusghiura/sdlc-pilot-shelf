---
name: implement-issue
description: Stage E. Implements exactly one GitHub issue labelled ready, as one focused pull request, from the approved specs, then stops at the PR. With "fix", addresses review findings on that issue's open PR. Never merges, never deploys.
disable-model-invocation: true
argument-hint: "<issue-number> [fix]"
allowed-tools: Bash(node .sdlc/scripts/*), Bash(gh issue view *), Bash(gh pr view *), Bash(gh pr list *), Bash(gh pr checks *), Bash(gh pr diff *), Bash(gh pr create *), Bash(gh pr comment *), Bash(gh api repos/{owner}/{repo}/pulls/*), Bash(gh issue edit * --add-label in-progress), Bash(git status*), Bash(git diff*), Bash(git log*), Bash(git fetch*), Bash(git switch *), Bash(git branch*), Bash(git add *), Bash(git commit *), Bash(git push -u origin issue-*), Bash(git push origin issue-*)
---

# implement-issue: one ready issue → one pull request

**Gate (computed before you read this, with a clean working tree required):**

!`node .sdlc/scripts/gate.mjs issue $0 --require-clean`

**Issue:** #$0 · **Mode:** `$1` (empty = implement, `fix` = address review findings)

The gate output above lists the only binding specs and their approved versions. Anything not in an approved document is not a requirement. Follow `AGENTS.md` sections 4–6 throughout.

## Mode: implement (default)

### 1. Branch
- `git fetch origin`. If you are on `main`, run `git switch -c issue-$0-<short-slug> origin/main`.
- If you are already on a session worktree branch, keep it. `gh pr create` will use it.
- Mark the issue as started: `gh issue edit $0 --add-label in-progress`.

### 2. Read before editing
In this order. Quote IDs, never paraphrase them from memory:
1. `AGENTS.md` and `docs/architecture/implementation-guidelines.md`, in particular **Verified commands** and dependency rules.
2. The issue: `gh issue view $0`. Note every AC, the in-scope and out-of-scope lists, test expectations, visual QA, and the cited IDs.
3. Each cited `FR-`/`NFR-` section in `docs/product/prd.md`, each `UX-` section in `docs/design/ui-spec.md`, each cited ADR, and the API or data-model sections they touch.
4. For UI work: `docs/design/design-brief.md` and the reference previews for intent, then `ui-spec.md` and `tokens.json` for exact behaviour and values.
5. The existing code and tests you will touch, plus their neighbours. Follow established patterns.

### 3. Plan, and check for spec gaps
Write a short plan that maps each AC → code change → test. If anything is missing, contradictory, or needs a new dependency, architecture change, auth change or new product behaviour, **stop**. Draft a `spec-change-request` (see `AGENTS.md` section 5) and ask the owner. Don't guess.

### 4. Implement
- Make the smallest coherent change that satisfies the ACs. Stay inside the issue's scope. No drive-by refactors.
- Add tests for every AC and for important edge cases. Name tests after the IDs where practical, e.g. `FR-003 AC-2 rejects duplicate ISBN`.
- UI: use tokens through the project's agreed mechanism, never raw values. Implement every state the UI spec lists for the touched screens.

### 5. Verify (record what really happened)
- Run each relevant command from **Verified commands** (format/lint, type check, unit, integration, build, e2e). Capture exit status and a one-line result. If a command can't run, say why. Never report a check you didn't run.
- UI work: start the app the way the guidelines say, then capture the touched screens at the UI spec's comparison viewports and themes:
  ```bash
  node .sdlc/scripts/capture-previews.mjs --url <screen>=<http://localhost:…/route> --out docs/qa/issue-$0 --viewports desktop,mobile --themes light,dark
  ```
  Open each PNG next to its reference in `docs/design/previews/`. List every visible deviation, and fix it or record it as a deviation.
- Check the dependency manifests (`git diff origin/main -- package.json pom.xml build.gradle* *.lock`). No dependency may be added unless an approved ADR or the issue allows it.
- Run `node .sdlc/scripts/validate-docs.mjs` if you touched `docs/`.

### 6. Commit, push, open the PR
- Use focused commits with messages like `feat(<area>): <outcome> (#$0)`.
- `git push -u origin HEAD` (the guard blocks `main` and force pushes).
- `gh pr create --base main --title "<outcome> (#$0)" --body-file <file>`. Write the body file outside the repository, following `.github/PULL_REQUEST_TEMPLATE.md` completely:
  - `Closes #$0`, IDs, and the spec versions from the gate output
  - an AC → evidence table
  - the commands actually run with their results
  - screenshots via `https://github.com/<owner>/<repo>/blob/<branch>/docs/qa/issue-$0/<file>.png?raw=true`
  - deviations and review focus

### 7. STOP
Report the PR URL exactly as `gh` printed it, the verification table, and any deviations or open questions. Then stop. The next steps belong to others: CI runs automatically, the owner runs `/review-pr <pr>` in a **separate fresh session**, and only the owner merges.

## Mode: fix

1. Find the branch and PR: `git branch --list "issue-$0-*"`, `git switch <branch>`, `git pull --ff-only`, `gh pr list --head <branch> --state open --json number,url`.
2. Read the findings: `gh pr view <pr> --comments` (the AI review comment and owner comments) and inline comments via `gh api repos/{owner}/{repo}/pulls/<pr>/comments`. Count previous `### Fix round` comments. If this would be round 3 and blockers are still open, stop and ask the owner instead.
3. For each finding, decide **fixed**, **disputed** (with evidence) or **needs owner** (spec question, which becomes a change request). Fix only what the findings cover, within the issue's scope.
4. Re-run verification as in step 5. Commit and `git push` (never force).
5. Post one PR comment headed `### Fix round <k>`, with a table: finding → decision → commit or evidence. **STOP.** The owner re-runs `/review-pr <pr>` in a fresh session.

## Never

- Start without a passing gate, or work on more than one issue.
- Merge, approve, push to `main`, force-push, add the `ready` label, or change specs or approval metadata.
- Claim a PR, check or screenshot that doesn't exist.
