import tokensRaw from '@wippy-fe/theme/tokens.json?raw'

export type Rgb = [number, number, number]
export type Mode = 'light' | 'dark'

const WHITE: Rgb = [255, 255, 255]
const BLACK: Rgb = [0, 0, 0]

const tokens = new Map((JSON.parse(tokensRaw).tokens as Array<{ name: string, light: string, dark: string }>).map(t => [t.name, t]))

export function mix(a: Rgb, b: Rgb, weightOfA: number): Rgb {
  return a.map((v, i) => v * weightOfA + b[i] * (1 - weightOfA)) as Rgb
}

/** Splits `a, b(c, d), e` at the commas that are not inside parentheses. */
function splitTopLevel(text: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(')
      depth++
    else if (text[i] === ')')
      depth--
    else if (text[i] === ',' && depth === 0) {
      parts.push(text.slice(start, i).trim())
      start = i + 1
    }
  }
  parts.push(text.slice(start).trim())
  return parts
}

/**
 * Resolves a colour the theme uses for one mode: `#hex`, `rgb()`, `white`,
 * `black`, `var(--p-token)` (read from the theme's tokens.json) and
 * `color-mix(in srgb, A n%, B)` over any of those.
 */
export function resolveColor(expr: string, mode: Mode): Rgb {
  const value = expr.trim()
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value)
  if (hex) {
    const digits = hex[1].length === 3 ? hex[1].replaceAll(/./g, c => c + c) : hex[1]
    return [0, 2, 4].map(i => Number.parseInt(digits.slice(i, i + 2), 16)) as Rgb
  }
  const rgb = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(value)
  if (rgb)
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  if (value === 'white')
    return WHITE
  if (value === 'black')
    return BLACK
  const variable = /^var\((--[\w-]+)\)$/.exec(value)
  if (variable) {
    const token = tokens.get(variable[1])
    if (!token)
      throw new Error(`theme has no token ${variable[1]}`)
    return resolveColor(token[mode], mode)
  }
  const colorMix = /^color-mix\(in srgb,(.*)\)$/.exec(value)
  if (colorMix) {
    const [first, second] = splitTopLevel(colorMix[1])
    const weighted = /^(.*\S)\s+(\d+(?:\.\d+)?)%$/.exec(first)
    if (!weighted)
      throw new Error(`color-mix needs a percentage on its first colour: ${value}`)
    return mix(resolveColor(weighted[1], mode), resolveColor(second, mode), Number(weighted[2]) / 100)
  }
  throw new Error(`cannot resolve ${value}`)
}

function luminance([r, g, b]: Rgb): number {
  const linear = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

/** WCAG 2.x contrast ratio between two colours. */
export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
