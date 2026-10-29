// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { findForbiddenLiterals, main } from './check-css.mjs'

const rule = (value) => `.box {\n  margin: ${value};\n}\n`

describe('check-css (ADR-004)', () => {
  it.each([
    ['a short hex colour', 'color: #fff', 'colour literal "#fff"'],
    ['a long hex colour', 'color: #F5F7F4', 'colour literal "#F5F7F4"'],
    ['rgb()', 'color: rgb(0 0 0)', 'colour literal "rgb("'],
    ['rgba()', 'color: rgba(0, 0, 0, 0.5)', 'colour literal "rgba("'],
    ['hsl()', 'color: hsl(220 40% 20%)', 'colour literal "hsl("'],
    ['hsla()', 'color: hsla(220, 40%, 20%, 1)', 'colour literal "hsla("'],
    ['oklch()', 'color: oklch(50% 0.1 250)', 'colour literal "oklch("'],
    ['a named colour', 'color: red', 'named colour "red"'],
    ['a named colour in any case', 'border-color: White', 'named colour "White"'],
    ['a px length', 'width: 1px', 'px length "1px"'],
    ['a zero px length', 'width: 0px', 'px length "0px"'],
    ['a rem length', 'padding: 1.5rem', 'rem length "1.5rem"'],
    ['an em length', 'letter-spacing: 0.2em', 'em length "0.2em"'],
    ['a negative length', 'margin: -1rem', 'rem length "-1rem"'],
    ['a length inside calc()', 'width: calc(100% - .5rem)', 'rem length ".5rem"'],
    ['a length in a custom property', '--gap: 4px', 'px length "4px"'],
  ])('AC-3: rejects %s', (_, declaration, problem) => {
    expect(findForbiddenLiterals(`.box {\n  ${declaration};\n}\n`)).toEqual([{ line: 2, problem }])
  })

  it('AC-3: rejects a media query at any width other than 48rem', () => {
    expect(findForbiddenLiterals('@media (min-width: 40rem) {\n  .box { margin: 0; }\n}\n')).toEqual([
      { line: 1, problem: 'rem length "40rem"' },
    ])
  })

  it.each([
    ['0', '0'],
    ['percentages', '50% 12.5%'],
    ['fr', '1fr 2fr'],
    ['auto', 'auto'],
    ['tokens through var()', 'var(--space-4) var(--layout-gutter)'],
    ['calc() over tokens', 'calc(var(--space-4) * 2)'],
    ['transparent and currentcolor, which are not named colours', 'transparent currentcolor'],
    ['unitless numbers', '1.5'],
  ])('AC-3: allows %s', (_, value) => {
    expect(findForbiddenLiterals(rule(value))).toEqual([])
  })

  it('AC-3: allows the breakpoint media query (min-width: 48rem)', () => {
    expect(findForbiddenLiterals('@media (min-width: 48rem) {\n  .box { margin: 0; }\n}\n')).toEqual([])
    expect(findForbiddenLiterals('.box {\n  @media (min-width:48rem) { margin: auto; }\n}\n')).toEqual([])
  })

  it('AC-3: ignores selectors, property names, comments and strings', () => {
    const css = [
      '/* #fff 1px red */',
      '#add, .red, .white-box > a:hover {',
      '  white-space: nowrap;',
      '  font-family: "Times New Roman", serif;',
      "  content: '1px red';",
      '  background: url(red.png);',
      '}',
    ].join('\n')
    expect(findForbiddenLiterals(css)).toEqual([])
  })

  it('AC-3: reports each literal on its own line', () => {
    const css = '.a {\n  margin: 0;\n  color: #000;\n}\n\n.b {\n  padding: 1rem 2px;\n}\n'
    expect(findForbiddenLiterals(css)).toEqual([
      { line: 3, problem: 'colour literal "#000"' },
      { line: 7, problem: 'rem length "1rem"' },
      { line: 7, problem: 'px length "2px"' },
    ])
  })
})

describe('check-css main (ADR-004)', () => {
  let appDir
  const messages = []
  const log = { error: (m) => messages.push(m) }
  const write = (name, css) => {
    const path = join(appDir, name)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, css)
  }

  beforeEach(() => {
    appDir = mkdtempSync(join(tmpdir(), 'shelf-css-'))
    write('src/styles/tokens.css', ':root {\n  --space-4: 1rem;\n  --color-text-primary: #1B2140;\n}\n')
    messages.length = 0
  })

  afterEach(() => rmSync(appDir, { recursive: true, force: true }))

  it('ADR-004: allows literals in tokens.css and passes clean CSS', () => {
    write('src/styles/base.css', 'body {\n  color: var(--color-text-primary);\n}\n')
    expect(main({ appDir, log })).toBe(0)
    expect(messages).toEqual([])
  })

  it('AC-3: fails naming the file and line of every literal, in any folder under src', () => {
    write('src/components/PageFrame.module.css', '.sheet {\n  padding: 0;\n  border-left: 2px solid #E39AAE;\n}\n')
    expect(main({ appDir, log })).toBe(1)
    expect(messages).toEqual([
      expect.stringMatching(/^src\/components\/PageFrame\.module\.css:3: px length "2px"/),
      expect.stringMatching(/^src\/components\/PageFrame\.module\.css:3: colour literal "#E39AAE"/),
    ])
  })

  it('AC-3: the CSS under app/src passes', () => {
    expect(main({ log })).toBe(0)
    expect(messages).toEqual([])
  })
})

describe('check-css command line (ADR-004)', () => {
  let dir

  // A copy of the script in a throwaway app with one literal, and a symlink (a junction on Windows) to it.
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'shelf-css-cli-'))
    const real = join(dir, 'real')
    mkdirSync(join(real, 'scripts'), { recursive: true })
    mkdirSync(join(real, 'src'), { recursive: true })
    copyFileSync(fileURLToPath(new URL('./check-css.mjs', import.meta.url)), join(real, 'scripts/check-css.mjs'))
    writeFileSync(join(real, 'src/bad.css'), '.a {\n  color: red;\n}\n')
    symlinkSync(real, join(dir, 'link'), 'junction')
  })

  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it.each([
    ['directly', 'real'],
    ['through a symlink or junction', 'link'],
  ])('AC-3: exits 1 and names the literal when the script is run %s', (_, root) => {
    const result = spawnSync(process.execPath, [join(dir, root, 'scripts/check-css.mjs')], { encoding: 'utf8' })
    expect(result.stderr).toMatch(/src\/bad\.css:2: named colour "red"/)
    expect(result.status).toBe(1)
  })
})
