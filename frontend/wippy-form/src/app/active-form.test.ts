import type { FormState } from '../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ActiveForm from './active-form.vue'

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
  it('renders the field error text next to the field, connected via aria-describedby, with no role="alert"', async () => {
    const wrapper = mount(ActiveForm, {
      props: { state, submitting: false, banner: null },
      global: { plugins: [PrimeVuePlugin] },
    })

    const vm = wrapper.vm as unknown as {
      setServerErrors: (e?: Record<string, { code: string, message: string }[]>, f?: { code: string, message: string }[]) => void
    }
    vm.setServerErrors({ f1: [{ code: 'required', message: 'This question is required.' }] }, [])
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('This question is required.')

    const fieldset = wrapper.find('fieldset')
    const errorList = wrapper.find('ul[id]')
    expect(errorList.exists()).toBe(true)
    expect(fieldset.attributes('aria-describedby')).toContain(errorList.attributes('id'))
  })

  it('clears a question\'s error once the user answers it', async () => {
    const wrapper = mount(ActiveForm, {
      props: { state, submitting: false, banner: null },
      global: { plugins: [PrimeVuePlugin] },
    })

    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('This question is required.')

    await wrapper.find('input[type="radio"]').setValue(true)
    expect(wrapper.text()).not.toContain('This question is required.')
    expect(wrapper.find('fieldset').attributes('aria-describedby')).toBeUndefined()
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

  it('announces the error summary in the polite status region on a validation failure', async () => {
    const wrapper = mount(ActiveForm, {
      props: { state, submitting: false, banner: null },
      global: { plugins: [PrimeVuePlugin] },
    })

    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    const status = wrapper.find('[role="status"]')
    expect(status.exists()).toBe(true)
    expect(status.text()).toBe('1 question needs an answer.')
  })

  it('mirrors a submit-failure banner into the polite status region', async () => {
    const wrapper = mount(ActiveForm, {
      props: { state, submitting: false, banner: null },
      global: { plugins: [PrimeVuePlugin] },
    })
    await wrapper.setProps({ banner: { message: 'Network problem. Retrying…', retryable: true } })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="status"]').text()).toBe('Network problem. Retrying…')
  })
})

describe('ActiveForm — offline', () => {
  it('disables Submit and shows a polite offline notice', () => {
    const wrapper = mount(ActiveForm, {
      props: { state, submitting: false, banner: null, offline: true },
      global: { plugins: [PrimeVuePlugin] },
    })

    expect(wrapper.text()).toContain('You are offline. Your choices are kept.')
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })
})

describe('ActiveForm — blank Other answer', () => {
  it('asks for the Other text on that question instead of silently dropping it', async () => {
    const withOther: FormState = {
      ...state,
      definition: {
        title: 'Question',
        fields: [{
          id: 'extras',
          type: 'choice',
          label: 'Extras',
          required: false,
          options: [{ value: 'gift', label: 'Gift wrap' }],
          multiple: true,
          allow_other: true,
        }],
      },
      data: { extras: ['gift', { other: '' }] },
    }
    const wrapper = mount(ActiveForm, {
      props: { state: withOther, submitting: false, banner: null },
      global: { plugins: [PrimeVuePlugin] },
      attachTo: document.body,
    })
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Enter the other answer.')
    expect(wrapper.find('[role="status"]').text()).toContain('1 question needs an answer.')
    wrapper.unmount()
  })
})
