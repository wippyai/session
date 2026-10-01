import type { FormDefinition, FormState } from '../lib/definition'
import type { ComponentProps } from '../types'
import { mount } from '@vue/test-utils'
import * as WippyProxy from '@wippy-fe/proxy'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { EVENT_PROVIDER, PROPS_ERROR_PROVIDER, PROPS_PROVIDER } from '@wippy-fe/webcomponent-vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { ELEMENT_PROVIDER } from '../element-context'
import { ERROR_TEXT_CLASS, WARN_TEXT_CLASS } from '../lib/error-text'
import ActiveForm from './active-form.vue'
import NeedsNewerHostNotice from './needs-newer-host-notice.vue'
import WippyForm from './wippy-form.vue'

/**
 * The text of every PrimeVue `Message` outside the question card (the form's own
 * notices and the fields form's banner) takes the theme's severity utilities, one
 * constant per severity (`lib/error-text.ts`), exactly like the question card's
 * messages do: the `Message` keeps its box, and the text inside it has to be 4.5:1
 * in both themes, which the theme's own `Message` colours are not (EE2-2461).
 * Secondary notices ("cannot be submitted here", "was answered") are
 * already above 4.5:1 and keep the theme's colour.
 */

vi.mock('@wippy-fe/proxy', () => ({
  artifactState: vi.fn(),
  on: vi.fn(() => () => {}),
}))

const definition: FormDefinition = {
  title: 'Question',
  fields: [{ id: 'f1', type: 'choice', label: 'Pick one', required: true, options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], multiple: false, allow_other: false }],
}

const state: FormState = {
  form_version: 1,
  artifact_id: 'artifact-1',
  session_id: 'session-1',
  status: 'active',
  stale: false,
  late: false,
  content_version: 1,
  definition,
  data: null,
  submitted_at: null,
  answer_message_id: null,
  delivery: null,
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

describe('ActiveForm (fields form) banner text follows its severity', () => {
  it('draws a non-retryable (error) banner in the error utilities', () => {
    const wrapper = mount(ActiveForm, { props: { state, submitting: false, banner: { message: 'You are signed out. Sign in again, then retry.', retryable: false } }, global: { plugins: [PrimeVuePlugin] } })
    const text = textElement(wrapper.element, 'You are signed out. Sign in again, then retry.')
    expect(carries(text, ERROR_TEXT_CLASS)).toBe(true)
    expect(carries(text, WARN_TEXT_CLASS)).toBe(false)
    expect(text.closest('[role="alert"]')?.classList.contains('p-message-error')).toBe(true)
  })

  it('draws a retryable (warn) banner in the warn utilities and keeps its Retry button', () => {
    const wrapper = mount(ActiveForm, { props: { state, submitting: false, banner: { message: 'The server could not save this. Try again.', retryable: true } }, global: { plugins: [PrimeVuePlugin] } })
    const text = textElement(wrapper.element, 'The server could not save this. Try again.')
    expect(carries(text, WARN_TEXT_CLASS)).toBe(true)
    expect(carries(text, ERROR_TEXT_CLASS)).toBe(false)
    const message = text.closest('[role="alert"]') as HTMLElement
    expect(message.classList.contains('p-message-warn')).toBe(true)
    expect(Array.from(message.querySelectorAll('button')).some(b => b.textContent?.trim() === 'Retry')).toBe(true)
  })
})

describe('NeedsNewerHostNotice', () => {
  it('draws the "needs a newer Web Host" warning in the warn utilities', () => {
    const wrapper = mount(NeedsNewerHostNotice, { props: { definition }, global: { plugins: [PrimeVuePlugin] } })
    const text = textElement(wrapper.element, 'This form needs a newer Web Host. If you already answered it, your answer is in the chat.')
    expect(carries(text, WARN_TEXT_CLASS)).toBe(true)
    expect(text.closest('[role="alert"]')?.classList.contains('p-message-warn')).toBe(true)
  })

  it('leaves the secondary "was answered" notice on the theme colour', () => {
    const wrapper = mount(NeedsNewerHostNotice, { props: { definition, answered: true }, global: { plugins: [PrimeVuePlugin] } })
    const message = wrapper.find('[role="alert"]')
    expect(message.exists()).toBe(true)
    expect(message.classes()).toContain('p-message-secondary')
    expect(message.element.querySelector('[class*="text-danger"], [class*="text-warn"]')).toBeNull()
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
