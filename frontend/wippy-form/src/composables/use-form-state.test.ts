import type { FormState } from '../lib/definition'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { formState } from '../test-support/fixtures'
import { artifactStateMock, listenerFor, onMock, resetProxyMock } from '../test-support/proxy-control'
import { RELOAD_RETRY_MS, useFormState } from './use-form-state'

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

describe('useFormState — background reload vs first load', () => {
  it('only sets status to "loading" for the artifact\'s first load, not a later background reload', async () => {
    const getFn = vi.fn().mockResolvedValue(formState())
    artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })

    const wrapper = mountHarness('artifact-1')
    // First load in flight synchronously after mount.
    expect((wrapper.vm as unknown as { status: string }).status).toBe('loading')
    await flushPromises()
    expect((wrapper.vm as unknown as { status: string }).status).toBe('loaded')

    // A background reload (artifact event) must not flip status back to
    // "loading" — the caller keeps rendering the current state untouched.
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

    expect(vm.status).toBe('loaded') // unchanged — no full error screen
    expect(vm.state).not.toBeNull() // the view is still there to render
    expect(vm.reloadError).toBe('network down')
  })
})

describe('useFormState — retry after a failed background refresh', () => {
  it('retries once after a delay and clears the notice when that load succeeds', async () => {
    vi.useFakeTimers()
    try {
      const getFn = vi.fn()
        .mockResolvedValueOnce(formState())
        .mockRejectedValueOnce(new Error('network down'))
        .mockRejectedValueOnce(new Error('still down'))
        .mockResolvedValueOnce(formState({ status: 'idle' }))
      artifactStateMock().mockReturnValue({ get: getFn, submit: vi.fn() })

      const wrapper = mountHarness('artifact-1')
      await vi.advanceTimersByTimeAsync(0)
      const vm = wrapper.vm as unknown as { state: FormState, reloadError: string | null, reload: () => void }

      vm.reload()
      await vi.advanceTimersByTimeAsync(0)
      expect(vm.reloadError).toBe('network down')

      await vi.advanceTimersByTimeAsync(RELOAD_RETRY_MS)
      expect(getFn).toHaveBeenCalledTimes(3)
      expect(vm.reloadError).toBe('still down')

      // Bounded: no second automatic retry until something else succeeds.
      await vi.advanceTimersByTimeAsync(RELOAD_RETRY_MS * 3)
      expect(getFn).toHaveBeenCalledTimes(3)

      vm.reload()
      await vi.advanceTimersByTimeAsync(0)
      expect(vm.reloadError).toBeNull()
      expect(vm.state.status).toBe('idle')
      wrapper.unmount()
    }
    finally {
      vi.useRealTimers()
    }
  })
})

describe('useFormState — reload coalescing', () => {
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

    // The initial load + exactly one coalesced follow-up — not four.
    expect(getFn).toHaveBeenCalledTimes(2)
  })
})

describe('useFormState — visibility restore', () => {
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

describe('useFormState — Host reconnect', () => {
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

describe('useFormState — rebind race', () => {
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

    // Must reflect artifact-2 — never the late artifact-1 response, which
    // would otherwise let a stale definition/content_version briefly show
    // (and be submittable) under the new artifact id.
    expect(vm.state?.artifact_id).toBe('artifact-2')
    expect(getFn).toHaveBeenCalledTimes(2)
  })
})

describe('useFormState — refresh() awaits a coalesced load', () => {
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
    // already in flight when refresh() was called — otherwise the delivery
    // nudge reads a stale `delivery: 'pending'` and sends a needless
    // session_open even though the answer was already admitted.
    expect(result?.delivery).toBe('complete')
    expect(getFn).toHaveBeenCalledTimes(2)
  })
})

describe('useFormState — newer session messages', () => {
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

describe('useFormState — session status change (e.g. a Stop that settles the turn with no reply)', () => {
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
    // message:*) — any event on it is a reason to reload.
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
