<script setup lang="ts">
import type { HostState } from '../composables/use-host-reflection'
import type { FormAnswers, FormDefinition } from '../lib/definition'
import type { SubmitBanner } from '../lib/submit-error'
import { computed, nextTick, ref, watch } from 'vue'
import { useDeliveryNudge } from '../composables/use-delivery-nudge'
import { useFormState } from '../composables/use-form-state'
import { useFormSubmit } from '../composables/use-form-submit'
import { useHostReflection } from '../composables/use-host-reflection'
import { useOnlineStatus } from '../composables/use-online-status'
import { useComponentProps, useComponentPropsErrors } from '../constants'
import { useArtifactId } from '../element-context'
import { isChoiceFormState, isKnownFieldType, isSupportedFormVersion } from '../lib/definition'
import { CANNOT_SUBMIT_MESSAGE, LOAD_FAILED_MESSAGE, NEEDS_NEWER_HOST_MESSAGE, SUBMIT_FAILED_MESSAGE } from '../lib/messages'
import ActiveForm from './active-form.vue'
import FormMessage from './form-message.vue'
import FormNotice from './form-notice.vue'
import IdleForm from './idle-form.vue'
import QuestionCardActive from './question-card/question-card-active.vue'
import QuestionCardSummary from './question-card/question-card-summary.vue'

const RELOAD_FAILED_NOTICE = 'Could not refresh this form. Showing what you last saw.'
// Covers a rejected submit (409) and a background reload that finds unsent local input.
const ANSWERED_ELSEWHERE_NOTICE = 'This form was already answered elsewhere, so your draft was not saved. The saved answer is shown below.'
const ANSWERED_IN_CHAT_MESSAGE = 'This form was answered. Your answer is in the chat.'
const NEEDS_NEWER_HOST_NOTICE = `${NEEDS_NEWER_HOST_MESSAGE} If you already answered it, your answer is in the chat.`

const props = useComponentProps()
const propErrors = useComponentPropsErrors()
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
// A send that got no response may have saved the answer, so a later idle state may be our own.
let sendOutcomeUncertain = false
// A failed send's banner and its Retry belong to the form it was made for.
watch(artifactId, () => {
  answeredElsewhere.value = false
  banner.value = null
  sendOutcomeUncertain = false
})
// The question card or the fields form, whichever renders the active form.
const activeRef = ref<InstanceType<typeof QuestionCardActive> | InstanceType<typeof ActiveForm> | null>(null)
// The answered view of either.
const summaryRef = ref<InstanceType<typeof QuestionCardSummary> | InstanceType<typeof IdleForm> | null>(null)

// Set before our own accepted submit flips `state` to idle, so the watcher below
// does not report that change as an answer from elsewhere. It is not set when
// `state` is already idle, because no change follows and the flag would linger.
let suppressAnsweredElsewhereWatch = false

// A background reload can flip `state` to idle because another tab or client
// answered first. A form holding unsent input says its draft was dropped. A form
// nothing was entered into has nothing to explain. The input is read before the
// form unmounts, which is why this watcher runs before the render. The reader's
// own send is never reported: not while it is in flight (the server publishes the
// artifact before it returns the POST) and not after one whose outcome is unknown.
watch(() => state.value?.status, (status, previousStatus) => {
  if (status !== 'idle' || previousStatus !== 'active')
    return
  if (submitting.value || sendOutcomeUncertain)
    return
  if (suppressAnsweredElsewhereWatch) {
    suppressAnsweredElsewhereWatch = false
    return
  }
  if (activeRef.value?.hasUnsentInput())
    answeredElsewhere.value = true
})

/** True when a field of `def` has a type this component cannot render, a type from a newer version. */
function hasUnknownFieldType(def: FormDefinition | undefined): boolean {
  return !!def?.fields?.some(field => !isKnownFieldType(field.type))
}

// A form version this component does not render (1 and 2 render), named by the
// prop or by the loaded state, never gets an interactive form. Neither does a
// field of a type this component does not know, so a question is never
// silently dropped from the form.
const unsupportedVersion = computed(() => {
  const propVersion = props.value.formVersion
  if (propVersion !== undefined && !isSupportedFormVersion(propVersion))
    return true
  const stateVersion = state.value?.form_version
  if (stateVersion !== undefined && !isSupportedFormVersion(stateVersion))
    return true
  return hasUnknownFieldType(definition.value) || hasUnknownFieldType(state.value?.definition)
})

// A form of choices only (version 1) renders as the question card. A form with
// a standard field, alone or beside choices, renders as the fields form, where
// a choice is plain radio buttons or checkboxes with no notes.
const choiceState = computed(() => {
  const current = state.value
  return current && isChoiceFormState(current) ? current : null
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
// `unsupported` outranks every other value because no interactive form renders for it.
// `loading` covers the time before the first GET resolves. The fields form has
// no review step and cannot collapse, so it stays `active` until answered.
const hostState = computed<HostState>(() => {
  if (unsupportedVersion.value || status.value === 'unsupported')
    return 'unsupported'
  if (state.value === null)
    return 'loading'
  if (state.value.status === 'idle')
    return 'answered'
  return choiceState.value ? cardStep.value : 'active'
})
const hostCollapsed = computed(() => !unsupportedVersion.value && choiceState.value !== null && state.value?.status === 'active' && cardCollapsed.value)
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
    suppressAnsweredElsewhereWatch = state.value.status !== 'idle'
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
    // The submit button is gone with the form, so focus moves to the summary.
    void nextTick(() => summaryRef.value?.focusStatus())
    // The accepted response lacks the canonical `submitted_at` and normalized data.
    reload()
    return
  }

  if (outcome.fieldErrors || outcome.formErrors) {
    activeRef.value?.setServerErrors(outcome.fieldErrors, outcome.formErrors)
    return
  }

  if (outcome.code === 'network_error')
    sendOutcomeUncertain = true

  if (outcome.code === 'already_submitted') {
    // After a send that got no response, the answer that won may be our own.
    if (!sendOutcomeUncertain)
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
  activeRef.value?.retry()
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

      <!-- Keyed by the artifact, so a rebind discards the form and the draft it holds. -->
      <QuestionCardActive
        v-if="state.status === 'active' && choiceState"
        :key="state.artifact_id"
        ref="activeRef"
        :state="choiceState"
        :submitting="submitting"
        :banner="banner"
        :offline="!isOnline"
        @submit="handleSubmit"
        @retry="handleRetry"
        @step-change="(v) => { cardStep = v }"
        @collapsed-change="(v) => { cardCollapsed = v }"
      />
      <ActiveForm
        v-else-if="state.status === 'active'"
        :key="state.artifact_id"
        ref="activeRef"
        :state="state"
        :submitting="submitting"
        :banner="banner"
        :offline="!isOnline"
        @submit="handleSubmit"
        @retry="handleRetry"
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
          v-if="choiceState"
          :key="state.artifact_id"
          ref="summaryRef"
          :state="choiceState"
        />
        <IdleForm
          v-else
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
