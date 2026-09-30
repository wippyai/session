<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import InputGroup from 'primevue/inputgroup'
import Textarea from 'primevue/textarea'
import { computed } from 'vue'
import { partClass } from '../../lib/part-class'

/**
 * The joined text input + send button used for both a per-answer note and
 * the Other free-text row: PrimeVue `InputGroup` (the joined-border/radius
 * treatment) wrapping an auto-resizing `Textarea` and an icon-only `Button`
 * — the "joined input" from the compliance brief, all P0 PrimeVue. Enter
 * sends (when `enabled`); Shift+Enter is a newline (native textarea
 * behavior); Escape asks the parent to leave the box via `escape` — this
 * component does not decide what "leave" means (close a note vs. defocus
 * Other), since that differs by `kind` and the parent owns focus.
 */
const props = defineProps<{
  kind: 'note' | 'other'
  modelValue: string
  placeholder: string
  /** Accessible name for the textarea — named `label`, not `ariaLabel`, only to keep Vue's template prop resolution unambiguous. */
  label: string
  sendLabel: string
  /** Whether the send button may fire right now (e.g. non-blank text, or something already ticked). */
  enabled: boolean
  /** Value for the textarea's `data-focus` attribute — how the keyboard/focus layer finds this control. */
  dataFocus: string
  /** True while a `role="alert"` error (too-long, or a server field error) applies to this textarea. */
  invalid?: boolean
  /** Id(s) of the `role="alert"` element(s) that explain `invalid` — set on the textarea's `aria-describedby`. */
  describedBy?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'send': []
  'escape': []
}>()

const wrapper = computed(() => partClass('composer', props.kind))
const inputPart = computed(() => partClass(`${props.kind}-input`))
const sendPart = computed(() => partClass(`${props.kind}-send`))

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault()
    if (props.enabled)
      emit('send')
  }
  // `!event.isComposing`: an IME uses Escape to cancel the composition
  // in progress, not to leave the box — intercepting it here would eat
  // that cancel and defocus/close the note instead.
  else if (event.key === 'Escape' && !event.isComposing) {
    event.preventDefault()
    emit('escape')
  }
}
</script>

<template>
  <InputGroup
    :part="wrapper.part"
    :class="wrapper.class"
  >
    <Textarea
      :model-value="modelValue"
      :part="inputPart.part"
      :class="inputPart.class"
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
      type="button"
      text
      rounded
      :part="sendPart.part"
      :class="sendPart.class"
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
