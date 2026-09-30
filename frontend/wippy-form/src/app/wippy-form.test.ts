import type { FormState } from '../lib/definition'
import type { ComponentProps } from '../types'
import { EVENT_PROVIDER, PROPS_ERROR_PROVIDER, PROPS_PROVIDER } from '@wippy-fe/webcomponent-vue'
import * as WippyProxy from '@wippy-fe/proxy'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ELEMENT_PROVIDER } from '../element-context'
import WippyForm from './wippy-form.vue'

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

// `useOnlineStatus` registers real `window` online/offline listeners on
// mount. Vitest/jsdom keeps the same `window` for every test in this file,
// so a wrapper left mounted from an earlier test would still react to a
// later test's `window.dispatchEvent(...)` — every mounted wrapper is
// tracked here and torn down after each test to avoid that cross-test
// pollution.
let mountedWrappers: ReturnType<typeof mount>[] = []

function mountWippyForm(props: ComponentProps, element?: HTMLElement, options?: { attachToBody?: boolean }) {
  const globalProvide: Record<symbol, unknown> = {
    [PROPS_PROVIDER as unknown as symbol]: ref(props),
    [PROPS_ERROR_PROVIDER as unknown as symbol]: ref([]),
    [EVENT_PROVIDER as unknown as symbol]: vi.fn(),
  }
  if (element)
    globalProvide[ELEMENT_PROVIDER as unknown as symbol] = element

  const wrapper = mount(WippyForm, {
    attachTo: options?.attachToBody ? document.body : undefined,
    global: {
      plugins: [PrimeVuePlugin],
      provide: globalProvide,
    },
  })
  mountedWrappers.push(wrapper)
  return wrapper
}

beforeEach(() => {
  mockArtifactState().mockReset()
  // `WippyProxy.on`'s mock call history otherwise accumulates across every
  // test in this file (it is mocked once at module scope) — a later test
  // that looks up its own `on('artifact:<id>', …)` registration by
  // `.find()`-ing the topic would silently pick up an EARLIER test's
  // still-recorded call (and its now-torn-down closure) whenever two tests
  // share an artifact id, which several here do ('artifact-1').
  vi.mocked(WippyProxy.on).mockReset().mockReturnValue(() => {})
})

afterEach(() => {
  for (const wrapper of mountedWrappers) {
    try {
      wrapper.unmount()
    }
    catch {
      // Already unmounted by the test itself — fine.
    }
  }
  mountedWrappers = []
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

const choiceDefinition = {
  title: 'Question',
  fields: [
    {
      id: 'f1',
      type: 'choice' as const,
      label: 'Pick one',
      required: false,
      options: [{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }],
      multiple: false,
      allow_other: false,
    },
  ],
}

function activeState(overrides: Partial<FormState> = {}): FormState {
  return {
    form_version: 1,
    artifact_id: 'artifact-1',
    session_id: 'session-1',
    status: 'active',
    stale: false,
    late: false,
    content_version: 1,
    definition: choiceDefinition,
    data: null,
    submitted_at: null,
    answer_message_id: null,
    delivery: null,
    ...overrides,
  }
}

// Ticking a multi-choice option (unlike a single-choice one) does not
// auto-submit, so it stays "in progress, not yet sent" — the scenario the
// background-reload/no-remount guarantee actually needs to hold for.
const multiChoiceDefinition = {
  title: 'Question',
  fields: [
    {
      id: 'f1',
      type: 'choice' as const,
      label: 'Pick any',
      required: false,
      options: [{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }],
      multiple: true,
      allow_other: false,
    },
  ],
}

describe('WippyForm — background reload keeps the form mounted (item 1)', () => {
  it('does not remount the form or clear a selected answer when the artifact event fires again', async () => {
    const getFn = vi.fn().mockResolvedValue(activeState({ definition: multiChoiceDefinition }))
    mockArtifactState().mockReturnValue({ get: getFn, submit: vi.fn() })

    const wrapper = mountWippyForm(
      { formVersion: 1, definition: multiChoiceDefinition, state: 'active' },
      elementWithArtifactId('artifact-1'),
    )
    await flushPromises()
    await wrapper.vm.$nextTick()

    await wrapper.find('.w-form__option').trigger('click')
    expect(wrapper.find('.w-form__option--selected').exists()).toBe(true)
    const cardElBefore = wrapper.find('.w-form').element

    // Simulate the Host's `artifact:<id>` relay event firing a background reload.
    const artifactEventCall = vi.mocked(WippyProxy.on).mock.calls.find(([topic]) => topic === 'artifact:artifact-1')
    expect(artifactEventCall).toBeDefined()
    const onArtifactEvent = artifactEventCall?.[1] as () => void
    onArtifactEvent()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // Same card element (no remount) and the ticked answer survives.
    expect(wrapper.find('.w-form').element).toBe(cardElBefore)
    expect(wrapper.find('wippy-loading').exists()).toBe(false)
    expect(wrapper.find('.w-form__option--selected').exists()).toBe(true)
    expect(getFn).toHaveBeenCalledTimes(2)
  })
})

describe('WippyForm — rebind to a different artifact (item 1)', () => {
  it('discards a stale GET for the old artifact once the Host rebinds the element to a new one', async () => {
    let resolveA: ((s: FormState) => void) | undefined
    const pendingA = new Promise<FormState>((resolve) => { resolveA = resolve })
    const getFn = vi.fn()
      .mockReturnValueOnce(pendingA)
      .mockResolvedValueOnce(activeState({ artifact_id: 'artifact-2' }))
    mockArtifactState().mockReturnValue({ get: getFn, submit: vi.fn() })

    const element = elementWithArtifactId('artifact-1')
    const wrapper = mountWippyForm(
      { formVersion: 1, definition: choiceDefinition, state: 'active' },
      element,
    )
    await flushPromises()
    // artifact-1's GET is still pending — nothing loaded yet.
    expect(wrapper.find('wippy-loading').exists()).toBe(true)

    // The Host rebinds this element to a different artifact (e.g. the
    // double-buffered w-page swapping content underneath it) while that
    // GET is still in flight.
    element.setAttribute('data-wippy-artifact-id', 'artifact-2')
    await flushPromises()

    // artifact-1's stale response finally lands.
    resolveA?.(activeState({ artifact_id: 'artifact-1', data: { f1: 'a' } }))
    await flushPromises()
    await wrapper.vm.$nextTick()
    await flushPromises()

    // artifact-2's own (later) GET must be the one actually shown — never
    // artifact-1's late response answering under the new artifact's id.
    expect(getFn).toHaveBeenCalledTimes(2)
    expect(wrapper.find('.w-form').exists()).toBe(true)
  })
})

describe('WippyForm — unsupported form-version contract (item 12)', () => {
  it('never renders the submittable form when the form-version prop is not 1', async () => {
    const getFn = vi.fn().mockResolvedValue(activeState())
    const submitFn = vi.fn()
    mockArtifactState().mockReturnValue({ get: getFn, submit: submitFn })

    const element = elementWithArtifactId('artifact-1')
    const wrapper = mountWippyForm(
      { formVersion: 2, definition: choiceDefinition, state: 'active' },
      element,
    )
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('This form needs a newer version of the app.')
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false)
    expect(submitFn).not.toHaveBeenCalled()
    // card-state must reflect "unsupported", not keep reporting "active"
    // for a card that never actually renders interactively (item 12).
    expect(element.getAttribute('card-state')).toBe('unsupported')
  })

  it('never renders the submittable form when the loaded state\'s form_version is not 1', async () => {
    const getFn = vi.fn().mockResolvedValue(activeState({ form_version: 2 }))
    const submitFn = vi.fn()
    mockArtifactState().mockReturnValue({ get: getFn, submit: submitFn })

    const element = elementWithArtifactId('artifact-1')
    const wrapper = mountWippyForm(
      { formVersion: 1, definition: choiceDefinition, state: 'active' },
      element,
    )
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('This form needs a newer version of the app.')
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false)
    expect(submitFn).not.toHaveBeenCalled()
    expect(element.getAttribute('card-state')).toBe('unsupported')
  })
})

describe('WippyForm — offline (item 6)', () => {
  it('shows a polite offline notice and blocks submission until back online', async () => {
    const getFn = vi.fn().mockResolvedValue(activeState())
    const submitFn = vi.fn().mockResolvedValue({
      success: true,
      artifact_id: 'artifact-1',
      request_id: 'req-1',
      answer_message_id: 'msg-1',
      content_version: 2,
      status: 'idle',
      late: false,
      delivery: 'pending',
      replayed: false,
    })
    mockArtifactState().mockReturnValue({ get: getFn, submit: submitFn })

    const wrapper = mountWippyForm(
      { formVersion: 1, definition: choiceDefinition, state: 'active' },
      elementWithArtifactId('artifact-1'),
    )
    await flushPromises()
    await wrapper.vm.$nextTick()

    window.dispatchEvent(new Event('offline'))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('You are offline. Your choices are kept.')

    // A click that would otherwise answer and submit immediately (single
    // choice, no Other) must not reach the state API while offline.
    await wrapper.find('.w-form__option').trigger('click')
    await flushPromises()
    expect(submitFn).not.toHaveBeenCalled()
    expect(getFn).toHaveBeenCalledTimes(1)

    window.dispatchEvent(new Event('online'))
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('You are offline.')
    expect(getFn).toHaveBeenCalledTimes(2)
  })
})

describe('WippyForm — exhausted-retry copy never sticks as "Retrying…" (P2 tracker line 107a)', () => {
  it('shows the final error and a working Retry once the one automatic retry has also failed, never "Retrying…"', async () => {
    vi.useFakeTimers()
    try {
      const getFn = vi.fn().mockResolvedValue(activeState())
      const networkError = Object.assign(new Error('no response'), {
        name: 'ArtifactStateError',
        status: undefined,
        code: 'network_error',
      })
      const submitFn = vi.fn().mockRejectedValue(networkError)
      mockArtifactState().mockReturnValue({ get: getFn, submit: submitFn })

      const wrapper = mountWippyForm(
        { formVersion: 1, definition: choiceDefinition, state: 'active' },
        elementWithArtifactId('artifact-1'),
      )
      await vi.advanceTimersByTimeAsync(0)

      await wrapper.find('.w-form__option').trigger('click')
      // The one automatic same-request-id retry waits 800ms internally.
      await vi.advanceTimersByTimeAsync(800)
      await vi.advanceTimersByTimeAsync(0)

      // Exactly the final, non-"Retrying…" copy — never left showing the
      // mid-retry message once both attempts have actually settled.
      expect(wrapper.text()).not.toContain('Retrying')
      expect(wrapper.text()).toContain('Network problem. Your answer may not have been saved. Check your connection, then select Retry.')
      expect(submitFn).toHaveBeenCalledTimes(2)

      // Retry is offered and actually works (issues a further attempt).
      const retryButton = wrapper.findAll('button').find(b => b.text() === 'Retry')
      if (!retryButton)
        throw new Error('expected a Retry button to be rendered')
      await retryButton.trigger('click')
      await vi.advanceTimersByTimeAsync(800)
      await vi.advanceTimersByTimeAsync(0)
      expect(submitFn).toHaveBeenCalledTimes(4) // the retry click's own attempt + its own automatic retry
    }
    finally {
      vi.useRealTimers()
    }
  })
})

describe('WippyForm — focus after a successful submit (item 8)', () => {
  it('moves focus to the read-only view\'s status text so focus is not lost', async () => {
    // Realistic server behavior: the initial GET returns the active
    // (unanswered) form; the background reload fired after acceptance
    // returns the now-idle, answered state — not the same active fixture.
    const getFn = vi.fn()
      .mockResolvedValueOnce(activeState())
      .mockResolvedValue(activeState({ status: 'idle', data: { f1: 'a' }, submitted_at: '2026-01-01T00:00:00.000Z', delivery: 'pending' }))
    const submitFn = vi.fn().mockResolvedValue({
      success: true,
      artifact_id: 'artifact-1',
      request_id: 'req-1',
      answer_message_id: 'msg-1',
      content_version: 2,
      status: 'idle',
      late: false,
      delivery: 'pending',
      replayed: false,
    })
    mockArtifactState().mockReturnValue({ get: getFn, submit: submitFn })

    const wrapper = mountWippyForm(
      { formVersion: 1, definition: choiceDefinition, state: 'active' },
      elementWithArtifactId('artifact-1'),
      { attachToBody: true },
    )
    await flushPromises()
    await wrapper.vm.$nextTick()

    await wrapper.find('.w-form__option').trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const statusEl = wrapper.find('[tabindex="-1"]')
    expect(statusEl.exists()).toBe(true)
    expect(document.activeElement).toBe(statusEl.element)
    wrapper.unmount()
  })
})

describe('WippyForm — answered elsewhere', () => {
  it('keeps a status notice on the read-only view after losing to another answer', async () => {
    const getFn = vi.fn()
      .mockResolvedValueOnce(activeState())
      .mockResolvedValue(activeState({ status: 'idle', data: { f1: 'b' }, submitted_at: '2026-01-01T00:00:00.000Z', delivery: 'complete' }))
    const conflict = Object.assign(new Error('This form was already answered.'), {
      name: 'ArtifactStateError',
      status: 409,
      code: 'already_submitted',
    })
    const submitFn = vi.fn().mockRejectedValue(conflict)
    mockArtifactState().mockReturnValue({ get: getFn, submit: submitFn })

    const wrapper = mountWippyForm(
      { formVersion: 1, definition: choiceDefinition, state: 'active' },
      elementWithArtifactId('artifact-1'),
    )
    await flushPromises()
    await wrapper.vm.$nextTick()

    await wrapper.find('.w-form__option').trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(submitFn).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.w-form__card--answered').exists()).toBe(true)
    const notice = wrapper.find('[role="status"]')
    expect(notice.text()).toContain('already answered elsewhere')
    expect(wrapper.text()).toContain('Option B')
  })

  it('moves focus to the read-only view\'s status text after losing the race (M07: was left on <body>)', async () => {
    const getFn = vi.fn()
      .mockResolvedValueOnce(activeState())
      .mockResolvedValue(activeState({ status: 'idle', data: { f1: 'b' }, submitted_at: '2026-01-01T00:00:00.000Z', delivery: 'complete' }))
    const conflict = Object.assign(new Error('This form was already answered.'), {
      name: 'ArtifactStateError',
      status: 409,
      code: 'already_submitted',
    })
    const submitFn = vi.fn().mockRejectedValue(conflict)
    mockArtifactState().mockReturnValue({ get: getFn, submit: submitFn })

    const wrapper = mountWippyForm(
      { formVersion: 1, definition: choiceDefinition, state: 'active' },
      elementWithArtifactId('artifact-1'),
      { attachToBody: true },
    )
    await flushPromises()
    await wrapper.vm.$nextTick()

    await wrapper.find('.w-form__option').trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const statusEl = wrapper.find('[tabindex="-1"]')
    expect(statusEl.exists()).toBe(true)
    expect(document.activeElement).toBe(statusEl.element)
    expect(document.activeElement).not.toBe(document.body)
    wrapper.unmount()
  })
})

describe('WippyForm — background swap to answered explains the drop (item 10)', () => {
  it('shows the "answered elsewhere" notice when a background reload — not our own submit — flips the form to idle', async () => {
    const getFn = vi.fn()
      .mockResolvedValueOnce(activeState())
      .mockResolvedValue(activeState({ status: 'idle', data: { f1: 'b' }, submitted_at: '2026-01-01T00:00:00.000Z', delivery: 'complete' }))
    const submitFn = vi.fn()
    mockArtifactState().mockReturnValue({ get: getFn, submit: submitFn })

    const wrapper = mountWippyForm(
      { formVersion: 1, definition: choiceDefinition, state: 'active' },
      elementWithArtifactId('artifact-1'),
    )
    await flushPromises()
    await wrapper.vm.$nextTick()

    // Someone else answers this same artifact from another tab/client — a
    // background reload (the artifact:<id> relay event), not anything this
    // instance itself submitted.
    const artifactEventCall = vi.mocked(WippyProxy.on).mock.calls.find(([topic]) => topic === 'artifact:artifact-1')
    const onArtifactEvent = artifactEventCall?.[1] as () => void
    onArtifactEvent()
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(submitFn).not.toHaveBeenCalled()
    const notice = wrapper.find('[role="status"]')
    expect(notice.exists()).toBe(true)
    expect(notice.text()).toContain('already answered elsewhere')
    expect(wrapper.text()).toContain('Option B')
  })

  it('does not show the notice for our own successful submit (active -> idle from the accepted branch)', async () => {
    const getFn = vi.fn()
      .mockResolvedValueOnce(activeState())
      .mockResolvedValue(activeState({ status: 'idle', data: { f1: 'a' }, submitted_at: '2026-01-01T00:00:00.000Z', delivery: 'pending' }))
    const submitFn = vi.fn().mockResolvedValue({
      success: true,
      artifact_id: 'artifact-1',
      request_id: 'req-1',
      answer_message_id: 'msg-1',
      content_version: 2,
      status: 'idle',
      late: false,
      delivery: 'pending',
      replayed: false,
    })
    mockArtifactState().mockReturnValue({ get: getFn, submit: submitFn })

    const wrapper = mountWippyForm(
      { formVersion: 1, definition: choiceDefinition, state: 'active' },
      elementWithArtifactId('artifact-1'),
    )
    await flushPromises()
    await wrapper.vm.$nextTick()

    await wrapper.find('.w-form__option').trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })
})

describe('WippyForm — unmount during a pending load', () => {
  it('does not throw, logs nothing, and does not re-touch the host element once the late response finally arrives', async () => {
    let resolveGet: ((state: FormState) => void) | undefined
    const pending = new Promise<FormState>((resolve) => { resolveGet = resolve })
    mockArtifactState().mockReturnValue({ get: vi.fn().mockReturnValue(pending), submit: vi.fn() })

    const element = elementWithArtifactId('artifact-1')
    const setAttributeSpy = vi.spyOn(element, 'setAttribute')
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountWippyForm(
      { formVersion: 1, definition, state: 'active' },
      element,
    )
    await flushPromises()

    expect(() => wrapper.unmount()).not.toThrow()
    const attributeWritesAtUnmount = setAttributeSpy.mock.calls.length

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
    await flushPromises()

    // The late response must be a genuine no-op: no Vue warning/error from
    // writing into a torn-down instance's reactivity, and the host-attribute
    // reflection (use-host-reflection.ts) — which would fire if the late
    // response reached a still-reactive `state` ref — must not run again.
    expect(consoleErrorSpy).not.toHaveBeenCalled()
    expect(consoleWarnSpy).not.toHaveBeenCalled()
    expect(setAttributeSpy.mock.calls.length).toBe(attributeWritesAtUnmount)

    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })
})
