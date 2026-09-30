import type { Ref } from 'vue'
import type { FormState } from '../lib/definition'
import { on } from '@wippy-fe/proxy'
import * as WippyProxy from '@wippy-fe/proxy'
import { computed, onUnmounted, ref, watch } from 'vue'

export const RELOAD_RETRY_MS = 5000

export type LoadStatus ='idle' | 'loading' | 'loaded' | 'error' | 'unsupported'

export interface UseFormStateResult {
  status: Ref<LoadStatus>
  state: Ref<FormState | null>
  errorMessage: Ref<string | null>
  /**
   * Set only when a load fails while a view is already showing (a
   * background reload, not the artifact's first load). The caller keeps
   * rendering `state` as-is and can surface this as a small, non-blocking
   * notice instead of replacing the view with an error screen.
   */
  reloadError: Ref<string | null>
  reload: () => void
  /** Loads now (coalesced with any load in flight) and resolves with the resulting state. */
  refresh: () => Promise<FormState | null>
}

/**
 * Loads and keeps `FormState` current for one artifact id: on mount, when
 * the id changes, when the Host's `state` prop changes (props.state="idle"
 * once the answer is accepted), on the `artifact:<id>` relay event, and on
 * the proxy's `@visibility` restore event (tab/document becoming visible
 * again), and on new messages in the form's session while the form can
 * still become "asked earlier" or its answer is not yet complete.
 * Superseded/late responses (unmount, id change, or a newer load
 * already in flight) are dropped via a generation counter rather than an
 * abort signal, since the Host client has no cancellation contract.
 *
 * Only the artifact's first load sets `status` to `'loading'` / `'error'`
 * (there is nothing to show yet, so a full loading/error screen is
 * appropriate). A background reload — the artifact already has a `state`
 * value — never touches `status`; a failure there only sets `reloadError`,
 * so the caller keeps the current view mounted (no remount, no lost focus
 * or draft) instead of replacing it.
 *
 * Concurrent reload requests (e.g. a visibility restore firing while an
 * `artifact:<id>` reload is still in flight) are coalesced into a single
 * follow-up load rather than piling up requests — no polling, no request
 * pile-up.
 */
export function useFormState(artifactId: Ref<string | null>, statePropTrigger: Ref<unknown>): UseFormStateResult {
  const status = ref<LoadStatus>('idle')
  const state = ref<FormState | null>(null)
  const errorMessage = ref<string | null>(null)
  const reloadError = ref<string | null>(null)

  let generation = 0
  // The load currently in flight, and — when a reload is requested while one
  // is already running — the promise of the coalesced follow-up load that
  // will run right after it. `runLoad()` always resolves once the freshest
  // requested load has actually finished, so `refresh()` (used by the
  // delivery nudge) never returns stale `state.value` from a load that was
  // still in flight when it was called.
  let currentLoad: Promise<void> | null = null
  let pendingLoad: Promise<void> | null = null
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

  // One delayed retry after a failed background refresh, so a transient
  // failure does not leave the view stale until the next event.
  let retryTimer: ReturnType<typeof setTimeout> | null = null
  let retried = false
  function scheduleRetry(): void {
    if (retried || retryTimer)
      return
    retried = true
    retryTimer = setTimeout(() => {
      retryTimer = null
      void runLoad()
    }, RELOAD_RETRY_MS)
  }

  async function performLoad(): Promise<void> {
    const id = artifactId.value
    if (!id) {
      status.value = 'idle'
      state.value = null
      reloadError.value = null
      return
    }

    const artifactStateFn = getArtifactStateFn()
    if (typeof artifactStateFn !== 'function') {
      status.value = 'unsupported'
      errorMessage.value = 'This form needs a newer Web Host.'
      return
    }

    const myGeneration = ++generation
    const isFirstLoad = state.value === null
    if (isFirstLoad)
      status.value = 'loading'

    try {
      const next = await artifactStateFn(id).get()
      if (myGeneration !== generation)
        return
      state.value = next
      status.value = 'loaded'
      errorMessage.value = null
      reloadError.value = null
      retried = false
    }
    catch (err) {
      if (myGeneration !== generation)
        return
      const message = err instanceof Error ? err.message : 'Could not load this form.'
      if (isFirstLoad) {
        status.value = 'error'
        errorMessage.value = message
      }
      else {
        // Keep the current view mounted; just flag the failed refresh.
        reloadError.value = message
        scheduleRetry()
      }
    }
  }

  /**
   * Runs `performLoad`, coalescing any reload requested while one is
   * already in flight into a single follow-up run. Returns a promise that
   * resolves once the freshest requested load has finished — when a load is
   * already running, that is the coalesced follow-up's own completion, not
   * the already-running load's, so a caller that awaits this always
   * observes state at least as fresh as the moment it called `runLoad()`.
   */
  function runLoad(): Promise<void> {
    if (currentLoad) {
      if (!pendingLoad) {
        pendingLoad = currentLoad.then(() => {
          pendingLoad = null
          return runLoad()
        })
      }
      return pendingLoad
    }
    currentLoad = performLoad().finally(() => {
      currentLoad = null
    })
    return currentLoad
  }

  function subscribe(id: string | null): void {
    if (subscribedId === id)
      return
    unsubscribeArtifactEvent?.()
    unsubscribeArtifactEvent = null
    subscribedId = id
    if (id)
      unsubscribeArtifactEvent = on(`artifact:${id}`, () => { void runLoad() })
  }

  watch(artifactId, (id) => {
    // A rebind to a different artifact is a new form — nothing to keep
    // showing, so let its own first load show the full loading state
    // rather than lingering on the previous artifact's content. Bumping
    // `generation` here (not only inside `performLoad`) is what actually
    // makes the rebind safe: without it, a GET already in flight for the
    // PREVIOUS id can still land after this point (it may even be the
    // load a coalesced `runLoad()` call is currently queued behind) and
    // would otherwise pass the `myGeneration !== generation` check and
    // overwrite `state.value` with the old artifact's data after the id
    // has already moved on.
    generation++
    state.value = null
    reloadError.value = null
    subscribe(id)
    void runLoad()
  }, { immediate: true })

  watch(statePropTrigger, () => { void runLoad() })

  // A newer message in the session changes derived state the artifact event
  // never announces: an open form becomes "asked earlier", and a pending
  // answer moves to running/complete. Listen only while one of those can
  // still change, and skip streaming chunks.
  const watchedSessionId = computed(() => {
    const current = state.value
    if (!current?.session_id)
      return null
    if (current.status === 'active' && !current.stale)
      return current.session_id
    if (current.status === 'idle' && current.delivery && current.delivery !== 'complete')
      return current.session_id
    return null
  })
  let unsubscribeSessionMessages: (() => void) | null = null
  watch(watchedSessionId, (sessionId) => {
    unsubscribeSessionMessages?.()
    unsubscribeSessionMessages = null
    if (sessionId) {
      unsubscribeSessionMessages = on(`session:${sessionId}:message:*`, (message) => {
        if ((message.data as { type?: string } | undefined)?.type !== 'chunk')
          void runLoad()
      })
    }
  }, { immediate: true })

  // Host-mediated tab/document visibility restore — a bounded, coalesced
  // state check, not polling.
  const unsubscribeVisibility = on('@visibility', (visible: boolean) => {
    if (visible)
      void runLoad()
  })

  onUnmounted(() => {
    generation++
    if (retryTimer)
      clearTimeout(retryTimer)
    retryTimer = null
    unsubscribeArtifactEvent?.()
    unsubscribeArtifactEvent = null
    unsubscribeSessionMessages?.()
    unsubscribeSessionMessages = null
    unsubscribeVisibility()
  })

  async function refresh(): Promise<FormState | null> {
    await runLoad()
    return state.value
  }

  return { status, state, errorMessage, reloadError, reload: () => { void runLoad() }, refresh }
}
