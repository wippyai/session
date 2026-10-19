import type { Ref } from 'vue'
import type { FormState } from '../lib/definition'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { formState } from '../test-support/fixtures'
import { resetProxyMock, wsSendMock } from '../test-support/proxy-control'
import { NUDGE_DELAY_MS, useDeliveryNudge } from './use-delivery-nudge'

/** An answered form whose delivery is still pending. */
function pendingState(overrides: Partial<FormState> = {}): FormState {
  return formState({ status: 'idle', content_version: 2, data: {}, submitted_at: '2026-09-29T20:00:00+02:00', answer_message_id: 'message-1', delivery: 'pending', ...overrides })
}

function harness(initial: FormState, afterReload: () => FormState) {
  const reload = vi.fn(async () => afterReload())
  const wrapper = mount(defineComponent({
    setup() {
      const state: Ref<FormState | null> = ref(initial)
      useDeliveryNudge(state, async () => {
        const next = await reload()
        state.value = next
        return next
      })
      return {}
    },
    template: '<div />',
  }))
  return { wrapper, reload }
}

beforeEach(() => {
  vi.useFakeTimers()
  resetProxyMock()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useDeliveryNudge', () => {
  it('opens the session once when an accepted answer stays pending', async () => {
    const { wrapper, reload } = harness(pendingState(), () => pendingState())
    await vi.advanceTimersByTimeAsync(NUDGE_DELAY_MS)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(wsSendMock()).toHaveBeenCalledWith({ type: 'session_open', session_id: 'session-1' })
    await vi.advanceTimersByTimeAsync(NUDGE_DELAY_MS * 3)
    expect(wsSendMock()).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('does nothing when the answer is admitted before the re-check', async () => {
    const { wrapper } = harness(pendingState(), () => pendingState({ delivery: 'complete' }))
    await vi.advanceTimersByTimeAsync(NUDGE_DELAY_MS)
    expect(wsSendMock()).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('does nothing for an active form or an already delivered answer', async () => {
    const active = harness(pendingState({ status: 'active', delivery: null }), () => pendingState())
    const done = harness(pendingState({ delivery: 'complete' }), () => pendingState())
    await vi.advanceTimersByTimeAsync(NUDGE_DELAY_MS * 2)
    expect(active.reload).not.toHaveBeenCalled()
    expect(done.reload).not.toHaveBeenCalled()
    expect(wsSendMock()).not.toHaveBeenCalled()
    active.wrapper.unmount()
    done.wrapper.unmount()
  })

  it('cancels a pending re-check on unmount', async () => {
    const { wrapper, reload } = harness(pendingState(), () => pendingState())
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(NUDGE_DELAY_MS * 2)
    expect(reload).not.toHaveBeenCalled()
    expect(wsSendMock()).not.toHaveBeenCalled()
  })
})
