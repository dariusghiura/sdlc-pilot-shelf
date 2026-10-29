// Turns docs/design/tokens.json into src/styles/tokens.css (ADR-004). No dependencies.
// Usage: node scripts/build-tokens.mjs [--check]
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const TOKENS_PATH = fileURLToPath(new URL('../../docs/design/tokens.json', import.meta.url))
export const CSS_PATH = fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url))
const CSS_NAME = 'src/styles/tokens.css'

const isToken = (node) => node !== null && typeof node === 'object' && '$value' in node
const childKeys = (node) => Object.keys(node).filter((key) => !key.startsWith('$'))

function findNode(tokens, path) {
  let node = tokens
  for (const key of path.split('.')) {
    if (node === null || typeof node !== 'object' || !(key in node)) return undefined
    node = node[key]
  }
  return node
}

// Rule 1: resolve {a.b} aliases to their final value.
function resolveValue(tokens, value, seen = []) {
  if (typeof value !== 'string') return value
  const alias = /^\{([^{}]+)\}$/.exec(value)
  if (!alias) {
    if (value.includes('{')) throw new Error(`Unsupported partial alias in "${value}"`)
    return value
  }
  const path = alias[1]
  if (seen.includes(path)) throw new Error(`Circular alias: ${[...seen, path].join(' -> ')}`)
  const target = findNode(tokens, path)
  if (!isToken(target)) throw new Error(`Alias {${path}} does not name a token`)
  return resolveValue(tokens, target.$value, [...seen, path])
}

// Rule 6: font-family lists become a comma list; numbers stay unitless; dimensions keep their units.
function formatValue(value) {
  if (Array.isArray(value)) return value.map((name) => (/\s/.test(name) ? `"${name}"` : name)).join(', ')
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  throw new Error(`Unsupported token value ${JSON.stringify(value)}`)
}

// Rule 4: a group whose children are exactly narrow and wide tokens.
const isResponsivePair = (node) => {
  const keys = childKeys(node)
  return keys.length === 2 && isToken(node.narrow) && isToken(node.wide)
}

// Walks a group; paths listed in skip (dotted, from the top) are left out.
function collect(tokens, node, path, out, skip = []) {
  for (const key of childKeys(node)) {
    const child = node[key]
    const childPath = [...path, key]
    if (skip.includes(childPath.join('.'))) continue
    const name = `--${childPath.join('-')}`
    if (isToken(child)) {
      out.root.push([name, formatValue(resolveValue(tokens, child.$value))])
    } else if (isResponsivePair(child)) {
      out.root.push([name, formatValue(resolveValue(tokens, child.narrow.$value))])
      out.wide.push([name, formatValue(resolveValue(tokens, child.wide.$value))])
    } else {
      collect(tokens, child, childPath, out, skip)
    }
  }
}

function themeRoles(tokens, theme) {
  const out = { root: [], wide: [] }
  collect(tokens, theme, ['color'], out)
  if (out.wide.length > 0) throw new Error('Responsive theme roles are not supported')
  return out.root
}

export function buildTokensCss(tokens) {
  const version = tokens.$extensions?.sdlc?.version
  if (!version) throw new Error('tokens.json has no $extensions.sdlc.version')
  const breakpoint = resolveValue(tokens, findNode(tokens, 'layout.breakpoint')?.$value)
  if (!breakpoint) throw new Error('tokens.json has no layout.breakpoint')

  // Rule 3: theme roles become --color-<path>, light on :root and dark under prefers-color-scheme.
  const { light, dark, ...otherThemes } = tokens.theme ?? {}
  if (!light || !dark || childKeys(otherThemes).length > 0) throw new Error('tokens.json must have exactly theme.light and theme.dark')
  const lightRoles = themeRoles(tokens, light)
  const darkRoles = themeRoles(tokens, dark)
  const lightNames = lightRoles.map(([name]) => name).join()
  if (lightNames !== darkRoles.map(([name]) => name).join()) throw new Error('theme.light and theme.dark must have identical paths')

  // Rules 2, 4 and 5: everything outside theme and color.palette keeps its path as its name.
  const out = { root: [], wide: [] }
  collect(tokens, tokens, [], out, ['theme', 'color.palette'])

  const lines = (entries, indent) => entries.map(([name, value]) => `${indent}${name}: ${value};`)
  return [
    `/* Generated from TOKENS v${version} (docs/design/tokens.json) by scripts/build-tokens.mjs. Do not edit: run npm run tokens. */`,
    '',
    ':root {',
    '  color-scheme: light;',
    ...lines(lightRoles, '  '),
    ...lines(out.root, '  '),
    '}',
    '',
    '@media (prefers-color-scheme: dark) {',
    '  :root {',
    '    color-scheme: dark;',
    ...lines(darkRoles, '    '),
    '  }',
    '}',
    '',
    `@media (min-width: ${breakpoint}) {`,
    '  :root {',
    ...lines(out.wide, '    '),
    '  }',
    '}',
    '',
  ].join('\n')
}

const normalise = (text) => text.replace(/\r\n/g, '\n')

// Returns the exit code: 0 when written or up to date, 1 when --check finds the CSS stale.
export function main({ check = false, tokensPath = TOKENS_PATH, cssPath = CSS_PATH, log = console } = {}) {
  const css = buildTokensCss(JSON.parse(readFileSync(tokensPath, 'utf8')))
  if (!check) {
    writeFileSync(cssPath, css)
    log.log(`Wrote ${CSS_NAME}`)
    return 0
  }
  let current
  try {
    current = readFileSync(cssPath, 'utf8')
  } catch {
    current = undefined
  }
  if (current !== undefined && normalise(current) === css) return 0
  log.error(`${CSS_NAME} is ${current === undefined ? 'missing' : 'stale'}: it differs from what docs/design/tokens.json produces. Run npm run tokens.`)
  return 1
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = main({ check: process.argv.includes('--check') })
}
