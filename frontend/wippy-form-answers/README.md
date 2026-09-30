# @wippy-session/wippy-form-answers

A Wippy `view.component` web component (`<wippy-form-answers>`) that makes a form's raw JSON answer record invisible in chat while keeping it reachable to an agent reading the raw message text.

## Why this exists

When a user answers a Session form (see the sibling `@wippy-session/wippy-form` package), the Session server writes the user's chat message as a human sentence followed by a machine-readable record carried in this tag's `record` attribute:

```
Answered questions about the delivery of your order.

<wippy-form-answers record='{"form_id":"…","form_version":1,"title":"Order details","late":false,"answers":{"delivery":{"question":"How should the parcel be delivered?","answer":{"value":"courier","label":"Courier","note":"Buzzer 12"}},"when":{"question":"When works best?","answer":null}}}'>
</wippy-form-answers>
```

The JSON is always a single line. The Session server escapes `'`, `<`, `>`, and `&` inside it (as the equivalent HTML entities) so the attribute value is exactly valid JSON once the HTML parser decodes it back — `element.getAttribute('record')` returns the decoded string directly; no extra unescaping is needed in this package's code.

The chat renders user messages as Markdown (`markdown-it`, `html: true`) then `sanitize-html`. The Wippy Web Host auto-loads every `view.component` registry entry with `auto_register: true` at boot and allows its tag (plus its declared prop attribute names) through the chat sanitizer — so `<wippy-form-answers>` and its `record` attribute survive sanitization instead of being stripped.

The answered-form card already shown above the message is the human-readable summary. This element's only job is to keep the JSON out of the user's sight while leaving it reachable in the raw message text, so an agent reading the conversation history on a later turn can still see exactly what was answered.

## Why an attribute, not text content

The record is carried in the `record` attribute — never in the element's text content or children. Two observed failure modes both leave the tag on the page with no children:

- **The chat sanitizer strips the tag.** If the Host's components list (which the sanitizer's allow-list is built from) hasn't picked up `wippy-form-answers` yet — for example right after a fresh deploy, before the Host has re-fetched it — the whole tag gets removed from the sanitized HTML. An unrecognized tag with no children renders nothing either way; one with visible text content would have shown the raw JSON to the user for that entire window.
- **The component's script hasn't loaded yet, or fails to load.** Until `customElements.define('wippy-form-answers', …)` runs, the browser treats `<wippy-form-answers>` as an anonymous, unstyled `HTMLElement` — which still renders its children by default. Text content would render as plain visible text; an element with no children (because the record lives in an attribute) renders nothing.

`record` is declared as a `wippy.props` entry specifically so the Host adds `record` to the sanitizer's allowed attribute list for this tag — without that declaration, the attribute itself would still be stripped even once the tag is allowed through.

The no-`<slot>` shadow root and `:host { display: none; }` (below) are defense in depth for the case where the element mounts normally — they are not what prevents the leak in the two failure modes above; the attribute-vs-text-content choice is.

## What it renders

Nothing. There is no framework, no template, and no `<slot>` anywhere in this component's own implementation, so even stray light-DOM content would never project into its shadow root. `:host { display: none; }` hides the element outright as a second, independent guarantee. This component's own code (`src/`) makes no host API calls and opens no network requests — it never calls `api`, `ws`, or `instance` itself. Its base class, `WippyElement` (`@wippy-fe/webcomponent-core`), does subscribe to the Host's `@theme` broadcast on connect (via the proxy's `on()`) so every component gets consistent light/dark handling; that subscription has no visible effect here since the element renders nothing, but it is a real host API call made on this element's behalf, not "none at all".

**A note on the `vue` dependency in package.json:** this component's own code (`src/`) contains no Vue import, no `WippyVueElement`, and no `vueConfig` — it extends the framework-agnostic `WippyElement` from `@wippy-fe/webcomponent-core`, not `WippyVueElement`. `vue` still appears in `peerDependencies` and as a `vite.config.ts` build external, though, because `@wippy-fe/webcomponent-core` itself imports `@iconify/vue`, which imports `vue` — bundling that transitive import into this component's output would ship Vue's unreplaced `process.env.NODE_ENV` checks and fail at load time in the browser (`process is not defined`) instead of being resolved from the Host's shared import map, as it is for every other component. `@iconify/vue` itself is only a `devDependency` here (a build-time external, not a `peerDependencies` entry — this component never imports it directly, so it declares no runtime expectation on it). So: no Vue *usage* in this package, but a real, necessary Vue *dependency declaration* for correct module resolution.

## Props

| Prop (HTML attribute) | Type | Default | Description |
| --- | --- | --- | --- |
| `record` | `string` | `""` | The self-contained JSON answer record (`form_id`, `form_version`, `title`, `late`, `answers`) as a single-line string, written by the Session server. Agents never write this attribute themselves. |

## Public API

| Member | Type | Behavior |
| --- | --- | --- |
| `answerRecord` | `Record<string, unknown> \| null` (read-only getter) | Parses the `record` attribute as JSON and returns the parsed object. Returns `null` when the attribute is missing, empty, or invalid JSON, or JSON that isn't a plain object (array, string, number, boolean, `null`). Text content is never read. Never throws. |

The getter is deliberately not called `record`. The Host's chat compiles message HTML as a Vue template, and Vue assigns a prop on a custom element as a DOM property whenever the element has a property of that name. A read-only `record` getter swallowed the value, so the attribute was never set. The element must never own a `record` property; a unit test guards this.

The parsing logic lives in `src/lib/parse-record.ts` (`parseFormAnswersRecord`) so it is unit-testable independent of the custom element; the getter itself (`src/index.ts`) is a one-line call to `parseFormAnswersRecord(this.getAttribute('record'))`.

## For agents

**Agents must never emit this tag themselves.** It is written exclusively by the Session server's message-composition code as part of the fixed "Answered questions about …" reply format. An agent that includes `<wippy-form-answers>` in its own generated message content is misusing it — the tag carries no meaning outside that exact server-written wire format, and the Session server is the only writer that keeps the JSON payload consistent with the answered-form card rendered alongside it.

---

## Styling API

This control has no visible surface, so it has none of the four public styling surfaces the Session Forms styling contract defines for the sibling `wippy-form` question card:

**Tokens used:** none. **New tokens:** none — there is nothing to color, size, or space.

| Part | States | What it is |
| --- | --- | --- |
| _(none)_ | | The element has no shadow-DOM content to expose a `part` on. |

| Host attribute | Values | Notes |
| --- | --- | --- |
| _(none)_ | | No state is reflected — there is nothing for a stylesheet to react to. (`record` is a data-carrying prop, not a styling hook.) |

| Keys | Where | What happens |
| --- | --- | --- |
| _(none)_ | | The element is never visible, so it never receives focus or keyboard input. |

**Why:** the element renders nothing by design — hiding the answer-record JSON from the user is its entire purpose, not an incomplete styling pass. Exposing parts, tokens, classes, or host attributes would invite restyling an element that must stay invisible under every theme, so none exist. If a future requirement needs this data to be visible in some context, that belongs in a new, separate presentational component — not in a styling override of this one.
