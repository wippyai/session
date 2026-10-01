import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

// TODO(D36): delete with @wippy-fe/theme >= 0.0.61. From that version the theme
// plugin's overlay layer follows the theme class of the overlay's trigger, so
// this class is no longer needed. When this package's theme dependency moves to
// >= 0.0.61, remove three things together:
//   1. this file,
//   2. use-theme-mode-class.test.ts beside it, and
//   3. the call in app/fields/date-field.vue (with the 'calendar overlay' theme
//      class tests in app/fields/date-field.test.ts, and the README gap).

const THEME_ROOT = '[data-wippy-theme-root]'
const MODE_CLASSES = ['w-theme-dark', 'w-theme-light']

/**
 * The forced theme class (`w-theme-dark` or `w-theme-light`) of the themed
 * container the element lives in, kept current while the Host switches the
 * theme, or `''` when the theme follows the OS (no class on the container).
 *
 * Why a component needs it: the Host applies the theme to the container of
 * the web component's shadow root, and the theme's `dark:` utilities and
 * `--p-*` tokens read that class on the element or an ancestor. An overlay the
 * theme plugin renders in its own layer (a sibling of that container, so it
 * escapes the clipping of the message around it) has no such ancestor, so it
 * would always paint in the OS scheme. Putting the same class on the overlay's
 * own element makes it follow the container (decision D36).
 *
 * The container is observed only while `enabled()` is true, so a field that
 * can open no overlay (read-only, or disabled for the moment) installs no
 * observer; it is read again when it becomes enabled.
 */
export function useThemeModeClass(anchor: () => Element | null | undefined, enabled: () => boolean = () => true): Ref<string> {
  const modeClass = ref('')
  let observer: MutationObserver | null = null

  function stop() {
    observer?.disconnect()
    observer = null
  }

  function start() {
    stop()
    const root = anchor()?.closest(THEME_ROOT)
    if (!root)
      return
    const read = () => { modeClass.value = MODE_CLASSES.find(name => root.classList.contains(name)) ?? '' }
    read()
    observer = new MutationObserver(read)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
  }

  onMounted(() => {
    // Created in the mounted hook, so it belongs to the component and ends with it.
    watch(enabled, on => on ? start() : stop(), { immediate: true })
  })

  onBeforeUnmount(stop)

  return modeClass
}
