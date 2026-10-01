<script setup lang="ts">
import type { FieldError, FormAnswers, FormState } from '../lib/definition'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { draftFromAnswers, fieldsWithBlankOther, fieldsWithOverlongOtherText, missingRequiredFields, serializeAnswers } from '../lib/answers'
import { ERROR_TEXT_CLASS, WARN_TEXT_CLASS } from '../lib/error-text'
import ChoiceField from './fields/choice-field.vue'

const props = defineProps<{
  state: FormState
  submitting: boolean
  banner: { message: string, retryable?: boolean } | null
  /** True while the browser is offline — blocks Submit; a submission can only fail with no network. */
  offline?: boolean
}>()

const emit = defineEmits<{
  submit: [answers: FormAnswers]
  retry: []
}>()

// The banner's text follows its severity, the same as the question card's (lib/error-text.ts).
const bannerTextClass = computed(() => props.banner?.retryable ? WARN_TEXT_CLASS : ERROR_TEXT_CLASS)

const TOO_LONG_MESSAGE = 'Use at most 2,000 characters.'
const BLANK_OTHER_MESSAGE = 'Enter the other answer.'
const OFFLINE_MESSAGE = 'You are offline. Your choices are kept.'

// Keyed by field id; typed values only — matches AnswerDraft.
const draft = reactive<Record<string, ReturnType<typeof draftFromAnswers>[string]>>(
  draftFromAnswers(props.state.definition, props.state.data),
)
const fieldErrors = ref<Record<string, FieldError[]>>({})
const formErrors = ref<FieldError[]>([])
type FieldHandle = { focusFirstControl: () => void, focusOtherText: () => void }
const fieldRefs: Record<string, FieldHandle | null> = {}

// Single polite live region for the form: submission-result banners and the
// validation error summary both funnel through here instead of each having
// their own role="alert" (which double-announces and can't be dismissed).
const statusMessage = ref('')

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

function announceErrorSummary(count: number) {
  statusMessage.value = count === 1 ? '1 question needs an answer.' : `${count} questions need an answer.`
}

function setServerErrors(errors: Record<string, FieldError[]> | undefined, formLevel: FieldError[] | undefined) {
  fieldErrors.value = errors ?? {}
  formErrors.value = formLevel ?? []
  const ids = Object.keys(fieldErrors.value)
  focusFirstInvalid(ids)
  const count = ids.length + (formErrors.value.length > 0 ? 1 : 0)
  if (count > 0)
    announceErrorSummary(count)
}

// A changed answer drops that question's errors; the next submit re-checks it.
function updateField(id: string, value: ReturnType<typeof draftFromAnswers>[string]) {
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
  const blankOther = fieldsWithBlankOther(props.state.definition, draft)
  // A blank Other is the more precise message for a required field too.
  const missing = missingRequiredFields(props.state.definition, draft).filter(id => !blankOther.includes(id))
  const tooLong = fieldsWithOverlongOtherText(props.state.definition, draft)
  if (missing.length > 0 || tooLong.length > 0 || blankOther.length > 0) {
    const errors: Record<string, FieldError[]> = {}
    for (const id of missing)
      errors[id] = [...(errors[id] ?? []), { code: 'required', message: 'This question is required.' }]
    for (const id of blankOther)
      errors[id] = [...(errors[id] ?? []), { code: 'blank', message: BLANK_OTHER_MESSAGE }]
    for (const id of tooLong)
      errors[id] = [...(errors[id] ?? []), { code: 'too_long', message: TOO_LONG_MESSAGE }]
    fieldErrors.value = errors
    formErrors.value = []
    const invalidIds = [...missing, ...blankOther, ...tooLong]
    focusFirstInvalid(invalidIds, blankOther)
    announceErrorSummary(new Set(invalidIds).size)
    return
  }
  fieldErrors.value = {}
  formErrors.value = []
  emit('submit', currentAnswers())
}

// Mirror the submit-outcome banner into the shared live region so a
// network/server failure is announced the same way a validation failure is.
watch(() => props.banner, (banner) => {
  if (banner)
    statusMessage.value = banner.message
})

defineExpose({
  setServerErrors,
  retry: () => emit('submit', currentAnswers()),
  // See QuestionCardActive's own `hasUnsentInput` — a field whose current
  // draft would actually serialize to something counts as unsent input a
  // background "answered elsewhere" swap would otherwise silently discard
  // without explanation.
  hasUnsentInput: () => Object.keys(currentAnswers()).length > 0,
})
</script>

<template>
  <form
    class="flex flex-col gap-4 min-w-0"
    @submit.prevent="handleSubmit"
  >
    <div
      role="status"
      class="sr-only"
    >
      {{ statusMessage }}
    </div>

    <p
      v-if="offline"
      role="status"
      class="text-xs text-muted-color"
    >
      {{ OFFLINE_MESSAGE }}
    </p>

    <div class="flex flex-col gap-1">
      <h2 class="text-base font-semibold text-color break-words">
        {{ state.definition.title }}
      </h2>
      <p
        v-if="state.definition.description"
        class="text-sm text-muted-color break-words"
      >
        {{ state.definition.description }}
      </p>
      <p
        v-if="state.stale"
        class="text-xs italic text-muted-color"
      >
        Asked earlier — the conversation has moved on. You can still answer; the assistant will use it as
        context and confirm before acting on the earlier request.
      </p>
    </div>

    <ChoiceField
      v-for="field in state.definition.fields"
      :key="field.id"
      :ref="(el) => setFieldRef(field.id, el)"
      :field="field"
      :model-value="draft[field.id]"
      :errors="fieldErrors[field.id] ?? []"
      :disabled="submitting"
      :readonly="false"
      @update:model-value="(v) => updateField(field.id, v)"
    />

    <ul
      v-if="formErrors.length > 0"
      class="text-xs text-danger-600 dark:text-danger-400 list-none p-0 m-0"
    >
      <li
        v-for="(err, i) in formErrors"
        :key="i"
      >
        {{ err.message }}
      </li>
    </ul>

    <Message
      v-if="banner"
      :severity="banner.retryable ? 'warn' : 'error'"
      :closable="false"
    >
      <div class="flex items-center gap-2">
        <span :class="bannerTextClass">{{ banner.message }}</span>
        <Button
          v-if="banner.retryable"
          type="button"
          link
          size="small"
          @click="emit('retry')"
        >
          Retry
        </Button>
      </div>
    </Message>

    <div>
      <Button
        type="submit"
        :label="state.definition.submit_label || 'Submit'"
        :loading="submitting"
        :disabled="!canSubmit"
      />
    </div>
  </form>
</template>
