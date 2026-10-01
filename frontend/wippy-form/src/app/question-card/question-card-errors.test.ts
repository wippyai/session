import type { FormDefinition } from '../../lib/definition'
import type { SubmitBanner } from '../../lib/submit-error'
import { flushPromises, mount } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { describe, expect, it } from 'vitest'
import { ERROR_TEXT_CLASS, WARN_TEXT_CLASS } from '../../lib/error-text'
import { textElement } from '../../test-support/dom'
import { formState } from '../../test-support/fixtures'
import QuestionCardActive from './question-card-active.vue'

/**
 * How the question card announces a submit error and ties the error text to the
 * control that has focus:
 *
 *  - each error is announced once, by one `role="alert"` element, with no copy
 *    in a polite status region and no second alert for the same text;
 *  - the control that has focus while an error is on screen (an answer row, the
 *    Other box, a note box) names the error in `aria-describedby`, and carries
 *    `aria-invalid` where its ARIA role supports it.
 *
 * Every mount uses the real `<transition>`, because the test-utils stub adds a
 * second element with the same attributes and would change the counts.
 */

const FIELD_ERROR = 'That choice is no longer available.'
const FORM_ERROR = 'This form changed since you loaded it.'
const BANNER_ERROR = 'Could not submit this form.'
const TICK_ERROR = 'Tick at least one answer, or type your own.'

const singleDef: FormDefinition = {
  title: 'Deploy',
  fields: [{
    id: 'f1',
    type: 'choice',
    label: 'Deploy now?',
    required: true,
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
    multiple: false,
    allow_other: true,
  }],
}

const multiDef: FormDefinition = {
  title: 'Pick',
  fields: [{
    id: 'f1',
    type: 'choice',
    label: 'Which packages?',
    required: true,
    options: [{ value: 'proxy', label: 'proxy' }, { value: 'theme', label: 'theme' }],
    multiple: true,
    allow_other: true,
  }],
}

type ServerErrors = Record<string, { code: string, message: string }[]>
type ErrorList = { code: string, message: string }[]
interface CardVm { setServerErrors: (fields?: ServerErrors, form?: ErrorList) => void }

function mountCard(definition: FormDefinition, banner: SubmitBanner | null = null) {
  return mount(QuestionCardActive, {
    props: { state: formState({ definition }), submitting: false, banner },
    attachTo: document.body,
    global: { plugins: [PrimeVuePlugin], stubs: { transition: false } },
  })
}

/** The text of every element the `aria-describedby` value names, resolved inside `root` the way a browser would. */
function describedText(root: Element, element: Element | null): string {
  return (element?.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .filter(Boolean)
    .map(id => root.querySelector(`[id="${id}"]`)?.textContent?.trim() ?? '')
    .join(' ')
}

/** Elements inside `root` that a screen reader would announce on their own: alerts, live regions and statuses. */
function announcers(root: Element): Element[] {
  return Array.from(root.querySelectorAll('[role="alert"], [role="status"], [aria-live]'))
}

function announcersSaying(root: Element, text: string): Element[] {
  return announcers(root).filter(el => el.textContent?.includes(text))
}

describe('QuestionCardActive: an error is announced once', () => {
  it('announces a form-level server error from ONE element, not once per place it can be drawn', async () => {
    const wrapper = mountCard(singleDef)
    ;(wrapper.vm as unknown as CardVm).setServerErrors(undefined, [{ code: 'stale', message: FORM_ERROR }])
    await flushPromises()

    expect(announcersSaying(wrapper.element, FORM_ERROR)).toHaveLength(1)
  })

  it('keeps a form-level error to one announcing element while the reader moves between questions and into the review', async () => {
    const twoQuestions: FormDefinition = {
      title: 'Release',
      fields: [
        { ...singleDef.fields[0], id: 'a', allow_other: false },
        { ...singleDef.fields[0], id: 'b', allow_other: false },
      ],
    }
    const wrapper = mountCard(twoQuestions)
    ;(wrapper.vm as unknown as CardVm).setServerErrors(undefined, [{ code: 'stale', message: FORM_ERROR }])
    await flushPromises()
    expect(announcersSaying(wrapper.element, FORM_ERROR)).toHaveLength(1)

    // Next question: still one copy, and it did not have to be redrawn.
    await wrapper.find('.w-form__next').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('2/2')
    expect(announcersSaying(wrapper.element, FORM_ERROR)).toHaveLength(1)

    // Review step: the same single copy (there is no per-question place there).
    await wrapper.find('.w-form__next').trigger('click')
    await flushPromises()
    expect(wrapper.find('.w-form__review').exists()).toBe(true)
    expect(announcersSaying(wrapper.element, FORM_ERROR)).toHaveLength(1)
  })

  it('announces a field error from ONE element', async () => {
    const wrapper = mountCard(singleDef)
    ;(wrapper.vm as unknown as CardVm).setServerErrors({ f1: [{ code: 'invalid', message: FIELD_ERROR }] })
    await flushPromises()

    expect(announcersSaying(wrapper.element, FIELD_ERROR)).toHaveLength(1)
  })

  it('announces a submit-failure banner from ONE element: no polite status region repeats it', async () => {
    const wrapper = mountCard(singleDef, { message: BANNER_ERROR, retryable: true })
    await flushPromises()
    // The polite region also has its own turn to speak (question changes,
    // "Ticked"); let it run before counting.
    await new Promise(resolve => setTimeout(resolve, 60))

    const sayingIt = announcersSaying(wrapper.element, BANNER_ERROR)
    expect(sayingIt).toHaveLength(1)
    expect(sayingIt[0].getAttribute('role')).toBe('alert')
  })
})

describe('QuestionCardActive: the focused control names the error', () => {
  it('a single-choice row that takes focus after a field error is described by that error', async () => {
    const wrapper = mountCard(singleDef)
    ;(wrapper.vm as unknown as CardVm).setServerErrors({ f1: [{ code: 'invalid', message: FIELD_ERROR }] })
    await flushPromises()

    const focused = document.activeElement as HTMLElement
    expect(wrapper.element.contains(focused)).toBe(true)
    expect(focused.getAttribute('role')).toBe('radio')
    expect(describedText(wrapper.element, focused)).toContain(FIELD_ERROR)
  })

  it('marks the radiogroup, not the radio, invalid: aria-invalid is a supported state of radiogroup and checkbox, not of radio', async () => {
    const wrapper = mountCard(singleDef)
    expect(wrapper.find('[role="radiogroup"]').attributes('aria-invalid')).toBeUndefined()

    ;(wrapper.vm as unknown as CardVm).setServerErrors({ f1: [{ code: 'invalid', message: FIELD_ERROR }] })
    await flushPromises()

    expect(wrapper.find('[role="radiogroup"]').attributes('aria-invalid')).toBe('true')
    for (const radio of wrapper.findAll('[role="radio"]'))
      expect(radio.attributes('aria-invalid')).toBeUndefined()
  })

  it('a several-answer row that takes focus after the "tick one" error is described by it and is aria-invalid', async () => {
    const wrapper = mountCard(multiDef)
    await wrapper.find('[role="checkbox"]').trigger('keydown', { key: 'Enter' })
    await flushPromises()

    const focused = document.activeElement as HTMLElement
    expect(wrapper.element.contains(focused)).toBe(true)
    expect(focused.getAttribute('role')).toBe('checkbox')
    expect(describedText(wrapper.element, focused)).toContain(TICK_ERROR)
    expect(focused.getAttribute('aria-invalid')).toBe('true')
    // `group` does not support aria-invalid, so the container stays unmarked.
    expect(wrapper.find('.w-form__options').attributes('aria-invalid')).toBeUndefined()
  })

  it('leaves answer rows with no description and no invalid state while there is no error', () => {
    const wrapper = mountCard(multiDef)
    for (const row of wrapper.findAll('[role="checkbox"]')) {
      expect(row.attributes('aria-describedby')).toBeUndefined()
      expect(row.attributes('aria-invalid')).toBeUndefined()
    }
  })

  it('describes a focused answer row by a form-level error without calling the row invalid', async () => {
    const wrapper = mountCard(singleDef)
    ;(wrapper.vm as unknown as CardVm).setServerErrors(undefined, [{ code: 'stale', message: FORM_ERROR }])
    await flushPromises()

    const row = wrapper.find('[role="radio"]')
    expect(describedText(wrapper.element, row.element)).toContain(FORM_ERROR)
    expect(row.attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.find('[role="radiogroup"]').attributes('aria-invalid')).toBeUndefined()
  })

  it('describes a focused answer row by the submit-failure banner', async () => {
    const wrapper = mountCard(singleDef, { message: BANNER_ERROR, retryable: true })
    await flushPromises()

    const row = wrapper.find('[role="radio"]')
    expect(describedText(wrapper.element, row.element)).toContain(BANNER_ERROR)
    // A failed send is not a problem with the chosen answer.
    expect(row.attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.find('[role="radiogroup"]').attributes('aria-invalid')).toBeUndefined()
  })

  it('describes the Other box by the banner and by a form-level error, without calling it invalid', async () => {
    const wrapper = mountCard(singleDef, { message: BANNER_ERROR })
    ;(wrapper.vm as unknown as CardVm).setServerErrors(undefined, [{ code: 'stale', message: FORM_ERROR }])
    await flushPromises()

    const other = wrapper.find('textarea.w-form__other-input')
    const text = describedText(wrapper.element, other.element)
    expect(text).toContain(BANNER_ERROR)
    expect(text).toContain(FORM_ERROR)
    expect(other.attributes('aria-invalid')).toBeUndefined()
  })

  it('describes the Other box by a field error and calls it invalid', async () => {
    const wrapper = mountCard(singleDef)
    ;(wrapper.vm as unknown as CardVm).setServerErrors({ f1: [{ code: 'invalid', message: FIELD_ERROR }] })
    await flushPromises()

    const other = wrapper.find('textarea.w-form__other-input')
    expect(describedText(wrapper.element, other.element)).toContain(FIELD_ERROR)
    expect(other.attributes('aria-invalid')).toBe('true')
  })

  it('describes an open note box by the banner, and keeps its own too-long notice in the description', async () => {
    const wrapper = mountCard(singleDef, { message: BANNER_ERROR })
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await flushPromises()

    const note = wrapper.find('textarea.w-form__note-input')
    expect(note.exists()).toBe(true)
    expect(describedText(wrapper.element, note.element)).toContain(BANNER_ERROR)
    expect(note.attributes('aria-invalid')).toBeUndefined()

    await note.setValue('x'.repeat(1001))
    const text = describedText(wrapper.element, note.element)
    expect(text).toContain(BANNER_ERROR)
    expect(text).toContain('Use at most 1,000 characters.')
    expect(note.attributes('aria-invalid')).toBe('true')
  })

  it('describes the Send button of a several-answer question by the banner: it is the control that just failed and still has focus', async () => {
    const noOther: FormDefinition = {
      title: 'Pick',
      fields: [{ ...multiDef.fields[0], allow_other: false }],
    }
    const wrapper = mountCard(noOther, { message: BANNER_ERROR, retryable: true })
    await flushPromises()

    const send = wrapper.find('[data-focus="send"]')
    expect(send.exists()).toBe(true)
    expect(describedText(wrapper.element, send.element)).toContain(BANNER_ERROR)
  })

  it('describes "Send answers" on the review step by the banner and by a form-level error', async () => {
    const twoQuestions: FormDefinition = {
      title: 'Release',
      fields: [
        { ...singleDef.fields[0], id: 'a', allow_other: false },
        { ...multiDef.fields[0], id: 'b', allow_other: false },
      ],
    }
    const wrapper = mountCard(twoQuestions, { message: BANNER_ERROR, retryable: true })
    ;(wrapper.vm as unknown as CardVm).setServerErrors(undefined, [{ code: 'stale', message: FORM_ERROR }])
    await flushPromises()

    // Question 1 (single): a click answers and advances. Question 2 (several): tick, then Send, which opens the review.
    await wrapper.find('[role="radio"]').trigger('click')
    await flushPromises()
    await wrapper.find('[role="checkbox"]').trigger('click')
    await wrapper.find('[data-focus="send"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('.w-form__review').exists()).toBe(true)

    const sendAll = wrapper.find('[data-focus="send-all"]')
    const text = describedText(wrapper.element, sendAll.element)
    expect(text).toContain(BANNER_ERROR)
    expect(text).toContain(FORM_ERROR)
  })

  it('describes an open note box by the question\'s own validation error', async () => {
    const wrapper = mountCard(multiDef)
    await wrapper.find('[role="checkbox"]').trigger('keydown', { key: 'Enter' })
    await flushPromises()
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await flushPromises()

    const note = wrapper.find('textarea.w-form__note-input')
    expect(note.exists()).toBe(true)
    expect(describedText(wrapper.element, note.element)).toContain(TICK_ERROR)
  })
})

describe('QuestionCardActive: focus after a failed send that started in a note', () => {
  // A single-answer note sends the whole form. The note editor closes on send
  // and takes focus with it; on a one-question card nothing else moves focus,
  // so a rejected send left it on <body>. Focus goes back to the row that owns
  // the note, the same place closing a note by Escape and every 422 field
  // error already put it.
  async function sendFromNote(wrapper: ReturnType<typeof mountCard>) {
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await flushPromises()
    const note = wrapper.find('textarea.w-form__note-input')
    // Positive control: the editor really holds focus before the send.
    expect(document.activeElement).toBe(note.element)
    await note.setValue('leave at the door')
    await note.trigger('keydown', { key: 'Enter' })
    await flushPromises()
    expect(wrapper.find('textarea.w-form__note-input').exists()).toBe(false)
  }

  it('lands on the row that owns the note, and the banner describes it', async () => {
    const wrapper = mountCard(singleDef)
    await sendFromNote(wrapper)
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ f1: { value: 'yes', note: 'leave at the door' } }])

    // The parent's submit cycle: in flight, then rejected.
    await wrapper.setProps({ submitting: true })
    await flushPromises()
    await wrapper.setProps({ submitting: false, banner: { message: BANNER_ERROR, retryable: true } })
    await flushPromises()

    const focused = document.activeElement as HTMLElement
    expect(focused).not.toBe(document.body)
    expect(wrapper.element.contains(focused)).toBe(true)
    expect(focused.getAttribute('role')).toBe('radio')
    expect(focused.dataset.focus).toBe('opt-0')
    expect(describedText(wrapper.element, focused)).toContain(BANNER_ERROR)
  })

  it('stays on that row when the server rejects the form with a form-level error', async () => {
    const wrapper = mountCard(singleDef)
    await sendFromNote(wrapper)
    ;(wrapper.vm as unknown as CardVm).setServerErrors(undefined, [{ code: 'stale', message: FORM_ERROR }])
    await flushPromises()

    const focused = document.activeElement as HTMLElement
    expect(wrapper.element.contains(focused)).toBe(true)
    expect(focused.dataset.focus).toBe('opt-0')
    expect(describedText(wrapper.element, focused)).toContain(FORM_ERROR)
  })

  it('stays on that row when the server rejects the answer with a field error, which the row is described by', async () => {
    const wrapper = mountCard(singleDef)
    await sendFromNote(wrapper)
    ;(wrapper.vm as unknown as CardVm).setServerErrors({ f1: [{ code: 'invalid', message: FIELD_ERROR }] })
    await flushPromises()

    const focused = document.activeElement as HTMLElement
    expect(wrapper.element.contains(focused)).toBe(true)
    expect(focused.dataset.focus).toBe('opt-0')
    expect(describedText(wrapper.element, focused)).toContain(FIELD_ERROR)
  })

  it('leaves focus to the move to the next question when the card has several', async () => {
    const twoQuestions: FormDefinition = {
      title: 'Release',
      fields: [
        { ...singleDef.fields[0], id: 'a', allow_other: false },
        { ...singleDef.fields[0], id: 'b', allow_other: false },
      ],
    }
    const wrapper = mountCard(twoQuestions)
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await flushPromises()
    const note = wrapper.find('textarea.w-form__note-input')
    await note.setValue('context')
    await note.trigger('keydown', { key: 'Enter' })
    await flushPromises()

    expect(wrapper.text()).toContain('2/2')
    const focused = document.activeElement as HTMLElement
    expect(wrapper.element.contains(focused)).toBe(true)
    expect(focused.getAttribute('role')).toBe('radio')
    expect(focused.dataset.focus).toBe('opt-0')
  })
})

describe('QuestionCardActive: error text takes the theme severity utilities', () => {
  // The `Message` keeps its box, role, id and parts. The text inside it takes
  // the utilities, because the `Message`'s own text colour is below 4.5:1
  // contrast in at least one theme.
  const errorUtilities = ERROR_TEXT_CLASS.split(' ')

  it('draws a field error in them, inside the Message that keeps its parts, class, role and id', async () => {
    const wrapper = mountCard(singleDef)
    ;(wrapper.vm as unknown as CardVm).setServerErrors({ f1: [{ code: 'invalid', message: FIELD_ERROR }] })
    await flushPromises()

    const text = textElement(wrapper.element, FIELD_ERROR)
    for (const utility of errorUtilities)
      expect(text.classList.contains(utility)).toBe(true)
    expect(text.getAttribute('style')).toBeNull()

    const message = text.closest('[role="alert"]') as HTMLElement
    expect(message).not.toBeNull()
    expect(message.classList.contains('p-message-error')).toBe(true)
    expect(message.classList.contains('w-form__error')).toBe(true)
    expect(message.getAttribute('part')).toBe('error')
    expect(message.id.endsWith('-err')).toBe(true)
    // The colour lives on the text, not on the Message: no competing utility on the box.
    expect(Array.from(message.classList).filter(c => /text-(?:danger|warn)-/.test(c))).toEqual([])
  })

  it('draws a non-retryable (error) banner\'s text in them', async () => {
    const wrapper = mountCard(singleDef, { message: 'You are signed out. Sign in again, then retry.', retryable: false })
    await flushPromises()

    const text = textElement(wrapper.element, 'You are signed out. Sign in again, then retry.')
    for (const utility of errorUtilities)
      expect(text.classList.contains(utility)).toBe(true)
    expect(text.closest('[role="alert"]')?.classList.contains('p-message-error')).toBe(true)
  })

  it('draws a retryable (warn) banner\'s text on the warning scale, not the danger one, and keeps its Retry button', async () => {
    const wrapper = mountCard(singleDef, { message: BANNER_ERROR, retryable: true })
    await flushPromises()

    const text = textElement(wrapper.element, BANNER_ERROR)
    // The warning's own severity pair (one step per theme, see lib/error-text.ts)...
    expect(WARN_TEXT_CLASS).toMatch(/^text-warn-\d+ dark:text-warn-\d+$/)
    for (const utility of WARN_TEXT_CLASS.split(' '))
      expect(text.classList.contains(utility)).toBe(true)
    // ...and none of the danger pair.
    for (const utility of errorUtilities)
      expect(text.classList.contains(utility)).toBe(false)
    const message = text.closest('[role="alert"]') as HTMLElement
    expect(message.classList.contains('p-message-warn')).toBe(true)
    expect(Array.from(message.querySelectorAll('button')).some(b => b.textContent?.trim() === 'Retry')).toBe(true)
  })

  it('follows the banner\'s severity when it changes: a retryable failure is a warning, the next non-retryable one an error', async () => {
    const wrapper = mountCard(singleDef, { message: BANNER_ERROR, retryable: true })
    await flushPromises()
    expect(textElement(wrapper.element, BANNER_ERROR).classList.contains('text-warn-700')).toBe(true)

    await wrapper.setProps({ banner: { message: 'You are signed out. Sign in again, then retry.', retryable: false } })
    await flushPromises()
    const text = textElement(wrapper.element, 'You are signed out. Sign in again, then retry.')
    expect(text.classList.contains('text-danger-600')).toBe(true)
    expect(text.classList.contains('text-warn-700')).toBe(false)
  })

  it('draws the form-level notice in them', async () => {
    const wrapper = mountCard(singleDef)
    ;(wrapper.vm as unknown as CardVm).setServerErrors(undefined, [{ code: 'stale', message: FORM_ERROR }])
    await flushPromises()

    const text = textElement(wrapper.element, FORM_ERROR)
    for (const utility of errorUtilities)
      expect(text.classList.contains(utility)).toBe(true)
    expect(text.closest('[role="alert"]')?.classList.contains('p-message-error')).toBe(true)
  })

  it('does not carry the utilities when there is no error (no stray error colour on other text)', () => {
    const wrapper = mountCard(singleDef)
    expect(wrapper.element.querySelector('[class*="text-danger"]')).toBeNull()
  })
})

describe('QuestionCardActive: the rest of the error text takes the severity utilities, not a stylesheet colour', () => {
  // Their stylesheet rules set no colour (styles.test.ts), so the utilities on
  // the element are the only thing that makes them an error colour.

  function hasErrorText(el: Element | null | undefined): boolean {
    return !!el && ERROR_TEXT_CLASS.split(' ').every(c => el.classList.contains(c))
  }

  function alertSaying(root: Element, text: string): HTMLElement {
    const found = Array.from(root.querySelectorAll<HTMLElement>('[role="alert"]')).find(el => el.textContent?.trim() === text)
    if (!found)
      throw new Error(`no alert says "${text}"`)
    return found
  }

  it('draws the note-too-long notice in them, keeping its part, class, role and id', async () => {
    const wrapper = mountCard(singleDef)
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await flushPromises()
    await wrapper.find('textarea.w-form__note-input').setValue('x'.repeat(1001))
    await flushPromises()

    const alert = alertSaying(wrapper.element, 'Use at most 1,000 characters.')
    expect(hasErrorText(alert)).toBe(true)
    expect(alert.classList.contains('w-form__error')).toBe(true)
    expect(alert.getAttribute('part')).toBe('error')
    expect(alert.id.endsWith('-note-err')).toBe(true)
  })

  it('draws the Other-too-long notice in them, keeping its part, class, role and id', async () => {
    const wrapper = mountCard(singleDef)
    await wrapper.find('textarea.w-form__other-input').setValue('x'.repeat(2001))
    await flushPromises()

    const alert = alertSaying(wrapper.element, 'Use at most 2,000 characters.')
    expect(hasErrorText(alert)).toBe(true)
    expect(alert.classList.contains('w-form__error')).toBe(true)
    expect(alert.getAttribute('part')).toBe('error')
    expect(alert.id.endsWith('-other-err')).toBe(true)
  })

  it('draws the review footer and a missing required answer in them, and no other review row', async () => {
    const threeQuestions: FormDefinition = {
      title: 'Release',
      fields: [
        { ...singleDef.fields[0], id: 'a', label: 'Required, left open', allow_other: false },
        { ...singleDef.fields[0], id: 'b', label: 'Optional, skipped', required: false, allow_other: false },
        { ...singleDef.fields[0], id: 'c', label: 'Required, answered', allow_other: false },
      ],
    }
    const wrapper = mountCard(threeQuestions)
    await wrapper.find('.w-form__next').trigger('click')
    await wrapper.find('.w-form__next').trigger('click')
    await flushPromises()
    await wrapper.find('[role="radio"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('.w-form__review').exists()).toBe(true)

    const footer = wrapper.find('.w-form__footer-text')
    expect(footer.text()).toBe('Question 1 still needs an answer.')
    expect(hasErrorText(footer.element)).toBe(true)

    const answers = wrapper.findAll('.w-form__review-answer')
    expect(answers).toHaveLength(3)
    expect(answers[0].text()).toBe('Not answered yet')
    expect(answers[1].text()).toBe('Skipped')
    expect(answers[2].text()).toContain('Yes')
    expect(answers.map(a => hasErrorText(a.element))).toEqual([true, false, false])
    // The missing row is still outlined (the one use of the --wippy-form-danger token) and still carries its state part.
    expect(wrapper.findAll('.w-form__review-item')[0].classes()).toContain('w-form__review-item--missing')
  })

  it('draws no message in them when nothing is wrong', async () => {
    const wrapper = mountCard(singleDef)
    await flushPromises()
    expect(wrapper.element.querySelector('[class*="text-danger"], [class*="text-warn"]')).toBeNull()
  })
})

describe('QuestionCardActive: ARIA attributes stay on roles that support them', () => {
  // WAI-ARIA 1.2 "Used in roles" (and the roles that inherit from them):
  // aria-required: checkbox, combobox, gridcell, listbox, radiogroup,
  // spinbutton, textbox, tree. aria-invalid: application, checkbox, combobox,
  // gridcell, listbox, radiogroup, slider, spinbutton, textbox, tree.
  // Neither is supported by `group`, and `radio` does not support
  // aria-invalid (its radiogroup does). Source: MDN ARIA reference pages for
  // aria-required and aria-invalid.
  const REQUIRED_ROLES = new Set(['checkbox', 'combobox', 'gridcell', 'listbox', 'radiogroup', 'spinbutton', 'textbox', 'tree', 'columnheader', 'rowheader', 'searchbox', 'switch', 'treegrid'])
  const INVALID_ROLES = new Set(['application', 'checkbox', 'combobox', 'gridcell', 'listbox', 'radiogroup', 'slider', 'spinbutton', 'textbox', 'tree', 'columnheader', 'rowheader', 'searchbox', 'switch', 'treegrid'])

  function roleOf(el: Element): string {
    const explicit = el.getAttribute('role')
    if (explicit)
      return explicit
    if (el.tagName === 'TEXTAREA')
      return 'textbox'
    if (el.tagName === 'INPUT')
      return el.getAttribute('type') === 'checkbox' ? 'checkbox' : 'textbox'
    return el.tagName.toLowerCase()
  }

  function offenders(root: Element): string[] {
    const out: string[] = []
    for (const el of Array.from(root.querySelectorAll('[aria-required]'))) {
      if (!REQUIRED_ROLES.has(roleOf(el)))
        out.push(`aria-required on ${roleOf(el)}`)
    }
    for (const el of Array.from(root.querySelectorAll('[aria-invalid]'))) {
      if (!INVALID_ROLES.has(roleOf(el)))
        out.push(`aria-invalid on ${roleOf(el)}`)
    }
    // A fieldset is already a group: giving it, or a child of it, role=group again is redundant.
    for (const group of Array.from(root.querySelectorAll('fieldset [role="group"], fieldset[role="group"]')))
      out.push(`role=group inside/on a fieldset (${group.tagName})`)
    return out
  }

  it('single choice, in error, with a banner and a note box open', async () => {
    const wrapper = mountCard(singleDef, { message: BANNER_ERROR })
    ;(wrapper.vm as unknown as CardVm).setServerErrors({ f1: [{ code: 'invalid', message: FIELD_ERROR }] }, [{ code: 'stale', message: FORM_ERROR }])
    await flushPromises()
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await flushPromises()

    expect(offenders(wrapper.element)).toEqual([])
  })

  it('several choice, in error, with a note box open', async () => {
    const wrapper = mountCard(multiDef)
    await wrapper.find('[role="checkbox"]').trigger('keydown', { key: 'Enter' })
    await flushPromises()
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await flushPromises()

    expect(offenders(wrapper.element)).toEqual([])
  })
})
