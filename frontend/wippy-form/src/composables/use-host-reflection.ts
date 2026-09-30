import type { Ref } from 'vue'
import { inject, watchEffect } from 'vue'
import { ELEMENT_PROVIDER } from '../element-context'

export type HostState = 'active' | 'review' | 'answered' | 'unsupported'

/**
 * Reflects the question-card's `card-state`/`collapsed` host attributes onto
 * the raw custom element (`<wippy-form>` itself), per the styling contract
 * (`.local/work/session-forms/design/2026-09-30-styling-contract.md`):
 * `wippy-form[card-state="review"]`, `wippy-form[collapsed]`. `density` is
 * NOT written here — it is read-only input from the host app, matched
 * purely via the `:host([density="comfortable"])` selector in the
 * component's own CSS (no JS needed to "read" it).
 *
 * Reflected as `card-state`, NOT `state` — the observed `state` PROP
 * (`"active" | "idle"`, package-tag lifecycle mirrored from the artifact;
 * see `types.ts`/`constants.ts`) is a distinct, same-named attribute. On a
 * custom element, a prop's attribute and any attribute written by
 * `setAttribute()` are the exact same DOM slot: writing `state` here was
 * indistinguishable, from the Host's/webcomponent-vue's point of view, from
 * the Host itself changing the `state` prop — which `wippy-form.vue`/
 * `use-form-state.ts` treat as a trigger to reload canonical state from the
 * Host. That meant every move into/out of review (or a collapse toggle)
 * fired a needless reload, an idle (already-answered) form's summary
 * reloaded on every state-part change, and the Host's own next write to its
 * `state` prop could stomp this reflection's value right back. `card-state`
 * shares no name with any declared prop, so it cannot collide the same way;
 * `collapsed` is checked against the same risk and currently declares no
 * prop of that name either.
 *
 * Uses the same `ELEMENT_PROVIDER` injection `use-artifact-id`
 * (`element-context.ts`) already relies on for `data-wippy-artifact-id`,
 * since `@wippy-fe/webcomponent-vue`'s own provider set does not expose the
 * host element itself.
 */
export function useHostReflection(state: Ref<HostState>, collapsed: Ref<boolean>): void {
  const element = inject(ELEMENT_PROVIDER)
  if (!element)
    return
  watchEffect(() => {
    element.setAttribute('card-state', state.value)
    element.toggleAttribute('collapsed', collapsed.value)
  })
}
