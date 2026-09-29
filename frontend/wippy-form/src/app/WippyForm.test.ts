import type { FormState } from '../lib/definition'
import type { ComponentProps } from '../types'
import { EVENT_PROVIDER, PROPS_ERROR_PROVIDER, PROPS_PROVIDER } from '@wippy-fe/webcomponent-vue'
import * as WippyProxy from '@wippy-fe/proxy'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ELEMENT_PROVIDER } from '../element-context'
import WippyForm from './WippyForm.vue'

vi.mock('@wippy-fe/proxy', () => ({
  artifactState: vi.fn(),
  on: vi.fn(() => () => {}),
}))

function mockArtifactState() {
  return vi.mocked(WippyProxy.artifactState)
}

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/** A real DOM element carrying the Host-set artifact identity attribute (MutationObserver needs a real Node). */
function elementWithArtifactId(id: string | null): HTMLElement {
  const el = document.createElement('div')
  if (id)
    el.setAttribute('data-wippy-artifact-id', id)
  return el
}

const definition = {
  title: 'Question',
  fields: [
    {
      id: 'f1',
      type: 'choice' as const,
      label: 'Pick one',
      required: true,
      options: [{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }],
      multiple: false,
      allow_other: false,
    },
  ],
}

function mountWippyForm(props: ComponentProps, element?: HTMLElement) {
  const globalProvide: Record<symbol, unknown> = {
    [PROPS_PROVIDER as unknown as symbol]: ref(props),
    [PROPS_ERROR_PROVIDER as unknown as symbol]: ref([]),
    [EVENT_PROVIDER as unknown as symbol]: vi.fn(),
  }
  if (element)
    globalProvide[ELEMENT_PROVIDER as unknown as symbol] = element

  return mount(WippyForm, {
    global: {
      plugins: [PrimeVuePlugin],
      provide: globalProvide,
    },
  })
}

beforeEach(() => {
  mockArtifactState().mockReset()
})

describe('WippyForm — no artifact identity', () => {
  it('renders the "cannot be submitted here" notice and never calls the state API', async () => {
    // No ELEMENT_PROVIDER at all — mirrors being mounted outside a bound artifact.
    const wrapper = mountWippyForm({ formVersion: 1, definition })
    await flushPromises()

    expect(wrapper.text()).toContain('This form cannot be submitted here.')
    expect(mockArtifactState()).not.toHaveBeenCalled()
  })

  it('also does not call the state API when the element carries no artifact id attribute', async () => {
    const wrapper = mountWippyForm({ formVersion: 1, definition }, elementWithArtifactId(null))
    await flushPromises()

    expect(wrapper.text()).toContain('This form cannot be submitted here.')
    expect(mockArtifactState()).not.toHaveBeenCalled()
  })
})

describe('WippyForm — idle (already-answered) state', () => {
  it('renders read-only answers with no Submit button', async () => {
    const state: FormState = {
      form_version: 1,
      artifact_id: 'artifact-1',
      session_id: 'session-1',
      status: 'idle',
      stale: false,
      late: false,
      content_version: 3,
      definition,
      data: { f1: 'a' },
      submitted_at: '2026-01-01T00:00:00.000Z',
      answer_message_id: 'msg-1',
      delivery: 'complete',
    }
    mockArtifactState().mockReturnValue({ get: vi.fn().mockResolvedValue(state), submit: vi.fn() })

    const wrapper = mountWippyForm(
      { formVersion: 1, definition, state: 'idle' },
      elementWithArtifactId('artifact-1'),
    )
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Option A')
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'PVButton' }).exists()).toBe(false)
  })
})

describe('WippyForm — unmount during a pending load', () => {
  it('does not throw and drops the response once it finally arrives', async () => {
    let resolveGet: ((state: FormState) => void) | undefined
    const pending = new Promise<FormState>((resolve) => { resolveGet = resolve })
    mockArtifactState().mockReturnValue({ get: vi.fn().mockReturnValue(pending), submit: vi.fn() })

    const wrapper = mountWippyForm(
      { formVersion: 1, definition, state: 'active' },
      elementWithArtifactId('artifact-1'),
    )
    await flushPromises()

    expect(() => wrapper.unmount()).not.toThrow()

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
    // Resolving after unmount must not throw (no writes to a torn-down component).
    expect(() => resolveGet?.(state)).not.toThrow()
    await expect(flushPromises()).resolves.toBeUndefined()
  })
})
