<script setup lang="ts">
import type { FieldError, FormAnswers, FormState } from '../lib/definition'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { computed, nextTick, reactive, ref } from 'vue'
import { draftFromAnswers, missingRequiredFields, serializeAnswers } from '../lib/answers'
import ChoiceField from './fields/ChoiceField.vue'

const props = defineProps<{
  state: FormState
  submitting: boolean
  banner: { message: string, retryable?: boolean } | null
}>()

const emit = defineEmits<{
  submit: [answers: FormAnswers]
  retry: []
}>()

// Keyed by field id; typed values only — matches AnswerDraft.
const draft = reactive<Record<string, ReturnType<typeof draftFromAnswers>[string]>>(
  draftFromAnswers(props.state.definition, props.state.data),
)
const fieldErrors = ref<Record<string, FieldError[]>>({})
const formErrors = ref<FieldError[]>([])
const fieldRefs: Record<string, { focusFirstControl: () => void } | null> = {}

function setFieldRef(id: string, el: unknown) {
  fieldRefs[id] = el as { focusFirstControl: () => void } | null
}

const canSubmit = computed(() => !props.submitting)

function focusFirstInvalid(ids: string[]) {
  const firstId = props.state.definition.fields.find(f => ids.includes(f.id))?.id
  if (firstId)
    void nextTick(() => fieldRefs[firstId]?.focusFirstControl())
}

function setServerErrors(errors: Record<string, FieldError[]> | undefined, formLevel: FieldError[] | undefined) {
  fieldErrors.value = errors ?? {}
  formErrors.value = formLevel ?? []
  focusFirstInvalid(Object.keys(fieldErrors.value))
}

function currentAnswers(): FormAnswers {
  return serializeAnswers(props.state.definition, draft)
}

function handleSubmit() {
  const missing = missingRequiredFields(props.state.definition, draft)
  if (missing.length > 0) {
    fieldErrors.value = Object.fromEntries(
      missing.map(id => [id, [{ code: 'required', message: 'This question is required.' }]]),
    )
    formErrors.value = []
    focusFirstInvalid(missing)
    return
  }
  fieldErrors.value = {}
  formErrors.value = []
  emit('submit', currentAnswers())
}

defineExpose({ setServerErrors, retry: () => emit('submit', currentAnswers()) })
</script>

<template>
  <form
    class="flex flex-col gap-4 min-w-0"
    @submit.prevent="handleSubmit"
  >
    <div class="flex flex-col gap-1">
      <h2 class="text-base font-semibold text-surface-900 dark:text-surface-0 break-words">
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
      @update:model-value="(v) => { draft[field.id] = v }"
    />

    <ul
      v-if="formErrors.length > 0"
      class="text-xs text-red-600 dark:text-red-400 list-none p-0 m-0"
      role="alert"
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
        <span>{{ banner.message }}</span>
        <button
          v-if="banner.retryable"
          type="button"
          class="underline text-sm"
          @click="emit('retry')"
        >
          Retry
        </button>
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
