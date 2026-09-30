import type { Ref } from 'vue'
import type { FormState } from '../lib/definition'
import * as WippyProxy from '@wippy-fe/proxy'
import { onUnmounted, watch } from 'vue'

/** How long an accepted answer may stay pending before the form asks for its session. */
export const NUDGE_DELAY_MS = 2000

interface WsLike { send: (command: { type: string, session_id: string }) => void }

function hostWs(): WsLike | undefined {
  // Namespace read, as in use-form-state.ts: an older Host may not export it.
  const ws = (WippyProxy as unknown as Record<string, unknown>).ws as WsLike | undefined
  return ws && typeof ws.send === 'function' ? ws : undefined
}

/**
 * An accepted answer is admitted by its session process. When no process
 * runs for the session (the tab reloaded, or the session was stopped), the
 * server's wake-up has nobody to reach and the answer would wait until the
 * user types. If an answered form still reports `delivery: 'pending'` a
 * moment after it was seen, this re-checks once and then opens the session
 * over the Host's own WebSocket connection (an ordinary `session_open`); the
 * session admits pending answers when it starts. Once per artifact.
 */
export function useDeliveryNudge(state: Ref<FormState | null>, reload: () => Promise<FormState | null>) {
  let timer: ReturnType<typeof setTimeout> | null = null
  const nudged = new Set<string>()

  function clear() {
    if (timer)
      clearTimeout(timer)
    timer = null
  }

  watch(() => [state.value?.artifact_id, state.value?.status, state.value?.delivery], () => {
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
      hostWs()?.send({ type: 'session_open', session_id: fresh.session_id })
    }, NUDGE_DELAY_MS)
  }, { immediate: true })

  onUnmounted(clear)
}
