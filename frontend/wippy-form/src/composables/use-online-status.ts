import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Tracks the `online` and `offline` state of the window. A submit while offline
 * can only fail, so the card blocks it and shows a notice. `onBackOnline` runs
 * once per return to online, so the caller can refresh its state.
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
