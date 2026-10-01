import type { FormState } from '../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import IdleForm from './idle-form.vue'

const answered: FormState = {
  form_version: 2,
  artifact_id: 'artifact-1',
  session_id: 'session-1',
  status: 'idle',
  stale: false,
  late: false,
  content_version: 2,
  definition: {
    title: 'Delivery details',
    fields: [
      { id: 'name', type: 'text', label: 'Full name', required: true },
      { id: 'notes', type: 'textarea', label: 'Notes', required: false },
      { id: 'mail', type: 'email', label: 'Email', required: true },
      { id: 'qty', type: 'number', label: 'Parcels', required: false },
      { id: 'day', type: 'date', label: 'Delivery date', required: false },
      { id: 'consent', type: 'checkbox', label: 'I agree', required: true },
      { id: 'later', type: 'text', label: 'Anything else', required: false },
      { id: 'news', type: 'checkbox', label: 'Newsletter', required: false },
    ],
  },
  data: { name: 'Ada', notes: 'line one\nline two', mail: 'ada@example.com', qty: 3, day: '2026-10-15', consent: true, news: false },
  submitted_at: '2026-10-01T10:00:00.000Z',
  answer_message_id: 'msg-1',
  delivery: 'complete',
}

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

  it('shows no "(required)" marker on a read-only field', () => {
    expect(mountIdle().text()).not.toContain('(required)')
  })

  it('keeps the delivery and answered-time lines', () => {
    expect(mountIdle().text()).toContain('Answered')
  })

  it('shows the answered state in the root part', () => {
    const root = mountIdle().element as HTMLElement
    expect(root.getAttribute('part')?.split(' ')).toEqual(expect.arrayContaining(['card', 'card-answered', 'fields']))
    expect(root.className).toContain('w-form__fields')
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
        { id: 'name', type: 'text', label: 'Name', required: false },
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
    expect(valueOf(wrapper, 'Speed').text()).toContain('Other: Drone')
    expect(valueOf(wrapper, 'Extras').text()).toContain('Gift wrap')
    expect(valueOf(wrapper, 'Extras').text()).toContain('Other: Ribbon')
  })
})
