<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import { computed } from 'vue'
import { partClass } from '../../lib/part-class'
import QuestionCardRichText from './question-card-rich-text.vue'

/** Counter/nav + question text + collapse chevron — the line above every question and the review step. */
const props = defineProps<{
  multi: boolean
  index: number
  n: number
  review: boolean
  /** Raw (backtick-aware) question text — ignored in review, where a fixed review heading shows instead. */
  questionText: string
  collapsed: boolean
  qid: string
}>()

const emit = defineEmits<{
  prev: []
  next: []
  toggleCollapse: []
}>()

const headerPart = computed(() => partClass('header', !props.multi && 'single'))
const navPart = computed(() => partClass('nav'))
const prevPart = computed(() => partClass('prev'))
const counterPart = computed(() => partClass('counter'))
const nextPart = computed(() => partClass('next'))
const questionPart = computed(() => partClass('question'))
const actionsPart = computed(() => partClass('actions'))
const collapsePart = computed(() => partClass('collapse'))

const counterText = computed(() => props.review ? 'Review' : `${props.index + 1}/${props.n}`)
const counterSrText = computed(() => props.review ? 'Review' : `Question ${props.index + 1} of ${props.n}`)
const nextLabel = computed(() => props.index === props.n - 1 ? 'Review answers' : 'Next question')
</script>

<template>
  <div
    :part="headerPart.part"
    :class="headerPart.class"
  >
    <div
      v-if="multi"
      :part="navPart.part"
      :class="navPart.class"
      role="group"
      aria-label="Questions"
    >
      <Button
        type="button"
        text
        size="small"
        :part="prevPart.part"
        :class="prevPart.class"
        aria-label="Previous question"
        title="Previous question"
        :disabled="index === 0"
        @click="emit('prev')"
      >
        <template #icon>
          <Icon icon="tabler:chevron-left" />
        </template>
      </Button>
      <span
        :part="counterPart.part"
        :class="counterPart.class"
      >
        <span aria-hidden="true">{{ counterText }}</span>
        <span class="w-form__sr">{{ counterSrText }}</span>
      </span>
      <Button
        type="button"
        text
        size="small"
        :part="nextPart.part"
        :class="nextPart.class"
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
      :id="qid"
      :part="questionPart.part"
      :class="questionPart.class"
    >
      <template v-if="review">
        Check your answers, then send them.
      </template>
      <QuestionCardRichText
        v-else
        :text="questionText"
      />
    </h3>
    <div
      :part="actionsPart.part"
      :class="actionsPart.class"
    >
      <Button
        type="button"
        text
        size="small"
        :part="collapsePart.part"
        :class="collapsePart.class"
        :aria-expanded="collapsed ? 'false' : 'true'"
        :aria-label="collapsed ? 'Show answers' : 'Hide answers'"
        :title="collapsed ? 'Show answers' : 'Hide answers'"
        @click="emit('toggleCollapse')"
      >
        <template #icon>
          <Icon :icon="collapsed ? 'tabler:chevron-down' : 'tabler:chevron-up'" />
        </template>
      </Button>
    </div>
  </div>
</template>
