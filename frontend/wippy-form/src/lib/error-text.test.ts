import messageCss from '@wippy-fe/theme/primevue/message.css?raw'
import tokensRaw from '@wippy-fe/theme/tokens.json?raw'
import { describe, expect, it } from 'vitest'
import { ERROR_TEXT_CLASS, WARN_TEXT_CLASS } from './error-text'

/**
 * Contrast of the severity text steps in `lib/error-text.ts`, computed from the
 * theme's own tokens (`@wippy-fe/theme/tokens.json`) and the `Message` box
 * tints in the theme's `primevue/message.css`, with the same WCAG 2.x relative
 * luminance formula the EE2-2461 re-check used. No browser is involved, so the
 * card backgrounds come from the re-check's screenshots:
 *
 *  - light card rgb(251,247,255), dark card rgb(54,41,63) (the dark one is
 *    back-solved from the re-check's measured box colour rgb(82,45,64)).
 *
 * "Calibration" below proves the arithmetic by reproducing three values the
 * re-check MEASURED for the colours the theme's `Message` uses (3.56, 2.1, 3.9),
 * so a passing step here is a real 4.5:1 and not a modelling artefact.
 */

type Rgb = [number, number, number]
type Mode = 'light' | 'dark'

const LIGHT_CARD: Rgb = [251, 247, 255]
const DARK_CARD: Rgb = [54, 41, 63]
const WHITE: Rgb = [255, 255, 255]
const BLACK: Rgb = [0, 0, 0]
const MIN_CONTRAST = 4.5

const tokens = new Map((JSON.parse(tokensRaw).tokens as Array<{ name: string, light: string, dark: string }>).map(t => [t.name, t]))

function mix(a: Rgb, b: Rgb, weightOfA: number): Rgb {
  return a.map((v, i) => v * weightOfA + b[i] * (1 - weightOfA)) as Rgb
}

/** A theme colour token for one mode: `rgb()`, an alias `var()`, or `color-mix(in srgb, var() N%, white|black)`. */
function colorOf(name: string, mode: Mode): Rgb {
  const token = tokens.get(name)
  if (!token)
    throw new Error(`theme has no token ${name}`)
  const value = token[mode]
  const rgb = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(value)
  if (rgb)
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  const alias = /^var\((--[\w-]+)\)$/.exec(value)
  if (alias)
    return colorOf(alias[1], mode)
  const colorMix = /^color-mix\(in srgb, var\((--[\w-]+)\) (\d+)%, (white|black)\)$/.exec(value)
  if (colorMix)
    return mix(colorOf(colorMix[1], mode), colorMix[3] === 'white' ? WHITE : BLACK, Number(colorMix[2]) / 100)
  throw new Error(`cannot resolve ${name}: ${value}`)
}

function luminance([r, g, b]: Rgb): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** `text-warn-700` -> the colour of `--p-warn-700`; `dark:` classes resolve in dark mode. */
function textColor(utility: string): { family: string, color: Rgb, mode: Mode } {
  const match = /^(dark:)?text-(\w+)-(\d+)$/.exec(utility)
  if (!match)
    throw new Error(`not a severity text utility: ${utility}`)
  const mode: Mode = match[1] ? 'dark' : 'light'
  return { family: match[2], color: colorOf(`--p-${match[2]}-${match[3]}`, mode), mode }
}

/** The body of one `.p-message-*` rule in the theme's message.css. */
function messageRule(selector: string): string {
  const escaped = selector.replaceAll('.', '\\.')
  const match = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(messageCss)
  if (!match)
    throw new Error(`message.css has no rule ${selector}`)
  return match[1]
}

/** The `Message` box colour a severity draws over the card, in one mode, from the theme's `bg-<family>-<step>/<alpha>` utilities. */
function boxColor(messageClass: string, family: string, mode: Mode): Rgb {
  const body = messageRule(`.p-message-${messageClass}`)
  const utility = mode === 'dark'
    ? new RegExp(`dark:bg-${family}-(\\d+)/(\\d+)`).exec(body)
    : new RegExp(`(?<![:\\w-])bg-${family}-(\\d+)/(\\d+)`).exec(body)
  if (!utility)
    throw new Error(`no ${mode} box in .p-message-${messageClass}`)
  return mix(colorOf(`--p-${family}-${utility[1]}`, mode), mode === 'dark' ? DARK_CARD : LIGHT_CARD, Number(utility[2]) / 100)
}

/** The backgrounds one severity's text sits on in one mode: the bare card and the Message box over it. */
function backgrounds(messageClass: string, family: string, mode: Mode): Array<{ name: string, color: Rgb }> {
  return [
    { name: `${mode} card`, color: mode === 'dark' ? DARK_CARD : LIGHT_CARD },
    { name: `${mode} ${messageClass} Message box`, color: boxColor(messageClass, family, mode) },
  ]
}

const SEVERITIES = [
  { label: 'ERROR_TEXT_CLASS', classes: ERROR_TEXT_CLASS, messageClass: 'error', family: 'danger' },
  { label: 'WARN_TEXT_CLASS', classes: WARN_TEXT_CLASS, messageClass: 'warn', family: 'warn' },
]

describe('error text contrast, computed from the theme tokens', () => {
  describe('calibration against what the EE2-2461 re-check measured', () => {
    it('reproduces the theme Message colours that failed: field error 3.56 (light) and 2.1 (dark), warn banner 3.9 (dark)', () => {
      const lightFieldError = contrast(colorOf('--p-danger-500', 'light'), LIGHT_CARD)
      expect(lightFieldError).toBeCloseTo(3.56, 1)

      const darkFieldError = contrast(colorOf('--p-danger-600', 'dark'), boxColor('error', 'danger', 'dark'))
      expect(darkFieldError).toBeCloseTo(2.1, 1)

      const darkWarnBanner = contrast(colorOf('--p-warn-500', 'dark'), boxColor('warn', 'warn', 'dark'))
      expect(darkWarnBanner).toBeCloseTo(3.9, 1)
    })

    it('reproduces what the fields form\'s own danger text measured on the card: 5.19 (light) and 7.82 (dark)', () => {
      // The dark card colour is back-solved from a screenshot, so allow the rounding that costs.
      expect(Math.abs(contrast(textColor('text-danger-600').color, LIGHT_CARD) - 5.19)).toBeLessThan(0.1)
      expect(Math.abs(contrast(textColor('dark:text-danger-400').color, DARK_CARD) - 7.82)).toBeLessThan(0.15)
    })

    it('comes out below 4.5 for the retryable banner\'s theme colour in light too (warn-600, which the re-check did not measure)', () => {
      expect(contrast(colorOf('--p-warn-600', 'light'), boxColor('warn', 'warn', 'light'))).toBeLessThan(MIN_CONTRAST)
    })
  })

  describe.each(SEVERITIES)('$label ($classes)', ({ classes, messageClass, family }) => {
    it('is one light step and one dark step of its own severity family', () => {
      const [light, dark] = classes.split(' ').map(textColor)
      expect(classes).toMatch(new RegExp(`^text-${family}-\\d+ dark:text-${family}-\\d+$`))
      expect(light.mode).toBe('light')
      expect(dark.mode).toBe('dark')
    })

    it.each(['light', 'dark'] as const)('is at least 4.5:1 in %s on the card and on the Message box', (mode) => {
      const utility = classes.split(' ').map(textColor).find(t => t.mode === mode)
      if (!utility)
        throw new Error(`no ${mode} step in ${classes}`)
      for (const bg of backgrounds(messageClass, family, mode))
        expect(contrast(utility.color, bg.color), `${classes} in ${bg.name}`).toBeGreaterThanOrEqual(MIN_CONTRAST)
    })
  })

  it('picks the step that passes: one step lighter in light (or darker in dark) than each constant would fail or add nothing', () => {
    // WARN light is `warn-700` because `warn-600` is 4.0:1 on the warn box.
    expect(contrast(colorOf('--p-warn-600', 'light'), boxColor('warn', 'warn', 'light'))).toBeLessThan(MIN_CONTRAST)
    expect(contrast(colorOf('--p-warn-700', 'light'), boxColor('warn', 'warn', 'light'))).toBeGreaterThanOrEqual(MIN_CONTRAST)
    // WARN dark is `warn-400` because `warn-500` is 3.9:1 on the warn box.
    expect(contrast(colorOf('--p-warn-500', 'dark'), boxColor('warn', 'warn', 'dark'))).toBeLessThan(MIN_CONTRAST)
    expect(contrast(colorOf('--p-warn-400', 'dark'), boxColor('warn', 'warn', 'dark'))).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })
})
