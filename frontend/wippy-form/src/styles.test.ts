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
// raw-theme-fighting the compliance rules reject — and would not even help,
// since the theme's own colors there are themselves below 4.5:1 in both
// themes (see the comment at the rule itself for the audited numbers).
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

// The fields form reads the same tokens as the card; only the space between
// fields and the label weight are new tokens. Each is a public
// `--wippy-form-*` token read through a private `--_x`, like the rest.
describe('styles.css — fields form tokens and parts', () => {
  it('reads the field gap and the label weight through public tokens', () => {
    const body = ruleBody(':host')
    expect(body).toMatch(/--_field-gap:\s*var\(--wippy-form-field-gap,\s*var\(--_d-field-gap\)\)/)
    expect(body).toMatch(/--_label-weight:\s*var\(--wippy-form-label-weight,\s*500\)/)
  })

  it('has a wider field gap at comfortable density', () => {
    const body = ruleBody(':host\\(\\[density=\'comfortable\'\\]\\)')
    expect(body).toMatch(/--_d-field-gap:\s*20px/)
  })

  it('spaces fields with the token, and sets the label weight from it', () => {
    expect(ruleBody('\\.w-form__fields')).toMatch(/gap:\s*var\(--_field-gap\)/)
    expect(ruleBody('\\.w-form__field-label')).toMatch(/font-weight:\s*var\(--_label-weight\)/)
  })

  it('draws the description and read-only note muted, through --_muted', () => {
    expect(ruleBody('\\.w-form__field-description')).toMatch(/color:\s*var\(--_muted\)/)
    expect(ruleBody('\\.w-form__field-note')).toMatch(/color:\s*var\(--_muted\)/)
  })

  it('has no raw .p-* rule for the PrimeVue inputs (comments aside)', () => {
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
    expect(withoutComments).not.toMatch(/\.p-(inputtext|textarea|checkbox|datepicker|radiobutton)/)
  })
})
