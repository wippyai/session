import type { Ref } from 'vue'
import type { FormState } from '../lib/definition'
import { onUnmounted, watch } from 'vue'
import { hostExport } from '../lib/host-proxy'

/** How long an accepted answer may stay pending before the form asks for its session. */
export const NUDGE_DELAY_MS = 2000

/**
 * An accepted answer is admitted by its session process. When no process runs
 * for the session (the tab reloaded, or the session was stopped), the server's
 * wake-up reaches nobody and the answer waits until the user types. If an
 * answered form still reports `delivery: 'pending'` a moment after it was seen,
 * this reloads it once and then opens the session over the Host's WebSocket,
 * and the session admits pending answers when it starts. It does this once per
 * artifact.
 */
export function useDeliveryNudge(state: Ref<FormState | null>, reload: () => Promise<FormState | null>) {
  let timer: ReturnType<typeof setTimeout> | null = null
  const nudged = new Set<string>()

  function clear() {
    if (timer)
      clearTimeout(timer)
    timer = null
  }

  watch([() => state.value?.artifact_id, () => state.value?.status, () => state.value?.delivery], () => {
    const current = state.value
    if (!current || current.status !== 'idle' || current.delivery !== 'pending' || nudged.has(current.artifact_id))
      return
    clear()
    const artifactId = current.artifact_id
    timer = setTimeout(async () => {
      timer = null
      const fresh = await reload()
      if (!fresh || fresh.artifact_id !== artifactId || fresh.delivery !== 'pending' || nudged.has(artifactId))
        return
      nudged.add(artifactId)
      hostExport('ws')?.send({ type: 'session_open', session_id: fresh.session_id })
    }, NUDGE_DELAY_MS)
  }, { immediate: true })

  onUnmounted(clear)
}
