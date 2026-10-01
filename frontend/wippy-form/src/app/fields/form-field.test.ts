import type { FieldAnswer, FieldError, FormField } from '../../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FormFieldControl from './form-field.vue'

function mountField(field: FormField, props: Partial<{ modelValue: FieldAnswer | undefined, errors: FieldError[], disabled: boolean, readonly: boolean }> = {}) {
  return mount(FormFieldControl, {
    props: { field, modelValue: undefined, errors: [], disabled: false, readonly: false, ...props },
    global: { plugins: [PrimeVuePlugin] },
    attachTo: document.body,
  })
}

const REQUIRED_ERROR: FieldError[] = [{ code: 'required', message: 'This question is required.' }]

/** The last value a control reported through v-model. */
function lastValue(wrapper: ReturnType<typeof mountField>): unknown {
  const events = wrapper.emitted('update:modelValue') ?? []
  return events[events.length - 1]?.[0]
}

describe('text field', () => {
  const field: FormField = { id: 'name', type: 'text', label: 'Full name', required: true, description: 'As on the parcel', placeholder: 'Ada Lovelace' }

  it('is an InputText labelled by its own label element', () => {
    const wrapper = mountField(field)
    const input = wrapper.find('input')
    expect(input.attributes('type')).toBe('text')
    expect(input.attributes('placeholder')).toBe('Ada Lovelace')
    expect(wrapper.find('label').attributes('for')).toBe(input.attributes('id'))
  })

  it('links the error and the description to the real input, not a wrapper', () => {
    const wrapper = mountField(field, { errors: REQUIRED_ERROR })
    const input = wrapper.find('input')
    const describedBy = (input.attributes('aria-describedby') ?? '').split(' ')
    expect(describedBy).toContain(wrapper.find('p').attributes('id'))
    expect(describedBy).toContain(wrapper.find('ul').attributes('id'))
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-required')).toBe('true')
  })

  it('reports what is typed through v-model, untrimmed', async () => {
    const wrapper = mountField(field)
    await wrapper.find('input').setValue('  Ada  ')
    expect(lastValue(wrapper)).toBe('  Ada  ')
  })

  it('shows the draft it is given', () => {
    expect((mountField(field, { modelValue: 'Berlin' }).find('input').element as HTMLInputElement).value).toBe('Berlin')
  })

  it('is disabled while the form is submitting', () => {
    expect(mountField(field, { disabled: true }).find('input').attributes('disabled')).toBeDefined()
  })

  it('focuses its input on focusFirstControl', () => {
    const wrapper = mountField(field)
    ;(wrapper.vm as unknown as { focusFirstControl: () => void }).focusFirstControl()
    expect(document.activeElement).toBe(wrapper.find('input').element)
  })
})

describe('textarea field', () => {
  const field: FormField = { id: 'notes', type: 'textarea', label: 'Notes', required: false }

  it('is a textarea whose newlines are kept', async () => {
    const wrapper = mountField(field)
    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
    await textarea.setValue('one\ntwo')
    expect(lastValue(wrapper)).toBe('one\ntwo')
  })

  it('links its error to the textarea itself', () => {
    const wrapper = mountField(field, { errors: [{ code: 'too_long', message: 'Use at most 8000 characters.' }] })
    expect(wrapper.find('textarea').attributes('aria-describedby')).toBe(wrapper.find('ul').attributes('id'))
    expect(wrapper.find('textarea').attributes('aria-invalid')).toBe('true')
  })

  it('does not mark an optional field as required', () => {
    expect(mountField(field).find('textarea').attributes('aria-required')).toBeUndefined()
  })
})

describe('email field', () => {
  const field: FormField = { id: 'mail', type: 'email', label: 'Email', required: true }

  it('is an InputText of type email with the email keyboard hint and autofill token', () => {
    const input = mountField(field).find('input')
    expect(input.attributes('type')).toBe('email')
    expect(input.attributes('inputmode')).toBe('email')
    expect(input.attributes('autocomplete')).toBe('email')
  })

  it('links its error to the input', () => {
    const wrapper = mountField(field, { errors: [{ code: 'invalid_email', message: 'Enter a valid email address.' }] })
    expect(wrapper.find('input').attributes('aria-describedby')).toBe(wrapper.find('ul').attributes('id'))
  })
})

describe('number field', () => {
  const field: FormField = { id: 'qty', type: 'number', label: 'Parcels', required: false, integer: true }

  it('is a text input with the decimal keyboard hint, not a native number input or a spinner', () => {
    const input = mountField(field).find('input')
    expect(input.attributes('type')).toBe('text')
    expect(input.attributes('inputmode')).toBe('decimal')
    expect(mountField(field).find('[role="spinbutton"]').exists()).toBe(false)
  })

  it('reports exactly the text typed, so the strict parser sees it (no rounding, no clamping, no group stripping)', async () => {
    const wrapper = mountField(field)
    await wrapper.find('input').setValue('1,5')
    expect(lastValue(wrapper)).toBe('1,5')
    await wrapper.find('input').setValue('12345678.123456789')
    expect(lastValue(wrapper)).toBe('12345678.123456789')
  })

  it('links its error to the input', () => {
    const wrapper = mountField(field, { errors: [{ code: 'invalid_number', message: 'Enter a number.' }] })
    expect(wrapper.find('input').attributes('aria-describedby')).toBe(wrapper.find('ul').attributes('id'))
  })
})

describe('checkbox field', () => {
  const field: FormField = { id: 'ok', type: 'checkbox', label: 'I agree to the terms', required: true, description: 'Required to continue' }

  it('is a real checkbox with a clickable label, control first', () => {
    const wrapper = mountField(field)
    const input = wrapper.find('input[type="checkbox"]')
    expect(input.exists()).toBe(true)
    expect(wrapper.find('label').attributes('for')).toBe(input.attributes('id'))
  })

  it('reports an explicit boolean when the box or its label is clicked', async () => {
    const wrapper = mountField(field)
    await wrapper.find('input[type="checkbox"]').setValue(true)
    expect(lastValue(wrapper)).toBe(true)
    await wrapper.find('input[type="checkbox"]').setValue(false)
    expect(lastValue(wrapper)).toBe(false)
    await wrapper.find('label').trigger('click')
    expect(lastValue(wrapper)).toBe(true)
  })

  it('links description and error to the checkbox input itself, not to the wrapper div', () => {
    const wrapper = mountField(field, { errors: REQUIRED_ERROR })
    const input = wrapper.find('input[type="checkbox"]')
    const describedBy = (input.attributes('aria-describedby') ?? '').split(' ')
    expect(describedBy).toContain(wrapper.find('p').attributes('id'))
    expect(describedBy).toContain(wrapper.find('ul').attributes('id'))
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-required')).toBe('true')
    // The PrimeVue root div must not carry a stray aria-describedby.
    expect(wrapper.find('.p-checkbox').attributes('aria-describedby')).toBeUndefined()
  })

  it('shows a checked draft and can be toggled with the keyboard', async () => {
    const wrapper = mountField(field, { modelValue: true })
    expect((wrapper.find('input[type="checkbox"]').element as HTMLInputElement).checked).toBe(true)
  })

  it('focuses the checkbox on focusFirstControl', () => {
    const wrapper = mountField(field)
    ;(wrapper.vm as unknown as { focusFirstControl: () => void }).focusFirstControl()
    expect(document.activeElement).toBe(wrapper.find('input[type="checkbox"]').element)
  })
})

describe('date field', () => {
  const field: FormField = { id: 'day', type: 'date', label: 'Delivery date', required: true, min: '2026-10-01', max: '2026-12-31' }

  it('is a date picker input labelled by the field label', () => {
    const wrapper = mountField(field)
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(wrapper.find('label').attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('placeholder')).toBe('YYYY-MM-DD')
  })

  it('links the error and description to the real input, not the picker wrapper', () => {
    const wrapper = mountField({ ...field, description: 'Pick a weekday' }, { errors: [{ code: 'invalid_date', message: 'Enter a valid date as YYYY-MM-DD.' }] })
    const input = wrapper.find('input')
    const describedBy = (input.attributes('aria-describedby') ?? '').split(' ')
    expect(describedBy).toContain(wrapper.find('p').attributes('id'))
    expect(describedBy).toContain(wrapper.find('ul').attributes('id'))
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-required')).toBe('true')
  })

  it('reports a typed date in the wire format', async () => {
    const wrapper = mountField(field)
    await wrapper.find('input').setValue('2026-10-15')
    expect(lastValue(wrapper)).toBe('2026-10-15')
  })

  it('reports typed text that is not a date instead of dropping it', async () => {
    const wrapper = mountField(field)
    await wrapper.find('input').setValue('next tuesday')
    expect(lastValue(wrapper)).toBe('next tuesday')
  })

  it('reports a typed date outside min and max as typed, for the client check to name', async () => {
    const wrapper = mountField(field)
    await wrapper.find('input').setValue('2026-09-30')
    expect(lastValue(wrapper)).toBe('2026-09-30')
  })

  it('reports an emptied field as empty text', async () => {
    const wrapper = mountField(field, { modelValue: '2026-10-15' })
    await wrapper.find('input').setValue('')
    expect(lastValue(wrapper)).toBe('')
  })

  it('shows a stored date', () => {
    const wrapper = mountField(field, { modelValue: '2026-10-15' })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('2026-10-15')
  })

  it('keeps the typed text in the box after leaving it, so the user can correct it', async () => {
    const wrapper = mountField(field)
    const input = wrapper.find('input')
    await input.setValue('next tuesday')
    await input.trigger('blur')
    await wrapper.vm.$nextTick()
    expect((input.element as HTMLInputElement).value).toBe('next tuesday')
  })

  it('opens no calendar on focus: it opens from its button, so keyboard users can just type', async () => {
    const wrapper = mountField(field)
    await wrapper.find('input').trigger('focus')
    expect(document.querySelector('.p-datepicker-panel')).toBeNull()
    expect(wrapper.find('button[aria-haspopup="dialog"]').exists()).toBe(true)
  })

  it('opens the calendar from the keyboard with ArrowDown and closes it with Escape', async () => {
    const wrapper = mountField(field)
    const input = wrapper.find('input')
    await input.trigger('keydown', { code: 'ArrowDown' })
    await wrapper.vm.$nextTick()
    expect(input.attributes('aria-expanded')).toBe('true')
    await input.trigger('keydown', { code: 'Escape' })
    await wrapper.vm.$nextTick()
    expect(input.attributes('aria-expanded')).toBe('false')
  })

  it('opens the calendar from its button', async () => {
    const wrapper = mountField(field)
    await wrapper.find('button[aria-haspopup="dialog"]').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('input').attributes('aria-expanded')).toBe('true')
  })
})

describe('choice field through the dispatcher', () => {
  it('still renders the V1 radio group', () => {
    const wrapper = mountField({ id: 'c', type: 'choice', label: 'Speed', required: false, options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], multiple: false, allow_other: false })
    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(2)
  })

  it('forwards focusOtherText to the choice field', () => {
    const wrapper = mountField({ id: 'c', type: 'choice', label: 'Speed', required: false, options: [{ value: 'a', label: 'A' }], multiple: false, allow_other: true }, { modelValue: { other: '' } })
    ;(wrapper.vm as unknown as { focusOtherText: () => void }).focusOtherText()
    expect(document.activeElement).toBe(wrapper.find('input[type="text"]').element)
  })
})

describe('read-only through the dispatcher', () => {
  it('renders no control for any type and shows the stored value', () => {
    const cases: Array<[FormField, FieldAnswer | undefined, string]> = [
      [{ id: 'a', type: 'text', label: 'A', required: true }, 'Ada', 'Ada'],
      [{ id: 'b', type: 'email', label: 'B', required: false }, 'a@b.co', 'a@b.co'],
      [{ id: 'c', type: 'number', label: 'C', required: false }, 3, '3'],
      [{ id: 'd', type: 'date', label: 'D', required: false }, '2026-10-01', '2026-10-01'],
      [{ id: 'e', type: 'checkbox', label: 'E', required: false }, true, 'Yes'],
      [{ id: 'f', type: 'textarea', label: 'F', required: false }, 'x', 'x'],
    ]
    for (const [field, value, shown] of cases) {
      const wrapper = mountField(field, { readonly: true, disabled: true, modelValue: value })
      expect(wrapper.find('input, textarea').exists(), field.type).toBe(false)
      expect(wrapper.find('[part~="field-value"]').text(), field.type).toBe(shown)
    }
  })
})
