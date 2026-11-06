import type { FormDefinition } from '../../lib/definition'
import { mount } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { describe, expect, it } from 'vitest'
import { formState } from '../../test-support/fixtures'
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

/** Mounts the card with the form's props, which `props` can override. `global` adds mounting options. */
function mountCard(definition: FormDefinition, props: { offline?: boolean, submitting?: boolean } = {}, global: Record<string, unknown> = {}) {
  return mount(QuestionCardActive, {
    props: { state: formState({ definition }), submitting: false, banner: null, ...props },
    attachTo: document.body,
    global: { plugins: [PrimeVuePlugin], ...global },
  })
}

describe('QuestionCardActive: styling API surface', () => {
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

describe('QuestionCardActive: single question, single answer', () => {
  it('clicking a row answers and submits the whole form', async () => {
    const wrapper = mountCard(singleQuestionDef)
    await wrapper.findAll('.w-form__option')[0].trigger('click')
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ f1: 'yes' }])
  })

  it('pressing a row\'s number key answers it', async () => {
    const wrapper = mountCard(singleQuestionDef)
    // A real digit keypress carries both, `.key` is what the handler
    // actually reads for a plain (non-Shift) digit.
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit2', key: '2' })
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ f1: 'no' }])
  })

  it('Other stays focus-only while empty: Enter does not send', async () => {
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

describe('QuestionCardActive: offline indicator and blocked answering', () => {
  it('shows a visible offline notice and blocks a row click and a number key from answering', async () => {
    const wrapper = mountCard(singleQuestionDef, { offline: true })

    const notice = wrapper.find('[role="status"]')
    expect(notice.exists()).toBe(true)
    expect(notice.text()).toContain('You are offline. Your choices are kept.')

    // Assistive technology needs the blocked state on the control itself.
    const row = wrapper.find('[role="radio"]')
    expect(row.attributes('aria-disabled')).toBe('true')

    await wrapper.find('.w-form__option').trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit2', key: '2' })
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('does not mark answer rows aria-disabled while online and idle', () => {
    const wrapper = mountCard(singleQuestionDef)
    const row = wrapper.find('[role="radio"]')
    expect(row.attributes('aria-disabled')).toBeUndefined()
  })
})

describe('QuestionCardActive: blocked while a submit is already in flight', () => {
  it('marks the card aria-busy and blocks a row click and a number key from submitting again', async () => {
    const wrapper = mountCard(singleQuestionDef)
    await wrapper.setProps({ submitting: true })

    expect(wrapper.find('.w-form').attributes('aria-busy')).toBe('true')
    expect(wrapper.text()).toContain('Sending your answer…')
    expect(wrapper.find('[role="radio"]').attributes('aria-disabled')).toBe('true')

    await wrapper.find('.w-form__option').trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.find('.w-form').trigger('keydown', { key: '2' })
    expect(wrapper.emitted('submit')).toBeUndefined()
  })
})

describe('QuestionCardActive: keyboard boundaries', () => {
  it('a digit typed into Other does not answer the question', async () => {
    const wrapper = mountCard(singleQuestionDef)
    const other = wrapper.find('textarea.w-form__other-input')
    await other.trigger('keydown', { key: '2' })
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('a numpad digit reported with NumLock off (its `.key` is an arrow, not a digit) does not answer', async () => {
    const wrapper = mountCard(singleQuestionDef)
    // With NumLock off the key's `.code` is still `Numpad2` and its `.key` is
    // `ArrowDown`. The handler reads `.key`, so this is navigation, not answer 2.
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

describe('QuestionCardActive: Escape in a note closes it without losing the draft', () => {
  it('closes the note editor but keeps the typed draft, shown back under the row', async () => {
    const wrapper = mountCard(singleQuestionDef)
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await wrapper.vm.$nextTick()

    const note = wrapper.find('textarea.w-form__note-input')
    await note.setValue('leave at the door')
    await note.trigger('keydown', { key: 'Escape' })
    await wrapper.vm.$nextTick()

    // The editor closed...
    expect(wrapper.find('.w-form__option--editing').exists()).toBe(false)
    // ...but the draft was not cleared, it shows back under the row, and
    // nothing was submitted (Escape leaves the box, it does not answer).
    expect(wrapper.find('.w-form__option-note').text()).toContain('leave at the door')
    expect(wrapper.emitted('submit')).toBeUndefined()

    // Reopening the note (Shift+1 again) shows the same text still there.
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await wrapper.vm.$nextTick()
    expect((wrapper.find('textarea.w-form__note-input').element as HTMLTextAreaElement).value).toBe('leave at the door')
  })
})

describe('QuestionCardActive: form title and description', () => {
  it('shows the form title on a single-question card, not only a several-question one', () => {
    const wrapper = mountCard(singleQuestionDef)
    const title = wrapper.find('.w-form__title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toContain('Deploy')
  })

  it('shows the form-level description, in the muted style, with backticks rendered as inline code', () => {
    const withFormDescription: FormDefinition = {
      ...singleQuestionDef,
      description: 'Uses the `staging` cluster only.',
    }
    const wrapper = mountCard(withFormDescription)
    const description = wrapper.find('.w-form__form-description')
    expect(description.exists()).toBe(true)
    expect(description.attributes('part')).toBe('form-description')
    expect(description.find('code').exists()).toBe(true)
    expect(description.find('code').text()).toBe('staging')
  })

  it('renders no form-description element when the definition has none', () => {
    const wrapper = mountCard(singleQuestionDef)
    expect(wrapper.find('.w-form__form-description').exists()).toBe(false)
  })
})

describe('QuestionCardActive: field description', () => {
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

describe('QuestionCardActive: 422 field errors', () => {
  it('setServerErrors shows the message on the question that owns the field', async () => {
    const wrapper = mountCard(singleQuestionDef)
    const vm = wrapper.vm as unknown as { setServerErrors: (e?: Record<string, { code: string, message: string }[]>, f?: { code: string, message: string }[]) => void }
    vm.setServerErrors({ f1: [{ code: 'invalid', message: 'That choice is no longer available.' }] })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('That choice is no longer available.')
  })
})

describe('QuestionCardActive: length-error and server-error alerts are linked to the textarea', () => {
  it('links the Other textarea to its own too-long alert via aria-describedby/aria-invalid', async () => {
    const wrapper = mountCard(singleQuestionDef)
    const other = wrapper.find('textarea.w-form__other-input')
    await other.setValue('x'.repeat(2001))

    expect(other.attributes('aria-invalid')).toBe('true')
    const describedBy = other.attributes('aria-describedby')
    expect(describedBy).toBeTruthy()
    const errorEl = wrapper.find(`#${describedBy}`)
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toContain('Use at most 2,000 characters.')
  })

  it('is not marked invalid while the Other textarea is empty', () => {
    const wrapper = mountCard(singleQuestionDef)
    const other = wrapper.find('textarea.w-form__other-input')
    expect(other.attributes('aria-invalid')).toBeUndefined()
    expect(other.attributes('aria-describedby')).toBeUndefined()
  })

  it('links a note textarea to its own too-long alert via aria-describedby/aria-invalid', async () => {
    const wrapper = mountCard(singleQuestionDef)
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await wrapper.vm.$nextTick()

    const note = wrapper.find('textarea.w-form__note-input')
    expect(note.exists()).toBe(true)
    await note.setValue('x'.repeat(1001))

    expect(note.attributes('aria-invalid')).toBe('true')
    const describedBy = note.attributes('aria-describedby')
    expect(describedBy).toBeTruthy()
    const errorEl = wrapper.find(`#${describedBy}`)
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toContain('Use at most 1,000 characters.')
  })

  it('links the Other textarea to the question\'s server error once one is set', async () => {
    const wrapper = mountCard(singleQuestionDef)
    const vm = wrapper.vm as unknown as { setServerErrors: (e?: Record<string, { code: string, message: string }[]>) => void }
    vm.setServerErrors({ f1: [{ code: 'invalid', message: 'That choice is no longer available.' }] })
    await wrapper.vm.$nextTick()

    // The Other textarea names the same error as the options group.
    const groupErrorId = wrapper.find('[role="radiogroup"]').attributes('aria-describedby')
    expect(groupErrorId).toBeTruthy()

    const other = wrapper.find('textarea.w-form__other-input')
    expect(other.attributes('aria-invalid')).toBe('true')
    const describedBy = (other.attributes('aria-describedby') ?? '').split(' ')
    expect(describedBy).toContain(groupErrorId)
  })

  // The test-utils <transition> stub is a real element that captures $attrs, so
  // the tests above prove the id strings match, not that the id lands on an
  // element. This one mounts with the real <transition> a browser has and
  // looks the id up in the tree.
  it('the error id that aria-describedby points at names a real element when mounted without the transition stub', async () => {
    const wrapper = mountCard(singleQuestionDef, {}, { stubs: { transition: false } })
    const vm = wrapper.vm as unknown as { setServerErrors: (e?: Record<string, { code: string, message: string }[]>) => void }
    vm.setServerErrors({ f1: [{ code: 'invalid', message: 'That choice is no longer available.' }] })
    await wrapper.vm.$nextTick()

    const groupErrorId = wrapper.find('[role="radiogroup"]').attributes('aria-describedby')
    expect(groupErrorId).toBeTruthy()

    // Looked up in this wrapper's own tree, because `useId()` values can repeat
    // across separately mounted apps.
    const target = wrapper.element.querySelector(`#${groupErrorId}`)
    expect(target).not.toBeNull()
    expect(target?.getAttribute('role')).toBe('alert')
    expect(target?.textContent).toContain('That choice is no longer available.')
  })
})

describe('QuestionCardActive: several questions', () => {
  it('answering advances to the next question, shows the counter, then review, then sends', async () => {
    const wrapper = mountCard(twoQuestionDef)
    expect(wrapper.text()).toContain('1/2')

    // Q1: single-choice, click answers and advances.
    await wrapper.findAll('.w-form__option')[0].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('2/2')

    // Q2: multi-choice, tick one, then send via the footer button (no Other on this field).
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

  it('reaching the review step emits step-change("review"); the collapse chevron emits collapsed-change', async () => {
    const wrapper = mountCard(twoQuestionDef)
    await wrapper.findAll('.w-form__option')[0].trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.find('.w-form__option').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.find('[data-focus="send"]').trigger('click')
    await wrapper.vm.$nextTick()

    const stateEvents = wrapper.emitted('step-change') ?? []
    expect(stateEvents.at(-1)).toEqual(['review'])

    await wrapper.find('.w-form__collapse').trigger('click')
    await wrapper.vm.$nextTick()
    const collapsedEvents = wrapper.emitted('collapsed-change') ?? []
    expect(collapsedEvents.at(-1)).toEqual([true])
  })

  it('keeps focus on the collapse button when it hides and shows the answers, and does not move it to the card', async () => {
    const wrapper = mountCard(twoQuestionDef)
    const toggle = wrapper.find('.w-form__collapse')
    ;(toggle.element as HTMLElement).focus()
    expect(document.activeElement).toBe(toggle.element)

    for (const label of ['Hide answers', 'Show answers']) {
      expect(toggle.attributes('aria-label')).toBe(label)
      await toggle.trigger('click')
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()
      expect(document.activeElement).toBe(toggle.element)
      expect(document.activeElement).not.toBe(wrapper.find('.w-form').element)
    }
    expect(toggle.attributes('aria-label')).toBe('Hide answers')
    wrapper.unmount()
  })

  it('names each review row by its question, its answer and the action, not by a label that hides them', async () => {
    const wrapper = mountCard(twoQuestionDef)
    await wrapper.findAll('[role="radio"]')[1].trigger('click') // Q1: "No"
    await wrapper.vm.$nextTick()
    await wrapper.find('.w-form__option').trigger('click') // Q2: tick "proxy"
    await wrapper.vm.$nextTick()
    await wrapper.find('[data-focus="send"]').trigger('click')
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('.w-form__review-edit')
    expect(rows).toHaveLength(2)
    for (const row of rows)
      expect(row.attributes('aria-label')).toBeUndefined()
    const names = rows.map(row => row.text().replaceAll(/\s+/g, ' ').trim())
    expect(names[0]).toContain('Question 1')
    expect(names[0]).toContain('Widen the peer range?')
    expect(names[0]).toContain('No')
    expect(names[0]).toContain('Change the answer')
    expect(names[1]).toContain('Question 2')
    expect(names[1]).toContain('Which packages?')
    expect(names[1]).toContain('proxy')
    expect(names[1]).toContain('Change the answer')
    wrapper.unmount()
  })

  it('reaching review with a required question still unanswered keeps focus inside the card, on that question\'s row', async () => {
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

    // A disabled "Send answers" cannot take focus, it must have landed on
    // Q2's own review row instead of silently falling through to <body>.
    const missingRow = wrapper.find('[data-focus="review-item-1"]')
    expect(missingRow.exists()).toBe(true)
    expect(document.activeElement).toBe(missingRow.element)
    expect(document.activeElement).not.toBe(document.body)
  })
})

describe('QuestionCardActive: checkbox visual state follows the model', () => {
  // PrimeVue's Checkbox listens to its own native `change` event and can update
  // its mark independently of the `selected` prop. A real click fires that event
  // and the row's `click` together, which jsdom cannot reproduce, so the test
  // fires `change` alone to show that the mark follows the model.
  it('does not let the checkbox\'s own native change event move its visual mark independently of the selected prop', async () => {
    const wrapper = mountCard(twoQuestionDef)
    // Reach f2 (multi-choice, two options, no Other).
    await wrapper.findAll('.w-form__option')[0].trigger('click')
    await wrapper.vm.$nextTick()

    // Open the first option's note.
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await wrapper.vm.$nextTick()
    const row = wrapper.find('.w-form__option--editing')
    expect(row.exists()).toBe(true)

    // Not yet ticked: our own model and the Checkbox agree, both unselected.
    expect(wrapper.find('[role="checkbox"]').attributes('aria-checked')).toBe('false')
    expect(wrapper.find('.w-form__option-mark').attributes('data-p-checked')).toBe('false')

    // Fire only the native `change` event, without the row's `click` handler that ticks through `activate()`.
    const checkboxInput = row.find('input[type="checkbox"]')
    const checkboxEl = checkboxInput.element as HTMLInputElement
    checkboxEl.checked = true
    await checkboxInput.trigger('change')
    await wrapper.vm.$nextTick()

    // The row's aria-checked follows `selected`, which nothing changed, and the
    // Checkbox's own mark must agree with it instead of flipping on its own.
    expect(row.attributes('part')).not.toContain('option-selected')
    expect(wrapper.find('[role="checkbox"]').attributes('aria-checked')).toBe('false')
    expect(wrapper.find('.w-form__option-mark').attributes('data-p-checked')).toBe('false')
  })
})

describe('QuestionCardActive: single-choice is one Tab stop with a roving tabindex', () => {
  it('starts with tabindex=0 on the first row and -1 on the rest, for a single-choice (radio) question', () => {
    const wrapper = mountCard(singleQuestionDef)
    const rows = wrapper.findAll('[role="radio"]')
    expect(rows).toHaveLength(2)
    expect(rows[0].attributes('tabindex')).toBe('0')
    expect(rows[1].attributes('tabindex')).toBe('-1')
  })

  it('moves the roving tabindex (not just focus) when arrow keys move between rows', async () => {
    const wrapper = mountCard(singleQuestionDef)
    const rows = wrapper.findAll('[role="radio"]')
    await rows[0].trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()

    const rowsAfter = wrapper.findAll('[role="radio"]')
    expect(rowsAfter[0].attributes('tabindex')).toBe('-1')
    expect(rowsAfter[1].attributes('tabindex')).toBe('0')
  })

  it('puts the roving tabindex on the already-chosen row when returning to an earlier single-choice question from the review step', async () => {
    const wrapper = mountCard(twoQuestionDef)
    // Answer f1 with "No" (index 1), then reach the review via f2.
    const f1Rows = wrapper.findAll('[role="radio"]')
    await f1Rows[1].trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.find('.w-form__option').trigger('click') // f2, multi: tick one option
    await wrapper.vm.$nextTick()
    await wrapper.find('[data-focus="send"]').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.w-form__review').exists()).toBe(true)

    // "Question 1: change the answer" returns to f1.
    await wrapper.find('[data-focus="review-item-0"]').trigger('click')
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('[role="radio"]')
    expect(rows[0].attributes('tabindex')).toBe('-1')
    expect(rows[1].attributes('tabindex')).toBe('0') // "No", the stored answer.
  })

  it('leaves every row its own Tab stop (tabindex=0) for a multi-choice (checkbox) question: no roving', async () => {
    const wrapper = mountCard(twoQuestionDef)
    // Reach f2 (multi-choice).
    await wrapper.findAll('.w-form__option')[0].trigger('click')
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('[role="checkbox"]')
    expect(rows).toHaveLength(2)
    expect(rows[0].attributes('tabindex')).toBe('0')
    expect(rows[1].attributes('tabindex')).toBe('0')
  })
})
