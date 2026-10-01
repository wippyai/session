<script setup lang="ts">
import type { HostState } from '../composables/use-host-reflection'
import type { FormAnswers } from '../lib/definition'
import type { SubmitBanner } from '../lib/submit-error'
import { computed, nextTick, ref, watch } from 'vue'
import { useDeliveryNudge } from '../composables/use-delivery-nudge'
import { useFormState } from '../composables/use-form-state'
import { useFormSubmit } from '../composables/use-form-submit'
import { useHostReflection } from '../composables/use-host-reflection'
import { useOnlineStatus } from '../composables/use-online-status'
import { useComponentEvents, useComponentProps, useComponentPropsErrors } from '../constants'
import { useArtifactId } from '../element-context'
import { CANNOT_SUBMIT_MESSAGE, LOAD_FAILED_MESSAGE, NEEDS_NEWER_HOST_MESSAGE, SUBMIT_FAILED_MESSAGE } from '../lib/messages'
import FormMessage from './form-message.vue'
import FormNotice from './form-notice.vue'
import QuestionCardActive from './question-card/question-card-active.vue'
import QuestionCardSummary from './question-card/question-card-summary.vue'

const RELOAD_FAILED_NOTICE = 'Could not refresh this form. Showing what you last saw.'
// Covers a rejected submit (409) and a background reload that finds unsent local input.
const ANSWERED_ELSEWHERE_NOTICE = 'This form was already answered elsewhere, so your draft was not saved. The saved answer is shown below.'
const ANSWERED_IN_CHAT_MESSAGE = 'This form was answered. Your answer is in the chat.'
const NEEDS_NEWER_HOST_NOTICE = `${NEEDS_NEWER_HOST_MESSAGE} If you already answered it, your answer is in the chat.`
const SUPPORTED_FORM_VERSION = 1

const props = useComponentProps()
const propErrors = useComponentPropsErrors()
const emit = useComponentEvents()
const artifactId = useArtifactId()

const definition = computed(() => props.value.definition)
const statePropTrigger = computed(() => props.value.state)
// The `state` prop becomes `idle` in the same transaction that accepts an
// answer, so `idle` means an answer was accepted. `active` proves nothing: the
// Host's copy of the content may predate the answer. Without the artifact-state
// API this prop is the only way to tell an answered form from an open one.
const answeredPerHostProp = computed(() => statePropTrigger.value === 'idle')

const { status, state, errorMessage, reloadError, reload, refresh } = useFormState(artifactId, statePropTrigger)
useDeliveryNudge(state, refresh)
const { submitting, submit } = useFormSubmit(artifactId)
const { isOnline } = useOnlineStatus(() => reload())

const banner = ref<SubmitBanner | null>(null)
// Survives the swap to the summary, which is where a lost race ends up.
const answeredElsewhere = ref(false)
watch(artifactId, () => { answeredElsewhere.value = false })
const cardRef = ref<InstanceType<typeof QuestionCardActive> | null>(null)
const summaryRef = ref<InstanceType<typeof QuestionCardSummary> | null>(null)

// Set before our own accepted submit flips `state` to idle, so the watcher below
// does not report that change as an answer from elsewhere.
let suppressAnsweredElsewhereWatch = false

// A background reload can flip `state` to idle because another tab or client
// answered first. A card holding unsent input says its draft was dropped. A card
// nothing was entered into has nothing to explain. The input is read before the
// card unmounts, which is why this watcher runs before the render.
watch(() => state.value?.status, (status, previousStatus) => {
  if (status !== 'idle' || previousStatus !== 'active')
    return
  if (suppressAnsweredElsewhereWatch) {
    suppressAnsweredElsewhereWatch = false
    return
  }
  if (cardRef.value?.hasUnsentInput())
    answeredElsewhere.value = true
})

// A form version other than 1, named by the prop or by the loaded state, never
// gets an interactive card.
const unsupportedVersion = computed(() => {
  const propVersion = props.value.formVersion
  if (propVersion !== undefined && propVersion !== SUPPORTED_FORM_VERSION)
    return true
  const stateVersion = state.value?.form_version
  return stateVersion !== undefined && stateVersion !== SUPPORTED_FORM_VERSION
})

// Shown with the definition's questions disabled when the form cannot be answered here.
const notice = computed(() => {
  if (status.value === 'unsupported')
    return answeredPerHostProp.value
      ? { severity: 'secondary', message: ANSWERED_IN_CHAT_MESSAGE } as const
      : { severity: 'warn', message: NEEDS_NEWER_HOST_NOTICE } as const
  if (!artifactId.value)
    return { severity: 'secondary', message: CANNOT_SUBMIT_MESSAGE } as const
  return null
})

const cardStep = ref<'active' | 'review'>('active')
const cardCollapsed = ref(false)
// `unsupported` outranks every other value because no interactive card renders for it.
// `loading` covers the time before the first GET resolves.
const hostState = computed<HostState>(() => {
  if (unsupportedVersion.value || status.value === 'unsupported')
    return 'unsupported'
  if (state.value === null)
    return 'loading'
  return state.value.status === 'idle' ? 'answered' : cardStep.value
})
const hostCollapsed = computed(() => !unsupportedVersion.value && state.value?.status === 'active' && cardCollapsed.value)
useHostReflection(hostState, hostCollapsed)

async function handleSubmit(answers: FormAnswers) {
  if (!state.value)
    return
  banner.value = null
  const outcome = await submit(state.value.form_version, state.value.content_version, answers)

  // The element was rebound to another artifact while this request was in flight.
  if (outcome.ignored)
    return

  if (outcome.ok && outcome.accepted) {
    const accepted = outcome.accepted
    suppressAnsweredElsewhereWatch = true
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
    // The submit button is gone with the card, so focus moves to the summary.
    void nextTick(() => summaryRef.value?.focusStatus())
    // The accepted response lacks the canonical `submitted_at` and normalized data.
    reload()
    return
  }

  if (outcome.fieldErrors || outcome.formErrors) {
    cardRef.value?.setServerErrors(outcome.fieldErrors, outcome.formErrors)
    return
  }

  if (outcome.code === 'already_submitted') {
    answeredElsewhere.value = true
    // The summary exists only once the reload has replaced the active state.
    await refresh()
    void nextTick(() => summaryRef.value?.focusStatus())
    return
  }

  if (outcome.shouldReload)
    reload()

  banner.value = { message: outcome.message ?? SUBMIT_FAILED_MESSAGE, retryable: outcome.retryable }
}

function handleRetry() {
  cardRef.value?.retry()
}
</script>

<template>
  <div class="max-w-full min-w-0">
    <FormMessage
      v-if="propErrors.length > 0"
      severity="error"
    >
      Invalid form configuration.
    </FormMessage>

    <FormMessage
      v-else-if="!definition?.fields?.length"
      severity="error"
    >
      This form has no definition to render.
    </FormMessage>

    <FormMessage
      v-else-if="unsupportedVersion"
      severity="warn"
    >
      This form needs a newer version of the app.
    </FormMessage>

    <FormNotice
      v-else-if="notice"
      :definition="definition"
      :severity="notice.severity"
      :message="notice.message"
    />

    <template v-else-if="state">
      <p
        v-if="reloadError"
        class="text-xs text-muted-color mb-2"
      >
        {{ RELOAD_FAILED_NOTICE }}
      </p>

      <!-- Keyed by the artifact, so a rebind discards the card and the draft it holds. -->
      <QuestionCardActive
        v-if="state.status === 'active'"
        :key="state.artifact_id"
        ref="cardRef"
        :state="state"
        :submitting="submitting"
        :banner="banner"
        :offline="!isOnline"
        @submit="handleSubmit"
        @retry="handleRetry"
        @update:state="(v) => { cardStep = v }"
        @update:collapsed="(v) => { cardCollapsed = v }"
      />
      <template v-else>
        <p
          v-if="answeredElsewhere"
          role="status"
          class="text-sm text-color mb-3"
        >
          {{ ANSWERED_ELSEWHERE_NOTICE }}
        </p>
        <QuestionCardSummary
          :key="state.artifact_id"
          ref="summaryRef"
          :state="state"
        />
      </template>
    </template>

    <wippy-loading
      v-else-if="status === 'loading' || status === 'idle'"
      no-bg
      title="Loading form…"
    />

    <FormMessage
      v-else-if="status === 'error'"
      severity="error"
      retry
      @retry="reload"
    >
      {{ errorMessage || LOAD_FAILED_MESSAGE }}
    </FormMessage>
  </div>
</template>
