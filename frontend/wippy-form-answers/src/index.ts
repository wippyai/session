import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-core'
import { define, WippyElement } from '@wippy-fe/webcomponent-core'
import pkg from '../package.json'
import { HIDDEN_HOST_CSS } from './lib/hidden-css'
import { parseFormAnswersRecord } from './lib/parse-record'

/**
 * `<wippy-form-answers>` — an invisible carrier for the raw JSON answer
 * record the Session server appends to a user's chat message right after
 * they answer a form. See `package.json`'s `wippy.description` (mirrored
 * in the registry entry) for the full wire contract.
 *
 * The record lives in the `record` ATTRIBUTE, never in text content or
 * children. An element the chat sanitizer strips (e.g. because the
 * Host's components list hasn't picked up this tag yet) or that hasn't
 * finished loading its script (still an unrecognized element) both
 * render nothing when they have no children — but would leak the raw
 * JSON straight to the user if it lived in text content instead.
 * `record` is declared as a prop specifically so the Host adds it to the
 * chat sanitizer's allowed attribute list; without that, the attribute
 * itself would still get stripped even once the tag is allowed through.
 *
 * It renders nothing: no `<slot>` is ever created anywhere in this class
 * (so even stray light-DOM content would never project into the shadow
 * root), and `:host { display: none; }` hides the element outright as
 * defense in depth for the case where it does mount normally — the
 * attribute-not-text-content design above is what actually prevents the
 * JSON leaking in the sanitizer-stripped / not-yet-loaded failure modes.
 *
 * One prop (`record`), no events, no host API calls, no network access.
 * The only public surface is the read-only `answerRecord` getter.
 */
export class WippyFormAnswersElement extends WippyElement {
  static get wippyConfig(): WippyElementConfig {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      // Nothing is ever visible, so no platform CSS is needed at all.
      hostCssKeys: [],
      inlineCss: HIDDEN_HOST_CSS,
      // This element must never receive host/app customCSS either — it has
      // nothing to style, and skipping the injection keeps it that way
      // even if a facade or page customCSS rule happened to target the tag.
      customCss: false,
    }
  }

  /**
   * Parses this element's `record` attribute (the raw JSON payload
   * written by the Session server) and returns the parsed record, or
   * `null` when the attribute is missing, empty, or not valid JSON. Text
   * content is never read — see the class doc for why the record lives
   * in an attribute instead. Never throws.
   *
   * Deliberately NOT named `record`: the Host's chat compiles message HTML
   * as a Vue template, and Vue assigns a prop on a custom element as a DOM
   * property whenever the element has one by that name (`key in el`). A
   * `record` getter swallowed the value, so the attribute was never set
   * (seen live 2026-09-30). The element must not own a `record` property.
   */
  get answerRecord(): Record<string, unknown> | null {
    return parseFormAnswersRecord(this.getAttribute('record'))
  }

  protected onMount(): void {
    // Renders nothing — no framework, no DOM to build, no slot to project
    // any (unexpected) light-DOM content into.
  }

  protected onUnmount(): void {
    // Nothing was mounted; nothing to tear down.
  }
}

export async function webComponent() {
  return WippyFormAnswersElement
}

define(import.meta.url, WippyFormAnswersElement)
