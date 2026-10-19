import { describe, expect, it } from 'vitest'
import { contrast, resolveColor } from './test-support/contrast'
import css from './styles.css?raw'

/** The declaration block of the first rule with this selector (a regex source), or a thrown error when there is none. */
function ruleBody(selectorPattern: string): string {
  const body = new RegExp(`${selectorPattern}\\s*\\{([^}]*)\\}`).exec(css)?.[1]
  if (body === undefined)
    throw new Error(`styles.css has no rule for ${selectorPattern}`)
  return body
}

/** The stylesheet's rules with comments removed, so prose about colours is not mistaken for a declaration. */
const rules = css.replace(/\/\*[\s\S]*?\*\//g, '')

/** The fallback of a private variable declared as `--_name: var(--wippy-form-x, fallback);` on `:host`. */
function fallbackOf(name: string): string {
  const fallback = new RegExp(`--_${name}:\\s*var\\(--wippy-form-[\\w-]+,\\s*(.*)\\);`).exec(ruleBody(':host'))?.[1]
  if (!fallback)
    throw new Error(`:host declares no fallback for --_${name}`)
  return fallback
}

describe('styles.css: the rule helpers', () => {
  it('ruleBody throws for a selector with no rule, so a missing rule cannot pass a "does not contain" assertion', () => {
    expect(() => ruleBody('\\.w-form__no-such-rule')).toThrow('no rule')
  })
})

// Error and warning text takes its colour from the theme's severity utilities
// on the text element (`lib/error-text.ts`), never from a rule here.
describe('styles.css: no rule colours error or warning text', () => {
  it('.w-form__error sets a margin and no colour', () => {
    const body = ruleBody('\\.w-form__error')
    expect(body).toMatch(/margin:/)
    expect(body).not.toMatch(/color:/)
  })

  it('has no `color` declaration that reads --_danger or a danger or warn theme colour', () => {
    // Positive control: the scan sees colour declarations.
    expect(rules).toMatch(/\bcolor:\s*var\(--_muted\)/)

    const severityColors = Array.from(rules.matchAll(/(?<![-\w])color:\s*([^;}]*)/g))
      .map(m => m[1].trim())
      .filter(value => /--_danger|--p-danger|--p-warn|--wippy-form-danger/.test(value))
    expect(severityColors).toEqual([])
  })

  it('the footer text and a missing answer take their colour from the utilities', () => {
    expect(ruleBody('\\.w-form__footer-text')).not.toMatch(/color:/)
    expect(ruleBody('\\.w-form__review-item--missing \\.w-form__review-answer')).not.toMatch(/color:/)
  })

  it('--_danger is only the border colour of a review row with a missing answer', () => {
    expect(fallbackOf('danger')).toMatch(/^var\(--p-danger-500,/)
    expect(Array.from(rules.matchAll(/([\w-]+):\s*var\(--_danger\)/g)).map(m => m[1])).toEqual(['border-color'])
    expect(ruleBody('\\.w-form__review-item--missing \\.w-form__review-edit')).toMatch(/border-color:\s*var\(--_danger\)/)
  })

  it('has no `.p-message` rule', () => {
    expect(rules).not.toMatch(/\.p-message/)
  })
})

describe('styles.css: the card colours', () => {
  it('the background is the theme content background, and the border is transparent', () => {
    expect(fallbackOf('surface')).toBe('var(--p-content-background)')
    expect(fallbackOf('border')).toBe('transparent')
  })

  it.each(['light', 'dark'] as const)('answer rows stand out from the card background in %s, and a hovered row stands out more', (mode) => {
    const surface = resolveColor(fallbackOf('surface'), mode)
    const rest = contrast(resolveColor(fallbackOf('row'), mode), surface)
    const hover = contrast(resolveColor(fallbackOf('row-hover'), mode), surface)
    expect(rest).toBeGreaterThanOrEqual(1.15)
    expect(hover).toBeGreaterThan(rest)
  })

  it.each(['light', 'dark'] as const)('the number key border is visible against an answer row in %s', (mode) => {
    expect(contrast(resolveColor(fallbackOf('key-border'), mode), resolveColor(fallbackOf('row'), mode))).toBeGreaterThanOrEqual(1.5)
  })

  // WCAG 1.4.3: text under 18px needs 4.5:1. The plain muted colour is lighter than that on the row backgrounds in the light theme.
  it.each(['light', 'dark'] as const)('muted text on an answer row reaches 4.5:1 at rest and under the pointer in %s', (mode) => {
    const text = resolveColor(fallbackOf('muted-row'), mode)
    expect(contrast(text, resolveColor(fallbackOf('row'), mode))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(text, resolveColor(fallbackOf('row-hover'), mode))).toBeGreaterThanOrEqual(4.5)
  })

  it('positive control: the plain muted colour is under 4.5:1 on a hovered row in the light theme, so the check above can fail', () => {
    const hover = resolveColor(fallbackOf('row-hover'), 'light')
    expect(contrast(resolveColor(fallbackOf('muted'), 'light'), hover)).toBeLessThan(4.5)
  })

  it.each([
    '\\.w-form__option-description',
    '\\.w-form__option-note',
    '\\.w-form__option-key',
    '\\.w-form__review-number',
    '\\.w-form__review-question',
    '\\.w-form__answer-note',
    '\\.w-form__notice',
  ])('%s reads the muted-on-row colour, because it sits on an answer row', (selector) => {
    expect(ruleBody(selector)).toMatch(/(?<![-\w])color:\s*var\(--_muted-row\)/)
  })

  it('the card pads all four sides equally', () => {
    expect(fallbackOf('pad')).toBe('10px')
    expect(ruleBody('\\.w-form')).toMatch(/padding:\s*var\(--_pad\)\s*;/)
  })
})

describe('styles.css: the number key badge', () => {
  const body = ruleBody('\\.w-form__option-key')

  it('is a fixed-height box that centers its digit on both axes', () => {
    expect(body).toMatch(/display:\s*inline-flex/)
    expect(body).toMatch(/align-items:\s*center/)
    expect(body).toMatch(/justify-content:\s*center/)
    expect(body).toMatch(/height:\s*var\(--_key\)/)
    expect(body).toMatch(/line-height:\s*1\s*;/)
  })

  it('sets the font with longhands, because `font` with a variable that may be `inherit` is invalid and falls back to the card font', () => {
    expect(body).not.toMatch(/(?<![-\w])font:/)
    expect(body).toMatch(/font-size:\s*12px/)
  })
})

// The summary's status line takes focus by script after a send. It shows the
// theme's own focus ring, and the ring hugs the text instead of spanning the card.
describe('styles.css: the status line shows the theme focus ring', () => {
  const ring = () => ruleBody('\\.w-form__status:focus-visible')

  it('takes outline width, style, colour and offset from the theme focus-ring tokens', () => {
    const body = ring()
    expect(body).toMatch(/outline-width:\s*var\(--p-focus-ring-width,/)
    expect(body).toMatch(/outline-style:\s*var\(--p-focus-ring-style,/)
    expect(body).toMatch(/outline-color:\s*var\(--wippy-form-focus,\s*var\(--p-focus-ring-color,/)
    expect(body).toMatch(/outline-offset:\s*var\(--p-focus-ring-offset,/)
  })

  it('does not fall back to the browser default or draw a fixed 2px ring', () => {
    const body = ring()
    expect(body).not.toMatch(/outline:\s*auto/)
    expect(body).not.toMatch(/outline-style:\s*auto/)
    expect(body).not.toMatch(/\b2px\s+solid\b/)
  })

  it('stays out of the card root\'s own ring rule', () => {
    expect(css).not.toMatch(/\.w-form:focus-visible\s*,/)
    expect(ruleBody('\\.w-form:focus-visible')).toMatch(/outline:\s*2px solid var\(--_focus\)/)
  })

  it('hugs its text and has rounded corners like the rows', () => {
    const body = ruleBody('\\.w-form__status')
    expect(body).toMatch(/width:\s*fit-content/)
    expect(body).toMatch(/max-width:\s*100%/)
    expect(body).toMatch(/border-radius:\s*var\(--_row-radius\)/)
  })
})
