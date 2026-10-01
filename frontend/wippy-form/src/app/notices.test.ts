import type { FormDefinition } from '../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import NeedsNewerHostNotice from './needs-newer-host-notice.vue'
import NoArtifactNotice from './no-artifact-notice.vue'

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

function plain(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('input, textarea').filter(el => (el.element as HTMLInputElement).type !== 'radio')
}

describe.each([
  ['NeedsNewerHostNotice', NeedsNewerHostNotice],
  ['NoArtifactNotice', NoArtifactNotice],
] as const)('%s — V2 fields', (_name, Notice) => {
  it('renders every field as a real, disabled control of its own kind, never an empty radio group', () => {
    const wrapper = mount(Notice, { props: { definition }, global: { plugins: [PrimeVuePlugin] } })

    const controls = plain(wrapper)
    expect(controls.length).toBeGreaterThanOrEqual(6)
    expect(controls.every(c => (c.element as HTMLInputElement).disabled)).toBe(true)
    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(1)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('keeps the title, description and every question readable, and shows no answer', () => {
    const wrapper = mount(Notice, { props: { definition }, global: { plugins: [PrimeVuePlugin] } })
    for (const text of ['Delivery details', 'Where should it go?', 'Full name', 'Notes', 'Email', 'Parcels', 'Delivery date', 'I agree', 'Speed'])
      expect(wrapper.text()).toContain(text)
    expect(wrapper.text()).not.toContain('Skipped')
    expect(wrapper.text()).not.toContain('—')
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false)
  })
})

describe('NeedsNewerHostNotice', () => {
  it('says what to do, depending on whether the form was already answered', () => {
    const open = mount(NeedsNewerHostNotice, { props: { definition }, global: { plugins: [PrimeVuePlugin] } })
    expect(open.text()).toContain('This form needs a newer Web Host.')
    const done = mount(NeedsNewerHostNotice, { props: { definition, answered: true }, global: { plugins: [PrimeVuePlugin] } })
    expect(done.text()).toContain('This form was answered. Your answer is in the chat.')
  })
})

describe('NoArtifactNotice', () => {
  it('says the form cannot be submitted here', () => {
    const wrapper = mount(NoArtifactNotice, { props: { definition }, global: { plugins: [PrimeVuePlugin] } })
    expect(wrapper.text()).toContain('This form cannot be submitted here.')
  })
})
