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

describe('ChoiceField: the Other box label', () => {
  it.each([false, true])('is for screen readers only (several answers: %s)', (multiple) => {
    const wrapper = mountField({ field: { ...trickyField, multiple } })
    const label = wrapper.findAll('label').find(l => l.text() === 'Other answer')
    expect(label?.classes()).toContain('sr-only')
  })
})

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

  it('does not mark an optional single-choice group as required', () => {
    const wrapper = mountField({ field: { ...trickyField, required: false } })
    expect(wrapper.find('[role="radiogroup"]').attributes('aria-required')).toBeUndefined()
  })

  // A radiogroup needs its own accessible name: the fieldset's legend names
  // the fieldset, not the role inside it.
  it('names the radiogroup by the field label', () => {
    const wrapper = mountField()
    const labelledBy = wrapper.find('[role="radiogroup"]').attributes('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    const legend = wrapper.find('legend')
    expect(legend.attributes('id')).toBe(labelledBy)
    expect(legend.text()).toBe('Pick one (required)')
  })

  // The fieldset is already the group, and aria-required is not allowed on a
  // group role, so a multiple-choice field adds neither.
  it('adds no role and no aria-required to a multiple-choice field, whose fieldset is the group', () => {
    const wrapper = mountField({ field: { ...trickyField, multiple: true } })
    expect(wrapper.find('fieldset').exists()).toBe(true)
    expect(wrapper.find('[role]').exists()).toBe(false)
    expect(wrapper.find('[aria-required]').exists()).toBe(false)
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

  it('marks the Other text box invalid when that text is too long', () => {
    const tooLong = mountField({ errors: [{ code: 'too_long', message: 'Use at most 2,000 characters.' }], modelValue: { other: 'x'.repeat(2001) } })
    expect(tooLong.find('input[type="text"]').attributes('aria-invalid')).toBe('true')
  })

  it('keeps the error linked to the group as before', () => {
    const wrapper = mountField({ errors: REQUIRED })
    expect(wrapper.find('fieldset').attributes('aria-describedby')).toBe(wrapper.find('ul').attributes('id'))
  })
})

describe('ChoiceField — description and error linked to the inputs', () => {
  const described: ChoiceFormField = { ...trickyField, description: 'Pick carefully' }
  const BLANK: FieldError[] = [{ code: 'blank', message: 'Write your answer in the Other box.' }]

  /** The ids an input is described by. */
  const describedBy = (input: { attributes: (name: string) => string | undefined }) => (input.attributes('aria-describedby') ?? '').split(' ').filter(Boolean)

  it.each([
    ['single choice', 'radio', false],
    ['multiple choice', 'checkbox', true],
  ] as const)('links the description and the error to every %s input and the Other box, not only to the fieldset', (_name, kind, multiple) => {
    const wrapper = mountField({ field: { ...described, multiple }, errors: BLANK, modelValue: multiple ? [{ other: '' }] : { other: '' } })
    const descriptionId = wrapper.find('p').attributes('id')
    const errorId = wrapper.find('ul').attributes('id')
    expect(descriptionId).toBeTruthy()
    expect(errorId).toBeTruthy()

    const inputs = [...wrapper.findAll(`input[type="${kind}"]`), wrapper.find('input[type="text"]')]
    // Two options, the Other choice and the Other text box.
    expect(inputs).toHaveLength(4)
    for (const input of inputs)
      expect(describedBy(input), input.attributes('id')).toEqual([descriptionId, errorId])
  })

  it('links only the error when the field has no description, and nothing when there is none', () => {
    const withError = mountField({ errors: BLANK, modelValue: { other: '' } })
    for (const input of withError.findAll('input'))
      expect(describedBy(input)).toEqual([withError.find('ul').attributes('id')])

    const quiet = mountField()
    for (const input of quiet.findAll('input'))
      expect(input.attributes('aria-describedby')).toBeUndefined()
  })

  it('drops the error link from the inputs once the error is gone, and keeps the description', async () => {
    const wrapper = mountField({ field: described, errors: BLANK, modelValue: { other: '' } })
    await wrapper.setProps({ errors: [] })
    const descriptionId = wrapper.find('p').attributes('id')
    for (const input of wrapper.findAll('input'))
      expect(describedBy(input)).toEqual([descriptionId])
  })

  it('links nothing in the read-only view, which has no inputs', () => {
    const wrapper = mountField({ field: described, readonly: true, disabled: true, modelValue: 'other' })
    expect(wrapper.find('input').exists()).toBe(false)
  })
})

// Other is its own selection state, never a reserved option value: an option
// value is any text the agent wrote, so no string is safe to reserve.
describe('ChoiceField: an option whose value is the old Other marker', () => {
  const MARKER = 'choice-field-other-sentinel'
  const markerField = (multiple: boolean, allowOther: boolean): ChoiceFormField => ({
    ...trickyField,
    multiple,
    allow_other: allowOther,
    options: [{ value: MARKER, label: 'Keep original' }, { value: 'b', label: 'Option B' }],
  })

  it.each([true, false])('single choice (Other allowed: %s): choosing it answers with its value', async (allowOther) => {
    const wrapper = mountField({ field: markerField(false, allowOther) })
    await wrapper.findAll('input[type="radio"]')[0].setValue(true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([MARKER])
  })

  it.each([true, false])('single choice (Other allowed: %s): shows it chosen, and Other not chosen', async (allowOther) => {
    const wrapper = mountField({ field: markerField(false, allowOther), modelValue: MARKER })
    const radios = wrapper.findAll('input[type="radio"]')
    expect((radios[0].element as HTMLInputElement).checked).toBe(true)
    if (allowOther) {
      expect((radios[2].element as HTMLInputElement).checked).toBe(false)
      expect(wrapper.find('input[type="text"]').attributes('disabled')).toBeDefined()
    }
  })

  it('single choice: Other is chosen apart from it, and the option is not', async () => {
    const wrapper = mountField({ field: markerField(false, true), modelValue: { other: '' } })
    const radios = wrapper.findAll('input[type="radio"]')
    expect((radios[0].element as HTMLInputElement).checked).toBe(false)
    expect((radios[2].element as HTMLInputElement).checked).toBe(true)
    await wrapper.find('input[type="text"]').setValue('mine')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([{ other: 'mine' }])
    await radios[0].setValue(true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([MARKER])
  })

  it('single choice: choosing Other answers with the Other text', async () => {
    const wrapper = mountField({ field: markerField(false, true) })
    await wrapper.findAll('input[type="radio"]')[2].setValue(true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([{ other: '' }])
  })

  it.each([true, false])('multiple choice (Other allowed: %s): ticking it answers with its value', async (allowOther) => {
    const wrapper = mountField({ field: markerField(true, allowOther) })
    await wrapper.findAll('input[type="checkbox"]')[0].setValue(true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[MARKER]])
  })
})