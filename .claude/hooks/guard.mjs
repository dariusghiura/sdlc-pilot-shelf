#!/usr/bin/env node
// PreToolUse guard for the SDLC kit. Denies human-only actions before they run:
//   - merging or approving PRs, pushing to main/master, force/mirror/delete pushes, committing on main/master
//   - adding the `ready` label, releases, secrets/variables, workflow dispatch, repo settings, API DELETEs
//   - writing approval metadata (status: approved, approved_by, approved_on) into docs/
//   - editing an approved document without reopening it (status back to draft) in the same edit
//   - modifying guardrails: .claude/settings*.json, .claude/hooks/, .sdlc/
// It is a safety net, not a sandbox: commands phrased differently can slip past (see docs/workflow/architecture.md).
// Input: hook JSON on stdin. Output: a PreToolUse "deny" decision on stdout, or nothing (normal permission flow).
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { relative, resolve, isAbsolute } from 'node:path';
import { parseFrontMatter } from '../../.sdlc/scripts/lib/docs.mjs';

const PROTECTED_RE = /^(\.claude\/settings(\.local)?\.json|\.claude\/hooks\/.+|\.sdlc\/.+)$/;
const PROTECTED_IN_CMD = /(^|[\s"'=/])\.?\/?(\.claude\/settings(\.local)?\.json|\.claude\/hooks\/\S*|\.sdlc\/\S*)/;
const APPROVAL_LINE = /^\s*(status\s*:\s*["']?approved\b|approved_(by|on)\s*:\s*["']?[^\s"'#])|"status"\s*:\s*"approved"|"approved_(by|on)"\s*:\s*"[^"\s]/;
const APPROVAL_IN_CMD = /status["']?\s*:\s*["']?approved\b|approved_(by|on)["']?\s*:\s*["']?[^\s"'#]/;
const WRITE_IN_CMD = /\bsed\s[^;&|\n]*-i|\bperl\s+-\w*i|>{1,2}\s*[^\s&>]|\btee\b|Set-Content|Add-Content|Out-File|writeFile|write_text|\.write\(/;
const REOPEN_STATUS = /status["']?\s*:\s*["']?(draft|in-review|superseded)\b/;
const APPROVED_STATUS = /status["']?\s*:\s*["']?approved\b/;

function deny(reasons) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          `SDLC guard: ${reasons.join('; ')}. ` +
          'This is reserved for the human. Tell the user what you were trying to do; do not try another way.',
      },
    }),
  );
  process.exit(0);
}

function currentBranch(cwd) {
  try {
    return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

const unquote = (t) => t.replace(/^["']|["']$/g, '');

function commandProblems(raw, cwd) {
  const cmd = raw.replace(/\\\r?\n/g, ' ');
  const out = [];
  const onMain = () => /^(main|master)$/.test(currentBranch(cwd));

  if (/\bgh\s+pr\s+merge\b/.test(cmd)) out.push('merging PRs');
  if (/\bgh\s+pr\s+review\b[^\n;&|]*(--approve\b|\s-a\b)/.test(cmd)) out.push('approving PRs');
  if (/\bgh\s+api\b[^\n;&|]*\/pulls\/\d+\/merge\b/.test(cmd)) out.push('merging PRs through the API');
  if (/\bgh\s+api\b[^\n;&|]*(-X|--method)[\s=]*["']?DELETE\b/i.test(cmd)) out.push('DELETE calls to the GitHub API');
  if (/\bgh\s+(release|secret|variable)\b/.test(cmd)) out.push('releases, secrets and variables');
  if (/\bgh\s+repo\s+(delete|archive|rename|edit)\b/.test(cmd)) out.push('changing repository settings');
  if (/\bgh\s+workflow\s+(run|enable|disable)\b/.test(cmd)) out.push('dispatching or toggling workflows (deployments)');
  if (/\bgh\s[^\n;&|]*(--add-label|--label|\s-l)[\s=]+["']?[^"'\s;&|]*\bready\b/.test(cmd) || /\bgh\s+api\b[^\n;&|]*\/labels\b[^\n;&|]*\bready\b/.test(cmd)) {
    out.push('adding the "ready" label (the human marks issues ready)');
  }

  for (const m of cmd.matchAll(/\bgit((?:\s+-[cC]\s+\S+|\s+--[\w-]+=\S+)*)\s+push\b([^\n;&|]*)/g)) {
    const argv = m[2].trim().split(/\s+/).filter(Boolean).map(unquote);
    const flags = argv.filter((a) => a.startsWith('-'));
    const positional = argv.filter((a) => !a.startsWith('-'));
    const refspecs = positional.slice(1);
    if (flags.some((f) => /^(-f|--force|--force-with-lease|--force-if-includes|--mirror|--all|--delete|-d|--prune)(=|$)/.test(f)) || positional.some((p) => p.startsWith('+'))) {
      out.push('force, mirror or delete pushes');
    }
    if (refspecs.some((r) => /(^|:)(refs\/heads\/)?(main|master)$/.test(r))) out.push('pushing to main/master (push a feature branch and open a PR)');
    else if ((refspecs.length === 0 || refspecs.includes('HEAD')) && onMain()) out.push('pushing from main/master (create a branch issue-<n>-<slug> first)');
  }
  if (/\bgit(\s+-[cC]\s+\S+)*\s+commit\b/.test(cmd) && onMain()) out.push('committing directly on main/master (create a branch first)');

  if (APPROVAL_IN_CMD.test(cmd) && WRITE_IN_CMD.test(cmd) && /docs\/|\.md\b|tokens\.json/.test(cmd)) {
    out.push('writing approval metadata into documents');
  }

  for (const seg of cmd.split(/&&|\|\||[;|\n]/)) {
    const t = seg.trim().split(/\s+/).map(unquote);
    const verb = (t[0] ?? '').toLowerCase();
    const isProt = (p) => PROTECTED_RE.test(p.replace(/^\.\//, '').replace(/\\/g, '/'));
    if (['rm', 'del', 'remove-item', 'rmdir'].includes(verb) && t.slice(1).some(isProt)) out.push('deleting guardrail files');
    if (['mv', 'move-item'].includes(verb) && t.slice(1).some(isProt)) out.push('moving guardrail files');
    if (['cp', 'copy-item'].includes(verb) && t.length > 2 && isProt(t.at(-1))) out.push('overwriting guardrail files');
  }
  if (/>{1,2}\s*["']?(\.\/)?(\.claude\/(settings[^\s]*\.json|hooks\/)|\.sdlc\/)/.test(cmd) || (/\bsed\s[^;&|\n]*-i/.test(cmd) && PROTECTED_IN_CMD.test(cmd.replace(/\bnode\s+\S*\.sdlc\/scripts\/\S+/g, '')))) {
    out.push('modifying guardrail files');
  }
  return [...new Set(out)];
}

function statusOnDisk(abs) {
  if (!existsSync(abs)) return { text: '', status: undefined };
  const text = readFileSync(abs, 'utf8');
  if (abs.endsWith('.json')) {
    try {
      return { text, status: JSON.parse(text)?.$extensions?.sdlc?.status };
    } catch {
      return { text, status: undefined };
    }
  }
  return { text, status: parseFrontMatter(text).data.status };
}

// Lines that set approval metadata and were not already present in the replaced text.
function introducesApproval(newText, oldText) {
  const old = new Set(String(oldText ?? '').replace(/\r\n/g, '\n').split('\n').map((l) => l.trim()));
  return String(newText ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .some((l) => APPROVAL_LINE.test(l) && !old.has(l.trim()));
}

function fileProblems(tool, input, projectDir) {
  const target = input.file_path ?? input.notebook_path;
  if (!target) return [];
  const abs = isAbsolute(target) ? target : resolve(projectDir, target);
  const rel = relative(projectDir, abs).replace(/\\/g, '/');
  if (rel.startsWith('..')) return [];
  if (PROTECTED_RE.test(rel)) return [`modifying guardrail file ${rel}`];
  if (!/^docs\/.+\.(md|json)$/.test(rel)) return [];

  const disk = statusOnDisk(abs);
  const pairs =
    tool === 'Write' ? [{ old: disk.text, neu: input.content }]
    : tool === 'MultiEdit' ? (input.edits ?? []).map((e) => ({ old: e.old_string, neu: e.new_string }))
    : tool === 'NotebookEdit' ? [{ old: '', neu: input.new_source }]
    : [{ old: input.old_string, neu: input.new_string }];

  if (pairs.some((p) => introducesApproval(p.neu, p.old))) {
    return [`setting approval metadata (status: approved, approved_by, approved_on) in ${rel}`];
  }
  if (disk.status === 'approved') {
    const reopens =
      tool === 'Write'
        ? REOPEN_STATUS.test(String(input.content ?? '')) && !APPROVED_STATUS.test(String(input.content ?? ''))
        : pairs.some((p) => APPROVED_STATUS.test(String(p.old ?? '')) && REOPEN_STATUS.test(String(p.neu ?? '')));
    if (!reopens) {
      return [`editing ${rel}, which is approved and frozen (reopen it via an approved change request: set status: draft and bump version in the same edit)`];
    }
  }
  return [];
}

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch (e) {
  console.error(`SDLC guard: could not parse hook input (${e.message}); allowing normal permission flow`);
  process.exit(0);
}
const tool = input.tool_name ?? '';
const ti = input.tool_input ?? {};
const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();

let problems = [];
if (tool === 'Bash' || tool === 'PowerShell') problems = commandProblems(String(ti.command ?? ''), input.cwd || projectDir);
else if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) problems = fileProblems(tool, ti, projectDir);
if (problems.length) deny(problems.map((p) => `blocked ${p}`));
process.exit(0);
