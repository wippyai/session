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
    // A real digit keypress carries both — `.key` is what the handler
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

    // Rows silently ignoring clicks (via JS) is not enough — assistive tech
    // needs the disabled state marked on the control itself.
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

describe('QuestionCardActive — blocked while a submit is already in flight', () => {
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

describe('QuestionCardActive — keyboard boundaries', () => {
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

describe('QuestionCardActive — Escape in a note closes it without losing the draft', () => {
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
    // ...but the draft was not cleared — it shows back under the row, and
    // nothing was submitted (Escape leaves the box, it does not answer).
    expect(wrapper.find('.w-form__option-note').text()).toContain('leave at the door')
    expect(wrapper.emitted('submit')).toBeUndefined()

    // Reopening the note (Shift+1 again) shows the same text still there.
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await wrapper.vm.$nextTick()
    expect((wrapper.find('textarea.w-form__note-input').element as HTMLTextAreaElement).value).toBe('leave at the door')
  })
})

describe('QuestionCardActive — form title and description (the one-question card was missing both)', () => {
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

describe('QuestionCardActive — length-error and server-error alerts are linked to the textarea', () => {
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

    // The options group already points its own aria-describedby at the
    // question's error Message — the Other textarea must reference that
    // same id too, not just the group as a whole.
    const groupErrorId = wrapper.find('[role="radiogroup"]').attributes('aria-describedby')
    expect(groupErrorId).toBeTruthy()

    const other = wrapper.find('textarea.w-form__other-input')
    expect(other.attributes('aria-invalid')).toBe('true')
    const describedBy = (other.attributes('aria-describedby') ?? '').split(' ')
    expect(describedBy).toContain(groupErrorId)
  })

  // PrimeVue's `Message` sets `inheritAttrs: false`. vue-test-utils mounts
  // with its OWN <transition> stub by default, which renders as a real DOM
  // element (<transition-stub>) that captures $attrs regardless of the
  // wrapped component's own inheritAttrs setting — so the test above proves
  // the STRING ids match, but not that the id actually lands on anything in
  // a real (non-test-stub) render. This one mounts with the real
  // <transition> (global.stubs.transition: false, matching an actual
  // browser) and resolves the id through `document.getElementById` to prove
  // it names a real element, not a dangling reference the browser would
  // silently fail to link.
  it('the error id an Other/radiogroup aria-describedby points at resolves to a real element in an UNSTUBBED render (not just a matching string)', async () => {
    const wrapper = mount(QuestionCardActive, {
      props: {
        state: makeState(singleQuestionDef),
        submitting: false,
        banner: null,
      },
      attachTo: document.body,
      global: { plugins: [PrimeVuePlugin], stubs: { transition: false } },
    })
    try {
      const vm = wrapper.vm as unknown as { setServerErrors: (e?: Record<string, { code: string, message: string }[]>) => void }
      vm.setServerErrors({ f1: [{ code: 'invalid', message: 'That choice is no longer available.' }] })
      await wrapper.vm.$nextTick()

      const groupErrorId = wrapper.find('[role="radiogroup"]').attributes('aria-describedby')
      expect(groupErrorId).toBeTruthy()

      // Scoped to THIS wrapper's own rendered tree, not the global
      // `document` — this file's other tests mount with `attachTo:
      // document.body` too and none of them unmount afterward, so stale
      // elements from earlier tests (whose Vue `useId()` counter can
      // collide with this one's, since each `mount()` starts a fresh app
      // instance) can otherwise still be sitting in `document.body` and
      // `document.getElementById` would find the WRONG, stale one.
      const target = wrapper.element.querySelector(`#${groupErrorId}`)
      expect(target).not.toBeNull()
      expect(target?.getAttribute('role')).toBe('alert')
      expect(target?.textContent).toContain('That choice is no longer available.')
    }
    finally {
      wrapper.unmount()
    }
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

    // A disabled "Send answers" cannot take focus — it must have landed on
    // Q2's own review row instead of silently falling through to <body>.
    const missingRow = wrapper.find('[data-focus="review-item-1"]')
    expect(missingRow.exists()).toBe(true)
    expect(document.activeElement).toBe(missingRow.element)
    expect(document.activeElement).not.toBe(document.body)
  })
})

describe('QuestionCardActive — checkbox visual state follows the model', () => {
  // Ticking a row's checkbox with the mouse while that row's
  // own note is open leaves aria-checked="true" (driven by our own
  // `selected` prop) but the nested PrimeVue Checkbox's own visual mark
  // empty (data-p-checked="false") — the row and its Checkbox disagree.
  // The row already marks the Checkbox purely decorative (tabindex="-1"
  // aria-hidden="true") and drives every answer through its own click
  // handler (`onRowClick` -> `activate()`), but the Checkbox is still fully
  // interactive underneath: PrimeVue wires its native <input>'s own
  // `change` event to its own internal `d_value`/`writeValue` machinery,
  // which can update the visual mark independently of the `selected` prop
  // we pass it. A real mouse click fires both that native `change` AND the
  // row's bubbled `click` in close succession — browser-timing-dependent
  // and not reproducible through jsdom's simplified event dispatch — but
  // firing the native `change` alone (bypassing the row's click handler
  // entirely) isolates the exact mechanism: PrimeVue's own internal toggle
  // running independent of the model we own. That is the divergence this
  // item asks to close.
  it('does not let the checkbox\'s own native change event move its visual mark independently of the selected prop', async () => {
    const wrapper = mountCard(twoQuestionDef)
    // Reach f2 (multi-choice, two options, no Other).
    await wrapper.findAll('.w-form__option')[0].trigger('click')
    await wrapper.vm.$nextTick()

    // Open the first option's note (the repro's starting state).
    await wrapper.find('.w-form').trigger('keydown', { code: 'Digit1', key: '!', shiftKey: true })
    await wrapper.vm.$nextTick()
    const row = wrapper.find('.w-form__option--editing')
    expect(row.exists()).toBe(true)

    // Not yet ticked: our own model and the Checkbox agree, both unselected.
    expect(wrapper.find('[role="checkbox"]').attributes('aria-checked')).toBe('false')
    expect(wrapper.find('.w-form__option-mark').attributes('data-p-checked')).toBe('false')

    // Fire only the checkbox's native `change` event — the DOM event
    // PrimeVue's own Checkbox listens to internally — without going
    // through the row's `click` handler (which owns ticking via
    // `activate()`). `selected` (and so `chosen`) is untouched.
    const checkboxInput = row.find('input[type="checkbox"]')
    const checkboxEl = checkboxInput.element as HTMLInputElement
    checkboxEl.checked = true
    await checkboxInput.trigger('change')
    await wrapper.vm.$nextTick()

    // The row's own aria-checked (still driven directly by `selected`,
    // which nothing here changed) must agree with the nested Checkbox's own
    // visual state — it must stay unselected, not flip on its own.
    expect(row.attributes('part')).not.toContain('option-selected')
    expect(wrapper.find('[role="checkbox"]').attributes('aria-checked')).toBe('false')
    expect(wrapper.find('.w-form__option-mark').attributes('data-p-checked')).toBe('false')
  })
})

describe('QuestionCardActive — single-choice is one Tab stop with a roving tabindex', () => {
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
    expect(rows[1].attributes('tabindex')).toBe('0') // "No" — the stored answer.
  })

  it('leaves every row its own Tab stop (tabindex=0) for a multi-choice (checkbox) question — no roving', async () => {
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
