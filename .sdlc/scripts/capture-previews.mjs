#!/usr/bin/env node
// Render HTML prototypes or a running app to PNG at exact viewports and themes. Drives an installed
// Chromium-based browser (Chrome, Edge or Chromium) over the DevTools protocol. No npm dependencies (Node >= 22).
//
// Usage:
//   node .sdlc/scripts/capture-previews.mjs <file.html | dir>... [--url <name>=<url>]...
//        [--out <dir>] [--viewports desktop,mobile] [--themes light,dark] [--full-page] [--index] [--browser <path>]
//
//   <file.html | dir>   prototypes; directories are searched recursively for *.html (index.html excluded)
//   --url name=url      capture a running app page (e.g. --url list=http://localhost:5173/books)
//   --out <dir>         output directory (default: next to each HTML file; required with --url)
//   --viewports         desktop=1440x900, tablet=768x1024, mobile=390x844 (mobile emulation), or WxH. Default: desktop
//   --themes            light,dark. Default: light. Each theme is applied as prefers-color-scheme AND as ?theme=<t>
//   --full-page         capture the whole scrollable page instead of the first viewport
//   --index             also write index.html, a side-by-side contact sheet, in the common output directory
//
// Writes <name>-<viewport>-<theme>.png and records each capture (measured layout viewport, sha256, browser
// version, time) in previews.json next to the images. Exit codes: 0 ok, 1 capture failed, 2 usage error.
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir, platform } from 'node:os';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const PRESETS = { desktop: [1440, 900], tablet: [768, 1024], mobile: [390, 844] };
const toPosix = (p) => p.split('\\').join('/');

function usage(msg) {
  console.error(
    `${msg}\nusage: capture-previews.mjs <file.html|dir>... [--url name=url]... [--out dir] ` +
      '[--viewports desktop,mobile] [--themes light,dark] [--full-page] [--index] [--browser path]',
  );
  process.exit(2);
}

// ---------- arguments ----------

const args = process.argv.slice(2);
const inputs = [];
const urls = [];
let out = null;
let viewports = ['desktop'];
let themes = ['light'];
let fullPage = false;
let index = false;
let browser = process.env.SDLC_BROWSER || null;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--out') out = resolve(args[++i] ?? '');
  else if (a === '--viewports') viewports = (args[++i] ?? '').split(',').filter(Boolean);
  else if (a === '--themes') themes = (args[++i] ?? '').split(',').filter(Boolean);
  else if (a === '--full-page') fullPage = true;
  else if (a === '--index') index = true;
  else if (a === '--browser') browser = args[++i];
  else if (a === '--url') {
    const m = /^([\w.-]+)=(https?:\/\/.+)$/.exec(args[++i] ?? '');
    if (!m) usage('--url expects name=http(s)://…');
    urls.push({ name: m[1], url: m[2] });
  } else if (a.startsWith('--')) usage(`unknown option ${a}`);
  else inputs.push(resolve(a));
}
if (!inputs.length && !urls.length) usage('nothing to capture');
if (urls.length && !out) usage('--out is required with --url');
const sizes = viewports.map((v) => {
  if (PRESETS[v]) return { name: v, w: PRESETS[v][0], h: PRESETS[v][1] };
  const m = /^(\d+)x(\d+)$/.exec(v);
  if (!m) usage(`unknown viewport "${v}"`);
  return { name: v, w: Number(m[1]), h: Number(m[2]) };
});
for (const t of themes) if (!['light', 'dark'].includes(t)) usage(`unknown theme "${t}"`);

// ---------- helpers ----------

function onPath(cmd) {
  try {
    const finder = platform() === 'win32' ? 'where' : 'which';
    return execFileSync(finder, [cmd], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split(/\r?\n/)[0].trim() || null;
  } catch {
    return null;
  }
}

function findBrowser() {
  if (browser) return existsSync(browser) ? browser : onPath(browser);
  const env = process.env;
  const candidates =
    {
      win32: [
        `${env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
        `${env['PROGRAMFILES(X86)']}\\Google\\Chrome\\Application\\chrome.exe`,
        `${env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
        `${env['PROGRAMFILES(X86)']}\\Microsoft\\Edge\\Application\\msedge.exe`,
        `${env.PROGRAMFILES}\\Microsoft\\Edge\\Application\\msedge.exe`,
      ],
      darwin: [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      ],
    }[platform()] ?? [];
  for (const c of candidates) if (existsSync(c)) return c;
  for (const c of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge']) {
    const p = onPath(c);
    if (p) return p;
  }
  return null;
}

function htmlFiles(p) {
  if (!existsSync(p)) usage(`not found: ${p}`);
  if (statSync(p).isFile()) return [p];
  return readdirSync(p, { recursive: true })
    .map((f) => join(p, f))
    .filter((f) => extname(f) === '.html' && basename(f) !== 'index.html' && statSync(f).isFile())
    .sort();
}

function commonDir(dirs) {
  const parts = dirs.map((d) => resolve(d).split(/[\\/]/));
  let n = parts[0].length;
  for (const p of parts) {
    let i = 0;
    while (i < n && i < p.length && p[i].toLowerCase() === parts[0][i].toLowerCase()) i++;
    n = i;
  }
  return parts[0].slice(0, n).join(sep) || sep;
}

const withTheme = (url, theme) => `${url}${url.includes('?') ? '&' : '?'}theme=${theme}`;

// ---------- minimal DevTools protocol client ----------

async function launch(exe, profile) {
  const proc = spawn(
    exe,
    [
      '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run',
      '--no-default-browser-check', '--disable-extensions', '--disable-gpu', '--hide-scrollbars', 'about:blank',
    ],
    { stdio: 'ignore' },
  );
  const portFile = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 150 && !existsSync(portFile); i++) await sleep(100);
  if (!existsSync(portFile)) {
    proc.kill();
    throw new Error('browser did not start (no DevToolsActivePort after 15s)');
  }
  const port = readFileSync(portFile, 'utf8').split('\n')[0].trim();
  const base = `http://127.0.0.1:${port}`;
  const version = await (await fetch(`${base}/json/version`)).json();
  let target;
  for (let i = 0; i < 50 && !target; i++) {
    target = (await (await fetch(`${base}/json/list`)).json()).find((t) => t.type === 'page');
    if (!target) await sleep(100);
  }
  if (!target) throw new Error('no page target');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = () => rej(new Error('cannot connect to the browser'));
  });
  let seq = 0;
  const pending = new Map();
  const waiters = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) rej(new Error(msg.error.message));
      else res(msg.result);
    } else if (msg.method) {
      for (const w of [...waiters]) if (w.method === msg.method) w.fire(msg.params);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const id = ++seq;
      pending.set(id, { res, rej });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const once = (method, ms) =>
    new Promise((res, rej) => {
      const w = {
        method,
        fire: (p) => {
          clearTimeout(t);
          waiters.splice(waiters.indexOf(w), 1);
          res(p);
        },
      };
      const t = setTimeout(() => {
        waiters.splice(waiters.indexOf(w), 1);
        rej(new Error(`timed out after ${ms}ms waiting for ${method}`));
      }, ms);
      waiters.push(w);
    });
  const close = async () => {
    try {
      ws.close();
    } catch {
      /* already closed */
    }
    proc.kill();
    await new Promise((r) => (proc.exitCode !== null ? r() : proc.once('exit', r)));
  };
  return { send, once, close, version: version.Browser };
}

async function capture(page, url, size, theme, file) {
  const mobile = size.w < 768;
  await page.send('Emulation.setDeviceMetricsOverride', { width: size.w, height: size.h, deviceScaleFactor: 1, mobile });
  await page.send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }] });
  const loaded = page.once('Page.loadEventFired', 30_000);
  const nav = await page.send('Page.navigate', { url });
  if (nav.errorText) throw new Error(`navigation failed: ${nav.errorText}`);
  await loaded;
  const { result } = await page.send('Runtime.evaluate', {
    expression:
      'document.fonts.ready.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))' +
      '.then(() => JSON.stringify({ w: innerWidth, h: innerHeight, dark: matchMedia("(prefers-color-scheme: dark)").matches }))',
    awaitPromise: true,
    returnByValue: true,
  });
  await sleep(250);
  const layout = JSON.parse(result.value);
  const params = { format: 'png' };
  if (fullPage) {
    const m = await page.send('Page.getLayoutMetrics');
    const content = m.cssContentSize ?? m.contentSize;
    params.captureBeyondViewport = true;
    params.clip = { x: 0, y: 0, width: size.w, height: Math.ceil(content.height), scale: 1 };
  }
  const { data } = await page.send('Page.captureScreenshot', params);
  const png = Buffer.from(data, 'base64');
  writeFileSync(file, png);
  return { layout, png };
}

// ---------- run ----------

const exe = findBrowser();
if (!exe) {
  console.error('capture-previews: no Chromium-based browser found (Chrome, Edge or Chromium). Set SDLC_BROWSER or pass --browser.');
  process.exit(1);
}

const jobs = [];
for (const input of inputs) {
  for (const file of htmlFiles(input)) {
    jobs.push({ source: file, name: basename(file, '.html'), outDir: out ?? dirname(file), url: pathToFileURL(file).href });
  }
}
for (const u of urls) jobs.push({ source: u.url, name: u.name, outDir: out, url: u.url });

const profile = mkdtempSync(join(tmpdir(), 'sdlc-capture-'));
const results = [];
let failures = 0;
let page;
try {
  page = await launch(exe, profile);
  await page.send('Page.enable');
  for (const job of jobs) {
    mkdirSync(job.outDir, { recursive: true });
    for (const size of sizes) {
      for (const theme of themes) {
        const file = join(job.outDir, `${job.name}-${size.name}-${theme}.png`);
        try {
          const { layout, png } = await capture(page, withTheme(job.url, theme), size, theme, file);
          const entry = {
            file: toPosix(relative(process.cwd(), file)),
            source: /^https?:/.test(job.source) ? job.source : toPosix(relative(process.cwd(), job.source)),
            viewport_name: size.name,
            viewport: `${size.w}x${size.h}`,
            layout_viewport: `${layout.w}x${layout.h}`,
            theme,
            prefers_dark: layout.dark,
            full_page: fullPage,
            image: `${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`,
            sha256: createHash('sha256').update(png).digest('hex'),
            browser: page.version,
            captured_at: new Date().toISOString(),
          };
          if (layout.w !== size.w) {
            console.warn(`WARN ${entry.file}: page laid out at ${entry.layout_viewport}, requested ${entry.viewport}`);
          }
          results.push(entry);
          console.log(`captured ${entry.file} (layout ${entry.layout_viewport}, ${theme})`);
        } catch (e) {
          failures++;
          console.error(`FAILED ${job.name} ${size.name} ${theme}: ${e.message}`);
        }
      }
    }
  }
} catch (e) {
  failures++;
  console.error(`capture-previews: ${e.message}`);
} finally {
  await page?.close();
  rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}

// previews.json per output directory; newer entries replace older ones for the same file.
const byDir = Map.groupBy(results, (e) => dirname(resolve(e.file)));
for (const [dir, entries] of byDir) {
  const manifest = join(dir, 'previews.json');
  const prior = existsSync(manifest) ? JSON.parse(readFileSync(manifest, 'utf8')) : [];
  const files = new Set(entries.map((e) => e.file));
  writeFileSync(manifest, `${JSON.stringify([...prior.filter((e) => !files.has(e.file)), ...entries], null, 2)}\n`);
}

if (index && results.length) {
  const common = commonDir([...byDir.keys()]);
  const groups = Map.groupBy(results, (e) => toPosix(relative(common, dirname(resolve(e.file)))) || '.');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const figure = (e) =>
    `<figure><img src="${esc(toPosix(relative(common, resolve(e.file))))}" alt="${esc(basename(e.file))}">` +
    `<figcaption>${esc(basename(e.file))}</figcaption></figure>`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Preview contact sheet</title>
<style>
body{font:14px system-ui,sans-serif;margin:24px;background:#f4f4f4;color:#111}
h2{margin:32px 0 8px}.row{display:flex;gap:16px;overflow-x:auto;align-items:flex-start;padding-bottom:8px}
figure{margin:0;background:#fff;padding:8px;border:1px solid #d8d8d8}img{display:block;max-height:560px;width:auto}
figcaption{margin-top:6px;color:#444}
</style></head><body>
<h1>Preview contact sheet</h1>
<p>Generated ${esc(new Date().toISOString())} by capture-previews.mjs from the PNGs in each folder (see previews.json).</p>
${[...groups].map(([g, es]) => `<h2>${esc(g)}</h2>\n<div class="row">${es.map(figure).join('')}</div>`).join('\n')}
</body></html>
`;
  writeFileSync(join(common, 'index.html'), html);
  console.log(`index ${toPosix(relative(process.cwd(), join(common, 'index.html')))}`);
}

console.log(`capture-previews: ${results.length} image(s), ${failures} failure(s), ${page?.version ?? basename(exe)}`);
process.exit(failures ? 1 : 0);
