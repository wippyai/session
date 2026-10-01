import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { ELEMENT_PROVIDER, useArtifactId } from './element-context'

function mountHarness(element?: HTMLElement) {
  return mount(defineComponent({
    setup() {
      return { artifactId: useArtifactId() }
    },
    template: '<div />',
  }), { global: { provide: element ? { [ELEMENT_PROVIDER as unknown as symbol]: element } : {} } })
}

describe('useArtifactId', () => {
  it('reads the artifact id the Host set on the element, and follows a rebind', async () => {
    const element = document.createElement('div')
    element.setAttribute('data-wippy-artifact-id', 'artifact-1')
    const wrapper = mountHarness(element)
    const vm = wrapper.vm as unknown as { artifactId: string | null }
    expect(vm.artifactId).toBe('artifact-1')

    element.setAttribute('data-wippy-artifact-id', 'artifact-2')
    await flushPromises()
    expect(vm.artifactId).toBe('artifact-2')

    element.removeAttribute('data-wippy-artifact-id')
    await flushPromises()
    expect(vm.artifactId).toBeNull()
  })

  it('is null without an element', () => {
    expect((mountHarness().vm as unknown as { artifactId: string | null }).artifactId).toBeNull()
  })

  it('stops observing the element on unmount', async () => {
    const element = document.createElement('div')
    const wrapper = mountHarness(element)
    const vm = wrapper.vm as unknown as { artifactId: string | null }
    wrapper.unmount()

    element.setAttribute('data-wippy-artifact-id', 'artifact-9')
    await flushPromises()
    expect(vm.artifactId).toBeNull()
  })
})
