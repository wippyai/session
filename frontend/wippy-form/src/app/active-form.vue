<script setup lang="ts">
import type { FieldAnswer, FieldError, FormAnswers, FormState } from '../lib/definition'
import type { SubmitBanner } from '../lib/submit-error'
import Button from 'primevue/button'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { draftFromAnswers, draftSignature, serializeAnswers, validateAnswers } from '../lib/answers'
import { ERROR_TEXT_CLASS } from '../lib/error-text'
import { partAttrs } from '../lib/part-attrs'
import FormFieldControl from './fields/form-field.vue'
import FormHeader from './form-header.vue'
import FormMessage from './form-message.vue'

/**
 * The fields form: every field of the definition as its own control (choice
 * radios/checkboxes and the V2 standard fields), one Submit button, and one
 * polite status region. A form of choices only renders as the question card
 * instead; this is the renderer for any form with a standard field.
 *
 * The `<form>` is `novalidate`: a native `type="email"` or `required` would
 * otherwise stop the submit event with the browser's own bubble and bypass
 * the accessible error flow below (per-field errors linked by
 * `aria-describedby`, focus on the first invalid control, a status summary).
 */
const props = defineProps<{
  state: FormState
  submitting: boolean
  banner: SubmitBanner | null
  /** True while the browser is offline. It blocks Submit, because a submission can only fail with no network. */
  offline?: boolean
}>()

const emit = defineEmits<{
  submit: [answers: FormAnswers]
  retry: []
}>()

const OFFLINE_MESSAGE = 'You are offline. Your choices are kept.'
// One shared empty list: a fresh `[]` per render would hand every field a new
// prop on each parent render and re-render all of them.
const NO_ERRORS: FieldError[] = []

// A PrimeVue `Message` is a live region (`role="alert"`, `aria-live="assertive"`).
// The submit-failure banner is announced by the form's polite status region
// instead, so the Message is made a plain element: its text is still shown,
// and read by anyone browsing the form, but never spoken a second time.
const QUIET_MESSAGE_PT = { root: { 'role': undefined, 'aria-live': undefined, 'aria-atomic': undefined } }

// Keyed by field id: the raw value of each control — matches AnswerDraft.
const draft = reactive<Record<string, FieldAnswer | undefined>>(
  draftFromAnswers(props.state.definition, props.state.data),
)
// What the form started with, so "unsent input" means the user changed something.
const initialSignature = draftSignature(props.state.definition, draft)

const fieldErrors = ref<Record<string, FieldError[]>>({})
const formErrors = ref<FieldError[]>([])
type FieldHandle = { focusFirstControl: () => void, focusOtherText: () => void }
const fieldRefs: Record<string, FieldHandle | null> = {}

// Single polite live region for the form: submission-result banners and the
// validation error summary both funnel through here instead of each having
// their own role="alert" (which double-announces and can't be dismissed). The
// banner's own PrimeVue `Message` is made a plain element for that reason
// (`QUIET_MESSAGE_PT`), so a failure is announced once, here.
const statusMessage = ref('')
// True while the region holds the validation summary, which is kept in step
// with the errors still showing; false once a submit-failure message took it.
let statusIsSummary = false

function setFieldRef(id: string, el: unknown) {
  fieldRefs[id] = el as FieldHandle | null
}

const canSubmit = computed(() => !props.submitting && !props.offline)

function focusFirstInvalid(ids: string[], blankOther: string[] = []) {
  const firstId = props.state.definition.fields.find(f => ids.includes(f.id))?.id
  if (!firstId)
    return
  void nextTick(() => {
    const field = fieldRefs[firstId]
    if (blankOther.includes(firstId))
      field?.focusOtherText()
    else
      field?.focusFirstControl()
  })
}

function errorSummary(count: number): string {
  return count === 1 ? '1 question needs attention.' : `${count} questions need attention.`
}

// What the validation summary says: how many questions (fields) have an error,
// then each form-level message as its own text. A form-level error is about
// the form, not a question, so it is never counted as one.
const errorSummaryText = computed(() => {
  const parts: string[] = []
  const questions = Object.keys(fieldErrors.value).length
  if (questions > 0)
    parts.push(errorSummary(questions))
  for (const error of formErrors.value)
    parts.push(error.message)
  return parts.join(' ')
})

function announceErrorSummary() {
  statusIsSummary = true
  statusMessage.value = errorSummaryText.value
}

// A fixed question drops its error as the user types, so the summary would
// otherwise keep saying how many needed attention at the last submit. It is
// updated only when its text changes (once per fixed question, not once per
// key) and emptied when nothing is left. A polite live region does not
// announce text that has not changed.
watch(errorSummaryText, (text) => {
  if (!statusIsSummary)
    return
  statusMessage.value = text
  if (text === '')
    statusIsSummary = false
})

function setServerErrors(errors: Record<string, FieldError[]> | undefined, formLevel: FieldError[] | undefined) {
  fieldErrors.value = errors ?? {}
  formErrors.value = formLevel ?? []
  focusFirstInvalid(Object.keys(fieldErrors.value))
  if (errorSummaryText.value !== '')
    announceErrorSummary()
}

// Starting a send clears the previous server errors, as it does the banner, so
// a resent answer, such as one sent again with Retry, never shows an old 422
// next to the new outcome.
watch(() => props.submitting, (sending) => {
  if (!sending)
    return
  fieldErrors.value = {}
  formErrors.value = []
})

// A changed answer drops that question's errors; the next submit re-checks it.
function updateField(id: string, value: FieldAnswer | undefined) {
  draft[id] = value
  if (fieldErrors.value[id]) {
    const { [id]: _cleared, ...rest } = fieldErrors.value
    fieldErrors.value = rest
  }
}

function currentAnswers(): FormAnswers {
  return serializeAnswers(props.state.definition, draft)
}

function handleSubmit() {
  const errors = validateAnswers(props.state.definition, draft)
  const invalidIds = Object.keys(errors)
  if (invalidIds.length > 0) {
    fieldErrors.value = errors
    formErrors.value = []
    // A blank Other is the one failure where the text box, not the group, needs focus.
    const blankOther = invalidIds.filter(id => errors[id].some(e => e.code === 'blank'))
    focusFirstInvalid(invalidIds, blankOther)
    announceErrorSummary()
    return
  }
  fieldErrors.value = {}
  formErrors.value = []
  emit('submit', currentAnswers())
}

// Mirror the submit-outcome banner into the shared live region so a
// network/server failure is announced the same way a validation failure is.
watch(() => props.banner, (banner) => {
  if (!banner)
    return
  statusIsSummary = false
  statusMessage.value = banner.message
})

const rootPart = computed(() => partAttrs('card'))
const fieldsPart = computed(() => partAttrs('fields'))
const noticePart = computed(() => partAttrs('notice'))
const formErrorPart = computed(() => partAttrs('fields-error'))
const sendPart = computed(() => partAttrs('send'))

defineExpose({
  setServerErrors,
  retry: () => emit('submit', currentAnswers()),
  // See QuestionCardActive's own `hasUnsentInput` — a form the user changed
  // counts as unsent input a background "answered elsewhere" swap would
  // otherwise silently discard without explanation. An untouched form does
  // not, even one whose controls start filled from defaults or a checkbox.
  hasUnsentInput: () => draftSignature(props.state.definition, draft) !== initialSignature,
})
</script>

<template>
  <form
    :part="`${rootPart.part} ${fieldsPart.part}`"
    :class="`w-form ${rootPart.class} ${fieldsPart.class}`"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <div
      role="status"
      class="w-form__sr"
    >
      {{ statusMessage }}
    </div>

    <p
      v-if="offline"
      role="status"
      :part="noticePart.part"
      :class="noticePart.class"
    >
      {{ OFFLINE_MESSAGE }}
    </p>

    <FormHeader
      :title="state.definition.title"
      :description="state.definition.description"
    >
      <p
        v-if="state.stale"
        :part="noticePart.part"
        :class="noticePart.class"
      >
        Asked earlier — the conversation has moved on. You can still answer; the assistant will use it as
        context and confirm before acting on the earlier request.
      </p>
    </FormHeader>

    <FormFieldControl
      v-for="field in state.definition.fields"
      :key="field.id"
      :ref="(el) => setFieldRef(field.id, el)"
      :field="field"
      :model-value="draft[field.id]"
      :errors="fieldErrors[field.id] ?? NO_ERRORS"
      :disabled="submitting"
      :readonly="false"
      @update:model-value="(v) => updateField(field.id, v)"
    />

    <ul
      v-if="formErrors.length > 0"
      :part="formErrorPart.part"
      :class="`${formErrorPart.class} ${ERROR_TEXT_CLASS}`"
    >
      <li
        v-for="(err, i) in formErrors"
        :key="i"
      >
        {{ err.message }}
      </li>
    </ul>

    <FormMessage
      v-if="banner"
      :severity="banner.retryable ? 'warn' : 'error'"
      :retry="banner.retryable"
      :pt="QUIET_MESSAGE_PT"
      @retry="emit('retry')"
    >
      {{ banner.message }}
    </FormMessage>

    <div>
      <Button
        type="submit"
        :label="state.definition.submit_label || 'Submit'"
        :loading="submitting"
        :disabled="!canSubmit"
        :part="sendPart.part"
        :class="sendPart.class"
      />
    </div>
  </form>
</template>
