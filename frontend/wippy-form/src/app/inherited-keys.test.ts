import type { ChoiceFormDefinition, FieldError, FormDefinition, FormField, FormState } from '../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { draftFromAnswers, validateAnswers } from '../lib/answers'
import { formState } from '../test-support/fixtures'
import ActiveForm from './active-form.vue'
import IdleForm from './idle-form.vue'
import QuestionCardActive from './question-card/question-card-active.vue'
import QuestionCardSummary from './question-card/question-card-summary.vue'

/*
 * Field ids and option values are agent-written strings. `constructor` is a
 * valid field id (it is the one `Object.prototype` name that matches the id
 * pattern `^[a-z][a-z0-9_]*$`), and an option value may be any text. A map
 * keyed by them must only ever read its own keys: a plain `map[id]` on a
 * map without that key reads the inherited `Object` function.
 */

type ServerErrors = Record<string, FieldError[]>
interface ErrorsApi { setServerErrors: (fields?: ServerErrors, form?: FieldError[]) => void }

const companion: FormField = { id: 'name', type: 'text', min_length: 0, max_length: 500, label: 'Name', required: false }

/** A field `constructor` of every type, each with a valid answer as typed into its control and as sent. */
const CASES: Array<{ type: string, field: FormField, fill: (wrapper: ReturnType<typeof mountActive>) => Promise<void>, sent: unknown }> = [
  {
    type: 'text',
    field: { id: 'constructor', type: 'text', min_length: 0, max_length: 500, label: 'Build', required: true },
    fill: async w => { await inputFor(w, 'Build').setValue('Ada') },
    sent: 'Ada',
  },
  {
    type: 'textarea',
    field: { id: 'constructor', type: 'textarea', min_length: 0, max_length: 8000, label: 'Build', required: true },
    fill: async w => { await w.find('textarea').setValue('line') },
    sent: 'line',
  },
  {
    type: 'email',
    field: { id: 'constructor', type: 'email', label: 'Build', required: true },
    fill: async w => { await w.find('input[type="email"]').setValue('ada@example.com') },
    sent: 'ada@example.com',
  },
  {
    type: 'number',
    field: { id: 'constructor', type: 'number', label: 'Build', required: true, integer: true },
    fill: async w => { await inputFor(w, 'Build').setValue('3') },
    sent: 3,
  },
  {
    type: 'date',
    field: { id: 'constructor', type: 'date', label: 'Build', required: true },
    fill: async w => { await inputFor(w, 'Build').setValue('2026-06-15') },
    sent: '2026-06-15',
  },
  {
    type: 'checkbox',
    field: { id: 'constructor', type: 'checkbox', label: 'Build', required: true },
    fill: async w => { await w.find('input[type="checkbox"]').setValue(true) },
    sent: true,
  },
  {
    type: 'single choice with Other',
    field: { id: 'constructor', type: 'choice', label: 'Build', required: true, options: [{ value: 'a', label: 'Option A' }], multiple: false, allow_other: true },
    fill: async w => { await w.find('input[type="radio"]').setValue(true) },
    sent: 'a',
  },
  {
    type: 'multiple choice with Other',
    field: { id: 'constructor', type: 'choice', label: 'Build', required: true, options: [{ value: 'a', label: 'Option A' }], multiple: true, allow_other: true },
    fill: async w => { await w.find('input[type="checkbox"]').setValue(true) },
    sent: ['a'],
  },
]

function v2State(field: FormField): FormState {
  // The text field makes it a fields form even when the tested field is a choice: a mixed form.
  const definition: FormDefinition = { title: 'Build', fields: [field, companion] }
  return formState({ form_version: 2, definition })
}

function mountActive(state: FormState) {
  return mount(ActiveForm, {
    props: { state, submitting: false, banner: null },
    global: { plugins: [PrimeVuePlugin] },
    attachTo: document.body,
  })
}

function inputFor(wrapper: ReturnType<typeof mountActive>, label: string) {
  const labelEl = wrapper.findAll('label').find(l => l.text().startsWith(label))
  if (!labelEl)
    throw new Error(`no label starting with "${label}"`)
  return wrapper.find(`[id="${labelEl.attributes('for')}"]`)
}

function fieldRoot(wrapper: ReturnType<typeof mountActive>) {
  return wrapper.findAll('[part~="field"]')[0]
}

describe('a field with the id `constructor` in the fields form', () => {
  it.each(CASES)('$type: starts with no error and is sent under its id', async ({ field, fill, sent }) => {
    const wrapper = mountActive(v2State(field))
    expect(fieldRoot(wrapper).attributes('part')?.split(' ')).not.toContain('field-invalid')
    expect(wrapper.find('[aria-invalid="true"]').exists()).toBe(false)

    await fill(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ constructor: sent }])
  })

  it.each(CASES)('$type: names it as required when it is left empty', async ({ field }) => {
    const wrapper = mountActive(v2State(field))
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(fieldRoot(wrapper).find('ul').text()).toBe('This question is required.')
  })

  it.each(CASES)('$type: a server error for another field leaves it alone, its own error shows, and a new send clears it', async ({ field }) => {
    const wrapper = mountActive(v2State(field))
    const api = wrapper.vm as unknown as ErrorsApi
    api.setServerErrors({ name: [{ code: 'too_short', message: 'Name is too short.' }] }, [])
    await flushPromises()
    expect(fieldRoot(wrapper).attributes('part')?.split(' ')).not.toContain('field-invalid')
    expect(wrapper.find('[role="status"]').text()).toBe('1 question needs attention.')

    api.setServerErrors({ constructor: [{ code: 'invalid', message: 'Not accepted.' }] }, [])
    await flushPromises()
    expect(fieldRoot(wrapper).find('ul').text()).toBe('Not accepted.')

    await wrapper.setProps({ submitting: true })
    await flushPromises()
    expect(fieldRoot(wrapper).find('ul').exists()).toBe(false)
    expect(fieldRoot(wrapper).attributes('part')?.split(' ')).not.toContain('field-invalid')
  })

  it('reads as Skipped in the answered view when it was left unanswered', () => {
    const state = formState({ form_version: 2, status: 'idle', definition: { title: 'Build', fields: [CASES[0].field, companion] }, data: { name: 'Ada' } })
    const wrapper = mount(IdleForm, { props: { state }, global: { plugins: [PrimeVuePlugin] } })
    expect(wrapper.findAll('[part~="field-value"]')[0].text()).toBe('Skipped')
  })
})

describe('the answer helpers with a field `constructor`', () => {
  const choice: FormField = { id: 'constructor', type: 'choice', label: 'Build', required: false, options: [{ value: 'a', label: 'A' }], multiple: false, allow_other: true }
  const definition: FormDefinition = { title: 'Build', fields: [choice, companion] }

  it('starts an unanswered field with no draft, even from stored answers that lack it', () => {
    const draft = draftFromAnswers(definition, { name: 'Ada' })
    expect(Object.hasOwn(draft, 'constructor')).toBe(false)
    expect(validateAnswers(definition, draft)).toEqual({})
  })
})

describe('the question card with a question `constructor`', () => {
  const single: ChoiceFormDefinition = {
    title: 'Build',
    fields: [{ id: 'constructor', type: 'choice', label: 'Build now?', required: true, options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], multiple: false, allow_other: true }],
  }
  const two: ChoiceFormDefinition = {
    title: 'Build',
    fields: [
      single.fields[0],
      { id: 'later', type: 'choice', label: 'Which parts?', required: true, options: [{ value: 'a', label: 'Part A' }, { value: 'b', label: 'Part B' }], multiple: true, allow_other: false },
    ],
  }

  function mountCard(definition: ChoiceFormDefinition) {
    return mount(QuestionCardActive, {
      props: { state: formState({ definition }), submitting: false, banner: null },
      attachTo: document.body,
      global: { plugins: [PrimeVuePlugin] },
    })
  }

  it('shows no server error on it before any was given', () => {
    const wrapper = mountCard(single)
    expect(wrapper.find('[aria-invalid="true"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('function')
    expect(wrapper.text()).not.toContain('native code')
  })

  it('goes to the question that owns a server error, not to the question `constructor`', async () => {
    const wrapper = mountCard(two)
    // Answering the first question moves on to the second.
    await wrapper.findAll('.w-form__option')[0].trigger('click')
    await flushPromises()
    const api = wrapper.vm as unknown as ErrorsApi
    api.setServerErrors({ later: [{ code: 'invalid', message: 'Pick again.' }] })
    await flushPromises()
    expect(wrapper.text()).toContain('Which parts?')
    expect(wrapper.text()).toContain('Pick again.')
  })

  it('reads as Skipped in the answered summary when it was left unanswered', () => {
    const optional: ChoiceFormDefinition = { title: 'Build', fields: [{ ...single.fields[0], required: false }, { ...two.fields[1], required: false }] }
    const state = formState({ status: 'idle', definition: optional, data: { later: ['a'] }, submitted_at: '2026-10-01T10:00:00.000Z', delivery: 'complete' })
    const wrapper = mount(QuestionCardSummary, { props: { state }, global: { plugins: [PrimeVuePlugin] } })
    expect(wrapper.text()).not.toContain('function')
    expect(wrapper.text()).toContain('Part A')
  })
})

describe('the question card with an option value that names an Object property', () => {
  function mountOdd(value: string) {
    const definition: ChoiceFormDefinition = {
      title: 'Build',
      fields: [{ id: 'f1', type: 'choice', label: 'Pick', required: true, options: [{ value, label: 'Odd one' }, { value: 'plain', label: 'Plain' }], multiple: false, allow_other: false }],
    }
    return mount(QuestionCardActive, {
      props: { state: formState({ definition }), submitting: false, banner: null },
      attachTo: document.body,
      global: { plugins: [PrimeVuePlugin] },
    })
  }

  it.each(['constructor', 'toString', 'hasOwnProperty', '__proto__'])('answers the option %s', async (value) => {
    const wrapper = mountOdd(value)
    await wrapper.findAll('.w-form__option')[0].trigger('click')
    await flushPromises()
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ f1: value }])
  })

  it.each(['constructor', 'toString', 'hasOwnProperty', '__proto__'])('keeps and sends a note on the option %s', async (value) => {
    const wrapper = mountOdd(value)
    // Shift+1 opens the note of the first option.
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await flushPromises()
    const note = wrapper.find('textarea.w-form__note-input')
    await note.setValue('by Friday')
    await note.trigger('keydown', { key: 'Escape' })
    await flushPromises()
    expect(wrapper.find('.w-form__option-note').text()).toContain('by Friday')

    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await flushPromises()
    await wrapper.find('textarea.w-form__note-input').trigger('keydown', { key: 'Enter' })
    await flushPromises()
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ f1: { value, note: 'by Friday' } }])
  })
})
