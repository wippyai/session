import type { FieldAnswer, FieldError, FormField } from '../../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FieldShell from './field-shell.vue'

const textField: FormField = { id: 'name', type: 'text', label: 'Full name', required: true, description: 'As on the parcel' }

const CONTROL_SLOT = `<template #default="{ id, describedBy, invalid }">
  <input :id="id" :aria-describedby="describedBy" :aria-invalid="invalid ? 'true' : undefined">
</template>`

function mountShell(props: Partial<{ field: FormField, modelValue: FieldAnswer | undefined, errors: FieldError[], readonly: boolean, disabled: boolean, layout: 'group' | 'stacked' | 'inline' }> = {}) {
  return mount(FieldShell, {
    props: { field: textField, modelValue: undefined, errors: [], readonly: false, disabled: false, layout: 'stacked', ...props },
    slots: { default: CONTROL_SLOT },
    global: { plugins: [PrimeVuePlugin] },
  })
}

describe('FieldShell — stacked layout (one labelled control)', () => {
  it('labels the real control: the label points at the id the slot receives', () => {
    const wrapper = mountShell()
    const input = wrapper.find('input')
    const label = wrapper.find('label')
    expect(label.attributes('for')).toBe(input.attributes('id'))
    expect(label.text()).toContain('Full name')
  })

  it('shows the required marker as text on an editable required field', () => {
    expect(mountShell().find('label').text()).toContain('(required)')
    expect(mountShell({ field: { ...textField, required: false } }).find('label').text()).not.toContain('(required)')
  })

  it('describes the control with the description and, once there are errors, the error list', () => {
    const wrapper = mountShell({ errors: [{ code: 'required', message: 'This question is required.' }] })
    const describedBy = wrapper.find('input').attributes('aria-describedby') ?? ''
    const description = wrapper.find('p')
    const errorList = wrapper.find('ul')
    expect(description.text()).toBe('As on the parcel')
    expect(describedBy.split(' ')).toEqual([description.attributes('id'), errorList.attributes('id')])
    expect(errorList.text()).toContain('This question is required.')
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('does not point aria-describedby at an error list that is not rendered', () => {
    const wrapper = mountShell({ field: { ...textField, description: undefined } })
    expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined()
    expect(wrapper.find('ul').exists()).toBe(false)
    expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined()
  })

  it('derives the control, description and error ids from one base, all distinct', () => {
    const wrapper = mountShell({ errors: [{ code: 'required', message: 'This question is required.' }] })
    const ids = [wrapper.find('input').attributes('id'), wrapper.find('p').attributes('id'), wrapper.find('ul').attributes('id')]
    expect(ids.every(id => !!id)).toBe(true)
    expect(new Set(ids).size).toBe(3)
  })

  it('never uses role="alert" (one polite live region announces the summary instead)', () => {
    const wrapper = mountShell({ errors: [{ code: 'required', message: 'This question is required.' }] })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('exposes focusFirstControl, which focuses the slotted control', async () => {
    const wrapper = mount(FieldShell, {
      props: { field: textField, modelValue: undefined, errors: [], readonly: false, disabled: false, layout: 'stacked' },
      slots: { default: CONTROL_SLOT },
      global: { plugins: [PrimeVuePlugin] },
      attachTo: document.body,
    })
    ;(wrapper.vm as unknown as { focusFirstControl: () => void }).focusFirstControl()
    expect(document.activeElement).toBe(wrapper.find('input').element)
  })
})

describe('FieldShell — inline layout (checkbox)', () => {
  it('puts the control first and a clickable label that points at it', () => {
    const wrapper = mountShell({ layout: 'inline', field: { id: 'ok', type: 'checkbox', label: 'I agree', required: true } })
    const input = wrapper.find('input')
    const label = wrapper.find('label')
    expect(label.attributes('for')).toBe(input.attributes('id'))
    expect(label.text()).toContain('I agree')
    const html = wrapper.html()
    expect(html.indexOf('<input')).toBeLessThan(html.indexOf('<label'))
  })
})

describe('FieldShell — group layout (choice)', () => {
  it('is a fieldset with a legend and describes the fieldset itself', () => {
    const wrapper = mountShell({ layout: 'group', errors: [{ code: 'required', message: 'This question is required.' }] })
    const fieldset = wrapper.find('fieldset')
    expect(fieldset.exists()).toBe(true)
    expect(fieldset.find('legend').text()).toContain('Full name')
    expect(fieldset.attributes('aria-describedby')).toContain(wrapper.find('ul').attributes('id') as string)
    expect(wrapper.find('label').exists()).toBe(false)
  })
})

describe('FieldShell — read-only', () => {
  it('shows the value instead of the control, with no required marker and no errors', () => {
    const wrapper = mountShell({ readonly: true, modelValue: 'Ada', errors: [{ code: 'required', message: 'x' }] })
    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.text()).toContain('Ada')
    expect(wrapper.text()).not.toContain('(required)')
    expect(wrapper.find('ul').exists()).toBe(false)
    expect(wrapper.find('label').exists()).toBe(false)
  })

  it('keeps a text value\'s line breaks as real line breaks', () => {
    const wrapper = mountShell({ readonly: true, field: { id: 'n', type: 'textarea', label: 'Notes', required: false }, modelValue: 'one\ntwo' })
    expect(wrapper.find('[part~="field-value"]').html()).toContain('one<br>two')
  })

  it('words an unanswered field "Skipped"', () => {
    const wrapper = mountShell({ readonly: true, modelValue: undefined })
    expect(wrapper.find('[part~="field-value"]').text()).toBe('Skipped')
    expect(wrapper.find('[part~="field-value-empty"]').exists()).toBe(true)
  })

  it('shows a checkbox as Yes or No and a number as stored', () => {
    const yes = mountShell({ readonly: true, field: { id: 'c', type: 'checkbox', label: 'C', required: false }, modelValue: true })
    expect(yes.find('[part~="field-value"]').text()).toBe('Yes')
    const no = mountShell({ readonly: true, field: { id: 'c', type: 'checkbox', label: 'C', required: false }, modelValue: false })
    expect(no.find('[part~="field-value"]').text()).toBe('No')
    const num = mountShell({ readonly: true, field: { id: 'n', type: 'number', label: 'N', required: false }, modelValue: 0.5 })
    expect(num.find('[part~="field-value"]').text()).toBe('0.5')
  })

  it('shows a choice answer with its note and an Other entry', () => {
    const choice: FormField = { id: 'p', type: 'choice', label: 'Speed', required: false, options: [{ value: 'a', label: 'Alpha' }], multiple: true, allow_other: true }
    const wrapper = mountShell({ readonly: true, layout: 'group', field: choice, modelValue: [{ value: 'a', note: 'because' }, { other: 'mine' }] })
    const text = wrapper.find('[part~="field-value"]').text()
    expect(text).toContain('Alpha')
    expect(text).toContain('because')
    expect(text).toContain('Other: mine')
  })
})

describe('FieldShell — styling API', () => {
  it('names the field and its states as parts and w-form__ classes', () => {
    const wrapper = mountShell({ errors: [{ code: 'required', message: 'x' }], disabled: true })
    const root = wrapper.element as HTMLElement
    expect(root.getAttribute('part')?.split(' ')).toEqual(expect.arrayContaining(['field', 'field-required', 'field-invalid', 'field-disabled']))
    expect(root.className).toContain('w-form__field')
    expect(root.className).toContain('w-form__field--required')
    expect(root.className).toContain('w-form__field--invalid')
    for (const part of ['field-label', 'field-marker', 'field-description', 'field-control', 'field-error'])
      expect(wrapper.find(`[part~="${part}"]`).exists(), part).toBe(true)
    expect(wrapper.find('[part~="field-label"]').classes()).toContain('w-form__field-label')
  })

  it('marks a read-only field with the readonly state part', () => {
    const root = mountShell({ readonly: true }).element as HTMLElement
    expect(root.getAttribute('part')?.split(' ')).toContain('field-readonly')
    expect(root.className).toContain('w-form__field--readonly')
  })

  it('marks the layout as a state so styling can target it', () => {
    expect((mountShell({ layout: 'group' }).element as HTMLElement).getAttribute('part')?.split(' ')).toContain('field-group')
    expect((mountShell({ layout: 'inline' }).element as HTMLElement).getAttribute('part')?.split(' ')).toContain('field-inline')
  })
})
