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
describe('styles.css — length-error text uses the theme error token, not the default text color', () => {
  it('.w-form__error sets color to the shared --_danger token', () => {
    const body = ruleBody('\\.w-form__error')
    expect(body).toMatch(/color:\s*var\(--_danger\)/)
  })

  it('--_danger itself resolves through a semantic theme var, never a raw hex as the primary fallback (existing contract)', () => {
    const body = ruleBody(':host')
    expect(body).toMatch(/--_danger:\s*var\(--wippy-form-danger,\s*var\(--p-danger-500/)
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
