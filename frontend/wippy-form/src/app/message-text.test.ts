import type { FormDefinition } from '../lib/definition'
import type { ComponentProps } from '../types'
import { mount } from '@vue/test-utils'
import * as WippyProxy from '@wippy-fe/proxy'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { EVENT_PROVIDER, PROPS_ERROR_PROVIDER, PROPS_PROVIDER } from '@wippy-fe/webcomponent-vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { ELEMENT_PROVIDER } from '../element-context'
import { ERROR_TEXT_CLASS, WARN_TEXT_CLASS } from '../lib/error-text'
import FormNotice from './form-notice.vue'
import WippyForm from './wippy-form.vue'

/**
 * The text of every PrimeVue `Message` outside the question card takes the theme's
 * severity utilities from `lib/error-text.ts`, as the question card's messages do.
 * Secondary notices ("cannot be submitted here", "was answered") are above 4.5:1
 * already and keep the theme colour.
 */

vi.mock('@wippy-fe/proxy', () => ({
  artifactState: vi.fn(),
  on: vi.fn(() => () => {}),
}))

const definition: FormDefinition = {
  title: 'Question',
  fields: [{ id: 'f1', type: 'choice', label: 'Pick one', required: true, options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], multiple: false, allow_other: false }],
}

function carries(el: Element, classes: string): boolean {
  return classes.split(' ').every(c => el.classList.contains(c))
}

/** The element that holds `message` as its own text (no child elements), i.e. the text the reader sees. */
function textElement(root: Element, message: string): HTMLElement {
  const found = Array.from(root.querySelectorAll<HTMLElement>('*')).find(el => el.children.length === 0 && el.textContent?.trim() === message)
  if (!found)
    throw new Error(`no element holds exactly "${message}"`)
  return found
}

function mountWippyForm(props: ComponentProps) {
  const element = document.createElement('div')
  element.setAttribute('data-wippy-artifact-id', 'artifact-1')
  return mount(WippyForm, {
    global: {
      plugins: [PrimeVuePlugin],
      provide: {
        [PROPS_PROVIDER as unknown as symbol]: ref(props),
        [PROPS_ERROR_PROVIDER as unknown as symbol]: ref([]),
        [EVENT_PROVIDER as unknown as symbol]: vi.fn(),
        [ELEMENT_PROVIDER as unknown as symbol]: element,
      },
    },
  })
}

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

beforeEach(() => {
  vi.mocked(WippyProxy.artifactState).mockReset()
  vi.mocked(WippyProxy.on).mockReset().mockReturnValue(() => {})
})

afterEach(() => {
  document.body.replaceChildren()
})

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
  it('draws "no definition" in the error utilities', async () => {
    const wrapper = mountWippyForm({ formVersion: 1 })
    await flushPromises()
    const text = textElement(wrapper.element, 'This form has no definition to render.')
    expect(carries(text, ERROR_TEXT_CLASS)).toBe(true)
    expect(text.closest('[role="alert"]')?.classList.contains('p-message-error')).toBe(true)
  })

  it('draws "needs a newer version of the app" in the warn utilities', async () => {
    const wrapper = mountWippyForm({ formVersion: 2, definition })
    await flushPromises()
    const text = textElement(wrapper.element, 'This form needs a newer version of the app.')
    expect(carries(text, WARN_TEXT_CLASS)).toBe(true)
    expect(text.closest('[role="alert"]')?.classList.contains('p-message-warn')).toBe(true)
  })

  it('draws the load failure in the error utilities and keeps its Retry button', async () => {
    vi.mocked(WippyProxy.artifactState).mockReturnValue({ get: vi.fn().mockRejectedValue(new Error('The server could not load this form.')), submit: vi.fn() } as never)
    const wrapper = mountWippyForm({ formVersion: 1, definition, state: 'active' })
    await flushPromises()
    await flushPromises()
    const text = textElement(wrapper.element, 'The server could not load this form.')
    expect(carries(text, ERROR_TEXT_CLASS)).toBe(true)
    const message = text.closest('[role="alert"]') as HTMLElement
    expect(message.classList.contains('p-message-error')).toBe(true)
    expect(Array.from(message.querySelectorAll('button')).some(b => b.textContent?.trim() === 'Retry')).toBe(true)
  })
})
