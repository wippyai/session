import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-core'
import { define, WippyElement } from '@wippy-fe/webcomponent-core'
import pkg from '../package.json'
import { parseFormAnswersRecord } from './lib/parse-record'
import HIDDEN_HOST_CSS from './styles.css?inline'

/** Invisible carrier for the JSON answer record in the `record` attribute. Never read text content. */
export class WippyFormAnswersElement extends WippyElement {
  static get wippyConfig(): WippyElementConfig {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: [],
      inlineCss: HIDDEN_HOST_CSS,
      customCss: false,
    }
  }

  /**
   * The parsed `record` attribute, or `null` when it is missing, empty or not a
   * JSON object. It is not named `record`, because an element with a `record`
   * property would swallow the attribute the Host's chat sets.
   */
  get answerRecord(): Record<string, unknown> | null {
    return parseFormAnswersRecord(this.getAttribute('record'))
  }

  protected onMount(): void {}

  protected onUnmount(): void {}
}

export async function webComponent() {
  return WippyFormAnswersElement
}

define(import.meta.url, WippyFormAnswersElement)
