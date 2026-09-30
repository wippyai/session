<script setup lang="ts">
import type { AnswerDisplayItem } from '../../lib/answers'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { partClass } from '../../lib/part-class'
import QuestionCardRichText from './question-card-rich-text.vue'

/** One field's answered items — shared by the review step and the post-submit summary. */
const props = defineProps<{
  items: AnswerDisplayItem[]
}>()

const itemPart = computed(() => partClass('answer-item'))
const notePart = computed(() => partClass('answer-note'))
const ownPart = computed(() => partClass('answer-own'))
</script>

<template>
  <span
    v-for="(item, i) in props.items"
    :key="i"
    :part="itemPart.part"
    :class="itemPart.class"
  >
    <template v-if="item.own">
      <span
        :part="ownPart.part"
        :class="ownPart.class"
      >Own answer: </span>{{ item.label }}
    </template>
    <QuestionCardRichText
      v-else
      :text="item.label"
    />
    <span
      v-if="(item.note || '').trim()"
      :part="notePart.part"
      :class="notePart.class"
    >
      <Icon
        icon="tabler:note"
        aria-hidden="true"
      />
      <span>{{ item.note!.trim() }}</span>
    </span>
  </span>
</template>
