import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { useOnlineStatus } from './use-online-status'

function mountHarness(onBackOnline: () => void) {
  return mount(defineComponent({
    setup() {
      return useOnlineStatus(onBackOnline)
    },
    template: '<div />',
  }))
}

describe('useOnlineStatus', () => {
  it('follows the window offline and online events, and calls back once per return to online', async () => {
    const onBackOnline = vi.fn()
    const wrapper = mountHarness(onBackOnline)
    const vm = wrapper.vm as unknown as { isOnline: boolean }
    expect(vm.isOnline).toBe(true)

    window.dispatchEvent(new Event('offline'))
    await wrapper.vm.$nextTick()
    expect(vm.isOnline).toBe(false)
    expect(onBackOnline).not.toHaveBeenCalled()

    window.dispatchEvent(new Event('online'))
    await wrapper.vm.$nextTick()
    expect(vm.isOnline).toBe(true)
    expect(onBackOnline).toHaveBeenCalledTimes(1)
  })

  it('stops listening on unmount', () => {
    const onBackOnline = vi.fn()
    mountHarness(onBackOnline).unmount()

    window.dispatchEvent(new Event('online'))
    expect(onBackOnline).not.toHaveBeenCalled()
  })
})
