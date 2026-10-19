<script setup lang="ts">
import type { AnswerDisplayItem } from '../../lib/answers'
import { Icon } from '@iconify/vue'
import { trimAnswerText } from '../../lib/answers'
import { partAttrs } from '../../lib/part-attrs'
import { textLines } from '../../lib/rich-text'
import QuestionCardRichText from './question-card-rich-text.vue'

/** The answered items of one question, shared by the review step and the answered summary. */
defineProps<{
  items: AnswerDisplayItem[]
}>()
</script>

<template>
  <span
    v-for="(item, i) in items"
    :key="i"
    v-bind="partAttrs('answer-item')"
  >
    <template v-if="item.own">
      <span v-bind="partAttrs('answer-own')">Own answer: </span>
      <!-- Each line is followed by a real <br>, so no `\n` is left in one text node and no markup is parsed from the user's text. -->
      <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
      <template
        v-for="(line, li) in textLines(item.label)"
        :key="li"
      ><br v-if="li > 0">{{ line }}</template>
    </template>
    <QuestionCardRichText
      v-else
      :text="item.label"
    />
    <span
      v-if="trimAnswerText(item.note || '')"
      v-bind="partAttrs('answer-note')"
    >
      <Icon
        icon="tabler:note"
        aria-hidden="true"
      />
      <span>{{ trimAnswerText(item.note!) }}</span>
    </span>
  </span>
</template>
