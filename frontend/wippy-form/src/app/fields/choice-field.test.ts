import type { ChoiceFormField, FieldError } from '../../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ChoiceField from './choice-field.vue'

const trickyField: ChoiceFormField = {
  id: 'f1',
  type: 'choice',
  label: 'Pick one',
  required: true,
  // One option value literally equals the reserved "other" id fragment, and
  // one contains spaces — neither is safe to use directly as an HTML id.
  options: [
    { value: 'other', label: 'Literally "other"' },
    { value: 'has spaces', label: 'Has spaces' },
  ],
  multiple: false,
  allow_other: true,
}

function mountField(props: Partial<InstanceType<typeof ChoiceField>['$props']> = {}) {
  return mount(ChoiceField, {
    props: {
      field: trickyField,
      modelValue: undefined,
      errors: [],
      disabled: false,
      readonly: false,
      ...props,
    },
    global: { plugins: [PrimeVuePlugin] },
  })
}

describe('ChoiceField — DOM id uniqueness', () => {
  it('builds option ids from index, never from option values, and keeps the Other control id distinct', () => {
    const wrapper = mountField()

    const ids = wrapper.findAll('[id]').map(el => el.attributes('id'))
    const uniqueIds = new Set(ids)
    expect(ids.length).toBe(uniqueIds.size)

    // No id contains a raw space from the "has spaces" option value.
    for (const id of ids)
      expect(id).not.toContain(' ')

    const inputs = wrapper.findAll('input[type="radio"]')
    // Two options + the Other radio = three radio inputs.
    expect(inputs.length).toBe(3)
    const firstOptionId = inputs[0].attributes('id') as string
    const secondOptionId = inputs[1].attributes('id') as string
    const otherRadioId = inputs[2].attributes('id') as string

    // Option ids come from index, never from the option's own value — so
    // the option whose value literally is "other" does not collide with
    // the real Other control's reserved id.
    expect(firstOptionId).toMatch(/-opt-0$/)
    expect(secondOptionId).toMatch(/-opt-1$/)
    expect(otherRadioId).not.toBe(firstOptionId)
    expect(otherRadioId).not.toBe(secondOptionId)
    expect([firstOptionId, secondOptionId, otherRadioId].every(id => !!id)).toBe(true)
  })
})

describe('ChoiceField — Other control accessible name', () => {
  it('gives the Other radio and its text input separate accessible names', () => {
    const wrapper = mountField()

    const otherRadio = wrapper.findAll('input[type="radio"]')[2]
    const otherRadioId = otherRadio.attributes('id') as string
    const otherRadioLabel = wrapper.find(`label[for="${otherRadioId}"]`)
    expect(otherRadioLabel.exists()).toBe(true)
    expect(otherRadioLabel.text()).toBe('Other')

    const otherTextInput = wrapper.find('input[type="text"]')
    const otherTextId = otherTextInput.attributes('id') as string
    expect(otherTextId).not.toBe(otherRadioId)
    const otherTextLabel = wrapper.find(`label[for="${otherTextId}"]`)
    expect(otherTextLabel.exists()).toBe(true)
    expect(otherTextLabel.text()).toBe('Other answer')
  })
})

describe('ChoiceField — fieldset aria-describedby', () => {
  it('describes the fieldset with the description and error ids, not an inner div', () => {
    const described: ChoiceFormField = { ...trickyField, description: 'Pick carefully' }
    const wrapper = mountField({
      field: described,
      errors: [{ code: 'required', message: 'This question is required.' }],
    })

    const fieldset = wrapper.find('fieldset')
    const describedBy = fieldset.attributes('aria-describedby') ?? ''
    const descP = wrapper.find('p')
    expect(describedBy).toContain(descP.attributes('id'))

    const errorList = wrapper.find('ul[id]')
    expect(errorList.exists()).toBe(true)
    expect(describedBy).toContain(errorList.attributes('id') as string)
    expect(errorList.attributes('role')).toBeUndefined()
  })
})

describe('ChoiceField — group role and required', () => {
  it('marks a required single-choice group with role="radiogroup" and aria-required', () => {
    const wrapper = mountField()
    const group = wrapper.find('[role="radiogroup"]')
    expect(group.exists()).toBe(true)
    expect(group.attributes('aria-required')).toBe('true')
  })

  it('uses role="group" for a multiple-choice field', () => {
    const wrapper = mountField({ field: { ...trickyField, multiple: true } })
    expect(wrapper.find('[role="group"]').exists()).toBe(true)
    expect(wrapper.find('[role="radiogroup"]').exists()).toBe(false)
  })
})

describe('ChoiceField — required indicator hidden when read-only', () => {
  it('does not render "(required)" for a read-only (answered) field', () => {
    const wrapper = mountField({ readonly: true, disabled: true, modelValue: 'other' })
    expect(wrapper.text()).not.toContain('(required)')
  })

  it('still renders "(required)" for an editable required field', () => {
    const wrapper = mountField({ readonly: false })
    expect(wrapper.text()).toContain('(required)')
  })
})

describe('ChoiceField — invalid state for assistive technology', () => {
  const REQUIRED: FieldError[] = [{ code: 'required', message: 'This question is required.' }]
  const BLANK: FieldError[] = [{ code: 'blank', message: 'Write your answer in the Other box.' }]

  function invalidStates(wrapper: ReturnType<typeof mountField>, selector: string) {
    return wrapper.findAll(selector).map(input => input.attributes('aria-invalid'))
  }

  it('marks every radio of a single-choice group in error as invalid, on the input a screen reader lands on', () => {
    const wrapper = mountField({ errors: REQUIRED })
    // Two options plus Other.
    expect(invalidStates(wrapper, 'input[type="radio"]')).toEqual(['true', 'true', 'true'])
  })

  it('marks every checkbox of a multiple-choice group in error as invalid', () => {
    const wrapper = mountField({ field: { ...trickyField, multiple: true }, errors: REQUIRED })
    expect(invalidStates(wrapper, 'input[type="checkbox"]')).toEqual(['true', 'true', 'true'])
  })

  it('marks no control invalid while the group has no error', () => {
    expect(invalidStates(mountField(), 'input[type="radio"]')).toEqual([undefined, undefined, undefined])
    expect(invalidStates(mountField({ field: { ...trickyField, multiple: true } }), 'input[type="checkbox"]')).toEqual([undefined, undefined, undefined])
  })

  it('drops the invalid state when the error is gone', async () => {
    const wrapper = mountField({ errors: REQUIRED })
    await wrapper.setProps({ errors: [] })
    expect(invalidStates(wrapper, 'input[type="radio"]')).toEqual([undefined, undefined, undefined])
  })

  it('shows no invalid state on a read-only group', () => {
    const wrapper = mountField({ errors: REQUIRED, readonly: true, disabled: true, modelValue: 'other' })
    expect(wrapper.find('[aria-invalid]').exists()).toBe(false)
  })

  it('marks the Other text box invalid when that blank text is what is wrong, and not for a missing choice', () => {
    const blank = mountField({ errors: BLANK, modelValue: { other: '' } })
    expect(blank.find('input[type="text"]').attributes('aria-invalid')).toBe('true')
    const required = mountField({ errors: REQUIRED })
    expect(required.find('input[type="text"]').attributes('aria-invalid')).toBeUndefined()
  })

  it('keeps the error linked to the group as before', () => {
    const wrapper = mountField({ errors: REQUIRED })
    expect(wrapper.find('fieldset').attributes('aria-describedby')).toBe(wrapper.find('ul').attributes('id'))
  })
})
