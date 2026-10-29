// Rejects colour literals and px/rem/em lengths in every CSS file under src/ except tokens.css (ADR-004). No dependencies.
// Usage: node scripts/check-css.mjs
import { readdirSync, readFileSync, realpathSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const APP_DIR = fileURLToPath(new URL('..', import.meta.url))
const GENERATED = 'src/styles/tokens.css'

// CSS Color 4 <named-color>. transparent, currentcolor and system colours are not named colours and stay allowed.
const NAMED_COLOURS = new Set(
  `aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood
  cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray
  darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
  darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue
  firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew
  hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan
  lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray
  lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue
  mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred
  midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid
  palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple
  rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue
  slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow
  yellowgreen`.split(/\s+/),
)

const HEX = /#[0-9a-f]{3,8}(?![\w-])/gi
const COLOUR_FUNCTION = /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi
const WORD = /(?<![\w-])[a-z]+(?![\w-])/gi
const LENGTH = /(?<![\w.-])[+-]?(?:\d+\.?\d*|\.\d+)(?:px|rem|em)(?![\w-])/gi
// The one breakpoint literal ADR-004 allows, because custom properties can't be used in media queries.
const BREAKPOINT = /\(\s*min-width\s*:\s*48rem\s*\)/gi

const blank = (text) => text.replace(/[^\n]/g, ' ')

// Blanks comments, string contents and url() contents, keeping every offset and line break.
function mask(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/(["'])((?:\\.|(?!\1)[^\\\n])*)\1/g, (_, quote, body) => quote + blank(body) + quote)
    .replace(/(url\()([^)]*)\)/gi, (_, open, body) => open + blank(body) + ')')
}

function matches(pattern, text, offset, describe) {
  return [...text.matchAll(pattern)].flatMap((m) => {
    const problem = describe(m[0])
    return problem ? [{ index: offset + m.index, problem }] : []
  })
}

const lengthProblem = (text) => `${text.replace(/^[+-]?[\d.]+/, '').toLowerCase()} length "${text}"`

// Returns [{ line, problem }] for every forbidden literal in one CSS source.
export function findForbiddenLiterals(css) {
  const masked = mask(css)
  const found = []
  let start = 0
  for (const end of [...masked.matchAll(/[{};]/g)].map((m) => m.index).concat(masked.length)) {
    const segment = masked.slice(start, end)
    if (masked[end] === '{') {
      // A selector or an at-rule prelude: only media and other at-rule conditions can hold lengths.
      if (segment.trim().startsWith('@')) found.push(...matches(LENGTH, segment.replace(BREAKPOINT, blank), start, lengthProblem))
    } else {
      const colon = segment.indexOf(':')
      if (colon !== -1) {
        const valueStart = start + colon + 1
        const value = segment.slice(colon + 1)
        found.push(
          ...matches(HEX, value, valueStart, (text) => `colour literal "${text}"`),
          ...matches(COLOUR_FUNCTION, value, valueStart, (text) => `colour literal "${text}"`),
          ...matches(WORD, value, valueStart, (text) => NAMED_COLOURS.has(text.toLowerCase()) && `named colour "${text}"`),
          ...matches(LENGTH, value, valueStart, lengthProblem),
        )
      }
    }
    start = end + 1
  }
  return found
    .sort((a, b) => a.index - b.index)
    .map(({ index, problem }) => ({ line: css.slice(0, index).split('\n').length, problem }))
}

function listCssFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return listCssFiles(path)
    return entry.name.endsWith('.css') ? [path] : []
  })
}

// Returns the exit code: 0 when every CSS file under <appDir>/src is clean, 1 otherwise.
export function main({ appDir = APP_DIR, log = console } = {}) {
  let failures = 0
  for (const file of listCssFiles(join(appDir, 'src'))) {
    const name = relative(appDir, file).split(sep).join('/')
    if (name === GENERATED) continue
    for (const { line, problem } of findForbiddenLiterals(readFileSync(file, 'utf8'))) {
      log.error(`${name}:${line}: ${problem}. Use a var(--…) from ${GENERATED} (ADR-004).`)
      failures += 1
    }
  }
  return failures === 0 ? 0 : 1
}

// Node loads the main module from its real path, but argv[1] keeps any symlink or junction, so compare real paths.
if (process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url) {
  process.exitCode = main()
}
