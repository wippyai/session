# @wippy-session/wippy-form

The `<wippy-form>` web component renders one Session form artifact, as a question card or a fields form, and sends the answer back to the owning session through the Host's artifact-state API. Agents never write the tag. The Session `ask_user` and `ask_user_fields` tools create it.

## What it renders

A form of choice questions only (form version 1) renders as a question card. A form with several questions shows one at a time, with a counter and a review step before sending. Each question supports per-answer notes and, when the definition allows it, an Other free-text row. After the answer is accepted, the card becomes a read-only summary. See "Question card" below.

A form with at least one standard field (`text`, `textarea`, `number`, `email`, `date`, `checkbox`), alone or mixed with choices (form version 2), renders as a fields form: one labelled control per field and a single Submit button (`ActiveForm` while open, `IdleForm` once answered, both built on `FieldShell` and `FormHeader`). A choice inside it is a plain radio group or checkbox group, with no per-option notes and no click-to-answer. See "Fields form" below.

A form that cannot be answered here shows its questions as disabled controls under a message (`FormNotice`). A definition with no fields shows an error message instead of a form.

## Props

| Prop (HTML attribute) | Type | Default | Description |
| --- | --- | --- | --- |
| `form-version` | `number` | `1` | Form definition schema version. 1 is a form of choices only and 2 is a form with at least one standard field; both render. A higher value, from this prop or from the loaded state's `form_version`, disables the form and shows a "needs a newer version of the app" notice. So does a field whose `type` this version does not know, so a question is never silently dropped. |
| `definition` | `object` | `null` | The questions: `title`, optional `description`, and `fields`. A field is `{ id, type, label, description?, required }` plus the keys of its type. A `choice` adds `options: [{value, label, description?}]`, `multiple` and `allow_other`, and "Fields form" lists the keys of the standard types. Optional `submit_label` is the fields form's Submit button text (the card does not show it), and optional `answered_message` is accepted and not shown. |
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

A choice field's answer is one of three shapes, or an array of them for a multiple-choice field. They match the state API of the Session module.

- A plain option value: `"backfill"`.
- A chosen option with a note: `{ "value": "backfill", "note": "Regenerate the lockfile too." }`. A note that trims to blank sends the plain value.
- A free-text own answer: `{ "other": "Hold the release." }`.

Notes are limited to 1,000 Unicode code points and Other text to 2,000. The types are in `src/lib/definition.ts` and the limits in `src/lib/answers.ts`.

A standard field's answer is one JSON scalar. The key is left out when an optional field is not answered:

| Type | Answer sent | Notes |
| --- | --- | --- |
| `text`, `textarea` | string, exactly as typed | Inner and outer whitespace kept. A whitespace-only value is unanswered. Line breaks are LF |
| `email` | string, trimmed | Case kept |
| `number` | JSON number | Never a numeric string. A whole value is sent as an integer (`3.0` becomes `3`) |
| `date` | `"YYYY-MM-DD"` string | No timezone, not trimmed |
| `checkbox` | `true` or `false` | Always explicit: an optional box left unchecked sends `false` |

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
| `--wippy-form-text-muted-on-row` | `var(--p-text-hover-muted-color)` | Muted text on an answer row (option descriptions, notes, number keys, review numbers and questions). Darker than `--wippy-form-text-muted` because the rows are darker than the card: 4.5:1 or more on a row, resting or hovered, in the light and dark theme |
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

When the Host has no artifact-state API, the component shows the questions as disabled controls under a notice. The notice says the form was answered, when the `state` prop is `idle`, or that a newer Web Host is needed. Both point to the chat for an answer already sent.

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
- The polite region is emptied when a send starts, so it does not repeat the step that was sent from. The previous send's field and form-level errors are cleared at the same moment, as its banner is, so only the new send's outcome shows.
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

---

## Fields form

The renderer for a form that has at least one standard field (form version 2). Every field of the definition is one labelled control, in definition order, followed by one Submit button. It is built from `src/app/active-form.vue` (open), `src/app/idle-form.vue` (answered), `src/app/form-header.vue` (the title and description they share with `src/app/form-notice.vue`), `src/app/fields/*` (the fields) and `src/lib/answers.ts` with `src/lib/scalar-answers.ts` (the checks before sending). It follows the same styling contract as the question card: `--wippy-form-*` tokens, `part` names with `<part>-<state>` state parts and matching `w-form__` classes, host attributes.

A form with only choices never reaches it (that is the question card). A form that mixes choices with standard fields renders its choices here as a radio group (one answer) or a checkbox group (several), without per-option notes.

### Fields

| Type | Control | What it adds | Draft held while editing |
| --- | --- | --- | --- |
| `text` | PrimeVue `InputText` | `type="text"`, `placeholder` | The typed text |
| `email` | `InputText` | `type="email"`, `inputmode="email"`, `autocomplete="off"` (an agent may ask for someone else's address, so the browser must not offer the user's own); no `placeholder` | The typed text |
| `number` | `InputText` | `type="text"`, `autocomplete="off"`, and an on-screen keyboard chosen by what can be typed (see "Number keyboard" below); not `InputNumber` (it clamps to min/max, rounds extra digits and strips the locale's group character); no `placeholder` | The typed text, judged by a strict parser: dot decimal, optional minus, no separators or exponent |
| `textarea` | `Textarea` (auto-resize, three rows) | `placeholder`; Enter adds a line and never submits | The typed text with its line breaks |
| `date` | `DatePicker`, `updateModelType="string"`, `dateFormat="yy-mm-dd"` | A calendar from its button, and on a touch screen also by tapping the box (not on focus); `min`/`max` grey out days; typing allowed | The text in the box, as typed. A date the picker reads from loose text (`2026-6-5`) is held as the full date (`2026-06-05`), and the box shows that once it is left. A year below 1000 is kept with four digits (`0999-05-15`) and a typed year below 100 is reported as typed (`0050-03-04`, which PrimeVue alone would read as 1950) |
| `checkbox` | `Checkbox` (binary) | The label is clickable | An explicit boolean |

`placeholder` belongs to `text` and `textarea` only (the server refuses it on any other type, and the other controls ignore it).

A definition `default` prefills the control; clearing an optional prefilled value sends nothing for that field. A checkbox starts unchecked (its only possible default is `false`).

### Number keyboard

A phone shows the on-screen keyboard its `inputmode` asks for, and the two digit keypads cannot type everything the parser accepts: `numeric` has no minus key and no separator, `decimal` has no minus key on iOS and shows the locale's own separator (a comma in many locales, which the dot-only parser rejects). So the field asks for a digit keypad only where it cannot lock the user out:

| Field | `inputmode` |
| --- | --- |
| `integer: true` with `min` of 0 or more | `numeric` |
| Not `integer`, `min` of 0 or more, and the browser's locale writes decimals with a dot (`Intl.NumberFormat(undefined)`) | `decimal` |
| Anything else (no `min`, a negative `min`, or a fraction in a comma-decimal locale) | `text`, the full keyboard |

Whatever the keyboard, the parser takes only a dot for decimals, and its message is "Enter a number, using a dot for decimals (for example 12 or -3.5)."

### Client-side checks

A convenience mirror of the server's rules, run on submit so an obvious mistake is named before a round trip. The Session state API stays the authority, and its 422 errors show on the same fields. Codes are the server's; messages never echo the value. `test/forms/fixtures/v2_conformance.json` is run through both implementations (`src/lib/conformance.test.ts` here).

| Type | Checks (code) |
| --- | --- |
| all | Required: no non-whitespace content, no number, an unchecked checkbox (`required`) |
| `text`, `textarea` | Control characters, tab and line feed allowed in a textarea only (`invalid_text`); `min_length` (`too_short`); `max_length`, default 500 for text and 8,000 for a textarea, never above 2,000 and 8,000 (`too_long`), counted in code points. A text field's `pattern` is not checked here (see "Pattern" below) |
| `email` | ASCII address, one `@`, dot-atom local part up to 64, DNS-label domain with a dot, 254 in all (`invalid_email`) |
| `number` | Strict text (`invalid_number`); at most 1e12 in absolute value (`invalid_number`); `integer` (`not_integer`); `min`, `max` (`below_min`, `above_max`); `step` from `min`, else from 0, with exact decimal arithmetic and no tolerance (`not_on_step`) |
| `date` | A real calendar day written `YYYY-MM-DD`, years 0001 to 9999, not trimmed (`invalid_date`); `min`, `max` inclusive (`below_min`, `above_max`) |

### Pattern: checked on submit by the server, never in the browser

A `text` field may carry a `pattern` (a full-match expression). The component does not evaluate it. The pattern is written by the agent, and a browser regular-expression engine backtracks: an overlapping repeat such as `(a|a)*b` or `a*a*a*a*b` against a 2,000-character answer can freeze the user's tab, and the accepted pattern subset does not rule those out. The server checks the pattern with a linear-time engine (RE2), so it is the only place the pattern runs. A value that does not match is sent like any other, and the server answers `422` with `pattern_mismatch` under that field's id. The form shows it exactly like a client error: the message under the field, linked to the real input by `aria-describedby`, the field marked invalid (`aria-invalid`, the `field-invalid` part), focus on the first invalid field, and what the user typed kept in the box. Any other per-field code in a `422` is shown the same way, and `form_errors` appear under the fields. The only cost is one round trip for a pattern mistake, which the server's message names. `src/lib/scalar-answers.ts` builds no regular expression from a definition, and `src/lib/scalar-answers.test.ts` fails if that changes.

### Tokens

All the shared tokens of the question card apply to the root (`--wippy-form-font`, `-font-size`, `-small-size`, `-question-size`, `-question-weight` for the title, `-surface`, `-border`, `-radius`, `-padding`, `-text`, `-text-muted`, `-focus`). Three tokens are new:

| Token | Default (as coded) | Used for |
| --- | --- | --- |
| `--wippy-form-field-gap` | 16px | Space between fields, and between the form's header, fields, errors and button |
| `--wippy-form-label-weight` | `500` | Field label weight |
| `--wippy-form-date-width` | `20rem` | Width of the date control, which is full width only when the form is narrower than that. The theme opens the calendar at least as wide as the control, so the calendar follows this width; set it larger to get a wider box and calendar |

The inputs themselves are PrimeVue controls, so their surface, border and focus styling is the theme's (there are no input tokens, and no `.p-*` override).

### Parts and classes

Same convention as the question card: a state adds a part `<part>-<state>` and a class `w-form__<part>--<state>`.

| Part | States | What it is |
| --- | --- | --- |
| `card`, `fields` | `answered` (the answered view), `unsupported` (a notice) on `card` | The whole form; the same element carries both parts and the `w-form` class |
| `fields-title` | | Form title |
| `form-description` | | The form's own description (shared with the card) |
| `notice` | | "Asked earlier" and offline lines (shared with the card) |
| `fields-error` | | Form-level errors from a 422 (also spoken in the status region, see "Accessibility and keyboard") |
| `field` | `required`, `invalid`, `readonly`, `disabled`, `group`, `inline` | One field. `group` is a choice (fieldset), `inline` is a checkbox |
| `field-label` | | The label (or the legend of a choice) |
| `field-marker` | | The "(required)" text, shown on an editable required field |
| `field-description` | | The field's own description |
| `field-control` | | Wrapper around the control |
| `field-input` | `date` (on the date picker) | The PrimeVue control: the input, the textarea, the checkbox, the date picker. The `date` state is what `--wippy-form-date-width` bounds |
| `field-calendar` | | The date picker's calendar panel (class `w-form__field-calendar`). It opens in the theme plugin's overlay layer, not inside the form, so it is never clipped by the message around a short form; it carries the form's `w-theme-dark` or `w-theme-light` class, so it follows the theme. Its width follows the date control (see `--wippy-form-date-width`); no rule in this package overrides it |
| `field-error` | | The error list; linked to the control by `aria-describedby` |
| `field-value` | `empty` | The stored answer in the read-only view ("Skipped" when empty) |
| `field-note` | | The note on a chosen option in the read-only view |
| `field-options` | | A choice's group of rows |
| `field-option` | `other` | One radio or checkbox row |
| `field-option-input`, `field-option-label`, `field-option-description` | | Pieces of a row |
| `field-other`, `field-other-input` | | The Other row's label and text box |
| `status` | | Delivery and answered-time lines in the read-only view (shared with the card) |
| `send` | | The Submit button (shared with the card) |

### Host attributes

`card-state` is reflected as for the card: `loading`, `active`, `answered`, `unsupported`. A fields form never reports `review` and has no `collapsed`.

### Accessibility and keyboard

- Every control has a label whose `for` points at the real input. The description and the error list are linked by `aria-describedby` on that input (for a checkbox or a date picker, whose wrapper would otherwise take the attribute, through the PrimeVue pass-through). A choice is a `fieldset` with a `legend`, described as a whole, and every radio or checkbox in it, and the Other text box, carries the same `aria-describedby` (the field description and the error list, so a screen reader that lands on one input reads the blank-Other message) and `aria-invalid` while the group is in error (a `group` role may not carry `aria-invalid`, so it sits on the inputs). A single choice adds a `radiogroup` role with `aria-required` around its radios; a multiple choice adds no role and no `aria-required`, because its fieldset already is the group and `aria-required` is not allowed on that role (the "(required)" text in the legend says it). `aria-invalid` and `aria-required` follow the state.
- The form is `novalidate`, so the browser's own bubble never replaces the form's error flow. A failed submit names each field, focuses the first invalid control, and announces "N questions need attention." in one polite status region. Only fields in error count as questions: a form-level error from a 422 is spoken as its own text after the count ("2 questions need attention. This form changed since you loaded it."), or alone when no field is in error. As the user fixes questions the text in that region is updated, once per fixed question and not once per key, and emptied when nothing is left. Errors carry no `role="alert"` of their own, and neither does the submit-failure message (a PrimeVue `Message`, which is `role="alert"` and `aria-live="assertive"` by default). Its role and live attributes are removed through the pass-through, so its text is shown with its Retry button and announced once, by the status region. Starting a send clears the previous server errors, as it does the banner.
- Required is text ("(required)"), never colour alone. A read-only answer is plain selectable text.
- Enter in a single-line field submits the form; Enter in a textarea adds a line; Space toggles a checkbox.
- Date: type `YYYY-MM-DD` one key at a time, press the calendar button or ArrowDown to open the calendar, Escape closes it. The box always shows what the user typed, including after an error appears and after the box is left. Text the picker cannot parse is never dropped or replaced by the last good date: it stays in the box and is named on submit (`invalid_date`, or `below_min` / `above_max` for a well-formed date out of range). The calendar opens in the theme plugin's overlay layer inside the component's shadow root. On a touch screen PrimeVue sets `inputmode="none"` on the box (no keyboard), and the field does not open on focus, so a tap on the box opens the calendar when the primary pointer is coarse (`matchMedia('(pointer: coarse)')`, read at the tap) and the field is enabled; a click with a mouse and focus from a keyboard do not open it. Typing with an input method (IME composition) works: the box is written only with what the user typed. A state reload that hands over the same field leaves an open calendar on the month the user navigated to (`min` and `max` become a new `Date` only when their text changes).
- Date focus: when the calendar closes with focus still inside it (a day picked from the keyboard, or Escape), focus goes to the date box, also when PrimeVue's own delayed re-focus of its day cells has moved it into the calendar after the pick. Focus the user has already moved elsewhere (a click outside, Tab) is left where it is.
- How the date box keeps the typed text. PrimeVue's `DatePicker` box is uncontrolled: it follows only the last date the picker accepted, and Vue writes that date over the box on every re-render of the box (an error appearing, the form changing, a submit disabling the control), which would erase each key as it is typed. The field owns the box text and hands it to the box as its `value` through the picker's pass-through, so every render writes exactly what was typed (Vue skips a write that changes nothing, so the caret stays). The one thing PrimeVue still does on its own is reset the box to the last accepted date when it loses focus; the typed text is put back after that.

### Known gaps

- The error text and the "(required)" marker take `ERROR_TEXT_CLASS` from `src/lib/error-text.ts`, the theme's severity utilities the question card uses, and not `--wippy-form-danger`. The submit-failure message takes `ERROR_TEXT_CLASS`, or `WARN_TEXT_CLASS` when it can be retried, through `FormMessage`, as on the card.
- The unchecked checkbox and input edge contrast is the theme's, left to a theme-level fix. There is no local `.p-*` override.
- A `pattern` mistake is only reported after submit (by the server), not as the user types; see "Pattern" above.
- The calendar's day cells have no accessible name beyond the day number (PrimeVue's default); the panel itself is a dialog labelled "Choose Date". Not changed here.
- The calendar takes the form's theme from the theme plugin: its overlay layer follows the theme class of the calendar's trigger. `appendTo="self"` would put the calendar inside the themed container, but the message bubble around a form clips it (a one-question form shows about a quarter of the calendar), and `@wippy-fe/theme` documents it as the wrong setting. This is temporary: from Host 1.0.61 / `@wippy-fe/theme` 0.0.61 the plugin's layer follows the theme class of the overlay's trigger. When this package's theme dependency moves to 0.0.61 or later, the composable, its test file and its call in `date-field.vue` (with the calendar theme-class tests) are deleted.
- The theme (and PrimeVue's own alignment of an overlay) opens the calendar at least as wide as the date control. The date control is bounded to `--wippy-form-date-width` (20rem), so the calendar follows that width on its own. There is no override of the calendar and no `!important` in `styles.css` for it (`styles.test.ts` checks both).
- The calendar cannot show a year below 100: PrimeVue reads one as a two-digit year, so the calendar opens on 19xx or 20xx for such a date. The box and the saved answer keep the year as typed.
- In the Dark theme the textarea is darker than the single-line inputs. Both are the same PrimeVue components this form uses for the other fields; the difference is in the theme's own styles (`@wippy-fe/theme/primevue/textarea.css` uses `dark:bg-surface-950`, `inputtext.css` uses `dark:bg-surface-800`), so it is a theme-level change, not something to override here.
