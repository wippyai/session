# @wippy-session/wippy-form

The `<wippy-form>` web component renders one Session `ask_user` form artifact as a question card and sends the answer back to the owning session through the Host's artifact-state API. Agents never write the tag. The Session `ask_user` tool creates it.

## What it renders

A question card. A form with several questions shows one at a time, with a counter and a review step before sending. Each question supports per-answer notes and, when the definition allows it, an Other free-text row. After the answer is accepted, the card becomes a read-only summary. A definition with no fields shows an error message instead of a card.

## Props

| Prop (HTML attribute) | Type | Default | Description |
| --- | --- | --- | --- |
| `form-version` | `number` | `1` | Form definition schema version. A value other than 1, from this prop or from the loaded state's `form_version`, disables the card and shows a "needs a newer version of the app" notice. |
| `definition` | `object` | `null` | The questions: `title`, optional `description`, and `fields`, each `{ id, type: "choice", label, description?, required, options: [{value, label, description?}], multiple, allow_other }`. Optional `submit_label` and `answered_message` are accepted and not shown. |
| `state` | `string` | `"active"` | The lifecycle mirrored from the artifact: `"active"` while the form can be answered, `"idle"` once it was answered. A change of this prop reloads the form state from the Host. |

## Events

The base element dispatches these events. They bubble and cross the shadow boundary. The component adds no events of its own.

| Event | Payload | When |
| --- | --- | --- |
| `load` | none | The component finished mounting. |
| `unload` | none | The element was removed from the page. |
| `error` | `{ message, error }` | Mounting failed. |
| `invalid` | `{ message }` | A prop failed validation. |

## Answer shapes

A field's answer is one of three shapes, or an array of them for a multiple-choice field. They match the state API of the Session module.

- A plain option value: `"backfill"`.
- A chosen option with a note: `{ "value": "backfill", "note": "Regenerate the lockfile too." }`. A note that trims to blank sends the plain value.
- A free-text own answer: `{ "other": "Hold the release." }`.

Notes are limited to 1,000 Unicode code points and Other text to 2,000. The types are in `src/lib/definition.ts` and the limits in `src/lib/answers.ts`.

## Styling API

The card is styled through the tokens, parts, classes and host attributes below. Every value is a `--wippy-form-*` token with a semantic `--p-*` theme variable as its fallback, so a facade retint or a dark-mode flip restyles the card without edits here. A literal hex value is only a fallback for development without a theme.

### Tokens

Set a token on `wippy-form` or on any ancestor.

| Token | Default | Used for |
| --- | --- | --- |
| `--wippy-form-font` | `inherit` | Font family |
| `--wippy-form-font-size` | 14px | Answer labels and inputs |
| `--wippy-form-question-size` | 15px | Question text |
| `--wippy-form-question-weight` | `600` | Question text weight |
| `--wippy-form-small-size` | `13px` | Descriptions, notes, hints, status |
| `--wippy-form-surface` | `var(--p-content-background)` | Card background |
| `--wippy-form-border` | `transparent` | Card and counter pill edges |
| `--wippy-form-text` | `var(--p-text-color)` | Main text |
| `--wippy-form-text-muted` | `var(--p-text-muted-color)` | Descriptions, hints, icons |
| `--wippy-form-row` | `color-mix(in srgb, var(--p-content-hover-background) 40%, var(--p-content-border-color))` | Answer row background |
| `--wippy-form-row-hover` | `color-mix(in srgb, var(--p-content-border-color) 90%, var(--p-text-color))` | Answer row under the pointer |
| `--wippy-form-accent` | `var(--p-primary-color)` | Selection, counter, key badges, active note toggle, focus ring |
| `--wippy-form-accent-soft` | `var(--p-highlight-background)` | Selected row background |
| `--wippy-form-accent-contrast` | `var(--p-primary-contrast-color)` | Text and icons on the accent |
| `--wippy-form-danger` | `var(--p-danger-500, #b91c1c)` | Border of a review row whose required answer is missing |
| `--wippy-form-focus` | the accent | Focus ring |
| `--wippy-form-key-border` | `color-mix(in srgb, var(--p-text-muted-color) 55%, var(--p-content-border-color))` | Number key badges |
| `--wippy-form-code-bg` | `color-mix(in srgb, var(--p-text-color) 8%, transparent)` | Inline code |
| `--wippy-form-radius` | `12px` | Card corners |
| `--wippy-form-row-radius` | `8px` | Answer rows and inputs |
| `--wippy-form-padding` | `10px` | Card padding, the same on all four sides |
| `--wippy-form-row-padding-y` | `6px` | Row padding, top and bottom |
| `--wippy-form-row-padding-x` | `10px` | Row padding, left and right |
| `--wippy-form-gap` | `4px` | Space between rows |
| `--wippy-form-key-size` | `20px` | Number key badge size |

The card background is the theme content background (white in the light theme, the near-black content surface in the dark theme), so the answer rows stand out from it. Set `--wippy-form-surface` to `transparent` to show the surface behind the card.

Error and warning text takes the theme's severity utilities, not a token, so `--wippy-form-danger` only colours a border.

### Parts and classes

Each part has the class `w-form__<part>`. A state adds the part `<part>-<state>` and the class `w-form__<part>--<state>`, because `::part()` cannot take attribute selectors. The card root also has the class `w-form`.

| Part | States | What it is |
| --- | --- | --- |
| `card` | `answered` | The card. The summary carries `answered` |
| `title` | | The form title with an icon, on the active card and on the summary |
| `form-description` | | The form's own description, under the title |
| `header` | `single` | The counter, question and actions line |
| `nav`, `prev`, `counter`, `next` | | The `‹ n/total ›` pill and its buttons |
| `question` | | Question text |
| `actions`, `collapse` | | The collapse button |
| `notice` | | The "Asked earlier" line |
| `description` | | The question's own description, above the hint |
| `hint` | | "Choose any that apply.", "Optional." |
| `options` | | The list of answers |
| `option` | `selected`, `has-note`, `editing`, `other` | One answer row |
| `option-main` | | The clickable label and description, with `role="radio"` or `"checkbox"` |
| `option-mark` | | The tick box for several answers (a PrimeVue `Checkbox`), or the check on a chosen single answer |
| `option-label`, `option-description` | | Answer text |
| `option-note` | | A saved note under an answer |
| `note-toggle` | `has-note`, `editing` | The note icon button |
| `option-key` | | The number key badge, on the first 9 rows |
| `composer` | `note`, `other` | The joined input with its send button |
| `note-input`, `note-send` | | The note text box and its button |
| `other-input`, `other-send` | | The own-answer text box and its button |
| `send` | | Send button for several answers when there is no Other row |
| `review`, `review-item`, `review-edit` | `missing` on `review-item` | The review list and its rows |
| `review-number`, `review-question`, `review-answer` | | The pieces of a review row |
| `footer`, `footer-text`, `send-all` | | The review footer, its missing-answers text, and "Send answers" |
| `summary`, `summary-item`, `summary-question`, `summary-answer` | | The read-only summary |
| `answer-item`, `answer-note`, `answer-own`, `answer-empty` | | One answer, its note, "Own answer:", and "Skipped", shared by the review and the summary |
| `error`, `keys`, `status` | | The error line, the keyboard hint, and the delivery status with the answered time. After a send, `status` takes focus by script and shows the theme focus ring around its text |
| `code` | | Inline code from backticks |

### Host attributes

The component reflects these onto the `wippy-form` element, for styling only.

| Attribute | Values | Notes |
| --- | --- | --- |
| `card-state` | `loading`, `active`, `review`, `answered`, `unsupported` | Named `card-state` because `state` is an observed prop. `unsupported` outranks the others and covers an unrecognized form version and a Host without the artifact-state API. `loading` lasts until the first GET resolves |
| `collapsed` | present or absent | Present while the active card is collapsed |

When the Host has no artifact-state API, the component shows the questions with their options disabled under a notice. The notice says the form was answered, when the `state` prop is `idle`, or that a newer Web Host is needed. Both point to the chat for an answer already sent.

### Keyboard

| Keys | Where | What happens |
| --- | --- | --- |
| 1 to 9 | In the card, outside inputs | One answer: answers at once. Several answers: ticks. The number of Other focuses its box. Only the first 9 rows, options then Other, get a number. |
| Shift+1 to 9, or N on a focused row | Outside inputs | Opens the note of that answer |
| Enter | In Other or a note | Sends. In a note on a several-answer question, saves the note and ticks the answer |
| Shift+Enter | In Other or a note | New line |
| Escape | In Other or a note | Leaves the box. The note draft is kept and shows under the row |
| Enter or Space | On an answer row | Same as a click. Enter on several answers sends the ticked set, or shows an error when nothing is ticked and Other is empty |
| ↑ and ↓ | On answers | Move between answer rows and the Other box |
| ← and → | On answers, with several questions | Previous and next question |
| Tab | A single-answer question | The rows are one Tab stop with a roving `tabindex`. Tab lands on the chosen row, or the first. Several-answer rows are separate Tab stops |

Keys only work while focus is inside the card, so typing in the chat box never picks an answer.

### Errors and assistive technology

- Each error is announced once, by its own `role="alert"` element: the question's error, the card-wide notice for a form-level error, and the submit failure banner. The polite region speaks only question changes, "Ticked" and "Note saved".
- While an error is on screen, every answer row, the Other box, an open note box and the send buttons list it in `aria-describedby`, so the control that has focus reads it.
- `aria-invalid` is set only where ARIA supports it and the input is at fault: a several-answer row, the Other box, and a note box. A single-answer question sets it on its `radiogroup`. A failed send or a form-level error describes the controls without marking them invalid.
- Sending a single-answer note closes the editor, so focus returns to the row that owns the note. With several questions, focus moves to the next question.
- "Send answers" and "Send" stay focusable while a send is in flight. They are `aria-disabled` and carry the theme's `p-disabled` marker instead of the `disabled` attribute, which would hand focus to `<body>`, and they ignore activation. They are real disabled buttons while a required answer is missing or nothing is ticked.
- When a failed send has left no focus, it goes to "Send answers" on the review, or otherwise to the chosen or first answer. Focus on another control of the page is left alone.
- The polite region is emptied when a send starts, so it does not repeat the step that was sent from.
- Error and warning text uses two constants in `src/lib/error-text.ts`, `ERROR_TEXT_CLASS` and `WARN_TEXT_CLASS`, which are at least 4.5:1 in both themes. A retryable failure banner is a warning.

Tests: `question-card-errors.test.ts`, `question-card-send-focus.test.ts`, `use-question-card.test.ts`, `message-text.test.ts` and `error-text.test.ts`.

### Example

```css
wippy-form {
  --wippy-form-accent: #0f766e;
  --wippy-form-accent-soft: #d6f1ed;
  --wippy-form-radius: 4px;
  --wippy-form-row-radius: 2px;
  --wippy-form-font: Georgia, 'Times New Roman', serif;
}
wippy-form::part(option-key) {
  border-radius: 50%;
}
wippy-form::part(option-selected) {
  box-shadow: inset 3px 0 0 var(--wippy-form-accent);
}
```

### Known gaps

- The send buttons and the composer send buttons are PrimeVue defaults. They follow the theme's primary colour and not `--wippy-form-accent`, because a `.p-button` override would shadow the theme.
- The note and Other textareas use the theme's `.p-textarea` colours, and no token exists for them. Their only local rule is `flex: 1 1 auto; min-width: 0` in `src/styles.css`, because the theme's input group rule does not grow a bare `Textarea`.
