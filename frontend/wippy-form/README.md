# @wippy-session/wippy-form

A Wippy `view.component` web component (`<wippy-form>`) that renders one Session `ask_user` form artifact and submits the answer back to the owning session over the Host's artifact-state API.

## What it renders

- **Question card** (V1): when every field in `definition.fields` has `type: "choice"` — the only field type V1 emits — the component renders a Claude-style question card. One question at a time for several-question forms, with per-answer notes, an Other free-text row, a review step, and a read-only answered summary. See the "Question card" section below for the full contract.
- **Fields form** (V2, kept for mixed/non-`choice` definitions): a plain radio/checkbox form (`ActiveForm.vue` / `IdleForm.vue` / `ChoiceField.vue`), unchanged from before the question card. Not reachable from any V1 definition today (V1 only emits `type: "choice"` fields), but stays fully supported for a future V2 definition that mixes field types.

## Props

| Prop (HTML attribute) | Type | Default | Description |
| --- | --- | --- | --- |
| `form-version` | `number` | `1` | Form definition schema version. A value other than 1, from this prop or from the loaded state's own `form_version`, disables the interactive form and shows a "needs a newer app" notice instead. |
| `definition` | `object` | `null` | Immutable form definition: `title`, optional `description`, optional `submit_label`, and `fields` (each `{ id, type: "choice", label, description?, required, options: [{value, label, description?}], multiple, allow_other }`). |
| `state` | `string` | `"active"` | Package-tag lifecycle state mirrored from the artifact: `"active"` (still answerable) or `"idle"` (already answered, shown read-only). Changing this prop triggers a reload of the canonical form state from the Host. |

## Events

| Event | Payload | When |
| --- | --- | --- |
| `answer-submitted` | `{ requestId, answerMessageId, late }` | After a submission is durably accepted (including an exact replay). |
| `load` | — | Reserved (bootstrap lifecycle). |
| `unload` | — | Reserved (bootstrap lifecycle). |
| `error` | `{ message, error }` | An unrecoverable component-level error. |
| `invalid` | `{ message }` | Invalid props/config. |

## Answer shapes

A field's answer is one of three shapes (or an array of them, for a multi-choice field), matching the Session state API:

- a plain option value: `"backfill"`
- a chosen option with a note: `{ "value": "backfill", "note": "Regenerate the lockfile too." }` — a note trimming to blank sends the plain value instead
- a free-text own answer: `{ "other": "Hold the release." }`

Notes are limited to 1,000 Unicode code points (server code `too_long`); Other text stays at the existing 2,000-code-point limit. See `src/lib/definition.ts` (`FieldAnswer`, `NotedAnswer`, `OtherAnswer`) and `src/lib/answers.ts` (`buildNotedValue`, `NOTE_TEXT_MAX`, `isNoteTextTooLong`, `answerDisplayItems`).

---

## Question card

The Claude-style question card for a `choice`-only form: one question with immediate-submit-on-click (single answer) or tick-and-send (several answers), several questions advance through a counter with a review step before sending, per-answer notes, and a read-only answered summary. Built from `src/composables/use-question-card.ts` (the interaction state machine) and `src/app/question-card/*.vue` (the view). Follows the Session Forms styling contract: every visual value is a `--wippy-form-*` token with a semantic-theme-var fallback, every restylable piece is a `part`, states are reflected as `<part>-<state>` parts and `w-form__<part>--<state>` classes, and state the styling needs is a host attribute.

**Tokens used:** all of the shared tokens below. **New tokens:** none — the question card is what the shared token list in the styling contract was written for.

### Tokens

Set on `wippy-form` or any ancestor. Defaults are read through a private `--_x` variable whose own fallback is a semantic `--p-*` theme variable (never a raw hex as the *primary* fallback) — a facade retint or a dark-mode flip restyles the card with zero edits here. Only a final, literal hex value guards host-less dev (no theme loaded at all). Compact density is the default; `density="comfortable"` raises the size/spacing internals the last column lists — an explicit token value always wins over either.

| Token | Default (as coded) | Used for |
| --- | --- | --- |
| `--wippy-form-font` | `inherit` | Font family |
| `--wippy-form-font-size` | 14px compact / 15px comfortable | Answer labels and inputs |
| `--wippy-form-question-size` | 15px compact / 17px comfortable | Question text |
| `--wippy-form-question-weight` | `600` | Question text weight |
| `--wippy-form-small-size` | `13px` | Descriptions, notes, hints, status |
| `--wippy-form-surface` | `transparent` | Card background — the Host's artifact card already draws one; see "Why the card has no background" below |
| `--wippy-form-border` | `transparent` | Card and counter-pill edges |
| `--wippy-form-text` | `var(--p-text-color)` | Main text |
| `--wippy-form-text-muted` | `var(--p-text-muted-color)` | Descriptions, hints, icons |
| `--wippy-form-row` | `color-mix(in srgb, var(--p-content-hover-background) 45%, transparent)` | Answer row background (resting) |
| `--wippy-form-row-hover` | `var(--p-content-hover-background)` | Answer row under the pointer |
| `--wippy-form-accent` | `var(--p-primary-color)` | Selection, counter, key badges, note-toggle active state, focus ring |
| `--wippy-form-accent-soft` | `var(--p-highlight-background)` | Selected row background |
| `--wippy-form-accent-contrast` | `var(--p-primary-contrast-color)` | Text/icons on the accent (selected key badge) |
| `--wippy-form-danger` | `var(--p-danger-500, #b91c1c)` | Errors, missing required answers |
| `--wippy-form-focus` | the accent | Focus ring |
| `--wippy-form-key-border` | `var(--p-content-border-color)` | Number key badges |
| `--wippy-form-code-bg` | `color-mix(in srgb, var(--p-text-color) 8%, transparent)` | Inline code (backticks) |
| `--wippy-form-radius` | `12px` | Card corners |
| `--wippy-form-row-radius` | `8px` | Answer rows, inputs |
| `--wippy-form-padding` | 12px compact / 16px comfortable | Card padding |
| `--wippy-form-row-padding-y` | 6px compact / 10px comfortable | Row padding, top/bottom |
| `--wippy-form-row-padding-x` | 10px compact / 12px comfortable | Row padding, left/right |
| `--wippy-form-gap` | 4px compact / 6px comfortable | Space between rows |
| `--wippy-form-key-size` | 20px compact / 24px comfortable | Number key badge size |

**Why the card has no background by default:** the Host already wraps this component in the artifact card's own chrome, so a second background/border here would double it up. `--wippy-form-surface`/`--wippy-form-border` default to `transparent`; set them explicitly to give the card its own visible edge when it is not hosted inside another card.

**The four action buttons (the two "Send" buttons and the two composer send buttons) are plain, unstyled-by-us PrimeVue `Button`s** — default (filled primary) severity for Send/Send answers, `text rounded` for the composer's icon-only send. Their color comes straight from the theme's `--p-primary-*`/disabled treatment, not from `--wippy-form-accent`: a `.p-button` CSS override to route them through the token would be exactly the raw-`.p-*`-selector pattern the compliance gate rejects, and an inline-style workaround was tried and reverted — see "Known gaps". Practical effect: retinting `--wippy-form-accent` alone (without also retinting the theme's primary) leaves these four buttons on the old color while rows/counter/key-badges/focus-ring follow the new one.

### Parts and classes

Each part has a matching class `w-form__<part>`. A state adds a part `<part>-<state>` and a class `w-form__<part>--<state>` (`::part()` cannot take attribute selectors). The root also carries the plain class `w-form` alongside its `card` part.

| Part | States | What it is |
| --- | --- | --- |
| `card` | `answered` | The whole card (active view has no state; the post-submit summary carries `answered`) |
| `title` | | Form title — shown on every active card (single or several questions) and on the summary's title, with a check icon |
| `form-description` | | The form's own `FormDefinition.description`, when set — shown under the title, muted, on both the active card and the summary |
| `header` | `single` | Counter, question and actions line |
| `nav`, `prev`, `counter`, `next` | | The `‹ n/total ›` pill and its buttons |
| `question` | | Question text |
| `actions`, `collapse` | | The chevron button (no decline/dismiss button — dropped by design decision) |
| `notice` | | "Asked earlier" line |
| `description` | | The field's own `description` text, when set (shown under the question, above `hint`) |
| `hint` | | "Choose any that apply.", "Optional." |
| `options` | | The list of answers |
| `option` | `selected`, `has-note`, `editing`, `other` | One answer row |
| `option-main` | | The clickable label/description (focus target, `role="radio"`/`"checkbox"`) |
| `option-mark` | | Tick box (several answers, a real PrimeVue `Checkbox`) or the check on a chosen single answer |
| `option-label`, `option-description` | | Answer text |
| `option-note` | | Saved note shown under an answer |
| `note-toggle` | `has-note`, `editing` | The note icon button |
| `option-key` | | Number key badge (first 9 rows only) |
| `composer` | `note`, `other` | Joined input with its send button |
| `note-input`, `note-send` | | Note text box and its button |
| `other-input`, `other-send` | | Own-answer text box and its button |
| `send` | | Send button for several answers when there is no Other |
| `review`, `review-item`, `review-edit` | `missing` (on `review-item`) | Review step list and its rows |
| `review-number`, `review-question`, `review-answer` | | Pieces of a review row |
| `footer`, `footer-text`, `send-all` | | Review footer, its missing-answers text, "Send answers" |
| `summary`, `summary-item`, `summary-question`, `summary-answer` | | Read-only answered summary |
| `answer-item`, `answer-note`, `answer-own`, `answer-empty` | | One answer, its note, "Own answer:", "Skipped" — shared by the review and the summary |
| `error`, `keys`, `status` | | Error line (question-level and per-note-length), keyboard hint, "Answered at …". After an answer is sent, `status` takes focus by script (`tabindex="-1"`, not a tab stop) so focus is not lost when the card swaps to the summary; it shows the theme's focus ring (`--p-focus-ring-width`, `-style`, `-color`, `-offset`, with `--wippy-form-focus` overriding the colour) and the ring hugs the text rather than spanning the card |
| `code` | | Inline code from backticks |

### Host attributes

| Attribute | Values | Notes |
| --- | --- | --- |
| `density` | `compact` (default), `comfortable` | Set by the host app; read purely via the `:host([density="comfortable"])` CSS selector — no JS reads it |
| `card-state` | `loading`, `active`, `review`, `answered`, `unsupported` | Reflected by the component; read-only for styling. Named `card-state`, not `state` — `state` is already this element's own observed prop (`"active" \| "idle"`, the package-tag lifecycle mirrored from the artifact); reflecting under that same name previously fought with the prop and misfired a reload on every review/collapse change (fixed — see `use-host-reflection.ts`). `unsupported` takes priority over every other value: an unrecognized `form-version` (from the prop or the loaded state) never renders an interactive/submittable card, so styling must not keep reporting `active` for it. The same value is also reflected when the Host itself predates the artifact-state API (no `artifactState` export on the proxy) — the component then shows a read-only notice (`NeedsNewerHostNotice`) with the real question options disabled, instead of leaving `card-state` stuck on `loading` forever (EE2-2461). The options are all unselected, because the saved answer cannot be read without the state API, so the notice points to the chat for an answer already sent: "This form needs a newer Web Host. If you already answered it, your answer is in the chat." When the Host's own `state` prop is `idle` it reads "This form was answered. Your answer is in the chat." instead (the artifact content stores `idle` in the same transaction that accepts the answer; `active` proves nothing, because the Host's copy of the content may predate the answer, so it keeps the first wording). `loading` covers only the window before the artifact's first GET resolves (no `state` loaded yet, `<wippy-loading>` shown instead of the card) — it used to fall through to `active` there, reporting an interactive card for the tens of milliseconds before any options existed to interact with |
| `collapsed` | present or absent | Reflected by the component; only while the card is active |

Reflection lives in `src/composables/use-host-reflection.ts`, applied from `wippy-form.vue` (it needs the raw custom-element reference, injected via `ELEMENT_PROVIDER` in `src/element-context.ts`, the same mechanism `useArtifactId` uses).

### Keyboard

| Keys | Where | What happens |
| --- | --- | --- |
| 1–9 | Anywhere in the card, outside inputs | One answer: answers at once. Several answers: ticks. Other's number focuses its box. Only the first 9 rows (options + Other) get a number — no cap on how many options a question can have. |
| Shift+1–9, or N on a focused row | Outside inputs | Opens the note for that answer |
| Enter | In Other or a note | Sends (single answer or Other); in a note on a several-answer question, saves the note and ticks that answer |
| Shift+Enter | In Other or a note | New line |
| Escape | In Other or a note | Leaves the box. In a note, this only closes the editor — the draft is not cleared: it is already saved into that answer's note as each keystroke is typed (`setNote`), stays under the row (collapsed, read-only) once closed, and is sent with the answer, overwritten by further edits, or cleared by removing the tick/leaving the question unanswered — never discarded by Escape itself. Verified in `question-card-active.test.ts` ("Escape in a note"). |
| Enter or Space | On an answer row | Same as a click; on several answers, Enter sends the ticked set (with an inline error if nothing is ticked and Other is empty), Space ticks |
| ↑ / ↓ | On answers | Move between answer rows and the Other box |
| ← / → | On answers, several questions | Previous/next question |
| Tab / Shift+Tab | A single-answer question | The row group is ONE Tab stop (WAI-ARIA radio group pattern, roving `tabindex`): Tab moves past the whole group, not row by row. ↑/↓ move between rows inside it; whichever row last had focus — the chosen one once something is chosen, otherwise the first — is where Tab lands next time. A several-answer question's rows stay individual Tab stops (checkbox semantics; no roving) |

Keys only work while focus is inside the card, so typing in the surrounding chat box never picks an answer.

### Errors and assistive technology

- **Each error is announced once**, by its own `role="alert"` message: the question's error (a validation or server field error), the card-wide notice for a form-level server error, and the submit-failure banner. No error text is repeated in the polite live region (which only speaks question changes and "Ticked"/"Note saved"), and a form-level error is drawn once, not again on each question.
- **The control that has focus names the error.** While an error is on screen, every answer row, the Other box, an open note box and the Send / Send answers buttons (the controls that just failed and usually keep focus) list it in `aria-describedby`, so it is read with the control and not only when it first appears.
- **`aria-invalid` only where ARIA supports it and the input is at fault.** A several-answer row (`role="checkbox"`) carries it while its question has an error, the Other box while it is too long or its question has an error, and a note box while it is too long; a single-answer question carries it on its `radiogroup`, because `radio` does not support the state. A failed send or a form-level error describes the controls but does not mark them invalid.
- **A failed send keeps focus on a live control.** Sending a single-answer note closes the note editor, so focus returns to the row that owns the note (where closing a note with Escape and a 422 field error already put it). The error is then read with that row. On a several-question card, moving on to the next question takes focus instead.
- **The send buttons keep focus while a send is in flight.** "Send answers" (review step) and "Send" (a several-answer question without an Other box) are the controls that fail when a send is rejected, and a focused button that gets the `disabled` attribute hands focus to `<body>`. While a send is in flight, or the card is offline, they stay focusable: `aria-disabled="true"` and the theme's own `p-disabled` marker (the same dimmed look as a disabled button) replace the `disabled` attribute, and activation (click, Enter, Space) is ignored, so a second press never sends twice. With a required answer missing, or nothing ticked, they remain real disabled buttons; focus is on a row then, not on the button.
- **Focus is put back when a failed send has lost it.** If the page has no focus after a send fails (the failure banner's Retry button is removed the moment it is pressed, a browser may not focus a button on click, or the small send buttons in the Other and note boxes were disabled while sending), focus goes to the control that sends: "Send answers" on the review step, otherwise the chosen (or first) answer. Focus that has moved to another control on the page, such as the chat box, is left alone.
- **The polite region does not repeat a step that has been sent from.** It is emptied when a send starts, so after a failure it does not keep saying "Review your answers" or "Question 2 of 3"; the failure is announced by its own alert.
- **Error text meets 4.5:1 in both themes.** The field error, the submit-failure banner and the form-level notice keep their PrimeVue `Message` (box, outline, `role="alert"`, `part="error"`), and the text inside takes the theme's severity utilities, one constant per severity in `src/lib/error-text.ts`: `ERROR_TEXT_CLASS` (`text-danger-600 dark:text-danger-400`, the classes the fields form uses for its errors) and `WARN_TEXT_CLASS` (`text-warn-700 dark:text-warn-400`). A retryable failure banner is a warning, so its text follows the warn scale; every other message follows the error scale. Computed from the theme tokens (`src/lib/error-text.test.ts`, calibrated against what the re-check measured): error text 5.2:1 in light and 6.8:1 to 7.9:1 in dark; warn text 5.0:1 in light and 7.2:1 to 9.0:1 in dark, on the card and on the `Message` box. The `Message`'s own text colour is lower (field error 3.6:1 light and 2.1:1 dark; retryable banner 4.0:1 light and 3.9:1 dark); that is a theme-level item and is not overridden with a `.p-*` rule.
- Verified in `question-card-errors.test.ts`, `question-card-send-focus.test.ts`, `use-question-card.test.ts` and `lib/error-text.test.ts`.

### Example: a restyle

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
wippy-form::part(nav) {
  border-radius: 2px;
}
```

### Design decisions locked for V1 (differences from the approved prototype)

The approved prototype is the behavioral and styling-API reference; three things were decided differently for this build:

1. **No decline/dismiss button.** The prototype's close button and `declined` state are dropped entirely — no `dismiss` part, no `declined` value for the `card`/`state` states.
2. **Notes change the answer shape**, as described above — this was "to decide" in the prototype's design doc; it is settled for V1.
3. **Nine keys, no option cap.** Only the first 9 rows (options + Other) get a number-key badge; a question may have more than 9 options.
4. **Field `description`.** The prototype's question model has no per-question description; this build's `FormField.description` (shared with the V2 fields form) renders under the question line, in the same muted style as `hint`, when set — the `description` part above.

### Known gaps

- Text that reads `--wippy-form-danger` (default `--p-danger-500`) is below 4.5:1 for small text on the card: the "Use at most 1,000 / 2,000 characters." notices, the review footer ("Question 3 still needs an answer.") and a missing answer's "Not answered yet" (3.6:1 on the light card, about 3.6:1 on the dark one). The field error, failure banner and form-level notice above are not affected. Raising the token's default needs a shade that flips with the theme, which is a theme-level decision.
- The Send / Send answers / composer-send buttons do not read `--wippy-form-accent` — see "The four action buttons" above. An inline-`:style` approach that routed them through the token was tried and reverted: it re-implemented the theme's own primary/disabled button look by hand, which is the same "same semantics ⇒ same looks" violation a `.p-*` CSS override would be, just moved into the component script instead of the stylesheet. These four stay on the theme's own PrimeVue defaults; only the token-driven elements (rows, counter, key badges, focus ring, note-toggle) restyle with `--wippy-form-accent`.
- Other/note `Textarea` colour (background/border) is likewise the theme's own `.p-textarea` default, not a `--wippy-form-*` token — no `input-bg`/`input-border` tokens exist. The only non-default CSS on these two elements is `flex: 1 1 auto; min-width: 0` (`.w-form__note-input`/`.w-form__other-input` in `src/styles.css`), needed because `@wippy-fe/theme/primevue/inputgroup.css`'s grow-to-fill rule only targets `.p-inputtext`/`.p-inputwrapper`, not a bare `Textarea`'s `.p-textarea` — without it the box sat at its ~150px intrinsic width instead of filling the row.
