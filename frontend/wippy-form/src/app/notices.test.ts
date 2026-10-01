import type { FormDefinition } from '../lib/definition'
import type { MessageSeverity } from '../lib/error-text'
import { mount } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { describe, expect, it } from 'vitest'
import FormNotice from './form-notice.vue'

// Which message the notice shows, and when, is decided by `wippy-form.vue` and
// tested in `wippy-form.test.ts`. These tests cover how the notice shows a form
// with standard fields.
const definition: FormDefinition = {
  title: 'Delivery details',
  description: 'Where should it go?',
  fields: [
    { id: 'name', type: 'text', label: 'Full name', required: true },
    { id: 'notes', type: 'textarea', label: 'Notes', required: false },
    { id: 'mail', type: 'email', label: 'Email', required: true },
    { id: 'qty', type: 'number', label: 'Parcels', required: false },
    { id: 'day', type: 'date', label: 'Delivery date', required: false },
    { id: 'consent', type: 'checkbox', label: 'I agree', required: true },
    { id: 'speed', type: 'choice', label: 'Speed', required: false, options: [{ value: 'fast', label: 'Fast' }], multiple: false, allow_other: false },
  ],
}

function mountNotice(severity: MessageSeverity) {
  return mount(FormNotice, { props: { definition, severity, message: 'Not here.' }, global: { plugins: [PrimeVuePlugin] } })
}

function plain(wrapper: ReturnType<typeof mountNotice>) {
  return wrapper.findAll('input, textarea').filter(el => (el.element as HTMLInputElement).type !== 'radio')
}

describe.each(['warn', 'secondary'] as const)('FormNotice (%s): standard fields', (severity) => {
  it('renders every field as a real, disabled control of its own kind, never an empty radio group', () => {
    const wrapper = mountNotice(severity)

    const controls = plain(wrapper)
    expect(controls.length).toBeGreaterThanOrEqual(6)
    expect(controls.every(c => (c.element as HTMLInputElement).disabled)).toBe(true)
    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(1)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('keeps the title, description and every question readable, and shows no answer', () => {
    const wrapper = mountNotice(severity)
    for (const text of ['Delivery details', 'Where should it go?', 'Full name', 'Notes', 'Email', 'Parcels', 'Delivery date', 'I agree', 'Speed'])
      expect(wrapper.text()).toContain(text)
    expect(wrapper.text()).not.toContain('Skipped')
    expect(wrapper.text()).not.toContain('—')
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false)
  })

  it('names the card, its unsupported state and the form as parts and classes, with the shared header', () => {
    const root = mountNotice(severity).element as HTMLElement
    expect(root.getAttribute('part')?.split(' ')).toEqual(expect.arrayContaining(['card', 'card-unsupported', 'fields']))
    for (const name of ['w-form', 'w-form__card', 'w-form__card--unsupported', 'w-form__fields'])
      expect(root.classList.contains(name), name).toBe(true)
    expect(root.querySelector('[part~="fields-title"]')?.textContent?.trim()).toBe('Delivery details')
    expect(root.querySelector('[part~="form-description"]')?.textContent?.trim()).toBe('Where should it go?')
  })

  it('shows the message in a Message of its severity', () => {
    const wrapper = mountNotice(severity)
    expect(wrapper.text()).toContain('Not here.')
    expect(wrapper.find(`.p-message-${severity}`).exists()).toBe(true)
  })
})
