import type { InjectionKey, Ref } from 'vue'
import { inject, onMounted, onUnmounted, ref } from 'vue'

/**
 * Injection key for the raw custom element. It is the only way to read
 * `data-wippy-artifact-id`, because the provider set of
 * `@wippy-fe/webcomponent-vue` does not expose the host element. `src/index.ts`
 * provides it.
 */
export const ELEMENT_PROVIDER = Symbol('wippy-form:element') as InjectionKey<HTMLElement>

const ARTIFACT_ID_ATTR = 'data-wippy-artifact-id'

/**
 * The `data-wippy-artifact-id` attribute of the host element, kept current. The
 * Host writes it directly and it is not a prop, so prop changes never report
 * it, and a MutationObserver on that one attribute notices a rebind to another
 * artifact.
 */
export function useArtifactId(): Ref<string | null> {
  const element = inject(ELEMENT_PROVIDER)
  const artifactId = ref<string | null>(element?.getAttribute(ARTIFACT_ID_ATTR) ?? null)

  if (element) {
    let observer: MutationObserver | null = null
    onMounted(() => {
      artifactId.value = element.getAttribute(ARTIFACT_ID_ATTR)
      observer = new MutationObserver(() => {
        artifactId.value = element.getAttribute(ARTIFACT_ID_ATTR)
      })
      observer.observe(element, { attributes: true, attributeFilter: [ARTIFACT_ID_ATTR] })
    })
    onUnmounted(() => {
      observer?.disconnect()
      observer = null
    })
  }

  return artifactId
}
