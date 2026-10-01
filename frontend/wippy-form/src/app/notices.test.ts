import type { FormDefinition } from '../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FormNotice from './form-notice.vue'

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

function mountNotice(reason: 'needs-newer-host' | 'no-artifact', answered?: boolean) {
  return mount(FormNotice, { props: { definition, reason, answered }, global: { plugins: [PrimeVuePlugin] } })
}

function plain(wrapper: ReturnType<typeof mountNotice>) {
  return wrapper.findAll('input, textarea').filter(el => (el.element as HTMLInputElement).type !== 'radio')
}

describe.each(['needs-newer-host', 'no-artifact'] as const)('FormNotice (%s) — V2 fields', (reason) => {
  it('renders every field as a real, disabled control of its own kind, never an empty radio group', () => {
    const wrapper = mountNotice(reason)

    const controls = plain(wrapper)
    expect(controls.length).toBeGreaterThanOrEqual(6)
    expect(controls.every(c => (c.element as HTMLInputElement).disabled)).toBe(true)
    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(1)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('keeps the title, description and every question readable, and shows no answer', () => {
    const wrapper = mountNotice(reason)
    for (const text of ['Delivery details', 'Where should it go?', 'Full name', 'Notes', 'Email', 'Parcels', 'Delivery date', 'I agree', 'Speed'])
      expect(wrapper.text()).toContain(text)
    expect(wrapper.text()).not.toContain('Skipped')
    expect(wrapper.text()).not.toContain('—')
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false)
  })

  it('names the card, its unsupported state and the form as parts and classes, with the shared header', () => {
    const root = mountNotice(reason).element as HTMLElement
    expect(root.getAttribute('part')?.split(' ')).toEqual(expect.arrayContaining(['card', 'card-unsupported', 'fields']))
    for (const name of ['w-form', 'w-form__card', 'w-form__card--unsupported', 'w-form__fields'])
      expect(root.classList.contains(name), name).toBe(true)
    expect(root.querySelector('[part~="fields-title"]')?.textContent?.trim()).toBe('Delivery details')
    expect(root.querySelector('[part~="form-description"]')?.textContent?.trim()).toBe('Where should it go?')
  })
})

describe('FormNotice — needs-newer-host', () => {
  it('says what to do, depending on whether the form was already answered', () => {
    const open = mountNotice('needs-newer-host')
    expect(open.text()).toContain('This form needs a newer Web Host. If you already answered it, your answer is in the chat.')
    expect(open.find('.p-message-warn').exists()).toBe(true)
    const done = mountNotice('needs-newer-host', true)
    expect(done.text()).toContain('This form was answered. Your answer is in the chat.')
    expect(done.text()).not.toContain('needs a newer Web Host')
    expect(done.find('.p-message-secondary').exists()).toBe(true)
  })
})

describe('FormNotice — no-artifact', () => {
  it('says the form cannot be submitted here, whatever the Host says it is answered', () => {
    const wrapper = mountNotice('no-artifact')
    expect(wrapper.text()).toContain('This form cannot be submitted here.')
    expect(wrapper.find('.p-message-secondary').exists()).toBe(true)
    expect(mountNotice('no-artifact', true).text()).toContain('This form cannot be submitted here.')
  })
})
