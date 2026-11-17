import type { FormField } from '../../lib/definition'
import { mount } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { describe, expect, it } from 'vitest'
import ChoiceField from './choice-field.vue'

const trickyField: FormField = {
  id: 'f1',
  type: 'choice',
  label: 'Pick one',
  required: true,
  // One value is the reserved word "other" and one contains a space, so
  // neither can be used directly as an HTML id.
  options: [
    { value: 'other', label: 'Literally "other"' },
    { value: 'has spaces', label: 'Has spaces' },
  ],
  multiple: false,
  allow_other: true,
}

function mountField(field: FormField = trickyField) {
  return mount(ChoiceField, { props: { field }, global: { plugins: [PrimeVuePlugin] } })
}

describe('ChoiceField', () => {
  it('builds option ids from the index and keeps the Other control id distinct', () => {
    const wrapper = mountField()

    const ids = wrapper.findAll('[id]').map(el => el.attributes('id') as string)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids)
      expect(id).not.toContain(' ')

    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(3)
    expect(radios[0].attributes('id')).toMatch(/-opt-0$/)
    expect(radios[1].attributes('id')).toMatch(/-opt-1$/)
    expect(radios[2].attributes('id')).toMatch(/-other$/)
  })

  it('gives the Other radio and its text input separate accessible names', () => {
    const wrapper = mountField()

    const otherRadioId = wrapper.findAll('input[type="radio"]')[2].attributes('id') as string
    expect(wrapper.find(`label[for="${otherRadioId}"]`).text()).toBe('Other')

    const otherTextId = wrapper.find('input[type="text"]').attributes('id') as string
    expect(otherTextId).not.toBe(otherRadioId)
    expect(wrapper.find(`label[for="${otherTextId}"]`).text()).toBe('Other answer')
  })

  it('shows every control disabled and unselected', () => {
    const wrapper = mountField()
    const controls = wrapper.findAll('input')
    expect(controls.length).toBeGreaterThan(0)
    expect(controls.every(c => (c.element as HTMLInputElement).disabled && !(c.element as HTMLInputElement).checked)).toBe(true)
  })

  it('describes the fieldset with the description', () => {
    const wrapper = mountField({ ...trickyField, description: 'Pick carefully' })
    const description = wrapper.find('p')
    expect(description.text()).toBe('Pick carefully')
    expect(wrapper.find('fieldset').attributes('aria-describedby')).toBe(description.attributes('id'))
  })

  it('uses role="radiogroup" for single choice and role="group" for multiple choice', () => {
    expect(mountField().find('[role="radiogroup"]').exists()).toBe(true)

    const multiple = mountField({ ...trickyField, multiple: true })
    expect(multiple.find('[role="group"]').exists()).toBe(true)
    expect(multiple.find('[role="radiogroup"]').exists()).toBe(false)
    expect(multiple.findAll('input[type="checkbox"]')).toHaveLength(3)
  })

  it('marks a required question', () => {
    expect(mountField().text()).toContain('(required)')
    expect(mountField({ ...trickyField, required: false }).text()).not.toContain('(required)')
  })
})
