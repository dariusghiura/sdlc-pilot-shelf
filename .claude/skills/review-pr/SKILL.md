---
name: review-pr
description: Stage F. Independent, spec-aware AI review of one pull request by the read-only pr-reviewer subagent, posted as a single advisory PR comment. Run it in a fresh session that did not write the code. Never approves, requests changes or merges; CI and the owner remain authoritative.
disable-model-invocation: true
argument-hint: "<pr-number>"
allowed-tools: Bash(gh pr view *), Bash(gh pr checkout *), Bash(gh pr comment *), Bash(git status*), Bash(git branch --show-current), Bash(git switch *), Bash(git checkout -)
---

# review-pr: independent AI review of PR #$0

**PR facts (computed before you read this):**

!`gh pr view $0 --json number,title,url,state,isDraft,headRefName,baseRefName,closingIssuesReferences`

You are the **orchestrator**, not the reviewer. Your job is to give the `pr-reviewer` subagent a clean, artifact-only brief, then publish its report verbatim.

## 1. Independence check
If this session wrote, edited or committed any code on this PR's branch, or ran `/implement-issue`, **stop**. Tell the owner to run `/review-pr $0` in a fresh session. A reviewer briefed by the author inherits the author's blind spots.

## 2. Preconditions
- The PR must be `OPEN`. A draft is fine, but mention it.
- Note the linked issues from `closingIssuesReferences`. If there are none, still review; the reviewer will flag it as a blocker.
- `git status --porcelain` must be empty. Otherwise stop, so the owner's work isn't disturbed.

## 3. Check out the PR head read-only
Record the current branch (`git branch --show-current`), then run `gh pr checkout $0 --detach`. The reviewer then reads the PR's actual files, including screenshots under `docs/qa/`.

## 4. Delegate
Use the Agent tool with `subagent_type: pr-reviewer` and **exactly** this message, with the placeholders filled from the PR facts above. Add nothing about how or why the code was written:

```text
Review pull request #<number> (<url>).
Head branch: <headRefName>. Base branch: <baseRefName>. The working tree is checked out at the PR head (detached).
Linked issue(s): <#n, #m | none>.
Follow your instructions and return the report in the required format.
```

## 5. Restore the checkout
Switch back to the recorded branch (`git switch <branch>`), whether or not the review succeeded.

## 6. Publish the report verbatim
Write a body file **outside the repository**: the header below, then the reviewer's report unchanged. Don't soften, reorder or summarise it. Then run `gh pr comment $0 --body-file <file>`.

```markdown
## AI review (advisory, not an approval)

Independent review by the read-only `pr-reviewer` subagent against the linked issue and approved specs.
CI checks and the owner's review are authoritative. Only the owner merges.

---
```

## 7. STOP
Tell the owner the verdict line, the counts per severity, and the comment URL exactly as `gh` printed it. Don't fix anything, approve (`gh pr review --approve`), request changes, or merge. Fixes go through `/implement-issue <issue> fix` in another session.
