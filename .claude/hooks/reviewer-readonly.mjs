#!/usr/bin/env node
// PreToolUse hook (registered in .claude/settings.json) that makes the pr-reviewer subagent read-only.
// It acts only when the hook input says the call comes from that subagent (agent_type: "pr-reviewer");
// all other calls pass through untouched. Bash may only run read-only inspection commands: every
// subcommand (split on && || ; | and newlines) must match the allowlist; output redirection, command
// substitution and file-writing flags are rejected.
// Registered in settings rather than in the agent's frontmatter `hooks:`, because frontmatter hooks were
// observed not to fire for project subagents (Claude Code 2.1.301; see docs/workflow/validation-log.md).
import { readFileSync } from 'node:fs';

const REVIEWER = 'pr-reviewer';

const ALLOW = [
  /^cd\s+\S+$/,
  /^pwd$/,
  /^git(\s+-C\s+\S+)?\s+(diff|log|show|status|rev-parse|merge-base|ls-files|ls-tree|blame|cat-file|describe)(\s|$)/,
  /^git(\s+-C\s+\S+)?\s+branch(\s+(--show-current|-a|-r|-v|-vv|--list|--contains\s+\S+))*$/,
  /^git(\s+-C\s+\S+)?\s+fetch(\s+(-q|--quiet|--no-tags))*(\s+origin(\s+[\w./-]+)*)?$/,
  /^gh\s+pr\s+(view|diff|checks|list)(\s|$)/,
  /^gh\s+issue\s+(view|list)(\s|$)/,
  /^gh\s+api\s/,
  /^node\s+(\.\/)?\.sdlc\/scripts\/(validate-docs|gate)\.mjs(\s|$)/,
  /^(head|tail|wc|grep|cat|ls|cut|uniq|echo)(\s|$)/,
];
const WRITE_FLAGS = /(^|\s)(--output(=|\s)|--web\b)/;
const GH_API_WRITE = /(^|\s)(-X|--method)[\s=]*["']?(?!GET\b)\w+|(^|\s)(-f|-F|--field|--raw-field|--input)(\s|=)/i;

function decide(command) {
  const cmd = command.replace(/\\\r?\n/g, ' ');
  if (/\$\(|`/.test(cmd)) return 'command substitution is not allowed';
  const stripped = cmd.replace(/\s\d?>\s*\/dev\/null/g, ' ').replace(/\s2>&1/g, ' ');
  if (/>/.test(stripped)) return 'output redirection is not allowed';
  for (const raw of stripped.split(/&&|\|\||[;|\n]/)) {
    const seg = raw.trim();
    if (!seg) continue;
    if (!ALLOW.some((re) => re.test(seg))) return `"${seg}" is not on the reviewer's read-only allowlist`;
    if (WRITE_FLAGS.test(seg)) return `"${seg}" uses a writing or browser flag`;
    if (/^gh\s+api\s/.test(seg) && GH_API_WRITE.test(seg)) return `"${seg}" is not a GET request`;
  }
  return null;
}

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  // Fail closed: the reviewer must never run unchecked commands.
  process.stderr.write('pr-reviewer guard: unreadable hook input\n');
  process.exit(2);
}
if (input.agent_type === REVIEWER && input.tool_name === 'Bash') {
  const reason = decide(String(input.tool_input?.command ?? ''));
  if (reason) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: `pr-reviewer is read-only: ${reason}. Use Read/Grep/Glob, or list it under "Not checked".`,
        },
      }),
    );
  }
}
process.exit(0);
