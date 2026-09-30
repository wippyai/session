import type { Ref } from 'vue'
import type { FormState } from '../lib/definition'
import * as WippyProxy from '@wippy-fe/proxy'
import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NUDGE_DELAY_MS, useDeliveryNudge } from './use-delivery-nudge'

vi.mock('@wippy-fe/proxy', () => ({
  ws: { send: vi.fn() },
}))

function sendMock() {
  return vi.mocked((WippyProxy as unknown as { ws: { send: (c: unknown) => void } }).ws.send)
}

function formState(overrides: Partial<FormState> = {}): FormState {
  return {
    form_version: 1,
    artifact_id: 'artifact-1',
    session_id: 'session-1',
    status: 'idle',
    stale: false,
    late: false,
    content_version: 2,
    definition: { title: 'Form', fields: [] },
    data: {},
    submitted_at: '2026-09-29T20:00:00+02:00',
    answer_message_id: 'message-1',
    delivery: 'pending',
    ...overrides,
  }
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
  sendMock().mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useDeliveryNudge', () => {
  it('opens the session once when an accepted answer stays pending', async () => {
    const { wrapper, reload } = harness(formState(), () => formState())
    await vi.advanceTimersByTimeAsync(NUDGE_DELAY_MS)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(sendMock()).toHaveBeenCalledWith({ type: 'session_open', session_id: 'session-1' })
    await vi.advanceTimersByTimeAsync(NUDGE_DELAY_MS * 3)
    expect(sendMock()).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('does nothing when the answer is admitted before the re-check', async () => {
    const { wrapper } = harness(formState(), () => formState({ delivery: 'complete' }))
    await vi.advanceTimersByTimeAsync(NUDGE_DELAY_MS)
    expect(sendMock()).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('does nothing for an active form or an already delivered answer', async () => {
    const active = harness(formState({ status: 'active', delivery: null }), () => formState())
    const done = harness(formState({ delivery: 'complete' }), () => formState())
    await vi.advanceTimersByTimeAsync(NUDGE_DELAY_MS * 2)
    expect(active.reload).not.toHaveBeenCalled()
    expect(done.reload).not.toHaveBeenCalled()
    expect(sendMock()).not.toHaveBeenCalled()
    active.wrapper.unmount()
    done.wrapper.unmount()
  })

  it('cancels a pending re-check on unmount', async () => {
    const { wrapper, reload } = harness(formState(), () => formState())
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(NUDGE_DELAY_MS * 2)
    expect(reload).not.toHaveBeenCalled()
    expect(sendMock()).not.toHaveBeenCalled()
  })
})
