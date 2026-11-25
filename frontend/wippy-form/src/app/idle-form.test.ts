import type { FormState } from '../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { formatAnsweredAt } from '../lib/answered-time'
import { formState } from '../test-support/fixtures'
import IdleForm from './idle-form.vue'

const answered: FormState = formState<FormState['definition']>({
  form_version: 2,
  status: 'idle',
  content_version: 2,
  definition: {
    title: 'Delivery details',
    fields: [
      { id: 'name', type: 'text', min_length: 0, max_length: 500, label: 'Full name', required: true },
      { id: 'notes', type: 'textarea', min_length: 0, max_length: 8000, label: 'Notes', required: false },
      { id: 'mail', type: 'email', label: 'Email', required: true },
      { id: 'qty', type: 'number', label: 'Parcels', required: false, integer: false },
      { id: 'day', type: 'date', label: 'Delivery date', required: false },
      { id: 'consent', type: 'checkbox', label: 'I agree', required: true },
      { id: 'later', type: 'text', min_length: 0, max_length: 500, label: 'Anything else', required: false },
      { id: 'news', type: 'checkbox', label: 'Newsletter', required: false },
    ],
  },
  data: { name: 'Ada', notes: 'line one\nline two', mail: 'ada@example.com', qty: 3, day: '2026-10-15', consent: true, news: false },
  submitted_at: '2026-10-01T10:00:00.000Z',
  answer_message_id: 'msg-1',
  delivery: 'complete',
})

function valueOf(wrapper: ReturnType<typeof mountIdle>, label: string) {
  const field = wrapper.findAll('[part~="field"]').find(f => f.find('[part~="field-label"]').text() === label)
  if (!field)
    throw new Error(`no field labelled "${label}"`)
  return field.find('[part~="field-value"]')
}

function mountIdle(state: FormState = answered) {
  return mount(IdleForm, { props: { state }, global: { plugins: [PrimeVuePlugin] } })
}

describe('IdleForm — V2 read-only values', () => {
  it('shows every stored value as text with no control at all', () => {
    const wrapper = mountIdle()
    expect(wrapper.find('input, textarea, select').exists()).toBe(false)
    expect(valueOf(wrapper, 'Full name').text()).toBe('Ada')
    expect(valueOf(wrapper, 'Email').text()).toBe('ada@example.com')
    expect(valueOf(wrapper, 'Parcels').text()).toBe('3')
    expect(valueOf(wrapper, 'Delivery date').text()).toBe('2026-10-15')
    expect(valueOf(wrapper, 'I agree').text()).toBe('Yes')
    expect(valueOf(wrapper, 'Newsletter').text()).toBe('No')
  })

  it('keeps a text answer\'s line breaks', () => {
    expect(valueOf(mountIdle(), 'Notes').html()).toContain('line one<br>line two')
  })

  it('words an unanswered field "Skipped"', () => {
    expect(valueOf(mountIdle(), 'Anything else').text()).toBe('Skipped')
  })

  // The value shows spaces as stored (pre-wrap), so a space around the word would indent it.
  it('writes "Skipped" with no space around it, so it lines up with the other values', () => {
    expect(valueOf(mountIdle(), 'Anything else').element.textContent).toBe('Skipped')
  })

  it('shows no "(required)" marker on a read-only field', () => {
    expect(mountIdle().text()).not.toContain('(required)')
  })

  it('keeps the delivery and answered-time lines', () => {
    expect(mountIdle().text()).toContain('Answered')
  })

  // The fixture's submitted_at is 2026-10-01T10:00:00.000Z, shown in the test's own time zone, as the chat would show it.
  it('writes the answered time like the chat\'s message times, with no seconds', () => {
    const status = mountIdle().get('[part~="status"]').text()
    expect(status).toBe(`Answered ${formatAnsweredAt('2026-10-01T10:00:00.000Z')}`)
    expect(status).toMatch(/^Answered Oct 1, 2026 \d{2}:00$/)
  })

  it('shows the answered state in the root part', () => {
    const root = mountIdle().element as HTMLElement
    expect(root.getAttribute('part')?.split(' ')).toEqual(expect.arrayContaining(['card', 'card-answered', 'fields']))
    expect(root.className).toContain('w-form__fields')
  })

  // A read-only answer is not a disabled control, so it is not styled as one.
  it('marks the fields read-only, never disabled', () => {
    const wrapper = mountIdle()
    const fields = wrapper.findAll('[part~="field"]')
    expect(fields).toHaveLength(answered.definition.fields.length)
    for (const field of fields)
      expect(field.attributes('part')?.split(' ')).toContain('field-readonly')
    expect(wrapper.find('[part~="field-disabled"]').exists()).toBe(false)
    expect(wrapper.find('.w-form__field--disabled').exists()).toBe(false)
  })
})

describe('IdleForm — choice answers in a fields form', () => {
  const mixed: FormState = {
    ...answered,
    definition: {
      title: 'Mixed',
      fields: [
        { id: 'speed', type: 'choice', label: 'Speed', required: false, options: [{ value: 'fast', label: 'Fast' }, { value: 'slow', label: 'Slow' }], multiple: false, allow_other: true },
        { id: 'extras', type: 'choice', label: 'Extras', required: false, options: [{ value: 'gift', label: 'Gift wrap' }], multiple: true, allow_other: true },
        { id: 'name', type: 'text', min_length: 0, max_length: 500, label: 'Name', required: false },
      ],
    },
  }

  it('shows the note of a chosen option instead of dropping the answer', () => {
    const wrapper = mountIdle({ ...mixed, data: { speed: { value: 'fast', note: 'before noon please' }, name: 'Ada' } })
    const text = valueOf(wrapper, 'Speed').text()
    expect(text).toContain('Fast')
    expect(text).toContain('before noon please')
    expect(text).not.toBe('Skipped')
  })

  it('shows an Other answer and a multiple selection', () => {
    const wrapper = mountIdle({ ...mixed, data: { speed: { other: 'Drone' }, extras: ['gift', { other: 'Ribbon' }], name: 'Ada' } })
    expect(valueOf(wrapper, 'Speed').text()).toContain('Own answer: Drone')
    expect(valueOf(wrapper, 'Extras').text()).toContain('Gift wrap')
    expect(valueOf(wrapper, 'Extras').text()).toContain('Own answer: Ribbon')
  })
})

describe('IdleForm — delivery state text', () => {
  it('shows the pending, running and interrupted messages', () => {
    expect(mountIdle({ ...answered, delivery: 'pending' }).text()).toContain('Submitted. Waiting for the assistant.')
    expect(mountIdle({ ...answered, delivery: 'running' }).text()).toContain('The assistant is reading your answer.')
    expect(mountIdle({ ...answered, delivery: 'interrupted' }).text()).toContain('The assistant stopped before answering. Send a message to continue.')
  })

  it('shows no extra delivery line when complete or unknown, only the answered-time line', () => {
    for (const delivery of ['complete', null] as const) {
      const text = mountIdle({ ...answered, delivery }).text()
      expect(text).not.toContain('Waiting for the assistant')
      expect(text).not.toContain('reading your answer')
      expect(text).not.toContain('stopped before answering')
      expect(text).toContain('Answered')
    }
  })
})

describe('IdleForm — focusStatus', () => {
  it('exposes a focusable status element that receives focus when asked', async () => {
    const wrapper = mount(IdleForm, { props: { state: answered }, attachTo: document.body, global: { plugins: [PrimeVuePlugin] } })
    const vm = wrapper.vm as unknown as { focusStatus: () => void }
    vm.focusStatus()
    await wrapper.vm.$nextTick()

    const statusEl = wrapper.find('[tabindex="-1"]')
    expect(statusEl.exists()).toBe(true)
    expect(document.activeElement).toBe(statusEl.element)
    wrapper.unmount()
  })
})
