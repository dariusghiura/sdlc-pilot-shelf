// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildTokensCss, CSS_PATH, main, TOKENS_PATH } from './build-tokens.mjs'

const fixture = () => ({
  $description: 'Fixture tokens',
  $extensions: { sdlc: { id: 'TOKENS', version: '9.9.9' } },
  color: {
    $type: 'color',
    palette: {
      paper: { $value: '#F5F7F4' },
      ink: { $value: '#1B2140' },
      night: { $value: '#141A2C' },
      'ink-pale': { $value: '#E7E9F1' },
    },
  },
  theme: {
    light: {
      $type: 'color',
      surface: { page: { $value: '{color.palette.paper}', $description: 'Page background.' } },
      text: { primary: { $value: '{color.palette.ink}' } },
    },
    dark: {
      $type: 'color',
      surface: { page: { $value: '{color.palette.night}' } },
      text: { primary: { $value: '{color.palette.ink-pale}' } },
    },
  },
  font: {
    family: { $type: 'fontFamily', body: { $value: ['Literata', 'Times New Roman', 'serif'] } },
    weight: { $type: 'fontWeight', reading: { $value: 650 } },
    size: { $type: 'dimension', title: { narrow: { $value: '1.375rem' }, wide: { $value: '1.75rem' } } },
    'line-height': { $type: 'number', title: { $value: 1.25 } },
  },
  space: { $type: 'dimension', 4: { $value: '1rem' } },
  layout: {
    $type: 'dimension',
    breakpoint: { $value: '48rem' },
    'margin-inset': { $value: '{layout.inset-source}' },
    'inset-source': { $value: '{space.4}' },
  },
})

// The block that a selector or at-rule opens, up to its closing brace at the same indent.
const block = (css, opening) => {
  const start = css.indexOf(opening)
  expect(start, `${opening} is missing`).not.toBe(-1)
  return css.slice(start, css.indexOf('\n}', start) + 2)
}
const rootBlock = (css) => block(css, ':root {')
const darkBlock = (css) => block(css, '@media (prefers-color-scheme: dark) {')
const wideBlock = (css) => block(css, '@media (min-width: 48rem) {')

describe('build-tokens (ADR-004)', () => {
  it('ADR-004: starts with a "generated from TOKENS v<version>, do not edit" header', () => {
    const firstLine = buildTokensCss(fixture()).split('\n')[0]
    expect(firstLine).toMatch(/^\/\* Generated from TOKENS v9\.9\.9 .*Do not edit/)
  })

  it('ADR-004 rule 1: resolves aliases, including aliases of aliases', () => {
    const css = buildTokensCss(fixture())
    expect(rootBlock(css)).toContain('--color-surface-page: #F5F7F4;')
    expect(rootBlock(css)).toContain('--layout-margin-inset: 1rem;')
    expect(css).not.toMatch(/\{[a-z]/)
  })

  it('ADR-004 rule 1: rejects an alias to a missing token and a circular alias', () => {
    const missing = fixture()
    missing.space[4].$value = '{space.99}'
    expect(() => buildTokensCss(missing)).toThrow('Alias {space.99} does not name a token')
    const circular = fixture()
    circular.layout['inset-source'].$value = '{layout.margin-inset}'
    expect(() => buildTokensCss(circular)).toThrow('Circular alias')
  })

  it('ADR-004 rule 2: emits no color.palette property', () => {
    const css = buildTokensCss(fixture())
    expect(css).not.toMatch(/--color-palette/)
    expect(css).not.toMatch(/--color-(paper|ink|night)\b/)
  })

  it('ADR-004 rule 3: maps theme.light to --color-* on :root with color-scheme light', () => {
    const root = rootBlock(buildTokensCss(fixture()))
    expect(root).toContain('color-scheme: light;')
    expect(root).toContain('--color-text-primary: #1B2140;')
  })

  it('ADR-004 rule 3: redefines the same names for theme.dark under prefers-color-scheme: dark with color-scheme dark', () => {
    const dark = darkBlock(buildTokensCss(fixture()))
    expect(dark).toContain('  :root {\n    color-scheme: dark;')
    expect(dark).toContain('--color-surface-page: #141A2C;')
    expect(dark).toContain('--color-text-primary: #E7E9F1;')
    expect(dark).not.toContain('--font-')
  })

  it('ADR-004 rule 3: rejects themes whose paths differ', () => {
    const tokens = fixture()
    delete tokens.theme.dark.text
    expect(() => buildTokensCss(tokens)).toThrow('identical paths')
  })

  it('ADR-004 rule 4: emits a responsive pair once with a 48rem override', () => {
    const css = buildTokensCss(fixture())
    expect(css.match(/--font-size-title:/g)).toHaveLength(2)
    expect(rootBlock(css)).toContain('--font-size-title: 1.375rem;')
    expect(wideBlock(css)).toContain('--font-size-title: 1.75rem;')
    expect(css).not.toMatch(/--font-size-title-(narrow|wide)/)
  })

  it('ADR-004 rule 4: takes the override breakpoint from layout.breakpoint', () => {
    const tokens = fixture()
    tokens.layout.breakpoint.$value = '50rem'
    expect(buildTokensCss(tokens)).toContain('@media (min-width: 50rem) {')
  })

  it('ADR-004 rule 5: names every other token after its path', () => {
    const root = rootBlock(buildTokensCss(fixture()))
    expect(root).toContain('--space-4: 1rem;')
    expect(root).toContain('--font-weight-reading: 650;')
    expect(root).toContain('--font-line-height-title: 1.25;')
    expect(root).toContain('--layout-breakpoint: 48rem;')
  })

  it('ADR-004 rule 6: writes font families as a comma list, quoting names with spaces', () => {
    expect(buildTokensCss(fixture())).toContain('--font-family-body: Literata, "Times New Roman", serif;')
  })

  it('ADR-004 rule 6: keeps numbers unitless and dimensions with their units, and ignores $description and $extensions', () => {
    const css = buildTokensCss(fixture())
    expect(css).toContain('--font-weight-reading: 650;')
    expect(css).toContain('--font-size-title: 1.375rem;')
    expect(css).not.toMatch(/description|extensions|Page background|sdlc/)
  })

  it('AC-1: defines every non-palette token of TOKENS v1.0.0', () => {
    const tokens = JSON.parse(readFileSync(TOKENS_PATH, 'utf8'))
    const css = buildTokensCss(tokens)
    const expected = []
    const walk = (node, path) => {
      for (const [key, child] of Object.entries(node)) {
        if (key.startsWith('$')) continue
        const childPath = [...path, key]
        if (childPath.join('.') === 'color.palette') continue
        if ('$value' in child) expected.push(childPath)
        else walk(child, childPath)
      }
    }
    walk(tokens, [])
    expect(expected.length).toBeGreaterThan(60)
    for (const path of expected) {
      const [first, theme, ...rest] = path
      const names =
        first === 'theme' ? ['color', ...rest] : ['narrow', 'wide'].includes(path.at(-1)) ? path.slice(0, -1) : path
      const target = first === 'theme' && theme === 'dark' ? darkBlock(css) : path.at(-1) === 'wide' ? wideBlock(css) : rootBlock(css)
      expect(target, path.join('.')).toContain(`--${names.join('-')}: `)
    }
  })
})

describe('build-tokens main and --check (ADR-004)', () => {
  let dir
  let tokensPath
  let cssPath
  const messages = []
  const log = { log: (m) => messages.push(m), error: (m) => messages.push(m) }

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'shelf-tokens-'))
    tokensPath = join(dir, 'tokens.json')
    cssPath = join(dir, 'tokens.css')
    writeFileSync(tokensPath, JSON.stringify(fixture()))
    messages.length = 0
  })

  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it('npm run tokens: writes tokens.css and exits 0', () => {
    expect(main({ tokensPath, cssPath, log })).toBe(0)
    expect(readFileSync(cssPath, 'utf8')).toBe(buildTokensCss(fixture()))
  })

  it('ADR-004 --check: exits 0 when tokens.css is up to date, also with CRLF line endings', () => {
    writeFileSync(cssPath, buildTokensCss(fixture()).replace(/\n/g, '\r\n'))
    expect(main({ check: true, tokensPath, cssPath, log })).toBe(0)
    expect(messages).toEqual([])
  })

  it('AC-2: --check exits 1 and names tokens.css when it is stale, without rewriting it', () => {
    writeFileSync(cssPath, buildTokensCss(fixture()).replace('1rem', '2rem'))
    const before = readFileSync(cssPath, 'utf8')
    expect(main({ check: true, tokensPath, cssPath, log })).toBe(1)
    expect(messages.join('\n')).toMatch(/src\/styles\/tokens\.css is stale/)
    expect(readFileSync(cssPath, 'utf8')).toBe(before)
  })

  it('AC-2: --check exits 1 and names tokens.css when it is missing', () => {
    expect(main({ check: true, tokensPath, cssPath, log })).toBe(1)
    expect(messages.join('\n')).toMatch(/src\/styles\/tokens\.css is missing/)
  })

  it('AC-2: the committed tokens.css matches TOKENS (the CLI exits 0 with --check)', () => {
    const script = fileURLToPath(new URL('./build-tokens.mjs', import.meta.url))
    const result = spawnSync(process.execPath, [script, '--check'], { encoding: 'utf8' })
    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
    expect(readFileSync(CSS_PATH, 'utf8').replace(/\r\n/g, '\n')).toBe(buildTokensCss(JSON.parse(readFileSync(TOKENS_PATH, 'utf8'))))
  })
})

describe('build-tokens command line (ADR-004)', () => {
  let dir

  // A copy of the script in a throwaway checkout with a stale tokens.css, and a symlink (a junction on Windows) to it.
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'shelf-tokens-cli-'))
    const real = join(dir, 'real')
    mkdirSync(join(real, 'docs/design'), { recursive: true })
    mkdirSync(join(real, 'app/scripts'), { recursive: true })
    mkdirSync(join(real, 'app/src/styles'), { recursive: true })
    writeFileSync(join(real, 'docs/design/tokens.json'), JSON.stringify(fixture()))
    copyFileSync(fileURLToPath(new URL('./build-tokens.mjs', import.meta.url)), join(real, 'app/scripts/build-tokens.mjs'))
    writeFileSync(join(real, 'app/src/styles/tokens.css'), buildTokensCss(fixture()).replace('1rem', '2rem'))
    symlinkSync(real, join(dir, 'link'), 'junction')
  })

  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it.each([
    ['directly', 'real'],
    ['through a symlink or junction', 'link'],
  ])('AC-2: --check exits 1 on a stale tokens.css when the script is run %s', (_, root) => {
    const result = spawnSync(process.execPath, [join(dir, root, 'app/scripts/build-tokens.mjs'), '--check'], { encoding: 'utf8' })
    expect(result.stderr).toMatch(/src\/styles\/tokens\.css is stale/)
    expect(result.status).toBe(1)
  })
})
