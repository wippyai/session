import type { FormState } from '../lib/definition'
import type { ComponentProps } from '../types'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RETRY_DELAY_MS } from '../composables/use-form-submit'
import { acceptedResponse, choiceField, definitionOf, formState } from '../test-support/fixtures'
import { hostError } from '../test-support/host-error'
import { artifactElement, mountWippyForm } from '../test-support/mount-form'
import { artifactStateMock, listenerFor, resetProxyMock, setArtifactStateExport } from '../test-support/proxy-control'

const definition = definitionOf(choiceField({ required: true }))
const choiceDefinition = definitionOf(choiceField())
// Ticking an option of a several-answer question does not submit, so the answer
// stays unsent. That is what a background reload must not disturb.
const multiChoiceDefinition = definitionOf(choiceField({ label: 'Pick any', multiple: true }))

const ANSWERED_AT = '2026-01-01T00:00:00.000Z'

/** The Host's `artifact:<id>` event, which makes the form reload. */
function emitArtifactEvent(id: string) {
  const listener = listenerFor(`artifact:${id}`)
  if (!listener)
    throw new Error(`no listener for artifact:${id}`)
  listener()
}

beforeEach(resetProxyMock)

describe('WippyForm: no artifact identity', () => {
  it('renders the "cannot be submitted here" notice and never calls the state API', async () => {
    // No element at all, as when mounted outside a bound artifact.
    const wrapper = mountWippyForm({ formVersion: 1, definition })
    await flushPromises()

    expect(wrapper.text()).toContain('This form cannot be submitted here.')
    expect(artifactStateMock()).not.toHaveBeenCalled()
  })

  it('also does not call the state API when the element carries no artifact id attribute', async () => {
    const wrapper = mountWippyForm({ formVersion: 1, definition }, artifactElement(null))
    await flushPromises()

    expect(wrapper.text()).toContain('This form cannot be submitted here.')
    expect(artifactStateMock()).not.toHaveBeenCalled()
  })
})

describe('WippyForm: the Host predates the artifact-state API', () => {
  beforeEach(() => setArtifactStateExport(undefined))

  it('shows the "needs a newer Web Host" notice, not "cannot be submitted here", with disabled options and no submit control', async () => {
    const wrapper = mountWippyForm({ formVersion: 1, definition })
    await flushPromises()

    expect(wrapper.text()).toContain('This form needs a newer Web Host.')
    expect(wrapper.text()).not.toContain('This form cannot be submitted here.')
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'PVButton' }).exists()).toBe(false)
    expect(wrapper.text()).not.toContain('—')
    // The questions and options still show, disabled, instead of dashes.
    expect(wrapper.text()).toContain('Pick one')
    expect(wrapper.text()).toContain('Option A')
    expect(wrapper.text()).toContain('Option B')
  })

  it('tells the reader that an answer already sent is in the chat when the state prop is "active" or absent, because it cannot tell open from answered', async () => {
    for (const stateProp of ['active', undefined] as const) {
      const wrapper = mountWippyForm({ formVersion: 1, definition, state: stateProp })
      await flushPromises()

      expect(wrapper.text()).toContain('This form needs a newer Web Host.')
      expect(wrapper.text()).toContain('If you already answered it, your answer is in the chat.')
      expect(wrapper.text()).not.toContain('This form was answered.')
      // Nothing is invented: every option stays unselected and disabled.
      expect(wrapper.findAll('input[type="radio"]').every(r => (r.element as HTMLInputElement).disabled && !(r.element as HTMLInputElement).checked)).toBe(true)
      expect(wrapper.find('button[type="submit"]').exists()).toBe(false)
    }
  })

  it('says the form was answered and points to the chat when the state prop is "idle", with the options still shown disabled', async () => {
    const element = artifactElement(null)
    const wrapper = mountWippyForm({ formVersion: 1, definition, state: 'idle' }, element)
    await flushPromises()

    expect(wrapper.text()).toContain('This form was answered. Your answer is in the chat.')
    expect(wrapper.text()).not.toContain('needs a newer Web Host')
    expect(wrapper.text()).not.toContain('If you already answered it')
    // What was asked is readable. Nothing is selected, because the saved answer
    // cannot be read without the state API.
    expect(wrapper.text()).toContain('Pick one')
    expect(wrapper.text()).toContain('Option A')
    expect(wrapper.text()).not.toContain('—')
    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios.length).toBeGreaterThan(0)
    expect(radios.every(r => (r.element as HTMLInputElement).disabled && !(r.element as HTMLInputElement).checked)).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'PVButton' }).exists()).toBe(false)
    // Styling reports the missing capability, not an answered or interactive card.
    expect(element.getAttribute('card-state')).toBe('unsupported')
  })

  it('shows the same notice when the element does carry an artifact id, because the missing capability is checked first', async () => {
    const wrapper = mountWippyForm({ formVersion: 1, definition }, artifactElement('artifact-1'))
    await flushPromises()

    expect(wrapper.text()).toContain('This form needs a newer Web Host.')
    expect(wrapper.text()).not.toContain('This form cannot be submitted here.')
  })

  it('reflects card-state="unsupported" instead of leaving it on "loading"', async () => {
    const element = artifactElement(null)
    const wrapper = mountWippyForm({ formVersion: 1, definition }, element)
    await flushPromises()

    expect(wrapper.find('wippy-loading').exists()).toBe(false)
    expect(element.getAttribute('card-state')).toBe('unsupported')
  })
})

describe('WippyForm: the Host supports artifactState but sets no artifact id', () => {
  it('shows "This form cannot be submitted here.", not the newer-Host notice', async () => {
    const wrapper = mountWippyForm({ formVersion: 1, definition }, artifactElement(null))
    await flushPromises()

    expect(wrapper.text()).toContain('This form cannot be submitted here.')
    expect(wrapper.text()).not.toContain('This form needs a newer Web Host.')
    expect(artifactStateMock()).not.toHaveBeenCalled()
  })
})

describe('WippyForm: an answered form', () => {
  it('shows the answers read-only, with no Submit button', async () => {
    const state = formState({ status: 'idle', definition, content_version: 3, data: { f1: 'a' }, submitted_at: ANSWERED_AT, answer_message_id: 'msg-1', delivery: 'complete' })
    artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(state), submit: vi.fn() })

    const wrapper = mountWippyForm({ formVersion: 1, definition, state: 'idle' }, artifactElement('artifact-1'))
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.w-form__summary-answer').text()).toBe('Option A')
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'PVButton' }).exists()).toBe(false)
  })
})

describe('WippyForm: a definition with no questions', () => {
  it('shows the "no definition" message instead of a card', async () => {
    artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(formState({ definition: definitionOf() })), submit: vi.fn() })

    const wrapper = mountWippyForm({ formVersion: 1, definition: definitionOf(), state: 'active' }, artifactElement('artifact-1'))
    await flushPromises()

    expect(wrapper.text()).toContain('This form has no definition to render.')
    expect(wrapper.find('.w-form').exists()).toBe(false)
  })
})

describe('WippyForm: a background reload keeps the form mounted', () => {
  it('does not remount the form or clear a ticked answer when the artifact event fires again', async () => {
    const getFn = vi.fn().mockResolvedValue(formState({ definition: multiChoiceDefinition }))
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })

    const wrapper = mountWippyForm({ formVersion: 1, definition: multiChoiceDefinition, state: 'active' }, artifactElement('artifact-1'))
    await flushPromises()
    await wrapper.vm.$nextTick()

    await wrapper.find('.w-form__option').trigger('click')
    expect(wrapper.find('.w-form__option--selected').exists()).toBe(true)
    const cardElBefore = wrapper.find('.w-form').element

    emitArtifactEvent('artifact-1')
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.w-form').element).toBe(cardElBefore)
    expect(wrapper.find('wippy-loading').exists()).toBe(false)
    expect(wrapper.find('.w-form__option--selected').exists()).toBe(true)
    expect(getFn).toHaveBeenCalledTimes(2)
  })
})

describe('WippyForm: a rebind to a different artifact', () => {
  it('drops the response of the old artifact once the Host rebinds the element, and shows only the new one', async () => {
    let resolveOld: ((s: FormState) => void) | undefined
    let resolveNew: ((s: FormState) => void) | undefined
    const getFn = vi.fn()
      .mockReturnValueOnce(new Promise<FormState>((resolve) => { resolveOld = resolve }))
      .mockReturnValueOnce(new Promise<FormState>((resolve) => { resolveNew = resolve }))
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })

    const element = artifactElement('artifact-1')
    const wrapper = mountWippyForm({ formVersion: 1, definition: choiceDefinition, state: 'active' }, element)
    await flushPromises()
    expect(wrapper.find('wippy-loading').exists()).toBe(true)

    // The Host rebinds the element, for example when a double-buffered w-page
    // swaps content underneath it, while the first GET is still in flight.
    element.setAttribute('data-wippy-artifact-id', 'artifact-2')
    await flushPromises()

    // The old artifact's response arrives late and has an answer selected.
    resolveOld?.(formState({ artifact_id: 'artifact-1', data: { f1: 'a' } }))
    await flushPromises()

    // It is not shown: there is still no card, only the loading placeholder.
    expect(wrapper.find('.w-form').exists()).toBe(false)
    expect(wrapper.find('wippy-loading').exists()).toBe(true)

    resolveNew?.(formState({ artifact_id: 'artifact-2' }))
    await flushPromises()

    expect(getFn).toHaveBeenCalledTimes(2)
    expect(wrapper.find('.w-form').exists()).toBe(true)
    expect(wrapper.find('.w-form__option--selected').exists()).toBe(false)
  })
})

describe('WippyForm: the card-state while the first load is pending', () => {
  it('reflects "loading", not "active", until the first GET resolves', async () => {
    let resolveGet: ((s: FormState) => void) | undefined
    const pending = new Promise<FormState>((resolve) => { resolveGet = resolve })
    artifactStateMock().mockReturnValue({ get: vi.fn().mockReturnValue(pending), submit: vi.fn() })

    const element = artifactElement('artifact-1')
    const wrapper = mountWippyForm({ formVersion: 1, definition: choiceDefinition, state: 'active' }, element)
    await flushPromises()

    // Only the loading placeholder shows, so styling must not claim an
    // interactive card before there is one.
    expect(wrapper.find('wippy-loading').exists()).toBe(true)
    expect(element.getAttribute('card-state')).toBe('loading')

    resolveGet?.(formState())
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(element.getAttribute('card-state')).toBe('active')
  })
})

describe('WippyForm: an unsupported form version', () => {
  it('never renders a form when the form-version prop is not 1 or 2', async () => {
    const submitFn = vi.fn()
    artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(formState()), submit: submitFn })

    const element = artifactElement('artifact-1')
    const wrapper = mountWippyForm({ formVersion: 3, definition: choiceDefinition, state: 'active' }, element)
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('This form needs a newer version of the app.')
    expect(wrapper.find('.w-form').exists()).toBe(false)
    expect(submitFn).not.toHaveBeenCalled()
    expect(element.getAttribute('card-state')).toBe('unsupported')
  })

  it('never renders a form when the loaded state\'s form_version is not 1 or 2', async () => {
    const submitFn = vi.fn()
    artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(formState({ form_version: 3 })), submit: submitFn })

    const element = artifactElement('artifact-1')
    const wrapper = mountWippyForm({ formVersion: 1, definition: choiceDefinition, state: 'active' }, element)
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('This form needs a newer version of the app.')
    expect(wrapper.find('.w-form').exists()).toBe(false)
    expect(submitFn).not.toHaveBeenCalled()
    expect(element.getAttribute('card-state')).toBe('unsupported')
  })
})

describe('WippyForm: offline', () => {
  it('shows a polite offline notice and blocks submission until back online', async () => {
    const getFn = vi.fn().mockResolvedValue(formState())
    const submitFn = vi.fn().mockResolvedValue(acceptedResponse())
    artifactStateMock().mockReturnValue({ get: getFn, submit: submitFn })

    const wrapper = mountWippyForm({ formVersion: 1, definition: choiceDefinition, state: 'active' }, artifactElement('artifact-1'))
    await flushPromises()
    await wrapper.vm.$nextTick()

    window.dispatchEvent(new Event('offline'))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('You are offline. Your choices are kept.')

    // A click that would answer and submit at once must not reach the state API.
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

describe('WippyForm: the copy after the automatic retry has also failed', () => {
  it('shows the final error and a working Retry, never "Retrying…"', async () => {
    vi.useFakeTimers()
    try {
      const submitFn = vi.fn().mockRejectedValue(hostError(undefined, 'network_error'))
      artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(formState()), submit: submitFn })

      const wrapper = mountWippyForm({ formVersion: 1, definition: choiceDefinition, state: 'active' }, artifactElement('artifact-1'))
      await vi.advanceTimersByTimeAsync(0)

      await wrapper.find('.w-form__option').trigger('click')
      await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS)
      await vi.advanceTimersByTimeAsync(0)

      expect(wrapper.text()).not.toContain('Retrying')
      expect(wrapper.text()).toContain('Network problem. Your answer may not have been saved. Check your connection, then select Retry.')
      expect(submitFn).toHaveBeenCalledTimes(2)

      const retryButton = wrapper.findAll('button').find(b => b.text() === 'Retry')
      if (!retryButton)
        throw new Error('expected a Retry button to be rendered')
      await retryButton.trigger('click')
      await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS)
      await vi.advanceTimersByTimeAsync(0)
      expect(submitFn).toHaveBeenCalledTimes(4) // the click's own attempt and its automatic retry
    }
    finally {
      vi.useRealTimers()
    }
  })
})

describe('WippyForm: focus after a successful submit', () => {
  it('moves focus to the summary\'s status text so focus is not lost', async () => {
    // The first GET returns the open form. The reload after acceptance returns
    // the answered form.
    const getFn = vi.fn()
      .mockResolvedValueOnce(formState())
      .mockResolvedValue(formState({ status: 'idle', data: { f1: 'a' }, submitted_at: ANSWERED_AT, delivery: 'pending' }))
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn().mockResolvedValue(acceptedResponse()) })

    const wrapper = mountWippyForm({ formVersion: 1, definition: choiceDefinition, state: 'active' }, artifactElement('artifact-1'), { attachToBody: true })
    await flushPromises()
    await wrapper.vm.$nextTick()

    await wrapper.find('.w-form__option').trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const statusEl = wrapper.find('[tabindex="-1"]')
    expect(statusEl.exists()).toBe(true)
    expect(document.activeElement).toBe(statusEl.element)
  })
})

describe('WippyForm: a replayed submit that reports the current delivery', () => {
  const lines = [
    ['pending', 'Submitted. Waiting for the assistant.'],
    ['running', 'The assistant is reading your answer.'],
    ['interrupted', 'The assistant stopped before answering. Send a message to continue.'],
  ] as const

  it.each(lines)('shows the summary message for a %s delivery', async (delivery, text) => {
    // The reload after acceptance never settles, so the card keeps the state
    // built from the submit response.
    const getFn = vi.fn()
      .mockResolvedValueOnce(formState())
      .mockReturnValue(new Promise(() => {}))
    const submitFn = vi.fn().mockResolvedValue(acceptedResponse({ delivery, replayed: true }))
    artifactStateMock().mockReturnValue({ get: getFn, submit: submitFn })

    const wrapper = mountWippyForm({ formVersion: 1, definition: choiceDefinition, state: 'active' }, artifactElement('artifact-1'))
    await flushPromises()
    await wrapper.vm.$nextTick()

    await wrapper.find('.w-form__option').trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(submitFn).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.w-form__status').text()).toContain(text)
  })
})

describe('WippyForm: answered elsewhere', () => {
  function loseTheRace() {
    const getFn = vi.fn()
      .mockResolvedValueOnce(formState())
      .mockResolvedValue(formState({ status: 'idle', data: { f1: 'b' }, submitted_at: ANSWERED_AT, delivery: 'complete' }))
    const submitFn = vi.fn().mockRejectedValue(hostError(409, 'already_submitted'))
    artifactStateMock().mockReturnValue({ get: getFn, submit: submitFn })
    return submitFn
  }

  it('keeps a status notice on the summary after losing to another answer', async () => {
    const submitFn = loseTheRace()
    const wrapper = mountWippyForm({ formVersion: 1, definition: choiceDefinition, state: 'active' }, artifactElement('artifact-1'))
    await flushPromises()
    await wrapper.vm.$nextTick()

    await wrapper.find('.w-form__option').trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(submitFn).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.w-form__card--answered').exists()).toBe(true)
    const notice = wrapper.find('[role="status"]')
    expect(notice.text()).toContain('already answered elsewhere')
    expect(notice.text()).toContain('your draft was not saved')
    expect(wrapper.text()).toContain('Option B')
  })

  it('moves focus to the summary\'s status text after losing the race, instead of leaving it on <body>', async () => {
    loseTheRace()
    const wrapper = mountWippyForm({ formVersion: 1, definition: choiceDefinition, state: 'active' }, artifactElement('artifact-1'), { attachToBody: true })
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
  })
})

describe('WippyForm: a background swap to answered explains the drop only when input was unsent', () => {
  it('shows no "answered elsewhere" notice for a copy nothing was entered into', async () => {
    const getFn = vi.fn()
      .mockResolvedValueOnce(formState())
      .mockResolvedValue(formState({ status: 'idle', data: { f1: 'b' }, submitted_at: ANSWERED_AT, delivery: 'complete' }))
    const submitFn = vi.fn()
    artifactStateMock().mockReturnValue({ get: getFn, submit: submitFn })

    const wrapper = mountWippyForm({ formVersion: 1, definition: choiceDefinition, state: 'active' }, artifactElement('artifact-1'))
    await flushPromises()
    await wrapper.vm.$nextTick()

    // Another tab or client answers the same artifact, and the reload brings it here.
    emitArtifactEvent('artifact-1')
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(submitFn).not.toHaveBeenCalled()
    // The notice says a draft was not saved, and there was no draft.
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Option B')
  })

  it('shows the notice when the card held an unsent answer', async () => {
    const getFn = vi.fn()
      .mockResolvedValueOnce(formState({ definition: multiChoiceDefinition }))
      .mockResolvedValue(formState({ definition: multiChoiceDefinition, status: 'idle', data: { f1: 'b' }, submitted_at: ANSWERED_AT, delivery: 'complete' }))
    const submitFn = vi.fn()
    artifactStateMock().mockReturnValue({ get: getFn, submit: submitFn })

    const wrapper = mountWippyForm({ formVersion: 1, definition: multiChoiceDefinition, state: 'active' }, artifactElement('artifact-1'))
    await flushPromises()
    await wrapper.vm.$nextTick()

    await wrapper.find('.w-form__option').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.w-form__option--selected').exists()).toBe(true)

    emitArtifactEvent('artifact-1')
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(submitFn).not.toHaveBeenCalled()
    const notice = wrapper.find('[role="status"]')
    expect(notice.exists()).toBe(true)
    expect(notice.text()).toContain('already answered elsewhere')
    expect(notice.text()).toContain('your draft was not saved')
    expect(notice.text()).not.toContain('was not sent')
    expect(wrapper.text()).toContain('Option B')
  })

  it('shows no notice after the form\'s own successful submit', async () => {
    const getFn = vi.fn()
      .mockResolvedValueOnce(formState())
      .mockResolvedValue(formState({ status: 'idle', data: { f1: 'a' }, submitted_at: ANSWERED_AT, delivery: 'pending' }))
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn().mockResolvedValue(acceptedResponse()) })

    const wrapper = mountWippyForm({ formVersion: 1, definition: choiceDefinition, state: 'active' }, artifactElement('artifact-1'))
    await flushPromises()
    await wrapper.vm.$nextTick()

    await wrapper.find('.w-form__option').trigger('click')
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })
})

describe('WippyForm: unmount during a pending load', () => {
  it('does not throw or log, and does not touch the host element when the late response arrives', async () => {
    let resolveGet: ((state: FormState) => void) | undefined
    const pending = new Promise<FormState>((resolve) => { resolveGet = resolve })
    artifactStateMock().mockReturnValue({ get: vi.fn().mockReturnValue(pending), submit: vi.fn() })

    const element = artifactElement('artifact-1')
    const setAttributeSpy = vi.spyOn(element, 'setAttribute')
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountWippyForm({ formVersion: 1, definition, state: 'active' }, element)
    await flushPromises()

    expect(() => wrapper.unmount()).not.toThrow()
    const attributeWritesAtUnmount = setAttributeSpy.mock.calls.length

    expect(() => resolveGet?.(formState({ definition }))).not.toThrow()
    await flushPromises()

    // A late response that reached a still reactive `state` would warn, and
    // would reflect `card-state` onto the element again.
    expect(consoleErrorSpy).not.toHaveBeenCalled()
    expect(consoleWarnSpy).not.toHaveBeenCalled()
    expect(setAttributeSpy.mock.calls.length).toBe(attributeWritesAtUnmount)

    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })
})

// ── Form version 2: standard fields ────────────────────────────────

const v2Definition = {
  title: 'Delivery details',
  fields: [
    { id: 'name', type: 'text' as const, label: 'Full name', required: true },
    { id: 'mail', type: 'email' as const, label: 'Email', required: false },
    { id: 'qty', type: 'number' as const, label: 'Parcels', required: false, integer: true },
    { id: 'consent', type: 'checkbox' as const, label: 'I agree', required: true },
  ],
}

function v2State(overrides: Partial<FormState> = {}): FormState {
  return formState<FormState['definition']>({ form_version: 2, definition: v2Definition, ...overrides })
}

describe('WippyForm: form version 2', () => {
  it('accepts version 1 and 2 from the prop and from the loaded state', async () => {
    for (const [propVersion, stateVersion] of [[1, 1], [2, 2], [undefined, 2], [2, undefined]] as const) {
      const getFn = vi.fn().mockResolvedValue(v2State({ form_version: stateVersion ?? 2 }))
      artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })
      const element = artifactElement('artifact-1')
      const wrapper = mountWippyForm({ formVersion: propVersion, definition: v2Definition, state: 'active' }, element)
      await flushPromises()
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).not.toContain('needs a newer version')
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
      expect(element.getAttribute('card-state')).toBe('active')
    }
  })

  it('keeps the "needs a newer version" notice for a version above 2, from either source', async () => {
    artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(v2State({ form_version: 3 })), submit: vi.fn() })
    const fromProp = mountWippyForm({ formVersion: 3, definition: v2Definition, state: 'active' }, artifactElement('artifact-1'))
    await flushPromises()
    expect(fromProp.text()).toContain('This form needs a newer version of the app.')
    expect(fromProp.find('input').exists()).toBe(false)

    const fromState = mountWippyForm({ formVersion: 2, definition: v2Definition, state: 'active' }, artifactElement('artifact-1'))
    await flushPromises()
    expect(fromState.text()).toContain('This form needs a newer version of the app.')
    expect(fromState.find('button[type="submit"]').exists()).toBe(false)
  })

  it('shows the "needs a newer version" notice for a field type it does not know, rather than dropping the question', async () => {
    const future = { ...v2Definition, fields: [...v2Definition.fields, { id: 'rate', type: 'slider', label: 'Rate us', required: false }] }
    artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(v2State({ definition: future as unknown as FormState['definition'] })), submit: vi.fn() })
    const element = artifactElement('artifact-1')
    const wrapper = mountWippyForm({ formVersion: 2, definition: future as unknown as ComponentProps['definition'], state: 'active' }, element)
    await flushPromises()

    expect(wrapper.text()).toContain('This form needs a newer version of the app.')
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false)
    expect(element.getAttribute('card-state')).toBe('unsupported')
  })

  it('renders a form with standard fields as the fields form, not the question card', async () => {
    artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(v2State()), submit: vi.fn() })
    const wrapper = mountWippyForm({ formVersion: 2, definition: v2Definition, state: 'active' }, artifactElement('artifact-1'))
    await flushPromises()

    expect(wrapper.find('.w-form__fields').exists()).toBe(true)
    expect(wrapper.find('.w-form__option').exists()).toBe(false)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
  })

  it('renders a form that mixes choices with standard fields as the fields form with radio rows', async () => {
    const mixed = { title: 'Mixed', fields: [...choiceDefinition.fields, ...v2Definition.fields] }
    artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(v2State({ definition: mixed })), submit: vi.fn() })
    const wrapper = mountWippyForm({ formVersion: 2, definition: mixed, state: 'active' }, artifactElement('artifact-1'))
    await flushPromises()

    expect(wrapper.find('.w-form__fields').exists()).toBe(true)
    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(2)
  })

  it('submits version 2 answers, with a number as a JSON number and a checkbox as a boolean', async () => {
    const submitFn = vi.fn().mockResolvedValue(acceptedResponse())
    artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(v2State()), submit: submitFn })
    const wrapper = mountWippyForm({ formVersion: 2, definition: v2Definition, state: 'active' }, artifactElement('artifact-1'), { attachToBody: true })
    await flushPromises()

    const byLabel = (label: string) => {
      const l = wrapper.findAll('label').find(el => el.text().startsWith(label))
      return wrapper.find(`[id="${l?.attributes('for')}"]`)
    }
    await byLabel('Full name').setValue('Ada')
    await byLabel('Parcels').setValue('4')
    await byLabel('I agree').setValue(true)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(submitFn).toHaveBeenCalledTimes(1)
    const envelope = submitFn.mock.calls[0][0]
    expect(envelope.form_version).toBe(2)
    expect(envelope.answers).toEqual({ name: 'Ada', qty: 4, consent: true })
  })

  it('leaves a field\'s pattern to the server: a value that does not match is sent, and the 422 shows on that field', async () => {
    const patterned = {
      title: 'Parcel',
      fields: [{ id: 'code', type: 'text' as const, label: 'Parcel code', required: true, pattern: '[A-Z]{2}\\d{3}' }],
    }
    // The body the Session sends is { code: 'validation_failed', errors: { code: [{ code, message }] } },
    // and the Host client rejects with those on the ArtifactStateError.
    const unprocessable = hostError(422, 'validation_failed', {
      errors: { code: [{ code: 'pattern_mismatch', message: 'Does not match the expected format.' }] },
      formErrors: [],
    })
    const submitFn = vi.fn().mockRejectedValue(unprocessable)
    artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(v2State({ definition: patterned })), submit: submitFn })
    const wrapper = mountWippyForm({ formVersion: 2, definition: patterned, state: 'active' }, artifactElement('artifact-1'), { attachToBody: true })
    await flushPromises()

    const input = wrapper.find('input[type="text"]')
    await input.setValue('not-a-code')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await wrapper.vm.$nextTick()

    // The browser never judged the pattern, so the value went to the server.
    expect(submitFn).toHaveBeenCalledTimes(1)
    expect(submitFn.mock.calls[0][0].answers).toEqual({ code: 'not-a-code' })
    // The server's refusal reads like a client error: text under the field,
    // linked to the real input, the field invalid, focus there, the typed value kept.
    const error = wrapper.find('ul')
    expect(error.text()).toBe('Does not match the expected format.')
    expect(input.attributes('aria-describedby')).toBe(error.attributes('id'))
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(input.element)
    expect((input.element as HTMLInputElement).value).toBe('not-a-code')
    expect(wrapper.find('[part~="field-invalid"]').exists()).toBe(true)
    // A refusal is not a failed delivery, so there is no banner and the form stays open.
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    expect(wrapper.find('[role="status"]').text()).toBe('1 question needs attention.')
  })

  it('shows any other per-field 422 code on its own field, and a form-level one under the fields', async () => {
    const unprocessable = hostError(422, 'validation_failed', {
      errors: {
        qty: [{ code: 'not_on_step', message: 'Not on the allowed step.' }],
        mail: [{ code: 'invalid_email', message: 'That address is not accepted.' }],
      },
      formErrors: [{ code: 'stale', message: 'This form changed since you loaded it.' }],
    })
    const submitFn = vi.fn().mockRejectedValue(unprocessable)
    artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(v2State()), submit: submitFn })
    const wrapper = mountWippyForm({ formVersion: 2, definition: v2Definition, state: 'active' }, artifactElement('artifact-1'), { attachToBody: true })
    await flushPromises()

    const byLabel = (label: string) => {
      const l = wrapper.findAll('label').find(el => el.text().startsWith(label))
      return wrapper.find(`[id="${l?.attributes('for')}"]`)
    }
    await byLabel('Full name').setValue('Ada')
    await byLabel('Email').setValue('ada@example.com')
    await byLabel('Parcels').setValue('4')
    await byLabel('I agree').setValue(true)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await wrapper.vm.$nextTick()

    const mail = byLabel('Email')
    const qty = byLabel('Parcels')
    expect(wrapper.text()).toContain('That address is not accepted.')
    expect(wrapper.text()).toContain('Not on the allowed step.')
    expect(wrapper.text()).toContain('This form changed since you loaded it.')
    expect(mail.attributes('aria-invalid')).toBe('true')
    expect(qty.attributes('aria-invalid')).toBe('true')
    // The first invalid field in definition order takes focus.
    expect(document.activeElement).toBe(mail.element)
    expect((qty.element as HTMLInputElement).value).toBe('4')
    // Two questions have an error, and the form-level message is spoken as its own text.
    expect(wrapper.find('[role="status"]').text()).toBe('2 questions need attention. This form changed since you loaded it.')
  })

  it('shows a stored version 2 answer read-only once answered', async () => {
    const idle = v2State({ status: 'idle', data: { name: 'Ada', qty: 4, consent: true }, submitted_at: '2026-10-01T10:00:00.000Z', delivery: 'complete' })
    artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(idle), submit: vi.fn() })
    const element = artifactElement('artifact-1')
    const wrapper = mountWippyForm({ formVersion: 2, definition: v2Definition, state: 'idle' }, element)
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.text()).toContain('Ada')
    expect(wrapper.text()).toContain('Yes')
    expect(wrapper.text()).toContain('Skipped')
    expect(element.getAttribute('card-state')).toBe('answered')
  })
})
