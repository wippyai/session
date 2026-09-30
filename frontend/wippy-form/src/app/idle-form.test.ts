import type { FormState } from '../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import IdleForm from './idle-form.vue'

const baseState: FormState = {
  form_version: 1,
  artifact_id: 'artifact-1',
  session_id: 'session-1',
  status: 'idle',
  stale: false,
  late: false,
  content_version: 2,
  definition: {
    title: 'Question',
    fields: [
      {
        id: 'f1',
        type: 'choice',
        label: 'Pick one',
        required: true,
        options: [{ value: 'a', label: 'A' }],
        multiple: false,
        allow_other: false,
      },
    ],
  },
  data: { f1: 'a' },
  submitted_at: null,
  answer_message_id: 'msg-1',
  delivery: null,
}

describe('IdleForm — delivery state text', () => {
  it('shows the pending message', () => {
    const wrapper = mount(IdleForm, { props: { state: { ...baseState, delivery: 'pending' } }, global: { plugins: [PrimeVuePlugin] } })
    expect(wrapper.text()).toContain('Submitted. Waiting for the assistant.')
  })

  it('shows the running message', () => {
    const wrapper = mount(IdleForm, { props: { state: { ...baseState, delivery: 'running' } }, global: { plugins: [PrimeVuePlugin] } })
    expect(wrapper.text()).toContain('The assistant is reading your answer.')
  })

  it('shows no extra delivery line when complete (only the answered-time line)', () => {
    const wrapper = mount(IdleForm, {
      props: { state: { ...baseState, delivery: 'complete', submitted_at: '2026-01-01T00:00:00.000Z' } },
      global: { plugins: [PrimeVuePlugin] },
    })
    expect(wrapper.text()).not.toContain('Waiting for the assistant')
    expect(wrapper.text()).not.toContain('reading your answer')
    expect(wrapper.text()).not.toContain('stopped before answering')
    expect(wrapper.text()).toContain('Answered')
  })

  it('shows the interrupted message', () => {
    const wrapper = mount(IdleForm, { props: { state: { ...baseState, delivery: 'interrupted' } }, global: { plugins: [PrimeVuePlugin] } })
    expect(wrapper.text()).toContain('The assistant stopped before answering. Send a message to continue.')
  })

  it('shows nothing extra when delivery is null', () => {
    const wrapper = mount(IdleForm, { props: { state: { ...baseState, delivery: null } }, global: { plugins: [PrimeVuePlugin] } })
    expect(wrapper.text()).not.toContain('Waiting for the assistant')
    expect(wrapper.text()).not.toContain('reading your answer')
    expect(wrapper.text()).not.toContain('stopped before answering')
  })
})

describe('IdleForm — required indicator hidden on read-only fields', () => {
  it('does not show "(required)" for a required, already-answered field', () => {
    const wrapper = mount(IdleForm, { props: { state: baseState }, global: { plugins: [PrimeVuePlugin] } })
    expect(wrapper.text()).not.toContain('(required)')
  })
})

describe('IdleForm — focusStatus', () => {
  it('exposes a focusable status element that receives focus when asked', async () => {
    const wrapper = mount(IdleForm, {
      props: { state: { ...baseState, submitted_at: '2026-01-01T00:00:00.000Z' } },
      attachTo: document.body,
      global: { plugins: [PrimeVuePlugin] },
    })
    const vm = wrapper.vm as unknown as { focusStatus: () => void }
    vm.focusStatus()
    await wrapper.vm.$nextTick()

    const statusEl = wrapper.find('[tabindex="-1"]')
    expect(statusEl.exists()).toBe(true)
    expect(document.activeElement).toBe(statusEl.element)
    wrapper.unmount()
  })
})
