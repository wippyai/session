import type { FormState } from '../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ActiveForm from './active-form.vue'
import FormHeader from './form-header.vue'
import FormNotice from './form-notice.vue'
import IdleForm from './idle-form.vue'

const state: FormState = {
  form_version: 2,
  artifact_id: 'artifact-1',
  session_id: 'session-1',
  status: 'active',
  stale: false,
  late: false,
  content_version: 1,
  definition: {
    title: 'Delivery details',
    description: 'Where should it go?',
    fields: [{ id: 'name', type: 'text', label: 'Full name', required: false }],
  },
  data: null,
  submitted_at: null,
  answer_message_id: null,
  delivery: null,
}

const global = { plugins: [PrimeVuePlugin] }

describe('FormHeader', () => {
  it('shows the title and the description under their parts and classes', () => {
    const wrapper = mount(FormHeader, { props: { title: 'Delivery details', description: 'Where should it go?' } })
    const title = wrapper.find('h2')
    expect(title.text()).toBe('Delivery details')
    expect(title.attributes('part')).toBe('fields-title')
    expect(title.classes()).toContain('w-form__fields-title')
    const description = wrapper.find('p')
    expect(description.text()).toBe('Where should it go?')
    expect(description.attributes('part')).toBe('form-description')
    expect(description.classes()).toContain('w-form__form-description')
  })

  it('shows no description element when there is none, and renders what is slotted under it', () => {
    const wrapper = mount(FormHeader, { props: { title: 'T' }, slots: { default: '<span id="extra">asked earlier</span>' } })
    expect(wrapper.find('p').exists()).toBe(false)
    expect(wrapper.find('#extra').text()).toBe('asked earlier')
  })

  it('is the one header of the open form, the answered view and the notice', () => {
    for (const wrapper of [
      mount(ActiveForm, { props: { state, submitting: false, banner: null }, global }),
      mount(IdleForm, { props: { state: { ...state, status: 'idle' } }, global }),
      mount(FormNotice, { props: { definition: state.definition, reason: 'no-artifact' }, global }),
    ]) {
      const header = wrapper.findComponent(FormHeader)
      expect(header.exists()).toBe(true)
      expect(header.props()).toEqual({ title: 'Delivery details', description: 'Where should it go?' })
    }
  })

  it('carries the "asked earlier" line of a stale open form under the description', () => {
    const wrapper = mount(ActiveForm, { props: { state: { ...state, stale: true }, submitting: false, banner: null }, global })
    const header = wrapper.findComponent(FormHeader)
    expect(header.find('[part~="notice"]').text()).toContain('Asked earlier')
    expect(mount(ActiveForm, { props: { state, submitting: false, banner: null }, global }).find('[part~="notice"]').exists()).toBe(false)
  })
})
