<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import { computed } from 'vue'
import { partAttrs } from '../../lib/part-attrs'
import QuestionCardRichText from './question-card-rich-text.vue'

/** The line above every question and the review step: the counter with its buttons, the question text and the collapse button. */
const props = defineProps<{
  multi: boolean
  index: number
  n: number
  review: boolean
  /** The question text, which may contain backticks. A fixed heading replaces it in the review. */
  questionText: string
  collapsed: boolean
  qid: string
}>()

const emit = defineEmits<{
  'prev': []
  'next': []
  'toggle-collapse': []
}>()

const counterText = computed(() => props.review ? 'Review' : `${props.index + 1}/${props.n}`)
const counterSrText = computed(() => props.review ? 'Review' : `Question ${props.index + 1} of ${props.n}`)
const nextLabel = computed(() => props.index === props.n - 1 ? 'Review answers' : 'Next question')
</script>

<template>
  <div v-bind="partAttrs('header', !multi && 'single')">
    <div
      v-if="multi"
      v-bind="partAttrs('nav')"
      role="group"
      aria-label="Questions"
    >
      <Button
        v-bind="partAttrs('prev')"
        type="button"
        text
        size="small"
        aria-label="Previous question"
        title="Previous question"
        :disabled="index === 0"
        @click="emit('prev')"
      >
        <template #icon>
          <Icon icon="tabler:chevron-left" />
        </template>
      </Button>
      <span v-bind="partAttrs('counter')">
        <span aria-hidden="true">{{ counterText }}</span>
        <span class="sr-only">{{ counterSrText }}</span>
      </span>
      <Button
        v-bind="partAttrs('next')"
        type="button"
        text
        size="small"
        :aria-label="nextLabel"
        :title="nextLabel"
        :disabled="review"
        @click="emit('next')"
      >
        <template #icon>
          <Icon icon="tabler:chevron-right" />
        </template>
      </Button>
    </div>
    <h3
      v-bind="partAttrs('question')"
      :id="qid"
    >
      <template v-if="review">
        Check your answers, then send them.
      </template>
      <QuestionCardRichText
        v-else
        :text="questionText"
      />
    </h3>
    <div v-bind="partAttrs('actions')">
      <Button
        v-bind="partAttrs('collapse')"
        type="button"
        text
        size="small"
        :aria-expanded="collapsed ? 'false' : 'true'"
        :aria-label="collapsed ? 'Show answers' : 'Hide answers'"
        :title="collapsed ? 'Show answers' : 'Hide answers'"
        @click="emit('toggle-collapse')"
      >
        <template #icon>
          <Icon :icon="collapsed ? 'tabler:chevron-down' : 'tabler:chevron-up'" />
        </template>
      </Button>
    </div>
  </div>
</template>
