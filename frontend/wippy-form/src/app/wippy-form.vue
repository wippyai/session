<script setup lang="ts">
import type { HostState } from '../composables/use-host-reflection'
import type { FormAnswers } from '../lib/definition'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { computed, nextTick, ref, watch } from 'vue'
import { useComponentEvents, useComponentProps, useComponentPropsErrors } from '../constants'
import { useDeliveryNudge } from '../composables/use-delivery-nudge'
import { useFormState } from '../composables/use-form-state'
import { useFormSubmit } from '../composables/use-form-submit'
import { useHostReflection } from '../composables/use-host-reflection'
import { useOnlineStatus } from '../composables/use-online-status'
import { useArtifactId } from '../element-context'
import ActiveForm from './active-form.vue'
import IdleForm from './idle-form.vue'
import NoArtifactNotice from './no-artifact-notice.vue'
import QuestionCardActive from './question-card/question-card-active.vue'
import QuestionCardSummary from './question-card/question-card-summary.vue'

const RELOAD_FAILED_NOTICE = 'Could not refresh this form. Showing what you last saw.'
const ANSWERED_ELSEWHERE_NOTICE = 'This form was already answered elsewhere, so your answer was not sent. The saved answer is shown below.'
/** The only `form_version` this component knows how to render interactively (see `unsupportedVersion` below). */
const SUPPORTED_FORM_VERSION = 1

const props = useComponentProps()
const propErrors = useComponentPropsErrors()
const emit = useComponentEvents()
const artifactId = useArtifactId()

const definition = computed(() => props.value.definition)
const statePropTrigger = computed(() => props.value.state)

const { status, state, errorMessage, reloadError, reload, refresh } = useFormState(artifactId, statePropTrigger)
useDeliveryNudge(state, refresh)
const { submitting, submit } = useFormSubmit(artifactId)
const { isOnline } = useOnlineStatus(() => reload())

const banner = ref<{ message: string, retryable?: boolean } | null>(null)
// Survives the swap to the read-only view, which is where a lost race ends up.
const answeredElsewhere = ref(false)
watch(artifactId, () => { answeredElsewhere.value = false })
const activeFormRef = ref<{ setServerErrors: (e?: Record<string, { code: string, message: string }[]>, f?: { code: string, message: string }[]) => void, retry: () => void, hasUnsentInput?: () => boolean } | null>(null)
const idleFormRef = ref<{ focusStatus: () => void } | null>(null)

// Set synchronously right before `handleSubmit`'s own accepted-branch
// assignment to `state.value` so the active->idle watcher below (which
// explains an EXTERNAL answer-elsewhere swap) does not also fire for a
// transition WE caused by submitting successfully.
let suppressAnsweredElsewhereWatch = false

// A background reload/event (another tab or client answering the same
// artifact first) can flip `state` from active to idle without this
// instance ever attempting a submit itself — e.g. the `artifact:<id>`
// relay event firing while the user still has an in-progress, unsent
// answer. Silently swapping to the read-only summary would drop that
// in-progress answer with no explanation, so that case is treated the same
// as losing our own submit race: the same "answered elsewhere" notice.
//
// A PASSIVE instance — this copy was never touched, nothing chosen/typed —
// has nothing to lose, so the notice would be false: it reads as "your
// answer was not sent" when no answer was ever attempted. Gated on
// `hasUnsentInput()` (read synchronously here, before the
// active view unmounts on the next render — this watcher runs pre-flush).
// A form flavor with no exposed `hasUnsentInput` (should not happen; both
// ActiveForm and QuestionCardActive provide one) falls back to the old,
// safer-to-over-notify behavior rather than silently going quiet.
watch(() => state.value?.status, (status, previousStatus) => {
  if (status !== 'idle' || previousStatus !== 'active')
    return
  if (suppressAnsweredElsewhereWatch) {
    suppressAnsweredElsewhereWatch = false
    return
  }
  const hadUnsentInput = activeFormRef.value?.hasUnsentInput?.() ?? true
  if (hadUnsentInput)
    answeredElsewhere.value = true
})

// The contract check ("form-version") applies before anything else: the
// package-tag prop is known immediately (no need to wait for GET), and once
// state is loaded its own `form_version` is checked too. Either source
// being anything other than 1 means an interactive ActiveForm must never be
// rendered — a v-else-if branch below, not a submit-time guard, since the
// Host's `Submit` button must simply not exist.
const unsupportedVersion = computed(() => {
  const propVersion = props.value.formVersion
  if (propVersion !== undefined && propVersion !== SUPPORTED_FORM_VERSION)
    return true
  const stateVersion = state.value?.form_version
  if (stateVersion !== undefined && stateVersion !== SUPPORTED_FORM_VERSION)
    return true
  return false
})

// Routing: a definition where every field is `type: 'choice'` (the only
// field type V1 emits) renders the question card; anything else (a future
// mixed/non-choice V2 definition) falls back to the plain radio/checkbox
// fields form, which stays fully supported for that case.
const allChoice = computed(() => {
  const fields = definition.value?.fields
  return !!fields && fields.length > 0 && fields.every(f => f.type === 'choice')
})

// Host attribute reflection (`card-state`, `collapsed`) only makes sense for
// the question card — the plain fields form has no review/collapse concept,
// so it just tracks active vs. answered.
const questionCardState = ref<'active' | 'review'>('active')
const questionCardCollapsed = ref(false)
const hostState = computed<HostState>(() => {
  // Takes priority over everything else: an unsupported form-version never
  // renders an interactive/submittable card (see the v-else-if chain
  // below), so styling must not keep reporting "active" for it either.
  if (unsupportedVersion.value)
    return 'unsupported'
  // `state` is only ever null before the artifact's first GET has resolved
  // — the template shows <wippy-loading> for exactly this window (see the
  // `v-else-if="status === 'loading' || status === 'idle'"` branch below).
  // Without this check, `card-state` fell through to `questionCardState`'s
  // default ("active") here too, so styling reported an interactive card
  // for the ~tens of milliseconds before the GET actually landed and any
  // options existed to interact with.
  if (state.value === null)
    return 'loading'
  if (state.value.status === 'idle')
    return 'answered'
  return allChoice.value ? questionCardState.value : 'active'
})
const hostCollapsed = computed(() => !unsupportedVersion.value && allChoice.value && state.value?.status === 'active' && questionCardCollapsed.value)
useHostReflection(hostState, hostCollapsed)

async function handleSubmit(answers: FormAnswers) {
  if (!state.value)
    return
  banner.value = null
  const outcome = await submit(state.value.form_version, state.value.content_version, answers)

  // The artifact was rebound to a different id while this request was in
  // flight (e.g. the double-buffered w-page swapped content underneath
  // this instance) — this result belongs to a form that is no longer ours.
  if (outcome.ignored)
    return

  if (outcome.ok && outcome.accepted) {
    const accepted = outcome.accepted
    // This active->idle transition is OUR OWN successful submit, not an
    // externally observed "answered elsewhere" swap — the watcher above
    // must not also fire for it.
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
    // Move focus to the read-only view so it isn't lost when the form swaps
    // out from under the user's last interaction (the Submit button).
    void nextTick(() => idleFormRef.value?.focusStatus())
    // Refresh in the background for the canonical submitted_at / normalized
    // data the accepted response itself doesn't carry.
    reload()
    return
  }

  if (outcome.fieldErrors || outcome.formErrors) {
    activeFormRef.value?.setServerErrors(outcome.fieldErrors, outcome.formErrors)
    return
  }

  if (outcome.code === 'already_submitted') {
    answeredElsewhere.value = true
    // Await the reload (not fire-and-forget `reload()`) before scheduling
    // the focus move: `state.value` is still "active" until this resolves,
    // so the read-only view (and `idleFormRef`) does not exist yet — a
    // `nextTick` issued before the await landed found `idleFormRef` still
    // null and silently focused nothing, leaving focus on <body>.
    await refresh()
    void nextTick(() => idleFormRef.value?.focusStatus())
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

    <Message
      v-else-if="!definition"
      severity="error"
      :closable="false"
    >
      This form has no definition to render.
    </Message>

    <Message
      v-else-if="unsupportedVersion"
      severity="warn"
      :closable="false"
    >
      This form needs a newer version of the app.
    </Message>

    <NoArtifactNotice
      v-else-if="!artifactId"
      :definition="definition"
    />

    <template v-else-if="state">
      <p
        v-if="reloadError"
        class="text-xs text-muted-color mb-2"
      >
        {{ RELOAD_FAILED_NOTICE }}
      </p>

      <!--
        `:key="artifactId"` on all four branches below: defense in depth
        alongside the `generation` bump in use-form-state.ts. Even with that
        fix, keying by artifact id guarantees Vue fully discards and
        recreates the active/idle component (and its own local interaction
        state — the question card's ticks/notes/review position) on a
        rebind, rather than patching the existing instance in place should
        `state`'s shape otherwise look compatible across two different
        artifacts.
      -->
      <QuestionCardActive
        v-if="state.status === 'active' && allChoice"
        :key="artifactId"
        ref="activeFormRef"
        :state="state"
        :submitting="submitting"
        :banner="banner"
        :offline="!isOnline"
        @submit="handleSubmit"
        @retry="handleRetry"
        @update:state="(v) => { questionCardState = v }"
        @update:collapsed="(v) => { questionCardCollapsed = v }"
      />
      <ActiveForm
        v-else-if="state.status === 'active'"
        :key="artifactId"
        ref="activeFormRef"
        :state="state"
        :submitting="submitting"
        :banner="banner"
        :offline="!isOnline"
        @submit="handleSubmit"
        @retry="handleRetry"
      />

      <template v-else-if="state.status === 'idle'">
        <p
          v-if="answeredElsewhere"
          role="status"
          class="text-sm text-color mb-3"
        >
          {{ ANSWERED_ELSEWHERE_NOTICE }}
        </p>
        <QuestionCardSummary
          v-if="allChoice"
          :key="artifactId"
          ref="idleFormRef"
          :state="state"
        />
        <IdleForm
          v-else
          :key="artifactId"
          ref="idleFormRef"
          :state="state"
        />
      </template>
    </template>

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
        <Button
          type="button"
          link
          size="small"
          @click="reload"
        >
          Retry
        </Button>
      </div>
    </Message>
  </div>
</template>
