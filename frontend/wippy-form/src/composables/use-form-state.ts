import type { Ref } from 'vue'
import type { FormState } from '../lib/definition'
import { on } from '@wippy-fe/proxy'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { hostExport } from '../lib/host-proxy'
import { LOAD_FAILED_MESSAGE } from '../lib/messages'

export const RELOAD_RETRY_MS = 5000

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error' | 'unsupported'

export interface UseFormStateResult {
  status: Ref<LoadStatus>
  state: Ref<FormState | null>
  errorMessage: Ref<string | null>
  /** Set when a reload fails while a view is already showing. The caller keeps rendering `state` and can show a small notice. */
  reloadError: Ref<string | null>
  reload: () => void
  /** Loads now, coalesced with any load in flight, and resolves with the resulting state. */
  refresh: () => Promise<FormState | null>
}

/**
 * Loads the `FormState` of one artifact and keeps it current. It loads on
 * mount and when the id or the Host's `state` prop changes. It reloads on the
 * `artifact:<id>` event, when the page becomes visible, and after a WebSocket
 * reconnect. While the form can still become "asked earlier" or its answer is
 * not yet delivered, it also reloads on messages and status changes of the
 * session.
 *
 * A response for a previous id, or for a load that a newer one superseded, is
 * dropped by a generation counter, because the Host client cannot cancel a
 * request. Only the first load sets `status` to `loading` or `error`. A failed
 * background reload sets `reloadError` and keeps the view, so no remount loses
 * focus or a draft. Reloads requested while one is in flight are coalesced into
 * one follow-up load.
 */
export function useFormState(artifactId: Ref<string | null>, statePropTrigger: Ref<unknown>): UseFormStateResult {
  const status = ref<LoadStatus>('idle')
  const state = ref<FormState | null>(null)
  const errorMessage = ref<string | null>(null)
  const reloadError = ref<string | null>(null)

  let generation = 0
  // The load in flight, and the follow-up load that a reload requested during
  // it waits for. `runLoad()` resolves once the freshest requested load has
  // finished, so `refresh()` never returns the state of an older load.
  let currentLoad: Promise<void> | null = null
  let pendingLoad: Promise<void> | null = null
  let unsubscribeArtifactEvent: (() => void) | null = null
  let subscribedId: string | null = null

  // One delayed retry after a failed background reload, so a transient failure
  // does not leave the view stale until the next event.
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
    // Checked first: a Host without artifactState never sets an artifact id either.
    const artifactState = hostExport('artifactState')
    if (typeof artifactState !== 'function') {
      status.value = 'unsupported'
      return
    }

    const id = artifactId.value
    if (!id) {
      status.value = 'idle'
      state.value = null
      reloadError.value = null
      return
    }

    const myGeneration = ++generation
    const isFirstLoad = state.value === null
    if (isFirstLoad)
      status.value = 'loading'

    try {
      const next = await artifactState(id).get()
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
      const message = err instanceof Error ? err.message : LOAD_FAILED_MESSAGE
      if (isFirstLoad) {
        status.value = 'error'
        errorMessage.value = message
      }
      else {
        reloadError.value = message
        scheduleRetry()
      }
    }
  }

  /** Runs `performLoad`, or queues one follow-up run behind the load in flight. Resolves when the freshest requested load is done. */
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

  watch(statePropTrigger, () => { void runLoad() })

  // A newer message in the session makes an open form "asked earlier", and a
  // pending answer moves on to running and complete. The session is listened
  // to only while one of those can still happen.
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
  let unsubscribeSessionStatus: (() => void) | null = null
  let unsubscribeVisibility: (() => void) | null = null
  let unsubscribeReconnect: (() => void) | null = null

  onMounted(() => {
    watch(artifactId, (id) => {
      // A rebind starts a new form, so its first load shows the loading state.
      // Bumping `generation` here stops a GET still in flight for the previous
      // id, possibly the load a queued follow-up waits behind, from
      // overwriting `state` after the id has moved on.
      generation++
      state.value = null
      reloadError.value = null
      subscribe(id)
      void runLoad()
    }, { immediate: true })

    watch(watchedSessionId, (sessionId) => {
      unsubscribeSessionMessages?.()
      unsubscribeSessionMessages = null
      unsubscribeSessionStatus?.()
      unsubscribeSessionStatus = null
      if (sessionId) {
        unsubscribeSessionMessages = on(`session:${sessionId}:message:*`, (message) => {
          if ((message.data as { type?: string } | undefined)?.type !== 'chunk')
            void runLoad()
        })
        // A Stop that settles the turn without a reply sends no message, but it
        // changes the status of the session, which `session:<id>` announces.
        unsubscribeSessionStatus = on(`session:${sessionId}`, () => { void runLoad() })
      }
    }, { immediate: true })

    unsubscribeVisibility = on('@visibility', (visible: boolean) => {
      if (visible)
        void runLoad()
    })
    // After a WebSocket reconnect (no payload) the card is stale, because the
    // events that would have reloaded it travelled over the dropped socket.
    unsubscribeReconnect = on('@reconnect', () => { void runLoad() })
  })

  onUnmounted(() => {
    generation++
    if (retryTimer)
      clearTimeout(retryTimer)
    retryTimer = null
    unsubscribeArtifactEvent?.()
    unsubscribeSessionMessages?.()
    unsubscribeSessionStatus?.()
    unsubscribeVisibility?.()
    unsubscribeReconnect?.()
  })

  async function refresh(): Promise<FormState | null> {
    await runLoad()
    return state.value
  }

  return { status, state, errorMessage, reloadError, reload: () => { void runLoad() }, refresh }
}
