<script setup lang="ts">
import type { FormFieldOption } from '../../lib/definition'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import { computed, useId } from 'vue'
import { NOTE_TEXT_MAX } from '../../lib/answers'
import { joinIds } from '../../lib/aria'
import { noteKey, optionKey } from '../../lib/focus-key'
import { partAttrs, partSelector } from '../../lib/part-attrs'
import { plainText } from '../../lib/rich-text'
import QuestionCardComposer from './question-card-composer.vue'
import QuestionCardLengthAlert from './question-card-length-alert.vue'
import QuestionCardRichText from './question-card-rich-text.vue'

/**
 * One answer row: the label and description, a tick box for several answers or
 * a check once a single answer is chosen, the saved note or its editor, the note
 * toggle and the number key. A click on the row outside the note toggle and the
 * note editor answers or ticks it.
 */
const props = defineProps<{
  option: FormFieldOption
  index: number
  multiple: boolean
  selected: boolean
  /** The saved note text, or an empty string. */
  note: string
  /** Whether the note editor is open. */
  editing: boolean
  /** The text in the note editor while `editing`. */
  noteDraft: string
  /** The number key badge text ("1" to "9"), or null past the keyed rows. */
  keyLabel: string | null
  noteTooLong: boolean
  /** True while offline or a send is in flight, which blocks the row click and the note's send. */
  disabled?: boolean
  /** The ids of the error messages on screen for the question. The row names them in `aria-describedby`, and so does the note box. */
  describedBy?: string
  /**
   * True while the question has its own error. It is `aria-invalid` on a
   * checkbox row only, because ARIA supports that state on `checkbox` and
   * `radiogroup` but not on `radio`. A single-answer question carries it on its
   * radiogroup instead.
   */
  invalid?: boolean
  /** Single answer only: true for the one row the roving tabindex sits on. Several-answer rows are always tabbable. */
  rovingTabbable?: boolean
}>()

const emit = defineEmits<{
  'activate': []
  'toggle-note': []
  'update:noteDraft': [value: string]
  'send-note': []
  'escape-note': []
}>()

const noteErrorId = `${useId()}-note-err`
// The note box names its own length alert first, then the question's errors.
const noteDescribedBy = computed(() => joinIds(props.noteTooLong && noteErrorId, props.describedBy))

const NOTE_CONTROLS = `${partSelector('note-toggle')}, ${partSelector('composer')}`

function onRowClick(event: MouseEvent) {
  if (props.disabled)
    return
  if ((event.target as HTMLElement).closest(NOTE_CONTROLS))
    return
  emit('activate')
}

const noteToggleLabel = computed(() => `${props.note ? 'Edit the note on' : 'Add a note to'} ${plainText(props.option.label)}`)
const notePlaceholder = computed(() => props.multiple
  ? 'Note for this answer. Enter saves it.'
  : 'Note for this answer. Enter answers with it.')
const noteSendLabel = computed(() => props.multiple ? 'Save the note' : 'Answer with this note')
</script>

<template>
  <div
    v-bind="partAttrs('option', selected && 'selected', note && 'has-note', editing && 'editing')"
    @click="onRowClick"
  >
    <div
      v-bind="partAttrs('option-main')"
      :role="multiple ? 'checkbox' : 'radio'"
      :aria-checked="selected ? 'true' : 'false'"
      :aria-disabled="disabled ? 'true' : undefined"
      :aria-describedby="describedBy"
      :aria-invalid="multiple && invalid ? 'true' : undefined"
      :tabindex="multiple || rovingTabbable ? 0 : -1"
      :data-focus="optionKey(index)"
      :aria-keyshortcuts="keyLabel ? `${keyLabel} Shift+${keyLabel} N` : 'N'"
    >
      <span v-bind="partAttrs('option-label')">
        <Checkbox
          v-if="multiple"
          v-bind="partAttrs('option-mark')"
          :model-value="selected"
          binary
          readonly
          size="small"
          :tabindex="-1"
          aria-hidden="true"
        />
        <span
          v-else-if="selected"
          v-bind="partAttrs('option-mark')"
          aria-hidden="true"
        ><Icon icon="tabler:check" /></span>
        <QuestionCardRichText :text="option.label" />
      </span>
      <span
        v-if="option.description"
        v-bind="partAttrs('option-description')"
      >
        <QuestionCardRichText :text="option.description" />
      </span>
      <span
        v-if="note && !editing"
        v-bind="partAttrs('option-note')"
      >
        <Icon
          icon="tabler:note"
          aria-hidden="true"
        />
        <span>{{ note }}</span>
      </span>
    </div>
    <Button
      v-bind="partAttrs('note-toggle', note && 'has-note', editing && 'editing')"
      type="button"
      text
      size="small"
      :tabindex="-1"
      :disabled="disabled"
      :aria-expanded="editing ? 'true' : 'false'"
      :aria-label="noteToggleLabel"
      :title="note ? 'Edit the note' : 'Add a note'"
      @click.stop="emit('toggle-note')"
    >
      <template #icon>
        <Icon icon="tabler:note" />
      </template>
    </Button>
    <kbd
      v-if="keyLabel"
      v-bind="partAttrs('option-key')"
      aria-hidden="true"
    >{{ keyLabel }}</kbd>
    <span v-else />
    <template v-if="editing">
      <QuestionCardComposer
        kind="note"
        :model-value="noteDraft"
        :placeholder="notePlaceholder"
        :label="`Note for ${plainText(option.label)}`"
        :send-label="noteSendLabel"
        :enabled="!noteTooLong && !disabled"
        :invalid="noteTooLong"
        :described-by="noteDescribedBy"
        :data-focus="noteKey(option.value)"
        @update:model-value="(v) => emit('update:noteDraft', v)"
        @send="emit('send-note')"
        @escape="emit('escape-note')"
      />
      <QuestionCardLengthAlert
        v-if="noteTooLong"
        :id="noteErrorId"
        :max="NOTE_TEXT_MAX"
      />
    </template>
  </div>
</template>
