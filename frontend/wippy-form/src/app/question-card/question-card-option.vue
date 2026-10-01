<script setup lang="ts">
import type { FormFieldOption } from '../../lib/definition'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import { computed, useId } from 'vue'
import { ERROR_TEXT_CLASS } from '../../lib/error-text'
import { partClass } from '../../lib/part-class'
import { plainText } from '../../lib/rich-text'
import QuestionCardComposer from './question-card-composer.vue'
import QuestionCardRichText from './question-card-rich-text.vue'

/**
 * One answer row: label + description, a tick mark (multi-choice) or check
 * (single-choice, once selected), a saved note (or its editor), the note
 * toggle button, and a number-key badge. Clicking the row (outside the
 * note toggle / note composer) answers or ticks it — see
 * `use-question-card.ts`'s `activate`.
 */
const props = defineProps<{
  option: FormFieldOption
  index: number
  multiple: boolean
  selected: boolean
  /** Saved note text, or '' when this answer has none. */
  note: string
  /** Whether this answer's note editor is open. */
  editing: boolean
  /** Live text in the note editor while `editing`. */
  noteDraft: string
  /** Number-key badge text (\"1\"–\"9\"), or null past the keyed rows. */
  keyLabel: string | null
  noteTooLong: boolean
  /** True while offline or a submit is already in flight — blocks the row click and the note composer's send. */
  disabled?: boolean
  /**
   * Id(s) of the error message(s) on screen for this question — set on the
   * row's `aria-describedby` so the row that has focus names the error. Also
   * set on the note box this row opens.
   */
  describedBy?: string
  /**
   * True while this question has its own error (validation or server field
   * error). Surfaced as `aria-invalid` on a checkbox row only: ARIA supports
   * that state on `checkbox` and on `radiogroup`, but not on `radio`, so a
   * single-choice question carries it on its radiogroup instead
   * (question-card-question.vue).
   */
  invalid?: boolean
  /**
   * Single-choice (`role="radio"`) only: true when this is the ONE row the
   * roving tabindex currently sits on (WAI-ARIA radio group pattern — the
   * group is a single Tab stop, arrow keys move within it). Ignored for
   * `multiple` (checkbox) rows, which stay individually tabbable — see
   * `tabindex` below.
   */
  rovingTabbable?: boolean
}>()

const emit = defineEmits<{
  activate: []
  'toggle-note': []
  'update:noteDraft': [value: string]
  'send-note': []
  'escape-note': []
}>()

const rowPart = computed(() => partClass('option', props.selected && 'selected', props.note && 'has-note', props.editing && 'editing'))
const mainPart = computed(() => partClass('option-main'))
const labelPart = computed(() => partClass('option-label'))
const markPart = computed(() => partClass('option-mark'))
const descPart = computed(() => partClass('option-description'))
const notePart = computed(() => partClass('option-note'))
const togglePart = computed(() => partClass('note-toggle', props.note && 'has-note', props.editing && 'editing'))
const keyPart = computed(() => partClass('option-key'))
const errorPart = computed(() => partClass('error'))
// Links the note textarea's aria-invalid/aria-describedby to its own
// too-long notice, instead of leaving it an unlinked role="alert" paragraph.
const noteErrorId = `${useId()}-note-err`
// The note box names its own too-long notice first, then whatever error is on
// screen for the question (see `describedBy`).
const noteDescribedBy = computed(() => [
  props.noteTooLong ? noteErrorId : '',
  props.describedBy ?? '',
].filter(Boolean).join(' ') || undefined)

function onRowClick(event: MouseEvent) {
  if (props.disabled)
    return
  const target = event.target as HTMLElement
  if (target.closest('.w-form__note-toggle, .w-form__composer'))
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
    :part="rowPart.part"
    :class="rowPart.class"
    @click="onRowClick"
  >
    <div
      :part="mainPart.part"
      :class="mainPart.class"
      :role="multiple ? 'checkbox' : 'radio'"
      :aria-checked="selected ? 'true' : 'false'"
      :aria-disabled="disabled ? 'true' : undefined"
      :aria-describedby="describedBy"
      :aria-invalid="multiple && invalid ? 'true' : undefined"
      :tabindex="multiple || rovingTabbable ? 0 : -1"
      :data-focus="`opt-${index}`"
      :aria-keyshortcuts="keyLabel ? `${keyLabel} Shift+${keyLabel} N` : 'N'"
    >
      <span
        :part="labelPart.part"
        :class="labelPart.class"
      >
        <Checkbox
          v-if="multiple"
          :model-value="selected"
          binary
          readonly
          size="small"
          :tabindex="-1"
          aria-hidden="true"
          :part="markPart.part"
          :class="markPart.class"
        />
        <span
          v-else-if="selected"
          :part="markPart.part"
          :class="markPart.class"
          aria-hidden="true"
        ><Icon icon="tabler:check" /></span>
        <QuestionCardRichText :text="option.label" />
      </span>
      <span
        v-if="option.description"
        :part="descPart.part"
        :class="descPart.class"
      >
        <QuestionCardRichText :text="option.description" />
      </span>
      <span
        v-if="note && !editing"
        :part="notePart.part"
        :class="notePart.class"
      >
        <Icon
          icon="tabler:note"
          aria-hidden="true"
        />
        <span>{{ note }}</span>
      </span>
    </div>
    <Button
      type="button"
      text
      size="small"
      :tabindex="-1"
      :disabled="disabled"
      :part="togglePart.part"
      :class="togglePart.class"
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
      :part="keyPart.part"
      :class="keyPart.class"
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
        :data-focus="`note-${option.value}`"
        @update:model-value="(v) => emit('update:noteDraft', v)"
        @send="emit('send-note')"
        @escape="emit('escape-note')"
      />
      <p
        v-if="noteTooLong"
        :id="noteErrorId"
        :part="errorPart.part"
        :class="[errorPart.class, ERROR_TEXT_CLASS]"
        role="alert"
      >
        Use at most 1,000 characters.
      </p>
    </template>
  </div>
</template>
