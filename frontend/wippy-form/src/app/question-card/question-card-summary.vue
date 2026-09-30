<script setup lang="ts">
import type { FormState } from '../../lib/definition'
import { Icon } from '@iconify/vue'
import { computed, ref } from 'vue'
import { answerDisplayItems } from '../../lib/answers'
import { partClass } from '../../lib/part-class'
import QuestionCardAnswerItems from './question-card-answer-items.vue'
import QuestionCardRichText from './question-card-rich-text.vue'

/**
 * Read-only, post-submit view of a question-card form — the question-card
 * counterpart of `IdleForm.vue`, swapped in by `wippy-form.vue` once
 * `state.status === 'idle'` for an all-`choice` definition. Keeps the same
 * delivery-status copy (`pending`/`running`/`interrupted`, late-answer
 * notice, "Answered at …") `IdleForm.vue` shows.
 */
const props = defineProps<{
  state: FormState
}>()

function formatTime(iso: string | null): string | null {
  if (!iso)
    return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString()
}

const cardPart = computed(() => partClass('card', 'answered'))
const titlePart = computed(() => partClass('title'))
const summaryPart = computed(() => partClass('summary'))
const itemPart = computed(() => partClass('summary-item'))
const questionPart = computed(() => partClass('summary-question'))
const answerPart = computed(() => partClass('summary-answer'))
const emptyPart = computed(() => partClass('answer-empty'))
const statusPart = computed(() => partClass('status'))

function itemsFor(fieldId: string) {
  const field = props.state.definition.fields.find(f => f.id === fieldId)
  if (!field)
    return null
  return answerDisplayItems(field, props.state.data ? props.state.data[fieldId] : undefined)
}

const statusEl = ref<HTMLElement | null>(null)

defineExpose({
  /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
  focusStatus() {
    statusEl.value?.focus()
  },
})
</script>

<template>
  <section
    :part="cardPart.part"
    :class="`w-form ${cardPart.class}`"
    :aria-label="`${state.definition.title}, answered`"
  >
    <p
      :part="titlePart.part"
      :class="titlePart.class"
    >
      <Icon
        icon="tabler:circle-check"
        aria-hidden="true"
      />
      {{ state.definition.title }}
    </p>

    <dl
      :part="summaryPart.part"
      :class="summaryPart.class"
    >
      <div
        v-for="field in state.definition.fields"
        :key="field.id"
        :part="itemPart.part"
        :class="itemPart.class"
      >
        <dt
          :part="questionPart.part"
          :class="questionPart.class"
        >
          <QuestionCardRichText :text="field.label" />
        </dt>
        <dd
          :part="answerPart.part"
          :class="answerPart.class"
        >
          <QuestionCardAnswerItems
            v-if="itemsFor(field.id)"
            :items="itemsFor(field.id)!"
          />
          <span
            v-else
            :part="emptyPart.part"
            :class="emptyPart.class"
          >Skipped</span>
        </dd>
      </div>
    </dl>

    <div
      ref="statusEl"
      tabindex="-1"
      :part="statusPart.part"
      :class="statusPart.class"
    >
      <p v-if="state.late">
        Late answer — this was answered after the conversation moved on. The assistant will confirm before
        acting on the earlier request.
      </p>
      <p v-if="state.delivery === 'pending'">
        Submitted. Waiting for the assistant.
      </p>
      <p v-else-if="state.delivery === 'running'">
        The assistant is reading your answer.
      </p>
      <p v-else-if="state.delivery === 'interrupted'">
        The assistant stopped before answering. Send a message to continue.
      </p>
      <p v-if="formatTime(state.submitted_at)">
        Answered {{ formatTime(state.submitted_at) }}
      </p>
    </div>
  </section>
</template>
