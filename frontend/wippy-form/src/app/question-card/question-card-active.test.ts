import type { FormDefinition, FormState } from '../../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import QuestionCardActive from './question-card-active.vue'

const singleQuestionDef: FormDefinition = {
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

const twoQuestionDef: FormDefinition = {
  title: 'Release',
  fields: [
    { id: 'f1', type: 'choice', label: 'Widen the peer range?', required: true, options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], multiple: false, allow_other: false },
    { id: 'f2', type: 'choice', label: 'Which packages?', required: true, options: [{ value: 'proxy', label: 'proxy' }, { value: 'theme', label: 'theme' }], multiple: true, allow_other: false },
  ],
}

function makeState(definition: FormDefinition, overrides: Partial<FormState> = {}): FormState {
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
    ...overrides,
  }
}

function mountCard(definition: FormDefinition, overrides: Partial<FormState> = {}) {
  return mount(QuestionCardActive, {
    props: {
      state: makeState(definition, overrides),
      submitting: false,
      banner: null,
    },
    attachTo: document.body,
    global: { plugins: [PrimeVuePlugin] },
  })
}

describe('QuestionCardActive — styling API surface', () => {
  it('the root carries the w-form class and the card part', () => {
    const wrapper = mountCard(singleQuestionDef)
    const root = wrapper.find('.w-form')
    expect(root.exists()).toBe(true)
    expect(root.attributes('part')).toBe('card')
    expect(root.attributes('role')).toBe('group')
  })

  it('an option row carries its part/class pair and states, and clicking it answers and submits (single-choice commits immediately, so the selected state is checked via a multi-question fixture instead)', async () => {
    const wrapper = mountCard(singleQuestionDef)
    const row = wrapper.find('.w-form__option')
    expect(row.attributes('part')).toBe('option')
    expect(row.classes()).toContain('w-form__option')
    await row.trigger('click')
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ f1: 'yes' }])
  })

  it('a ticked row in a several-answer question gets the selected part/class', async () => {
    const wrapper = mountCard(twoQuestionDef)
    // f1 (single) must be answered first to reach f2 (multi).
    await wrapper.findAll('.w-form__option')[0].trigger('click')
    await wrapper.vm.$nextTick()
    const row = wrapper.find('.w-form__option')
    await row.trigger('click')
    expect(row.attributes('part')).toContain('option-selected')
    expect(row.classes()).toContain('w-form__option--selected')
  })
})

describe('QuestionCardActive — single question, single answer', () => {
  it('clicking a row answers and submits the whole form', async () => {
    const wrapper = mountCard(singleQuestionDef)
    await wrapper.findAll('.w-form__option')[0].trigger('click')
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ f1: 'yes' }])
  })

  it('pressing a row\'s number key answers it', async () => {
    const wrapper = mountCard(singleQuestionDef)
    // A real digit keypress carries both — `.key` is what the fix (item 6)
    // actually reads for a plain (non-Shift) digit.
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit2', key: '2' })
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ f1: 'no' }])
  })

  it('Other stays focus-only while empty — Enter does not send', async () => {
    const wrapper = mountCard(singleQuestionDef)
    const other = wrapper.find('.w-form__other-input')
    await other.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('typing in Other then Enter sends { other }', async () => {
    const wrapper = mountCard(singleQuestionDef)
    const other = wrapper.find('textarea.w-form__other-input')
    await other.setValue('my own answer')
    await other.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ f1: { other: 'my own answer' } }])
  })
})

describe('QuestionCardActive — offline indicator and blocked answering (P2 tracker line 107c)', () => {
  it('shows a visible offline notice and blocks a row click and a number key from answering', async () => {
    const wrapper = mount(QuestionCardActive, {
      props: {
        state: makeState(singleQuestionDef),
        submitting: false,
        banner: null,
        offline: true,
      },
      attachTo: document.body,
      global: { plugins: [PrimeVuePlugin] },
    })

    const notice = wrapper.find('[role="status"]')
    expect(notice.exists()).toBe(true)
    expect(notice.text()).toContain('You are offline. Your choices are kept.')

    await wrapper.find('.w-form__option').trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit2', key: '2' })
    expect(wrapper.emitted('submit')).toBeUndefined()
  })
})

describe('QuestionCardActive — blocked while a submit is already in flight (item 2)', () => {
  it('marks the card aria-busy and blocks a row click and a number key from submitting again', async () => {
    const wrapper = mountCard(singleQuestionDef)
    await wrapper.setProps({ submitting: true })

    expect(wrapper.find('.w-form').attributes('aria-busy')).toBe('true')
    expect(wrapper.text()).toContain('Sending your answer…')

    await wrapper.find('.w-form__option').trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.find('.w-form').trigger('keydown', { key: '2' })
    expect(wrapper.emitted('submit')).toBeUndefined()
  })
})

describe('QuestionCardActive — keyboard boundaries (item 6)', () => {
  it('a digit typed into Other does not answer the question', async () => {
    const wrapper = mountCard(singleQuestionDef)
    const other = wrapper.find('textarea.w-form__other-input')
    await other.trigger('keydown', { key: '2' })
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('a numpad digit reported with NumLock off (its `.key` is an arrow, not a digit) does not answer', async () => {
    const wrapper = mountCard(singleQuestionDef)
    // With NumLock off, the physical Numpad2 key's `.code` is still
    // `Numpad2`, but the browser reports `.key` as `ArrowDown` — matching
    // on `.code` (the old behavior) misread this as "answer option 2".
    await wrapper.find('.w-form').trigger('keydown', { code: 'Numpad2', key: 'ArrowDown' })
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('a numpad digit with NumLock on (`.key` is the digit) still answers', async () => {
    const wrapper = mountCard(singleQuestionDef)
    await wrapper.find('.w-form').trigger('keydown', { code: 'Numpad2', key: '2' })
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ f1: 'no' }])
  })

  it('Shift+digit opens that row\'s note instead of answering', async () => {
    const wrapper = mountCard(singleQuestionDef)
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('.w-form__option--editing').exists()).toBe(true)
  })
})

describe('QuestionCardActive — field description', () => {
  const withDescription: FormDefinition = {
    title: 'Deploy',
    fields: [{
      id: 'f1',
      type: 'choice',
      label: 'Deploy now?',
      description: 'This writes to the staging database only; production is not touched.',
      required: true,
      options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
      multiple: false,
      allow_other: false,
    }],
  }

  it('renders the description under the question, before the hint, in the description part', () => {
    const wrapper = mountCard(withDescription)
    const description = wrapper.find('.w-form__description')
    expect(description.exists()).toBe(true)
    expect(description.attributes('part')).toBe('description')
    expect(description.text()).toBe('This writes to the staging database only; production is not touched.')
  })

  it('renders nothing for a field with no description', () => {
    const wrapper = mountCard(singleQuestionDef)
    expect(wrapper.find('.w-form__description').exists()).toBe(false)
  })
})

describe('QuestionCardActive — 422 field errors', () => {
  it('setServerErrors shows the message on the question that owns the field', async () => {
    const wrapper = mountCard(singleQuestionDef)
    const vm = wrapper.vm as unknown as { setServerErrors: (e?: Record<string, { code: string, message: string }[]>, f?: { code: string, message: string }[]) => void }
    vm.setServerErrors({ f1: [{ code: 'invalid', message: 'That choice is no longer available.' }] })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('That choice is no longer available.')
  })
})

describe('QuestionCardActive — several questions', () => {
  it('answering advances to the next question, shows the counter, then review, then sends', async () => {
    const wrapper = mountCard(twoQuestionDef)
    expect(wrapper.text()).toContain('1/2')

    // Q1: single-choice — click answers and advances.
    await wrapper.findAll('.w-form__option')[0].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('2/2')

    // Q2: multi-choice — tick one, then send via the footer button (no Other on this field).
    await wrapper.find('.w-form__option').trigger('click')
    await wrapper.vm.$nextTick()
    const sendBtn = wrapper.find('[data-focus="send"]')
    expect(sendBtn.attributes('disabled')).toBeUndefined()
    await sendBtn.trigger('click')
    await wrapper.vm.$nextTick()

    // Review step.
    expect(wrapper.text()).toContain('Review')
    expect(wrapper.find('.w-form__review').exists()).toBe(true)
    const sendAll = wrapper.find('[data-focus="send-all"]')
    expect(sendAll.attributes('disabled')).toBeUndefined()
    await sendAll.trigger('click')
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ f1: 'yes', f2: ['proxy'] }])
  })

  it('← and → move between questions on a focused row', async () => {
    const wrapper = mountCard(twoQuestionDef)
    await wrapper.findAll('.w-form__option')[0].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('2/2')

    const row = wrapper.find('[role="checkbox"]')
    await row.trigger('keydown', { key: 'ArrowLeft' })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('1/2')
    // The answer from Q1 must still be selected after navigating back to it.
    expect(wrapper.find('.w-form__option--selected').exists()).toBe(true)
  })

  it('Enter on a multi-choice question with nothing chosen shows an inline error instead of sending', async () => {
    const wrapper = mountCard(twoQuestionDef)
    await wrapper.findAll('.w-form__option')[0].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('2/2')

    const row = wrapper.find('[role="checkbox"]')
    await row.trigger('keydown', { key: 'Enter' })
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Tick at least one answer, or type your own.')
  })

  it('reaching the review step emits update:state("review"); the collapse chevron emits update:collapsed', async () => {
    const wrapper = mountCard(twoQuestionDef)
    await wrapper.findAll('.w-form__option')[0].trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.find('.w-form__option').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.find('[data-focus="send"]').trigger('click')
    await wrapper.vm.$nextTick()

    const stateEvents = wrapper.emitted('update:state') ?? []
    expect(stateEvents.at(-1)).toEqual(['review'])

    await wrapper.find('.w-form__collapse').trigger('click')
    await wrapper.vm.$nextTick()
    const collapsedEvents = wrapper.emitted('update:collapsed') ?? []
    expect(collapsedEvents.at(-1)).toEqual([true])
  })

  it('reaching review with a required question still unanswered keeps focus inside the card, on that question\'s row (item 4)', async () => {
    const wrapper = mountCard(twoQuestionDef)
    // Answer Q1, then jump straight past Q2 (required, multi) into review
    // via -> without ticking or sending anything for it.
    await wrapper.findAll('.w-form__option')[0].trigger('click')
    await wrapper.vm.$nextTick()
    const q2Row = wrapper.find('[role="checkbox"]')
    await q2Row.trigger('keydown', { key: 'ArrowRight' })
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Review')
    expect(wrapper.text()).toContain('still needs an answer')

    // A disabled "Send answers" cannot take focus — it must have landed on
    // Q2's own review row instead of silently falling through to <body>.
    const missingRow = wrapper.find('[data-focus="review-item-1"]')
    expect(missingRow.exists()).toBe(true)
    expect(document.activeElement).toBe(missingRow.element)
    expect(document.activeElement).not.toBe(document.body)
  })
})
