# @wippy-session/wippy-form-answers

The `<wippy-form-answers>` web component carries the JSON answer record of a Session form in a chat message, invisibly, so the agent can read it later in the raw message text.

## Why it exists

When a user answers a form (see `@wippy-session/wippy-form`), the Session server writes the user's chat message as a sentence followed by this tag:

```
Answered questions about the delivery of your order.

<wippy-form-answers record='{"form_id":"…","form_version":1,"title":"Order details","late":false,"answers":{"delivery":{"question":"How should the parcel be delivered?","answer":{"value":"courier","label":"Courier","note":"Buzzer 12"}},"when":{"question":"When works best?","answer":null}}}'>
</wippy-form-answers>
```

The JSON is one line. The server escapes `'`, `<`, `>` and `&` inside it, so `element.getAttribute('record')` returns valid JSON and needs no further unescaping.

The chat renders user messages as Markdown (`markdown-it` with `html: true`) and then sanitizes them with `sanitize-html`. The Host registers every `view.component` entry with `auto_register: true` and allows its tag and its declared prop attributes through the sanitizer, so the tag and its `record` attribute survive. The user reads the answered-form card above the message. This element only keeps the JSON out of sight and in the raw message text, where the agent reads it on a later turn.

## Why an attribute

The record is in the `record` attribute and never in text content, because two cases leave the tag on the page with no children:

- The sanitizer removes the tag, for example right after a deploy, before the Host has fetched its components list. An element with no children shows nothing, while text content would show the raw JSON.
- The component script has not loaded yet, or fails to load. The browser then treats the tag as a plain element and shows its children, so text content would be visible.

`record` is declared in `wippy.props` so the Host adds the attribute to the sanitizer's allowed list. Without that, the attribute is stripped even when the tag is allowed. The shadow root has no `<slot>`, and `:host { display: none; }` hides the element when it mounts normally. Those two do not prevent the leak in the cases above. The attribute does.

## What it renders

Nothing. The element has no framework, template or slot. Its own code makes no host API calls and no network requests. Its base class, `WippyElement` from `@wippy-fe/webcomponent-core`, subscribes to the Host's `@theme` broadcast when the element connects, which has no visible effect here.

`vue` is a peer dependency and a build external because `@wippy-fe/webcomponent-core` imports `@iconify/vue`.

## Props

| Prop (HTML attribute) | Type | Default | Description |
| --- | --- | --- | --- |
| `record` | `string` | `""` | The JSON answer record (`form_id`, `form_version`, `title`, `late`, `answers`) as a single-line string, written by the Session server. Agents never write this attribute. |

## Public API

| Member | Type | Behavior |
| --- | --- | --- |
| `answerRecord` | `Record<string, unknown> \| null` (read-only getter) | Parses the `record` attribute as JSON and returns the object. Returns `null` when the attribute is missing, empty, invalid JSON, or JSON that is not a plain object. Text content is never read. It never throws. |

The getter is not named `record`. The Host's chat compiles message HTML as a Vue template, and Vue sets a prop on a custom element as a DOM property when the element has a property of that name. A `record` getter swallowed the value, so the attribute was never set. A unit test guards this.

The parsing is in `src/lib/parse-record.ts` (`parseFormAnswersRecord`), so it can be tested without the custom element.

## For agents

Agents must never write this tag. The Session server writes it in the fixed "Answered questions about …" reply, and only the server keeps the JSON consistent with the answered-form card shown beside it.

## Styling

No tokens, parts, or host attributes: the element renders nothing. A requirement to show this data belongs in a separate presentational component.
