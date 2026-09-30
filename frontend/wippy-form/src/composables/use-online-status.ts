import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Tracks `window` online/offline state. Submitting while offline can only
 * fail, so the form disables Submit and shows a notice instead of letting
 * the user hit the no-response retry path. `onBackOnline` is called once
 * per online transition so the caller can refresh state (coalesced with any
 * other pending reload — see `use-form-state.ts`), not poll.
 */
export function useOnlineStatus(onBackOnline: () => void) {
  const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)

  function handleOnline() {
    isOnline.value = true
    onBackOnline()
  }

  function handleOffline() {
    isOnline.value = false
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return { isOnline }
}
