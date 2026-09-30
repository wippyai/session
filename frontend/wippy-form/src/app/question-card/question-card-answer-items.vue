<script setup lang="ts">
import type { AnswerDisplayItem } from '../../lib/answers'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { trimAnswerText } from '../../lib/answers'
import { partClass } from '../../lib/part-class'
import { textLines } from '../../lib/rich-text'
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
      >Own answer: </span>
      <!--
        Free text, split on line breaks and joined back with real <br>s —
        never a `\n` left in a single text node (CSS `white-space` would
        depend on a stylesheet the consuming page may not have loaded) and
        never HTML/markup parsed from the user's own text.
      -->
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
      :part="notePart.part"
      :class="notePart.class"
    >
      <Icon
        icon="tabler:note"
        aria-hidden="true"
      />
      <span>{{ trimAnswerText(item.note!) }}</span>
    </span>
  </span>
</template>
