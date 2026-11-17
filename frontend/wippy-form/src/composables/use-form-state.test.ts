import type { FormState } from '../lib/definition'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { formState } from '../test-support/fixtures'
import { hostError } from '../test-support/host-error'
import { artifactStateMock, listenerFor, onMock, resetProxyMock } from '../test-support/proxy-control'
import { RELOAD_RETRY_MAX_MS, RELOAD_RETRY_MS, useFormState } from './use-form-state'

/** Mounts `useFormState` in a real component, so its listeners are registered on mount and released on unmount. */
function mountHarness(artifactId: string | null) {
  const Harness = defineComponent({
    setup() {
      const id = ref<string | null>(artifactId)
      const trigger = ref<unknown>(undefined)
      const result = useFormState(id, trigger)
      return { id, ...result }
    },
    template: '<div />',
  })
  return mount(Harness)
}

beforeEach(resetProxyMock)

describe('useFormState: stored answers at the read boundary', () => {
  it('keeps a noted answer and turns a { value } answer without a note into the plain value', async () => {
    const stored = formState({ status: 'idle', delivery: 'complete', data: {} })
    const getFn = vi.fn().mockResolvedValue({ ...stored, data: { f1: { value: 'a', note: 'why' }, f2: { value: 'b' }, f3: { other: 'mine' } } })
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })

    const wrapper = mountHarness('artifact-1')
    await flushPromises()

    const loaded = (wrapper.vm as unknown as { state: FormState }).state
    expect(loaded.data).toEqual({ f1: { value: 'a', note: 'why' }, f2: 'b', f3: { other: 'mine' } })
  })
})

describe('useFormState: background reload vs first load', () => {
  it('only sets status to "loading" for the artifact\'s first load, not a later background reload', async () => {
    const getFn = vi.fn().mockResolvedValue(formState())
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })

    const wrapper = mountHarness('artifact-1')
    // First load in flight synchronously after mount.
    expect((wrapper.vm as unknown as { status: string }).status).toBe('loading')
    await flushPromises()
    expect((wrapper.vm as unknown as { status: string }).status).toBe('loaded')

    // A background reload (artifact event) must not flip status back to
    // "loading", the caller keeps rendering the current state untouched.
    ;(wrapper.vm as unknown as { reload: () => void }).reload()
    expect((wrapper.vm as unknown as { status: string }).status).toBe('loaded')
    await flushPromises()
    expect((wrapper.vm as unknown as { status: string }).status).toBe('loaded')
    expect(getFn).toHaveBeenCalledTimes(2)
  })

  it('keeps the current state and sets reloadError (not status=error) when a background reload fails', async () => {
    const getFn = vi.fn()
      .mockResolvedValueOnce(formState())
      .mockRejectedValueOnce(new Error('network down'))
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })

    const wrapper = mountHarness('artifact-1')
    await flushPromises()
    const vm = wrapper.vm as unknown as { status: string, state: FormState | null, reloadError: string | null, reload: () => void }
    expect(vm.state).not.toBeNull()

    vm.reload()
    await flushPromises()

    expect(vm.status).toBe('loaded') // unchanged, no full error screen
    expect(vm.state).not.toBeNull() // the view is still there to render
    expect(vm.reloadError).toBe('network down')
  })
})

describe('useFormState: retry after a failed background refresh', () => {
  interface RetryVm { state: FormState, reloadError: string | null, reload: () => void, id: string | null }

  /** Mounts with a good first load, then fails `failures` reloads with `error` and loads fine after that. */
  async function mountFailingReloads(failures: number, error: Error = new Error('network down')) {
    const getFn = vi.fn().mockResolvedValueOnce(formState())
    // `Infinity` fails every reload.
    if (failures === Infinity) {
      getFn.mockRejectedValue(error)
    }
    else {
      for (let i = 0; i < failures; i++)
        getFn.mockRejectedValueOnce(error)
      getFn.mockResolvedValue(formState({ status: 'idle' }))
    }
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })
    const wrapper = mountHarness('artifact-1')
    await vi.advanceTimersByTimeAsync(0)
    const vm = wrapper.vm as unknown as RetryVm
    vm.reload()
    await vi.advanceTimersByTimeAsync(0)
    return { wrapper, vm, getFn }
  }

  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('keeps retrying through several failures and clears the notice when a load succeeds', async () => {
    const { wrapper, vm, getFn } = await mountFailingReloads(3)
    expect(getFn).toHaveBeenCalledTimes(2)
    expect(vm.reloadError).toBe('network down')

    await vi.advanceTimersByTimeAsync(RELOAD_RETRY_MS)
    expect(getFn).toHaveBeenCalledTimes(3)
    expect(vm.reloadError).toBe('network down')

    await vi.advanceTimersByTimeAsync(RELOAD_RETRY_MS * 2)
    expect(getFn).toHaveBeenCalledTimes(4)
    expect(vm.reloadError).toBe('network down')

    await vi.advanceTimersByTimeAsync(RELOAD_RETRY_MS * 4)
    expect(getFn).toHaveBeenCalledTimes(5)
    expect(vm.reloadError).toBeNull()
    expect(vm.state.status).toBe('idle')

    // A success ends the retries.
    await vi.advanceTimersByTimeAsync(RELOAD_RETRY_MAX_MS * 2)
    expect(getFn).toHaveBeenCalledTimes(5)
    wrapper.unmount()
  })

  it('doubles the delay up to the cap and keeps retrying at the cap', async () => {
    const { wrapper, getFn } = await mountFailingReloads(Infinity)
    let expected = 2

    // 5 s, 10 s, 20 s, 40 s, then 60 s twice. A retry never fires early.
    for (const delay of [5000, 10000, 20000, 40000, RELOAD_RETRY_MAX_MS, RELOAD_RETRY_MAX_MS]) {
      await vi.advanceTimersByTimeAsync(delay - 1)
      expect(getFn).toHaveBeenCalledTimes(expected)
      await vi.advanceTimersByTimeAsync(1)
      expect(getFn).toHaveBeenCalledTimes(++expected)
    }
    wrapper.unmount()
  })

  it('starts the backoff again after a success', async () => {
    const getFn = vi.fn()
      .mockResolvedValueOnce(formState())
      .mockRejectedValueOnce(new Error('down'))
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce(formState({ status: 'idle' }))
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValue(formState({ status: 'idle' }))
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })
    const wrapper = mountHarness('artifact-1')
    await vi.advanceTimersByTimeAsync(0)
    const vm = wrapper.vm as unknown as RetryVm

    vm.reload()
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(RELOAD_RETRY_MS)
    await vi.advanceTimersByTimeAsync(RELOAD_RETRY_MS * 2)
    expect(getFn).toHaveBeenCalledTimes(4)
    expect(vm.reloadError).toBeNull()

    vm.reload()
    await vi.advanceTimersByTimeAsync(0)
    expect(getFn).toHaveBeenCalledTimes(5)
    expect(vm.reloadError).toBe('down')
    await vi.advanceTimersByTimeAsync(RELOAD_RETRY_MS)
    expect(getFn).toHaveBeenCalledTimes(6)
    wrapper.unmount()
  })

  it.each([401, 403, 404])('does not retry after a %i, and a later event still loads', async (status) => {
    const { wrapper, vm, getFn } = await mountFailingReloads(1, hostError(status, 'denied'))
    expect(vm.reloadError).not.toBeNull()

    await vi.advanceTimersByTimeAsync(RELOAD_RETRY_MAX_MS * 3)
    expect(getFn).toHaveBeenCalledTimes(2)

    listenerFor('@reconnect')?.()
    await vi.advanceTimersByTimeAsync(0)
    expect(getFn).toHaveBeenCalledTimes(3)
    expect(vm.reloadError).toBeNull()
    wrapper.unmount()
  })

  it('retries after a 500', async () => {
    const { wrapper, getFn } = await mountFailingReloads(1, hostError(500, 'server_error'))
    await vi.advanceTimersByTimeAsync(RELOAD_RETRY_MS)
    expect(getFn).toHaveBeenCalledTimes(3)
    wrapper.unmount()
  })

  it('stops the timer on unmount', async () => {
    const { wrapper, getFn } = await mountFailingReloads(Infinity)
    expect(vi.getTimerCount()).toBe(1)

    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
    await vi.advanceTimersByTimeAsync(RELOAD_RETRY_MAX_MS * 2)
    expect(getFn).toHaveBeenCalledTimes(2)
  })

  it('stops the timer when the id is rebound', async () => {
    const getFn = vi.fn().mockResolvedValueOnce(formState()).mockRejectedValue(new Error('down'))
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })
    const wrapper = mountHarness('artifact-1')
    await vi.advanceTimersByTimeAsync(0)
    const vm = wrapper.vm as unknown as RetryVm
    vm.reload()
    await vi.advanceTimersByTimeAsync(0)
    expect(getFn).toHaveBeenCalledTimes(2)
    expect(vi.getTimerCount()).toBe(1)

    getFn.mockResolvedValueOnce(formState({ artifact_id: 'artifact-2' }))
    vm.id = 'artifact-2'
    await vi.advanceTimersByTimeAsync(0)
    expect(getFn).toHaveBeenCalledTimes(3)
    expect(vi.getTimerCount()).toBe(0)
    await vi.advanceTimersByTimeAsync(RELOAD_RETRY_MAX_MS * 2)
    expect(getFn).toHaveBeenCalledTimes(3)
    wrapper.unmount()
  })
})

describe('useFormState: reload coalescing', () => {
  it('coalesces reload calls made while a load is already in flight into a single follow-up load', async () => {
    let resolveFirst: ((s: FormState) => void) | undefined
    const first = new Promise<FormState>((resolve) => { resolveFirst = resolve })
    const getFn = vi.fn()
      .mockReturnValueOnce(first)
      .mockResolvedValueOnce(formState())
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })

    const wrapper = mountHarness('artifact-1')
    const vm = wrapper.vm as unknown as { reload: () => void }
    // Fired repeatedly while the first load is still pending.
    vm.reload()
    vm.reload()
    vm.reload()

    resolveFirst?.(formState())
    await flushPromises()
    await flushPromises()

    // The initial load + exactly one coalesced follow-up, not four.
    expect(getFn).toHaveBeenCalledTimes(2)
  })
})

describe('useFormState: visibility restore', () => {
  it('reloads once when the proxy reports the document becoming visible again', async () => {
    const getFn = vi.fn().mockResolvedValue(formState())
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })

    mountHarness('artifact-1')
    await flushPromises()
    expect(getFn).toHaveBeenCalledTimes(1)

    const onVisible = listenerFor<(visible: boolean) => void>('@visibility')
    if (!onVisible)
      throw new Error('no @visibility listener was registered')

    onVisible(false)
    await flushPromises()
    expect(getFn).toHaveBeenCalledTimes(1) // going invisible does not trigger a reload

    onVisible(true)
    await flushPromises()
    expect(getFn).toHaveBeenCalledTimes(2)
  })
})

describe('useFormState: Host reconnect', () => {
  it('reloads when the proxy reports @reconnect, so the form does not stay stale through a server restart', async () => {
    const getFn = vi.fn().mockResolvedValue(formState())
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })

    mountHarness('artifact-1')
    await flushPromises()
    expect(getFn).toHaveBeenCalledTimes(1)

    const onReconnect = listenerFor('@reconnect')
    if (!onReconnect)
      throw new Error('no @reconnect listener was registered')

    onReconnect()
    await flushPromises()
    expect(getFn).toHaveBeenCalledTimes(2)
  })

  it('unsubscribes from @reconnect on unmount', async () => {
    const unsubscribe = vi.fn()
    onMock().mockImplementation(((topic: string) => topic === '@reconnect' ? unsubscribe : () => {}) as never)
    artifactStateMock().mockReturnValue({ get: vi.fn().mockResolvedValue(formState()), submit: vi.fn() })

    const wrapper = mountHarness('artifact-1')
    await flushPromises()
    expect(unsubscribe).not.toHaveBeenCalled()

    wrapper.unmount()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})

describe('useFormState: rebind race', () => {
  it('drops a GET for the previous artifact that resolves only after the id has already moved on', async () => {
    let resolveA: ((s: FormState) => void) | undefined
    const pendingA = new Promise<FormState>((resolve) => { resolveA = resolve })
    const getFn = vi.fn()
      .mockReturnValueOnce(pendingA)
      .mockResolvedValueOnce(formState({ artifact_id: 'artifact-2', definition: { title: 'B', fields: [] } }))
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })

    const wrapper = mountHarness('artifact-1')
    const vm = wrapper.vm as unknown as { id: string | null, state: FormState | null }

    // The Host rebinds this instance to a different artifact (e.g. a
    // double-buffered w-page swap) while artifact-1's GET is still
    // in flight.
    vm.id = 'artifact-2'
    await flushPromises()

    // artifact-1's stale response finally lands.
    resolveA?.(formState({ artifact_id: 'artifact-1', definition: { title: 'A', fields: [] } }))
    await flushPromises()
    await flushPromises()

    // artifact-2 is shown. The late artifact-1 response would otherwise show a stale
    // definition and content_version, and make them submittable, under the new id.
    expect(vm.state?.artifact_id).toBe('artifact-2')
    expect(getFn).toHaveBeenCalledTimes(2)
  })
})

describe('useFormState: refresh() awaits a coalesced load', () => {
  it('resolves with the freshest state, not a stale value, when called while a load is already in flight', async () => {
    let resolveFirst: ((s: FormState) => void) | undefined
    const first = new Promise<FormState>((resolve) => { resolveFirst = resolve })
    const getFn = vi.fn()
      .mockReturnValueOnce(first)
      .mockResolvedValueOnce(formState({ status: 'idle', delivery: 'complete' }))
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })

    const wrapper = mountHarness('artifact-1')
    const vm = wrapper.vm as unknown as { refresh: () => Promise<FormState | null> }

    // refresh() is called (e.g. by the delivery nudge) while the mount's
    // own first load is still pending.
    const refreshPromise = vm.refresh()
    resolveFirst?.(formState({ status: 'idle', delivery: 'pending' }))

    const result = await refreshPromise

    // Must be the coalesced follow-up load's result, not the load that was
    // already in flight when refresh() was called, otherwise the delivery
    // nudge reads a stale `delivery: 'pending'` and sends a needless
    // session_open even though the answer was already admitted.
    expect(result?.delivery).toBe('complete')
    expect(getFn).toHaveBeenCalledTimes(2)
  })
})

describe('useFormState: newer session messages', () => {
  const SESSION_TOPIC = 'session:session-1:message:*'

  const sessionListener = () => listenerFor<(message: { data?: { type?: string } }) => void>(SESSION_TOPIC)

  it('reloads an open form on a new message, ignores chunks, and stops listening once it is stale', async () => {
    const unsubscribe = vi.fn()
    onMock().mockImplementation(((topic: string) => topic === SESSION_TOPIC ? unsubscribe : () => {}) as never)
    const getFn = vi.fn()
      .mockResolvedValueOnce(formState())
      .mockResolvedValueOnce(formState({ stale: true }))
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })

    const wrapper = mountHarness('artifact-1')
    await flushPromises()
    const onMessage = sessionListener()
    expect(onMessage).toBeDefined()

    onMessage?.({ data: { type: 'chunk' } })
    await flushPromises()
    expect(getFn).toHaveBeenCalledTimes(1)

    onMessage?.({ data: { type: 'user' } })
    await flushPromises()
    expect(getFn).toHaveBeenCalledTimes(2)
    expect((wrapper.vm as unknown as { state: FormState }).state.stale).toBe(true)
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('listens while an answer is not complete, and not for a completed one', async () => {
    const getFn = vi.fn().mockResolvedValue(formState({ status: 'idle', delivery: 'running' }))
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })
    mountHarness('artifact-1')
    await flushPromises()
    expect(sessionListener()).toBeDefined()

    onMock().mockClear()
    getFn.mockResolvedValue(formState({ status: 'idle', delivery: 'complete' }))
    mountHarness('artifact-1')
    await flushPromises()
    expect(sessionListener()).toBeUndefined()
  })
})

describe('useFormState: session status change (e.g. a Stop that settles the turn with no reply)', () => {
  const STATUS_TOPIC = 'session:session-1'

  const statusListener = () => listenerFor<(message: unknown) => void>(STATUS_TOPIC)

  it('reloads on a session-level status event while delivery is interrupted, and stops listening once complete', async () => {
    const unsubscribe = vi.fn()
    onMock().mockImplementation(((topic: string) => topic === STATUS_TOPIC ? unsubscribe : () => {}) as never)
    const getFn = vi.fn()
      .mockResolvedValueOnce(formState({ status: 'idle', delivery: 'interrupted' }))
      .mockResolvedValueOnce(formState({ status: 'idle', delivery: 'complete' }))
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })

    const wrapper = mountHarness('artifact-1')
    await flushPromises()
    const onStatus = statusListener()
    expect(onStatus).toBeDefined()

    // The session-level topic carries no `type` to filter on (unlike
    // message:*), any event on it is a reason to reload.
    onStatus?.({ data: { status: 'idle' } })
    await flushPromises()
    expect(getFn).toHaveBeenCalledTimes(2)
    expect((wrapper.vm as unknown as { state: FormState }).state.delivery).toBe('complete')
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('subscribes to the session-level topic (not just session:<id>:message:*), scoped to this session id', async () => {
    const getFn = vi.fn().mockResolvedValue(formState({ status: 'idle', delivery: 'running', session_id: 'session-42' }))
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })
    mountHarness('artifact-1')
    await flushPromises()

    const topics = onMock().mock.calls.map(([topic]) => topic)
    expect(topics).toContain('session:session-42')
    expect(topics).toContain('session:session-42:message:*')
  })

  it('unsubscribes the status listener on unmount', async () => {
    const unsubscribe = vi.fn()
    onMock().mockImplementation(((topic: string) => topic === STATUS_TOPIC ? unsubscribe : () => {}) as never)
    const getFn = vi.fn().mockResolvedValue(formState({ status: 'idle', delivery: 'running' }))
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })

    const wrapper = mountHarness('artifact-1')
    await flushPromises()
    expect(statusListener()).toBeDefined()

    wrapper.unmount()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})
