import type { InjectionKey, Ref } from 'vue'
import { inject, onMounted, onUnmounted, ref } from 'vue'

/**
 * Injection key for the raw custom-element host — the only reliable way to
 * read `data-wippy-artifact-id`. `@wippy-fe/webcomponent-vue`'s provider set
 * doesn't expose the host element itself (only props/events/content refs),
 * so `wippyConfig.vueConfig.providers` (in `src/index.ts`) supplies it here.
 */
export const ELEMENT_PROVIDER = Symbol('wippy-form:element') as InjectionKey<HTMLElement>

const ARTIFACT_ID_ATTR = 'data-wippy-artifact-id'

/**
 * Reactive `data-wippy-artifact-id` read off the host element.
 *
 * The form's identity is the Host-set `data-wippy-artifact-id` attribute
 * (see the Web Host's "Reserved Host Attributes"). That attribute
 * is not part of the component's props schema (it's an identity marker the
 * Host writes directly, not a package-tag prop), so `parseProps` /
 * `onPropsChanged` never see it. A `MutationObserver` on this one attribute
 * is what actually stays current if the Host (re)binds the element to a
 * different artifact without a full remount.
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
