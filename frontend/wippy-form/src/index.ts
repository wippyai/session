import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { App } from 'vue'
import type { Events } from './constants'
import type { ComponentProps } from './types'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { define, WippyVueElement } from '@wippy-fe/webcomponent-vue'
import pkg from '../package.json'
import AppRoot from './app/wippy-form.vue'
import { ELEMENT_PROVIDER } from './element-context'
import stylesText from './styles.css?inline'

class WippyFormElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return {
      rootComponent: AppRoot,
      plugins: [PrimeVuePlugin],
      providers(app: App, element: WippyFormElement) {
        app.provide(ELEMENT_PROVIDER, element)
      },
    }
  }
}

export async function webComponent() {
  return WippyFormElement
}

define(import.meta.url, WippyFormElement)
