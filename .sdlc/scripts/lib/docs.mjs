// Shared helpers for the SDLC kit scripts: document registry, front matter, IDs, links, tokens.
// Plain Node ESM (>= 22), no dependencies, so it runs unchanged locally, in hooks and on CI runners.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

export const STATUSES = ['draft', 'in-review', 'approved', 'superseded'];

// Gate documents, their canonical paths, and which documents they are derived from.
export const REGISTRY = {
  PRD: { path: 'docs/product/prd.md', upstream: [] },
  'DESIGN-BRIEF': { path: 'docs/design/design-brief.md', upstream: ['PRD'] },
  'UI-SPEC': { path: 'docs/design/ui-spec.md', upstream: ['PRD', 'DESIGN-BRIEF'] },
  TOKENS: { path: 'docs/design/tokens.json', upstream: ['DESIGN-BRIEF'] },
  ARCH: { path: 'docs/architecture/architecture.md', upstream: ['PRD', 'DESIGN-BRIEF', 'UI-SPEC'] },
  GUIDELINES: { path: 'docs/architecture/implementation-guidelines.md', upstream: ['ARCH'] },
  'DATA-MODEL': { path: 'docs/architecture/data-model.md', upstream: ['ARCH'] },
  BACKLOG: { path: 'docs/plan/backlog.md', upstream: ['PRD', 'UI-SPEC', 'ARCH'] },
};

export const ADR_DIR = 'docs/architecture/adr';
export const ADR_ID_RE = /^ADR-\d{3,}$/;
export const ID_RE = /\b(?:FR|NFR|UX|ADR)-\d{3,}\b/g;
const DEF_RE = /^(#{1,6})\s+((FR|NFR|UX)-\d{3,})\b/;
const HEADING_RE = /^(#{1,6})\s/;
const LINK_RE = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DTCG_TYPES = new Set([
  'color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'number',
  'strokeStyle', 'border', 'transition', 'shadow', 'gradient', 'typography',
]);

export const toPosix = (p) => p.split('\\').join('/');

export function upstreamOf(id) {
  if (REGISTRY[id]) return REGISTRY[id].upstream;
  if (ADR_ID_RE.test(id)) return ['ARCH'];
  return null;
}

// ---------- versions ----------

export function parseSemver(v) {
  const m = SEMVER_RE.exec(String(v ?? '').trim());
  return m ? m.slice(1).map(Number) : null;
}

export function compareSemver(a, b) {
  const x = parseSemver(a);
  const y = parseSemver(b);
  if (!x || !y) return NaN;
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
}

// PATCH bumps are wording-only and never invalidate downstream work.
export function compareMajorMinor(a, b) {
  const x = parseSemver(a);
  const y = parseSemver(b);
  if (!x || !y) return NaN;
  return x[0] - y[0] || x[1] - y[1];
}

// ---------- front matter (flat YAML subset: key: value, inline { k: v } maps, inline [a, b] lists) ----------

function stripComment(raw) {
  const s = raw.trim();
  if (s.startsWith('"') || s.startsWith("'")) {
    const end = s.indexOf(s[0], 1);
    return end > 0 ? s.slice(0, end + 1) : s;
  }
  const i = s.search(/(^|\s)#/);
  return i === -1 ? s : s.slice(0, i).trim();
}

function parseScalar(s) {
  const t = s.trim();
  if (t.length >= 2 && ((t[0] === '"' && t.at(-1) === '"') || (t[0] === "'" && t.at(-1) === "'"))) return t.slice(1, -1);
  return t;
}

function parseValue(s) {
  if (s.startsWith('{')) {
    if (!s.endsWith('}')) throw new Error('unterminated { } map');
    const inner = s.slice(1, -1).trim();
    const out = {};
    if (!inner) return out;
    for (const part of inner.split(',')) {
      const m = /^\s*([^:]+?)\s*:\s*(.*?)\s*$/.exec(part);
      if (!m) throw new Error(`cannot parse map entry "${part.trim()}"`);
      out[parseScalar(m[1])] = parseScalar(m[2]);
    }
    return out;
  }
  if (s.startsWith('[')) {
    if (!s.endsWith(']')) throw new Error('unterminated [ ] list');
    const inner = s.slice(1, -1).trim();
    return inner ? inner.split(',').map(parseScalar) : [];
  }
  return parseScalar(s);
}

export function parseFrontMatter(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  if (lines[0]?.trim() !== '---') return { found: false, data: {}, errors: [] };
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end === -1) return { found: true, data: {}, errors: [{ line: 1, msg: 'front matter is not closed with ---' }] };
  const data = {};
  const errors = [];
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (/^\s/.test(line)) {
      errors.push({ line: i + 1, msg: 'nested YAML is not supported in front matter; use inline { key: value } maps' });
      continue;
    }
    const m = /^([A-Za-z_][\w-]*)\s*:(.*)$/.exec(line);
    if (!m) {
      errors.push({ line: i + 1, msg: `cannot parse front matter line: ${line.trim()}` });
      continue;
    }
    try {
      data[m[1]] = parseValue(stripComment(m[2]));
    } catch (e) {
      errors.push({ line: i + 1, msg: `${m[1]}: ${e.message}` });
    }
  }
  return { found: true, data, errors };
}

// Blank out front matter, HTML comments and fenced code blocks, preserving line numbers,
// so template guidance and code samples never count as ID definitions, references or links.
export function maskNonContent(text) {
  const src = text.replace(/\r\n/g, '\n');
  const blank = (s) => s.replace(/[^\n]/g, '');
  let out = src;
  const lines = src.split('\n');
  if (lines[0]?.trim() === '---') {
    const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
    if (end !== -1) {
      const head = lines.slice(0, end + 1).join('\n');
      out = blank(head) + out.slice(head.length);
    }
  }
  out = out.replace(/<!--[\s\S]*?-->/g, blank);
  out = out.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank);
  return out;
}

// ---------- repository scan ----------

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else out.push(abs);
  }
  return out;
}

function jsonErrorLine(text, message) {
  const pos = /position (\d+)/.exec(message);
  if (pos) return text.slice(0, Number(pos[1])).split('\n').length;
  const line = /line (\d+)/.exec(message);
  return line ? Number(line[1]) : 0;
}

function loadGateDoc(root, id, rel, err) {
  const text = readFileSync(join(root, rel), 'utf8');
  if (rel.endsWith('.json')) {
    try {
      const json = JSON.parse(text);
      const meta = json?.$extensions?.sdlc;
      if (!meta || typeof meta !== 'object') err(rel, 1, 'missing $extensions.sdlc metadata (id, status, version, based_on, approved_by, approved_on)');
      return { id, path: rel, meta: meta ?? {}, json };
    } catch (e) {
      err(rel, jsonErrorLine(text, e.message), `invalid JSON: ${e.message}`);
      return { id, path: rel, meta: {}, invalid: true };
    }
  }
  const fm = parseFrontMatter(text);
  if (!fm.found) err(rel, 1, 'missing front matter (id, status, version, based_on, approved_by, approved_on)');
  for (const e of fm.errors) err(rel, e.line, e.msg);
  return { id, path: rel, meta: fm.data, text };
}

function validateMeta(doc, err) {
  if (doc.invalid) return;
  const m = doc.meta;
  const f = doc.path;
  if (m.id !== doc.id) err(f, 1, `id is "${m.id ?? ''}", expected "${doc.id}"`);
  if (!STATUSES.includes(m.status)) err(f, 1, `status must be one of ${STATUSES.join(', ')} (got "${m.status ?? ''}")`);
  if (!parseSemver(m.version)) err(f, 1, `version must be MAJOR.MINOR.PATCH (got "${m.version ?? ''}")`);
  if (m.based_on !== undefined && (typeof m.based_on !== 'object' || m.based_on === null || Array.isArray(m.based_on))) {
    err(f, 1, 'based_on must be a map, e.g. { PRD: 1.0.0 }');
  } else {
    for (const [k, v] of Object.entries(m.based_on ?? {})) {
      if (!parseSemver(v)) err(f, 1, `based_on.${k} must be MAJOR.MINOR.PATCH (got "${v}")`);
    }
  }
  if (m.status === 'approved') {
    if (!String(m.approved_by ?? '').trim()) err(f, 1, 'status is approved but approved_by is empty');
    if (!DATE_RE.test(String(m.approved_on ?? '').trim())) err(f, 1, 'status is approved but approved_on is not YYYY-MM-DD');
  }
}

function checkBasedOn(doc, docs, err, warn) {
  if (doc.invalid) return;
  const m = doc.meta;
  const f = doc.path;
  const basedOn = m.based_on && typeof m.based_on === 'object' && !Array.isArray(m.based_on) ? m.based_on : {};
  for (const [up, ver] of Object.entries(basedOn)) {
    const u = docs[up];
    if (!u) {
      err(f, 1, `based_on references ${up}, which does not exist`);
      continue;
    }
    if (!parseSemver(ver) || !parseSemver(u.meta.version)) continue;
    if (compareSemver(ver, u.meta.version) > 0) {
      err(f, 1, `based_on ${up} ${ver} is newer than ${up} itself (${u.meta.version})`);
    } else if (compareMajorMinor(u.meta.version, ver) > 0) {
      warn(f, 1, `stale: written against ${up} ${ver}, but ${up} is now ${u.meta.version}`);
    }
    if (m.status === 'approved' && u.meta.status !== 'approved') {
      warn(f, 1, `approved, but upstream ${up} is "${u.meta.status}" (reopened?)`);
    }
  }
  for (const up of upstreamOf(doc.id) ?? []) {
    if (docs[up] && !(up in basedOn)) warn(f, 1, `based_on does not record the ${up} version this was written against`);
  }
}

function checkTokens(doc, err, warn) {
  const f = doc.path;
  const tokens = new Map();
  const visit = (node, path, inherited) => {
    if ('$value' in node) {
      const type = node.$type ?? inherited;
      if (node.$type && !DTCG_TYPES.has(node.$type)) warn(f, 0, `${path.join('.')}: unknown $type "${node.$type}"`);
      if (!type) warn(f, 0, `${path.join('.')}: no $type (set it on the token or a parent group)`);
      tokens.set(path.join('.'), node.$value);
      return;
    }
    if (node.$type && !DTCG_TYPES.has(node.$type)) warn(f, 0, `${path.join('.') || '(root)'}: unknown $type "${node.$type}"`);
    const type = node.$type ?? inherited;
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      const p = [...path, k];
      if (v === null || typeof v !== 'object' || Array.isArray(v)) {
        err(f, 0, `${p.join('.')}: expected a group or a token with $value`);
        continue;
      }
      visit(v, p, type);
    }
  };
  visit(doc.json, [], undefined);

  const aliasesIn = (value) => {
    if (typeof value === 'string') return [...value.matchAll(/\{([^{}]+)\}/g)].map((m) => m[1]);
    if (Array.isArray(value)) return value.flatMap(aliasesIn);
    if (value && typeof value === 'object') return Object.values(value).flatMap(aliasesIn);
    return [];
  };
  for (const [path, value] of tokens) {
    for (const target of aliasesIn(value)) {
      if (!tokens.has(target)) {
        err(f, 0, `${path}: alias {${target}} does not resolve to a token`);
        continue;
      }
      const chain = [path];
      let cur = target;
      while (cur && chain.length < 32) {
        if (chain.includes(cur)) {
          err(f, 0, `${path}: circular alias ${[...chain, cur].join(' → ')}`);
          break;
        }
        chain.push(cur);
        const v = tokens.get(cur);
        const m = typeof v === 'string' ? /^\{([^{}]+)\}$/.exec(v) : null;
        cur = m && tokens.has(m[1]) ? m[1] : null;
      }
    }
  }

  // Theme modes (theme.light, theme.dark, …) must define exactly the same token paths.
  const themes = doc.json.theme ?? doc.json.themes;
  if (themes && typeof themes === 'object') {
    const prefix = doc.json.theme ? 'theme' : 'themes';
    const modes = Object.keys(themes).filter((k) => !k.startsWith('$'));
    if (modes.length >= 2) {
      const pathsOf = (mode) =>
        new Set([...tokens.keys()].filter((p) => p.startsWith(`${prefix}.${mode}.`)).map((p) => p.slice(prefix.length + mode.length + 2)));
      const base = pathsOf(modes[0]);
      for (const mode of modes.slice(1)) {
        const other = pathsOf(mode);
        const missing = [...base].filter((p) => !other.has(p));
        const extra = [...other].filter((p) => !base.has(p));
        if (missing.length) err(f, 0, `theme "${mode}" is missing tokens defined in "${modes[0]}": ${missing.join(', ')}`);
        if (extra.length) err(f, 0, `theme "${mode}" defines tokens absent from "${modes[0]}": ${extra.join(', ')}`);
      }
    }
  }
  return tokens;
}

// Validate everything under docs/. Errors break CI; warnings are surfaced and become errors at gates.
export function validateRepo(root) {
  const errors = [];
  const warnings = [];
  const err = (file, line, msg) => errors.push({ file, line, msg });
  const warn = (file, line, msg) => warnings.push({ file, line, msg });
  const docs = {};
  const defs = new Map();
  const result = { root, errors, warnings, docs, defs, hasDocs: existsSync(join(root, 'docs')) };
  if (!result.hasDocs) return result;

  for (const [id, def] of Object.entries(REGISTRY)) {
    if (existsSync(join(root, def.path))) docs[id] = loadGateDoc(root, id, def.path, err);
  }
  const adrAbs = join(root, ADR_DIR);
  if (existsSync(adrAbs)) {
    for (const name of readdirSync(adrAbs).filter((n) => n.endsWith('.md')).sort()) {
      const rel = `${ADR_DIR}/${name}`;
      const m = /^(ADR-\d{3,})-.+\.md$/.exec(name);
      if (!m) {
        err(rel, 1, 'ADR file name must be ADR-###-<slug>.md');
        continue;
      }
      if (docs[m[1]]) {
        err(rel, 1, `${m[1]} is defined more than once (also ${docs[m[1]].path})`);
        continue;
      }
      docs[m[1]] = loadGateDoc(root, m[1], rel, err);
      defs.set(m[1], { file: rel, line: 1 });
    }
  }
  for (const doc of Object.values(docs)) validateMeta(doc, err);
  for (const doc of Object.values(docs)) checkBasedOn(doc, docs, err, warn);

  // IDs and links across every Markdown file under docs/.
  const refs = [];
  const sections = new Map();
  for (const abs of walk(join(root, 'docs')).filter((p) => p.endsWith('.md'))) {
    const rel = toPosix(relative(root, abs));
    const lines = maskNonContent(readFileSync(abs, 'utf8')).split('\n');
    const headings = lines.flatMap((l, i) => (HEADING_RE.test(l) ? [{ i, level: HEADING_RE.exec(l)[1].length }] : []));
    lines.forEach((line, i) => {
      const d = DEF_RE.exec(line);
      let skip = null;
      if (d) {
        const [, hashes, id, type] = d;
        const owner = type === 'UX' ? REGISTRY['UI-SPEC'].path : REGISTRY.PRD.path;
        if (rel === owner) {
          skip = id;
          if (defs.has(id)) {
            const first = defs.get(id);
            err(rel, i + 1, `${id} is defined more than once (first at ${first.file}:${first.line})`);
          } else {
            defs.set(id, { file: rel, line: i + 1 });
            const next = headings.find((h) => h.i > i && h.level <= hashes.length);
            sections.set(id, lines.slice(i + 1, next ? next.i : lines.length).join('\n'));
          }
        }
      }
      for (const m of line.matchAll(ID_RE)) {
        if (m[0] === skip) {
          skip = null;
          continue;
        }
        refs.push({ id: m[0], file: rel, line: i + 1 });
      }
      for (const m of line.matchAll(LINK_RE)) {
        const target = m[1];
        if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#')) continue;
        let clean = target.split('#')[0].split('?')[0];
        try {
          clean = decodeURI(clean);
        } catch {
          /* keep the raw path */
        }
        if (clean && !existsSync(resolve(dirname(abs), clean))) err(rel, i + 1, `broken link: ${target}`);
      }
    });
  }

  const reported = new Set();
  for (const r of refs) {
    if (defs.has(r.id) || reported.has(`${r.file}|${r.id}`)) continue;
    reported.add(`${r.file}|${r.id}`);
    err(r.file, r.line, `${r.id} is referenced but not defined`);
  }

  const uiSpec = docs['UI-SPEC'];
  for (const [id, text] of sections) {
    if (id.startsWith('UX-') && !/\bFR-\d{3,}\b/.test(text)) {
      (uiSpec?.meta.status === 'approved' ? err : warn)(defs.get(id).file, defs.get(id).line, `${id} does not reference any FR-###`);
    }
  }
  const backlog = docs.BACKLOG;
  if (backlog) {
    const covered = new Set(refs.filter((r) => r.file === backlog.path).map((r) => r.id));
    for (const [id, text] of sections) {
      if (id.startsWith('FR-') && /Priority:\**\s*Now\b/i.test(text) && !covered.has(id)) {
        warn(backlog.path, 1, `${id} (priority Now) is not covered by any backlog slice`);
      }
    }
  }

  if (docs.TOKENS && !docs.TOKENS.invalid) result.tokens = checkTokens(docs.TOKENS, err, warn);
  return result;
}

export function formatFindings(list, label) {
  return list.map((f) => `${label} ${f.file}${f.line ? `:${f.line}` : ''}  ${f.msg}`);
}
