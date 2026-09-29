<script setup lang="ts">
import type { FormAnswers } from '../lib/definition'
import Message from 'primevue/message'
import { computed, ref } from 'vue'
import { useComponentEvents, useComponentProps, useComponentPropsErrors } from '../constants'
import { useFormState } from '../composables/use-form-state'
import { useFormSubmit } from '../composables/use-form-submit'
import { useArtifactId } from '../element-context'
import ActiveForm from './ActiveForm.vue'
import IdleForm from './IdleForm.vue'
import NoArtifactNotice from './NoArtifactNotice.vue'

const props = useComponentProps()
const propErrors = useComponentPropsErrors()
const emit = useComponentEvents()
const artifactId = useArtifactId()

const definition = computed(() => props.value.definition)
const statePropTrigger = computed(() => props.value.state)

const { status, state, errorMessage, reload } = useFormState(artifactId, statePropTrigger)
const { submitting, submit } = useFormSubmit(artifactId)

const banner = ref<{ message: string, retryable?: boolean } | null>(null)
const activeFormRef = ref<{ setServerErrors: (e?: Record<string, { code: string, message: string }[]>, f?: { code: string, message: string }[]) => void, retry: () => void } | null>(null)

async function handleSubmit(answers: FormAnswers) {
  if (!state.value)
    return
  banner.value = null
  const outcome = await submit(state.value.form_version, state.value.content_version, answers)

  if (outcome.ok && outcome.accepted) {
    const accepted = outcome.accepted
    state.value = {
      ...state.value,
      status: 'idle',
      stale: false,
      late: accepted.late,
      content_version: accepted.content_version,
      data: answers,
      answer_message_id: accepted.answer_message_id,
      delivery: accepted.delivery,
    }
    emit('answer-submitted', { requestId: accepted.request_id, answerMessageId: accepted.answer_message_id, late: accepted.late })
    // Refresh in the background for the canonical submitted_at / normalized
    // data the accepted response itself doesn't carry.
    reload()
    return
  }

  if (outcome.fieldErrors || outcome.formErrors) {
    activeFormRef.value?.setServerErrors(outcome.fieldErrors, outcome.formErrors)
    return
  }

  if (outcome.shouldReload)
    reload()

  banner.value = { message: outcome.message ?? 'Could not submit this form.', retryable: outcome.retryable }
}

function handleRetry() {
  activeFormRef.value?.retry()
}
</script>

<template>
  <div class="p-3 max-w-full min-w-0">
    <Message
      v-if="propErrors.length > 0"
      severity="error"
      :closable="false"
    >
      Invalid form configuration.
    </Message>

    <NoArtifactNotice
      v-else-if="!artifactId && definition"
      :definition="definition"
    />

    <Message
      v-else-if="!definition"
      severity="error"
      :closable="false"
    >
      This form has no definition to render.
    </Message>

    <wippy-loading
      v-else-if="status === 'loading' || status === 'idle'"
      no-bg
      title="Loading form…"
    />

    <Message
      v-else-if="status === 'unsupported'"
      severity="warn"
      :closable="false"
    >
      This form needs a newer Web Host.
    </Message>

    <Message
      v-else-if="status === 'error'"
      severity="error"
      :closable="false"
    >
      <div class="flex items-center gap-2">
        <span>{{ errorMessage || 'Could not load this form.' }}</span>
        <button
          type="button"
          class="underline text-sm"
          @click="reload"
        >
          Retry
        </button>
      </div>
    </Message>

    <ActiveForm
      v-else-if="state && state.status === 'active'"
      ref="activeFormRef"
      :state="state"
      :submitting="submitting"
      :banner="banner"
      @submit="handleSubmit"
      @retry="handleRetry"
    />

    <IdleForm
      v-else-if="state && state.status === 'idle'"
      :state="state"
    />
  </div>
</template>
