import { flushPromises, mount } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ERROR_TEXT_CLASS, WARN_TEXT_CLASS } from '../lib/error-text'
import { textElement } from '../test-support/dom'
import { choiceField, definitionOf, formState } from '../test-support/fixtures'
import { artifactElement, mountWippyForm } from '../test-support/mount-form'
import { artifactStateMock, resetProxyMock } from '../test-support/proxy-control'
import ActiveForm from './active-form.vue'
import FormNotice from './form-notice.vue'

/**
 * The text of every PrimeVue `Message` outside the question card takes the theme's
 * severity utilities from `lib/error-text.ts`, as the question card's messages do,
 * and so does the error text of the fields form. Secondary notices ("cannot be
 * submitted here", "was answered") are above 4.5:1 already and keep the theme colour.
 */

const definition = definitionOf(choiceField({ required: true }))

function carries(el: Element, classes: string): boolean {
  return classes.split(' ').every(c => el.classList.contains(c))
}

beforeEach(resetProxyMock)

describe('FormNotice', () => {
  it('draws a warn message in the warn utilities', () => {
    const wrapper = mount(FormNotice, { props: { definition, severity: 'warn', message: 'This form needs a newer Web Host.' }, global: { plugins: [PrimeVuePlugin] } })
    const text = textElement(wrapper.element, 'This form needs a newer Web Host.')
    expect(carries(text, WARN_TEXT_CLASS)).toBe(true)
    expect(text.closest('[role="alert"]')?.classList.contains('p-message-warn')).toBe(true)
  })

  it('leaves a secondary message on the theme colour', () => {
    const wrapper = mount(FormNotice, { props: { definition, severity: 'secondary', message: 'This form was answered.' }, global: { plugins: [PrimeVuePlugin] } })
    const message = wrapper.find('[role="alert"]')
    expect(message.classes()).toContain('p-message-secondary')
    expect(message.element.querySelector('[class*="text-danger"], [class*="text-warn"]')).toBeNull()
  })

  it('shows the questions with their options disabled', () => {
    const wrapper = mount(FormNotice, { props: { definition, severity: 'secondary', message: 'Not here.' }, global: { plugins: [PrimeVuePlugin] } })
    expect(wrapper.text()).toContain('Question')
    expect(wrapper.text()).toContain('Pick one')
    const options = wrapper.findAll('input[type="radio"]')
    expect(options).toHaveLength(2)
    expect(options.every(o => (o.element as HTMLInputElement).disabled)).toBe(true)
  })
})

describe('WippyForm notices', () => {
  const element = () => artifactElement('artifact-1')

  it('draws "no definition" in the error utilities', async () => {
    const wrapper = mountWippyForm({ formVersion: 1 }, element())
    await flushPromises()
    const text = textElement(wrapper.element, 'This form has no definition to render.')
    expect(carries(text, ERROR_TEXT_CLASS)).toBe(true)
    expect(text.closest('[role="alert"]')?.classList.contains('p-message-error')).toBe(true)
  })

  it('draws "needs a newer version of the app" in the warn utilities', async () => {
    const wrapper = mountWippyForm({ formVersion: 3, definition }, element())
    await flushPromises()
    const text = textElement(wrapper.element, 'This form needs a newer version of the app.')
    expect(carries(text, WARN_TEXT_CLASS)).toBe(true)
    expect(text.closest('[role="alert"]')?.classList.contains('p-message-warn')).toBe(true)
  })

  it('draws the load failure in the error utilities and keeps its Retry button', async () => {
    artifactStateMock().mockReturnValue({ get: vi.fn().mockRejectedValue(new Error('The server could not load this form.')), submit: vi.fn() })
    const wrapper = mountWippyForm({ formVersion: 1, definition, state: 'active' }, element())
    await flushPromises()
    await flushPromises()
    const text = textElement(wrapper.element, 'The server could not load this form.')
    expect(carries(text, ERROR_TEXT_CLASS)).toBe(true)
    const message = text.closest('[role="alert"]') as HTMLElement
    expect(message.classList.contains('p-message-error')).toBe(true)
    expect(Array.from(message.querySelectorAll('button')).some(b => b.textContent?.trim() === 'Retry')).toBe(true)
  })
})

describe('ActiveForm (fields form): error text follows its severity', () => {
  const fieldsState = formState({
    form_version: 2,
    definition: definitionOf({ id: 'name', type: 'text', min_length: 0, max_length: 500, label: 'Full name', required: true }),
  })

  function mountFields(banner: { message: string, retryable?: boolean } | null = null) {
    return mount(ActiveForm, { props: { state: fieldsState, submitting: false, banner }, global: { plugins: [PrimeVuePlugin] } })
  }

  it('draws a non-retryable banner in the error utilities', () => {
    const text = textElement(mountFields({ message: 'You are signed out. Sign in again, then retry.', retryable: false }).element, 'You are signed out. Sign in again, then retry.')
    expect(carries(text, ERROR_TEXT_CLASS)).toBe(true)
    expect(carries(text, WARN_TEXT_CLASS)).toBe(false)
    expect(text.closest('.p-message')?.classList.contains('p-message-error')).toBe(true)
  })

  it('draws a retryable banner in the warn utilities and keeps its Retry button', () => {
    const text = textElement(mountFields({ message: 'The server could not save this. Try again.', retryable: true }).element, 'The server could not save this. Try again.')
    expect(carries(text, WARN_TEXT_CLASS)).toBe(true)
    expect(carries(text, ERROR_TEXT_CLASS)).toBe(false)
    const message = text.closest('.p-message') as HTMLElement
    expect(message.classList.contains('p-message-warn')).toBe(true)
    expect(Array.from(message.querySelectorAll('button')).some(b => b.textContent?.trim() === 'Retry')).toBe(true)
  })

  it('draws the required marker, a field error and a form-level error in the error utilities', async () => {
    const wrapper = mountFields()
    expect(carries(wrapper.find('.w-form__field-marker').element, ERROR_TEXT_CLASS)).toBe(true)

    ;(wrapper.vm as unknown as { setServerErrors: (e: Record<string, Array<{ code: string, message: string }>>, f: Array<{ code: string, message: string }>) => void })
      .setServerErrors({ name: [{ code: 'too_short', message: 'Too short.' }] }, [{ code: 'stale', message: 'This form changed.' }])
    await flushPromises()
    expect(carries(wrapper.find('.w-form__field-error').element, ERROR_TEXT_CLASS)).toBe(true)
    expect(carries(wrapper.find('.w-form__fields-error').element, ERROR_TEXT_CLASS)).toBe(true)
  })
})
