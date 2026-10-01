import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

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
 * own element makes it follow the container. When the plugin's layer carries
 * the theme class itself, this can go.
 */
export function useThemeModeClass(anchor: () => Element | null | undefined): Ref<string> {
  const modeClass = ref('')
  let observer: MutationObserver | null = null

  onMounted(() => {
    const root = anchor()?.closest(THEME_ROOT)
    if (!root)
      return
    const read = () => { modeClass.value = MODE_CLASSES.find(name => root.classList.contains(name)) ?? '' }
    read()
    observer = new MutationObserver(read)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  return modeClass
}
