import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { WippyFormAnswersElement } from './index'

// Registered under a test-only tag name — the real `wippy-form-answers` tag
// is only ever auto-registered by the Host's `?declare-tag=` mechanism, not
// by importing this module directly.
const TAG = 'test-wippy-form-answers'

beforeAll(() => {
  if (!customElements.get(TAG))
    customElements.define(TAG, WippyFormAnswersElement)
})

function makeElement(): WippyFormAnswersElement {
  return document.createElement(TAG) as WippyFormAnswersElement
}

describe('wippy-form-answers element', () => {
  describe('answerRecord getter', () => {
    it('owns no `record` property, so Vue writes the prop as an attribute', () => {
      // The Host's chat compiles message HTML as a Vue template. Vue sets a
      // custom element's prop as a DOM property when `key in el`, else as an
      // attribute; a `record` property would swallow the value.
      const el = makeElement()
      expect('record' in el).toBe(false)
      const value = '{"form_id":"via-vue"}'
      if ('record' in el)
        (el as unknown as Record<string, unknown>).record = value
      else
        el.setAttribute('record', value)
      expect(el.answerRecord).toEqual({ form_id: 'via-vue' })
    })

    it('parses a valid JSON record attribute', () => {
      const el = makeElement()
      el.setAttribute('record', '{"form_id":"f1","answers":{"delivery":{"question":"How?","answer":{"value":"courier"}}}}')
      expect(el.answerRecord).toEqual({
        form_id: 'f1',
        answers: { delivery: { question: 'How?', answer: { value: 'courier' } } },
      })
    })

    it('returns null for an invalid JSON record attribute', () => {
      const el = makeElement()
      el.setAttribute('record', 'not json')
      expect(el.answerRecord).toBeNull()
    })

    it('returns null when the record attribute is missing', () => {
      const el = makeElement()
      expect(el.answerRecord).toBeNull()
    })

    it('returns null when the record attribute is empty', () => {
      const el = makeElement()
      el.setAttribute('record', '')
      expect(el.answerRecord).toBeNull()
    })

    it('never throws, even on malformed content', () => {
      const el = makeElement()
      el.setAttribute('record', '{"unterminated": ')
      expect(() => el.answerRecord).not.toThrow()
      expect(el.answerRecord).toBeNull()
    })

    it('ignores text content entirely — only the record attribute is read', () => {
      const el = makeElement()
      el.textContent = '{"form_id":"leaked-if-read"}'
      expect(el.answerRecord).toBeNull()

      // Even with a valid record attribute present, text content must not
      // be consulted, merged, or preferred over it.
      el.setAttribute('record', '{"form_id":"from-attribute"}')
      expect(el.answerRecord).toEqual({ form_id: 'from-attribute' })
    })
  })

  describe('rendering (must render nothing)', () => {
    let mounted: WippyFormAnswersElement[] = []

    afterEach(() => {
      for (const el of mounted) el.remove()
      mounted = []
    })

    it('attaches a shadow root with no <slot>, so light-DOM content is never projected', () => {
      const el = makeElement()
      el.setAttribute('record', '{"answers":{}}')
      document.body.appendChild(el)
      mounted.push(el)

      expect(el.shadowRoot).not.toBeNull()
      expect(el.shadowRoot?.querySelector('slot')).toBeNull()
    })

    it('injects the :host { display: none } rule into the shadow root', () => {
      const el = makeElement()
      document.body.appendChild(el)
      mounted.push(el)

      const styleText = el.shadowRoot?.querySelector('style')?.textContent ?? ''
      expect(styleText).toContain('display: none')

      // jsdom's CSS engine does not reliably resolve :host-scoped rules
      // through getComputedStyle in every version — assert the computed
      // value only when the environment actually resolves it, per the
      // task's own "where the env supports it" allowance. The inline-CSS
      // assertion above is the authoritative, environment-independent
      // check that the hiding rule is present.
      const display = getComputedStyle(el).display
      if (display !== '')
        expect(display).toBe('none')
    })
  })
})
