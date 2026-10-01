import type { VueWrapper } from '@vue/test-utils'
import type { FormDefinition, FormState } from '../../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import QuestionCardActive from './question-card-active.vue'

/**
 * How the question card announces a submit error, and how the error text is
 * tied to the control that has focus:
 *
 *  - each error is announced ONCE (one `role="alert"` element for it, no copy
 *    in a polite status region, no second alert for the same text);
 *  - whichever control holds focus while an error is on screen (an answer
 *    row, the Other box, a note box) names that error in `aria-describedby`,
 *    and says `aria-invalid` where its ARIA role supports it.
 *
 * Every mount uses the REAL `<transition>` (not the test-utils stub, which
 * adds a second element carrying the same attributes) so an element count
 * matches what a browser renders.
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

function makeState(definition: FormDefinition): FormState {
  return {
    form_version: 1,
    artifact_id: 'artifact-1',
    session_id: 'session-1',
    status: 'active',
    stale: false,
    late: false,
    content_version: 1,
    definition,
    data: null,
    submitted_at: null,
    answer_message_id: null,
    delivery: null,
  }
}

const mounted: VueWrapper[] = []

function mountCard(definition: FormDefinition, banner: { message: string, retryable?: boolean } | null = null) {
  const wrapper = mount(QuestionCardActive, {
    props: { state: makeState(definition), submitting: false, banner },
    attachTo: document.body,
    global: { plugins: [PrimeVuePlugin], stubs: { transition: false } },
  })
  mounted.push(wrapper as unknown as VueWrapper)
  return wrapper
}

afterEach(() => {
  while (mounted.length > 0)
    mounted.pop()?.unmount()
})

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
