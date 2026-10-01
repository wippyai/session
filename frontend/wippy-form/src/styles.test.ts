import { describe, expect, it } from 'vitest'
// Same `?raw`/`?inline` string-import mechanism `src/index.ts` already uses
// for this file (`import stylesText from './styles.css?inline'`) — no Node
// `fs` (this package ships browser-only code; `tsconfig.json`'s `types`
// list is `["vite/client", "@wippy-fe/proxy"]`, no `@types/node`).
import css from './styles.css?raw'

/** The declaration block for one top-level selector (given verbatim, already regex-escaped), or '' if it's not found. */
function ruleBody(selectorPattern: string): string {
  const re = new RegExp(`${selectorPattern}\\s*\\{([^}]*)\\}`)
  return re.exec(css)?.[1] ?? ''
}

// Error and warning TEXT is coloured by the theme's severity utilities on the
// text element (`ERROR_TEXT_CLASS` / `WARN_TEXT_CLASS`, asserted in the
// component tests and contrast-checked in lib/error-text.test.ts), never by a
// rule in this stylesheet: the old `--_danger` text rules were 3.6:1 on the card
// in both themes, and the theme's own `Message` colours are below 4.5:1 too. No
// `.p-*` rule may paper over the `Message` either (EE2-2461 F-RC-2).
describe('styles.css — no rule colours error or warning text', () => {
  /** The stylesheet's rules with comments removed, so prose about colours is not mistaken for a declaration. */
  const rules = css.replace(/\/\*[\s\S]*?\*\//g, '')

  it('.w-form__error (margin only) sets no color of its own', () => {
    const body = ruleBody('\\.w-form__error')
    expect(body).not.toMatch(/color:/)
    expect(body).toMatch(/margin:/)
  })

  it('has no `color` declaration that reads --_danger or a danger/warn theme colour', () => {
    // Positive control: the scan really sees colour declarations (the card's muted text).
    expect(rules).toMatch(/\bcolor:\s*var\(--_muted\)/)

    const severityTextColors = Array.from(rules.matchAll(/(?<![-\w])color:\s*([^;}]*)/g))
      .map(m => m[1].trim())
      .filter(value => /--_danger|--p-danger|--p-warn|--wippy-form-danger/.test(value))
    expect(severityTextColors).toEqual([])
  })

  it('the footer text and a missing answer take their colour from the utilities, not from their rules', () => {
    expect(ruleBody('\\.w-form__footer-text')).not.toMatch(/color:/)
    expect(ruleBody('\\.w-form__review-item--missing \\.w-form__review-answer')).not.toMatch(/color:/)
  })

  it('--_danger resolves through a semantic theme var, never a raw hex as the primary fallback, and its one use left is a border colour', () => {
    expect(ruleBody(':host')).toMatch(/--_danger:\s*var\(--wippy-form-danger,\s*var\(--p-danger-500/)
    const uses = Array.from(rules.matchAll(/([\w-]+):\s*var\(--_danger\)/g)).map(m => m[1])
    expect(uses).toEqual(['border-color'])
    expect(ruleBody('\\.w-form__review-item--missing \\.w-form__review-edit')).toMatch(/border-color:\s*var\(--_danger\)/)
  })

  it('has no `.p-message*` rule: the question card colours the text inside the Message with utilities instead', () => {
    expect(rules).not.toMatch(/\.p-message/)
  })
})
// The answered summary's status line takes focus by script after a send (so
// focus is not lost when the form swaps views). Its ring must be the theme's
// own focus ring, not the browser's default outline and not the card's heavier
// 2px selection ring, and it must hug the text instead of spanning the card
// (EE2-2461 O-RC-1).
describe('styles.css — the status line shows the theme focus ring', () => {
  const ring = () => ruleBody('\\.w-form__status:focus-visible')

  it('takes outline width, style, colour and offset from the theme focus-ring tokens', () => {
    const body = ring()
    expect(body).toMatch(/outline-width:\s*var\(--p-focus-ring-width,/)
    expect(body).toMatch(/outline-style:\s*var\(--p-focus-ring-style,/)
    expect(body).toMatch(/outline-color:\s*var\(--wippy-form-focus,\s*var\(--p-focus-ring-color,/)
    expect(body).toMatch(/outline-offset:\s*var\(--p-focus-ring-offset,/)
  })

  it('does not fall back to the browser default (`auto`) or draw a fixed 2px ring of its own', () => {
    const body = ring()
    expect(body).not.toMatch(/outline:\s*auto/)
    expect(body).not.toMatch(/outline-style:\s*auto/)
    expect(body).not.toMatch(/\b2px\s+solid\b/)
  })

  it('stays out of the card root\'s own ring rule', () => {
    expect(css).not.toMatch(/\.w-form:focus-visible\s*,/)
    expect(ruleBody('\\.w-form:focus-visible')).toMatch(/outline:\s*2px solid var\(--_focus\)/)
  })

  it('hugs its text, so the ring is not a full-width bar, and has rounded corners like the rows', () => {
    const body = ruleBody('\\.w-form__status')
    expect(body).toMatch(/width:\s*fit-content/)
    expect(body).toMatch(/max-width:\s*100%/)
    expect(body).toMatch(/border-radius:\s*var\(--_row-radius\)/)
  })
})

// The form-level description must not sit directly on the question line
// with no gap, and must read as "muted" the way the README's parts table
// documents.
describe('styles.css — the form-level description has space below it and the theme\'s muted text style', () => {
  it('.w-form__form-description sets a bottom margin, from the theme scale (not a raw pixel guess)', () => {
    const body = ruleBody('\\.w-form__form-description')
    expect(body).toMatch(/margin:\s*0\s+0\s+\d+px/)
  })

  it('.w-form__form-description reads through --_muted, matching the field-level description/hint style', () => {
    const body = ruleBody('\\.w-form__form-description')
    expect(body).toMatch(/color:\s*var\(--_muted\)/)
  })
})
