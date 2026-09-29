import type { Ref } from 'vue'
import type { FormState } from '../lib/definition'
import { on } from '@wippy-fe/proxy'
import * as WippyProxy from '@wippy-fe/proxy'
import { onUnmounted, ref, watch } from 'vue'

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error' | 'unsupported'

export interface UseFormStateResult {
  status: Ref<LoadStatus>
  state: Ref<FormState | null>
  errorMessage: Ref<string | null>
  reload: () => void
}

/**
 * Loads and keeps `FormState` current for one artifact id: on mount, when
 * the id changes, when the Host's `state` prop changes (props.state="idle"
 * once the answer is accepted), and on the `artifact:<id>` relay event.
 * Superseded/late responses (unmount, id change, or a newer
 * load already in flight) are dropped via a generation counter rather than
 * an abort signal, since the Host client has no cancellation contract.
 */
export function useFormState(artifactId: Ref<string | null>, statePropTrigger: Ref<unknown>): UseFormStateResult {
  const status = ref<LoadStatus>('idle')
  const state = ref<FormState | null>(null)
  const errorMessage = ref<string | null>(null)

  let generation = 0
  let unsubscribeArtifactEvent: (() => void) | null = null
  let subscribedId: string | null = null

  function getArtifactStateFn() {
    // Property access on the module namespace object, NOT a named import.
    // `import { artifactState } from '@wippy-fe/proxy'` resolves statically
    // against whatever proxy.js the Host's import map actually serves — on
    // an older Host that doesn't export it yet, that's a hard SyntaxError
    // at module link time, before any of our code runs. A namespace-object
    // property read just yields `undefined` there, which the "unsupported"
    // branch below turns into the actionable message the contract asks for.
    return (WippyProxy as unknown as Record<string, unknown>).artifactState as
      | ((id: string) => { get: () => Promise<FormState> })
      | undefined
  }

  async function load(): Promise<void> {
    const id = artifactId.value
    if (!id) {
      status.value = 'idle'
      state.value = null
      return
    }

    const artifactStateFn = getArtifactStateFn()
    if (typeof artifactStateFn !== 'function') {
      status.value = 'unsupported'
      errorMessage.value = 'This form needs a newer Web Host.'
      return
    }

    const myGeneration = ++generation
    status.value = 'loading'
    try {
      const next = await artifactStateFn(id).get()
      if (myGeneration !== generation)
        return
      state.value = next
      status.value = 'loaded'
      errorMessage.value = null
    }
    catch (err) {
      if (myGeneration !== generation)
        return
      status.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : 'Could not load this form.'
    }
  }

  function subscribe(id: string | null): void {
    if (subscribedId === id)
      return
    unsubscribeArtifactEvent?.()
    unsubscribeArtifactEvent = null
    subscribedId = id
    if (id)
      unsubscribeArtifactEvent = on(`artifact:${id}`, () => { void load() })
  }

  watch(artifactId, (id) => {
    subscribe(id)
    void load()
  }, { immediate: true })

  watch(statePropTrigger, () => { void load() })

  onUnmounted(() => {
    generation++
    unsubscribeArtifactEvent?.()
    unsubscribeArtifactEvent = null
  })

  return { status, state, errorMessage, reload: () => { void load() } }
}
