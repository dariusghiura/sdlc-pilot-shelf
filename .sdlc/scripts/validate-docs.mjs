#!/usr/bin/env node
// Validate the documents under docs/: front matter, approval metadata, version links (based_on),
// ID definitions and references (FR/NFR/UX/ADR), relative links, and tokens.json consistency.
//
// Usage: node .sdlc/scripts/validate-docs.mjs [--root <dir>] [--strict]
//   --strict  treat warnings (stale or unapproved upstream, coverage gaps) as errors
// Exit codes: 0 ok, 1 findings, 2 usage error.
import { resolve } from 'node:path';
import { validateRepo, formatFindings } from './lib/docs.mjs';

const args = process.argv.slice(2);
let root = process.cwd();
let strict = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--root') root = resolve(args[++i] ?? '');
  else if (args[i] === '--strict') strict = true;
  else {
    console.error(`unknown argument: ${args[i]}\nusage: validate-docs.mjs [--root <dir>] [--strict]`);
    process.exit(2);
  }
}

const report = validateRepo(root);
if (!report.hasDocs) {
  console.log('validate-docs: no docs/ directory, nothing to check');
  process.exit(0);
}

const { errors, warnings } = report;
const docCount = Object.keys(report.docs).length;
console.log(
  `validate-docs: ${docCount} gate document(s), ${report.defs.size} ID(s); ` +
    `${errors.length} error(s), ${warnings.length} warning(s)${strict ? ' [strict]' : ''}`,
);
for (const line of formatFindings(errors, 'ERROR')) console.log(line);
for (const line of formatFindings(warnings, 'WARN ')) console.log(line);
process.exit(errors.length || (strict && warnings.length) ? 1 : 0);
