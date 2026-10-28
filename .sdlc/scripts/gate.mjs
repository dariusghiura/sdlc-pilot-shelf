#!/usr/bin/env node
// Approval gate. Skills run this first; a non-zero exit means the stage must not start.
//
// Usage:
//   node .sdlc/scripts/gate.mjs require <DOC-ID> [<DOC-ID> ...] [--root <dir>]
//   node .sdlc/scripts/gate.mjs issue <number> [--require-clean] [--root <dir>] [--gh-fixtures <dir>]
//
// "require" passes when each document and its upstream chain (see REGISTRY) is approved, error-free,
// and recorded against the current MAJOR.MINOR of every upstream document.
// "issue" additionally checks the GitHub issue: open, labelled `ready`, not `blocked`, every
// "Blocked by" issue closed, cited spec versions current, referenced IDs defined.
// --gh-fixtures reads issue-<n>.json files instead of calling `gh` (used by tests).
// Exit codes: 0 pass, 1 gate failed, 2 usage error.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { REGISTRY, ID_RE, upstreamOf, compareMajorMinor, validateRepo, formatFindings } from './lib/docs.mjs';

const USAGE = 'usage: gate.mjs require <DOC-ID>... | gate.mjs issue <number> [--require-clean] [--root <dir>] [--gh-fixtures <dir>]';
const args = process.argv.slice(2);
const positional = [];
let root = process.cwd();
let fixtures = null;
let requireClean = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--root') root = resolve(args[++i] ?? '');
  else if (args[i] === '--gh-fixtures') fixtures = resolve(args[++i] ?? '');
  else if (args[i] === '--require-clean') requireClean = true;
  else if (args[i].startsWith('--')) usage(`unknown option ${args[i]}`);
  else positional.push(args[i]);
}
const [mode, ...rest] = positional;

function usage(msg) {
  console.error(`${msg}\n${USAGE}`);
  process.exit(2);
}

function finish(title, problems, lines) {
  if (problems.length) {
    console.log(`GATE FAILED — ${title}`);
    for (const p of problems) console.log(`- ${p}`);
    console.log('Stop. Report this to the human; do not edit approval metadata or work around the gate.');
    console.error(`gate failed: ${problems.length} problem(s)`);
    process.exit(1);
  }
  console.log(`GATE PASSED — ${title}`);
  for (const l of lines) console.log(l);
  process.exit(0);
}

// Walk the requested documents and their upstream chain; collect problems; return docs in dependency order.
function checkDocs(report, requested, problems) {
  const seen = new Set();
  const order = [];
  const visit = (id, explicit) => {
    if (seen.has(id)) return;
    seen.add(id);
    const ups = upstreamOf(id);
    if (ups === null) {
      problems.push(`unknown document id "${id}" (known: ${Object.keys(REGISTRY).join(', ')}, ADR-###)`);
      return;
    }
    const doc = report.docs[id];
    if (!doc) {
      if (explicit) problems.push(`${id} is required but ${REGISTRY[id]?.path ?? `its file in docs/architecture/adr/`} does not exist`);
      return;
    }
    const m = doc.meta;
    const basedOn = m.based_on && typeof m.based_on === 'object' && !Array.isArray(m.based_on) ? m.based_on : {};
    for (const up of ups) if (report.docs[up] || up in basedOn) visit(up, up in basedOn);
    order.push(id);
    if (m.status !== 'approved') problems.push(`${id} (${doc.path}) is "${m.status ?? 'unknown'}", not approved`);
    for (const [up, ver] of Object.entries(basedOn)) {
      const u = report.docs[up];
      if (!u) continue;
      const c = compareMajorMinor(u.meta.version, ver);
      if (c > 0) problems.push(`${id} is stale: written against ${up} ${ver}, but ${up} is now ${u.meta.version}; ${id} must be re-reviewed`);
      else if (c < 0) problems.push(`${id} cites ${up} ${ver}, newer than ${up} itself (${u.meta.version})`);
    }
    for (const up of ups) {
      if (report.docs[up] && !(up in basedOn)) problems.push(`${id} does not record which ${up} version it is based on (based_on)`);
    }
  };
  for (const id of requested) visit(id, true);
  return order;
}

function docLine(doc) {
  const m = doc.meta;
  return `- ${doc.id} v${m.version} — ${doc.path} (approved ${m.approved_on || '?'} by ${m.approved_by || '?'})`;
}

function loadReport(problems) {
  const report = validateRepo(root);
  if (!report.hasDocs) problems.push('no docs/ directory: nothing has been specified or approved yet');
  if (report.errors.length) {
    problems.push(`docs have ${report.errors.length} validation error(s) (run node .sdlc/scripts/validate-docs.mjs):`);
    for (const l of formatFindings(report.errors.slice(0, 8), '  ERROR')) problems.push(l.trim());
  }
  return report;
}

// ---------- require ----------

function runRequire(ids) {
  if (!ids.length) usage('require needs at least one document id');
  const problems = [];
  const report = loadReport(problems);
  const order = checkDocs(report, ids, problems);
  finish(`approved inputs for ${ids.join(', ')}`, problems, [
    'Approved inputs (only these versions are binding; read them before working):',
    ...order.map((id) => docLine(report.docs[id])),
  ]);
}

// ---------- issue ----------

function gh(n) {
  if (fixtures) return JSON.parse(readFileSync(join(fixtures, `issue-${n}.json`), 'utf8'));
  const out = execFileSync('gh', ['issue', 'view', String(n), '--json', 'number,title,state,labels,body,url'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(out);
}

// Issue Forms render each field as "### <label>" followed by the answer.
function sections(body) {
  const out = {};
  const parts = String(body ?? '').replace(/\r\n/g, '\n').split(/^###\s+(.+)$/m);
  for (let i = 1; i < parts.length; i += 2) {
    const text = parts[i + 1].trim();
    out[parts[i].trim().toLowerCase()] = text === '_No response_' ? '' : text;
  }
  return out;
}

const SPEC_RE = /\b(PRD|DESIGN-BRIEF|UI-SPEC|TOKENS|ARCH|GUIDELINES|DATA-MODEL|BACKLOG|ADR-\d{3,})\s+v?(\d+\.\d+\.\d+)\b/g;

function runIssue(n) {
  if (!/^\d+$/.test(n ?? '')) usage('issue needs an issue number');
  const problems = [];
  let issue;
  try {
    issue = gh(n);
  } catch (e) {
    finish(`issue #${n}`, [`could not read issue #${n}: ${String(e.stderr || e.message).trim()}`], []);
  }
  const labels = (issue.labels ?? []).map((l) => (typeof l === 'string' ? l : l.name));
  const s = sections(issue.body);

  if (String(issue.state).toUpperCase() !== 'OPEN') problems.push(`issue #${n} is ${issue.state}, not open`);
  if (!labels.includes('ready')) problems.push(`issue #${n} is not labelled "ready" (only the human adds it)`);
  if (labels.includes('blocked')) problems.push(`issue #${n} is labelled "blocked"`);

  const blockers = [...new Set([...(s['blocked by'] ?? '').matchAll(/#(\d+)/g)].map((m) => m[1]))];
  const blockerLines = [];
  for (const b of blockers) {
    try {
      const dep = gh(b);
      const open = String(dep.state).toUpperCase() !== 'CLOSED';
      blockerLines.push(`#${b} (${String(dep.state).toLowerCase()})`);
      if (open) problems.push(`blocked by #${b} "${dep.title}", which is still ${dep.state}`);
    } catch (e) {
      problems.push(`could not read blocking issue #${b}: ${String(e.stderr || e.message).trim()}`);
    }
  }

  const report = loadReport(problems);
  const required = ['PRD', 'ARCH', 'GUIDELINES', 'BACKLOG'];
  if (labels.includes('area:frontend')) required.push('DESIGN-BRIEF', 'UI-SPEC', 'TOKENS');
  const cited = Object.fromEntries([...(s['spec versions'] ?? '').matchAll(SPEC_RE)].map((m) => [m[1], m[2]]));
  for (const [id, ver] of Object.entries(cited)) {
    if (!required.includes(id)) required.push(id);
    const doc = report.docs[id];
    if (doc && compareMajorMinor(doc.meta.version, ver) !== 0) {
      problems.push(`issue cites ${id} v${ver}, but ${id} is now v${doc.meta.version}; the issue must be re-checked against the current spec`);
    }
  }
  for (const id of required) {
    if (!(id in cited)) problems.push(`issue does not cite the ${id} version it was planned against (### Spec versions)`);
  }
  const order = checkDocs(report, required, problems);

  const ids = [...new Set(String(issue.body ?? '').match(ID_RE) ?? [])];
  for (const id of ids) if (!report.defs.has(id)) problems.push(`issue references ${id}, which is not defined in the approved docs`);
  if (labels.includes('type:feature') && !ids.some((id) => /^N?FR-/.test(id))) {
    problems.push('feature issue references no FR-### or NFR-### requirement');
  }

  if (requireClean) {
    const dirty = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim();
    if (dirty) problems.push('working tree is not clean; commit or stash unrelated changes first');
  }

  finish(`issue #${n}: ${issue.title}`, problems, [
    `Labels: ${labels.join(', ') || '(none)'}`,
    `Blocked by: ${blockerLines.join(', ') || 'nothing'}`,
    `Referenced IDs: ${ids.join(', ') || '(none)'}`,
    'Approved specs to read before editing (only these versions are binding):',
    ...order.map((id) => docLine(report.docs[id])),
  ]);
}

if (mode === 'require') runRequire(rest);
else if (mode === 'issue') runIssue(rest[0]);
else usage(mode ? `unknown mode "${mode}"` : 'missing mode');
