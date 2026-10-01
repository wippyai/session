import { flushPromises, mount } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ERROR_TEXT_CLASS, WARN_TEXT_CLASS } from '../lib/error-text'
import { textElement } from '../test-support/dom'
import { choiceField, definitionOf } from '../test-support/fixtures'
import { artifactElement, mountWippyForm } from '../test-support/mount-form'
import { artifactStateMock, resetProxyMock } from '../test-support/proxy-control'
import FormNotice from './form-notice.vue'

/**
 * The text of every PrimeVue `Message` outside the question card takes the theme's
 * severity utilities from `lib/error-text.ts`, as the question card's messages do.
 * Secondary notices ("cannot be submitted here", "was answered") are above 4.5:1
 * already and keep the theme colour.
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
    const wrapper = mountWippyForm({ formVersion: 2, definition }, element())
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
