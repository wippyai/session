import type { FormState } from '../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ActiveForm from './ActiveForm.vue'

const state: FormState = {
  form_version: 1,
  artifact_id: 'artifact-1',
  session_id: 'session-1',
  status: 'active',
  stale: false,
  late: false,
  content_version: 1,
  definition: {
    title: 'Question',
    fields: [
      {
        id: 'f1',
        type: 'choice',
        label: 'Pick one',
        required: true,
        options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
        multiple: false,
        allow_other: false,
      },
    ],
  },
  data: null,
  submitted_at: null,
  answer_message_id: null,
  delivery: null,
}

describe('ActiveForm — server-side validation errors', () => {
  it('renders the field error text next to the field on a 422 response', async () => {
    const wrapper = mount(ActiveForm, {
      props: { state, submitting: false, banner: null },
      global: { plugins: [PrimeVuePlugin] },
    })

    const vm = wrapper.vm as unknown as {
      setServerErrors: (e?: Record<string, { code: string, message: string }[]>, f?: { code: string, message: string }[]) => void
    }
    vm.setServerErrors({ f1: [{ code: 'required', message: 'This question is required.' }] }, [])
    await wrapper.vm.$nextTick()

    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('This question is required.')
  })

  it('renders form-level errors from a 422 response', async () => {
    const wrapper = mount(ActiveForm, {
      props: { state, submitting: false, banner: null },
      global: { plugins: [PrimeVuePlugin] },
    })

    const vm = wrapper.vm as unknown as {
      setServerErrors: (e?: Record<string, { code: string, message: string }[]>, f?: { code: string, message: string }[]) => void
    }
    vm.setServerErrors({}, [{ code: 'stale', message: 'This form changed since you loaded it.' }])
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('This form changed since you loaded it.')
  })
})
