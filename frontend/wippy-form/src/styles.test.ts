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

// The note-too-long and Other-too-long alerts must not read as plain body
// text with no error styling. They render through the shared `error`
// part/class — both the plain `<p role="alert">` length errors AND the
// question-level `Message severity="error"` share `.w-form__error`
// (question-card-option.vue, question-card-question.vue). The styling must
// not touch id-linked DOM structure (the note/Other alerts' aria-describedby
// linking relies on those staying plain `<p :id>` elements, not PrimeVue
// `Message`s, whose `inheritAttrs: false` would silently drop that `id`) —
// so this is styled with the same danger token the rest of the card already
// uses for errors (`.w-form__footer-text`, `.w-form__review-item--missing
// .w-form__review-answer`), not a local color hack.
//
// `color` is scoped to `:not(.p-message)`: a `Message` already carries its
// own severity color from the theme's `.p-message-error`/`.p-message-simple`
// classes, so adding a second, competing `color` here would be exactly the
// raw-theme-fighting the compliance rules reject. The theme's own Message
// colors are below 4.5:1 in at least one theme (see the comment at the rule
// itself for the audited numbers); the question card fixes the text inside its
// Messages with the theme's severity utilities instead (`ERROR_TEXT_CLASS`,
// asserted in question-card-errors.test.ts), never with a `.p-*` rule.
describe('styles.css — length-error text uses the theme error token, not the default text color', () => {
  it('.w-form__error (margin only) sets no color of its own', () => {
    const body = ruleBody('\\.w-form__error')
    expect(body).not.toMatch(/color:/)
    expect(body).toMatch(/margin:/)
  })

  it('.w-form__error:not(.p-message) sets color to the shared --_danger token — the plain role="alert" case, never a Message', () => {
    const body = ruleBody('\\.w-form__error:not\\(\\.p-message\\)')
    expect(body).toMatch(/color:\s*var\(--_danger\)/)
  })

  it('--_danger itself resolves through a semantic theme var, never a raw hex as the primary fallback (existing contract)', () => {
    const body = ruleBody(':host')
    expect(body).toMatch(/--_danger:\s*var\(--wippy-form-danger,\s*var\(--p-danger-500/)
  })
})

describe('styles.css — no rule fights the theme\'s Message colours', () => {
  it('has no `.p-message*` rule (the question card colours the text inside the Message with utilities instead); only the `:not(.p-message)` guard on the plain alerts', () => {
    const rules = css.replace(/\/\*[\s\S]*?\*\//g, '')
    expect(rules).toMatch(/:not\(\.p-message\)/)
    expect(rules.replace(/:not\(\.p-message\)/g, '')).not.toMatch(/\.p-message/)
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
