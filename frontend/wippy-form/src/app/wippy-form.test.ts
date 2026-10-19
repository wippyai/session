import type { FormState } from '../lib/definition'
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
  it('never renders the card when the form-version prop is not 1', async () => {
    const submitFn = vi.fn()
    artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(formState()), submit: submitFn })

    const element = artifactElement('artifact-1')
    const wrapper = mountWippyForm({ formVersion: 2, definition: choiceDefinition, state: 'active' }, element)
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('This form needs a newer version of the app.')
    expect(wrapper.find('.w-form').exists()).toBe(false)
    expect(submitFn).not.toHaveBeenCalled()
    expect(element.getAttribute('card-state')).toBe('unsupported')
  })

  it('never renders the card when the loaded state\'s form_version is not 1', async () => {
    const submitFn = vi.fn()
    artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(formState({ form_version: 2 })), submit: submitFn })

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
