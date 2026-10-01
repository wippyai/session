import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FieldLabel from './field-label.vue'

function mountLabel(props: Partial<{ tag: 'label' | 'legend' | 'span', required: boolean }> = {}) {
  return mount(FieldLabel, { props: { tag: 'label', controlId: 'control-1', label: 'Full name', required: false, ...props } })
}

describe('FieldLabel', () => {
  it('is a label pointing at the control, under the field-label part and class', () => {
    const wrapper = mountLabel()
    expect(wrapper.element.tagName).toBe('LABEL')
    expect(wrapper.attributes('for')).toBe('control-1')
    expect(wrapper.attributes('part')).toBe('field-label')
    expect(wrapper.classes()).toContain('w-form__field-label')
    expect(wrapper.text()).toBe('Full name')
  })

  it('is a legend or a span that points at nothing', () => {
    for (const tag of ['legend', 'span'] as const) {
      const wrapper = mountLabel({ tag })
      expect(wrapper.element.tagName).toBe(tag.toUpperCase())
      expect(wrapper.attributes('for'), tag).toBeUndefined()
    }
  })

  it('adds the required marker as text, under its own part and class, in every tag', () => {
    for (const tag of ['label', 'legend', 'span'] as const) {
      const wrapper = mountLabel({ tag, required: true })
      expect(wrapper.text(), tag).toBe('Full name (required)')
      const marker = wrapper.find('[part~="field-marker"]')
      expect(marker.text(), tag).toBe('(required)')
      expect(marker.classes(), tag).toContain('w-form__field-marker')
    }
  })

  it('shows no marker when the field is not required', () => {
    expect(mountLabel().find('[part~="field-marker"]').exists()).toBe(false)
  })
})
