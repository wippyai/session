<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import InputGroup from 'primevue/inputgroup'
import Textarea from 'primevue/textarea'
import { partAttrs } from '../../lib/part-attrs'

/**
 * The text box with a send button, joined in a PrimeVue `InputGroup`, used for
 * a note and for the Other answer. Enter sends when `enabled`, Shift+Enter
 * starts a new line, and Escape emits `escape` for the parent to decide what
 * leaving the box means, since that differs by `kind`.
 */
const props = defineProps<{
  kind: 'note' | 'other'
  modelValue: string
  placeholder: string
  /** The accessible name of the textarea. Named `label` because `ariaLabel` is ambiguous in a Vue template prop. */
  label: string
  sendLabel: string
  /** Whether the send button may fire, for example with non-blank text. */
  enabled: boolean
  /** The `data-focus` value of the textarea, which the card's focus handling looks up. */
  dataFocus: string
  /** True while an alert, such as a length error, applies to the textarea. */
  invalid?: boolean
  /** The ids of the alerts that explain `invalid`. */
  describedBy?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'send': []
  'escape': []
}>()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault()
    if (props.enabled)
      emit('send')
  }
  // An input method uses Escape to cancel its composition, which must not leave the box.
  else if (event.key === 'Escape' && !event.isComposing) {
    event.preventDefault()
    emit('escape')
  }
}
</script>

<template>
  <InputGroup v-bind="partAttrs('composer', kind)">
    <Textarea
      v-bind="partAttrs(`${kind}-input`)"
      :model-value="modelValue"
      rows="1"
      auto-resize
      :placeholder="placeholder"
      :aria-label="label"
      :aria-invalid="invalid ? 'true' : undefined"
      :aria-describedby="describedBy"
      enterkeyhint="send"
      :data-focus="dataFocus"
      @update:model-value="(v) => emit('update:modelValue', String(v ?? ''))"
      @keydown="onKeydown"
    />
    <Button
      v-bind="partAttrs(`${kind}-send`)"
      type="button"
      text
      rounded
      :disabled="!enabled"
      :aria-label="sendLabel"
      :title="sendLabel"
      @click="emit('send')"
    >
      <template #icon>
        <Icon icon="tabler:send-2" />
      </template>
    </Button>
  </InputGroup>
</template>
