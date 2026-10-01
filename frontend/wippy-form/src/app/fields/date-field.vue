<script setup lang="ts">
import type { DateFormField, FieldAnswer, FieldError } from '../../lib/definition'
import DatePicker from 'primevue/datepicker'
import { computed, nextTick, ref } from 'vue'
import { isValidIsoDate } from '../../lib/scalar-answers'
import { partClass } from '../../lib/part-class'
import FieldShell from './field-shell.vue'

/**
 * The date field: a PrimeVue `DatePicker` in string mode, so its value is the
 * `YYYY-MM-DD` wire text itself, with no `Date` object and no timezone
 * conversion. Typing is allowed; the calendar opens from its button (not on
 * focus), so a keyboard user can just type.
 *
 * The picker silently ignores text it cannot parse — its model stays on the
 * last good date and, on blur, it rewrites the box to that date, which would
 * lose what the user typed. This control never lets that happen: the draft is
 * whatever the box holds, so unparseable or out-of-range text reaches the
 * client check as typed and is named (`invalid_date`, `before_min`,
 * `after_max`), and the typed text is put back after the picker's blur reset
 * so the user can correct it.
 */
const props = defineProps<{
  field: DateFormField
  modelValue: FieldAnswer | undefined
  errors: FieldError[]
  disabled: boolean
  readonly: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FieldAnswer | undefined]
}>()

const draft = computed(() => typeof props.modelValue === 'string' ? props.modelValue : '')

// What the picker itself holds: only its own accepted selections move it.
// Text it rejected changes the draft but never this, because a new model
// value makes the picker rewrite the box and erase what is being typed.
const picked = ref<string | null>(isValidIsoDate(draft.value) ? draft.value : null)
// PrimeVue's typings only list Date models; in string mode it takes and gives text.
const pickerModel = computed(() => picked.value as unknown as Date | null)

function toDate(iso: string | undefined): Date | undefined {
  if (!iso || !isValidIsoDate(iso))
    return undefined
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(2000, month - 1, day)
  // `new Date(year, ...)` maps years 0-99 to 1900-1999.
  date.setFullYear(year)
  return date
}
const minDate = computed(() => toDate(props.field.min))
const maxDate = computed(() => toDate(props.field.max))

// The picker reports an accepted selection (a calendar click or typed text
// it parsed) with `update:modelValue`, then fires `input` in the same tick.
let acceptedThisTick = false

function onPicked(value: unknown) {
  acceptedThisTick = true
  queueMicrotask(() => { acceptedThisTick = false })
  const text = typeof value === 'string' ? value : ''
  picked.value = text === '' ? null : text
  emit('update:modelValue', text)
}

function onTyped(event: Event) {
  // The picker understood this text and already reported the date.
  if (acceptedThisTick)
    return
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onBlur(event: { originalEvent: Event, value: string }) {
  const typed = event.value
  if (typed.trim() === '' || typed.trim() === (picked.value ?? ''))
    return
  // The picker resets the box to its last accepted date right after this
  // handler returns; restore what the user typed once it has.
  const input = event.originalEvent.target as HTMLInputElement
  void nextTick(() => { input.value = typed })
}

const inputPart = computed(() => partClass('field-input'))

// A DatePicker puts `$attrs` on its wrapper span; the description and error
// links go to its real `<input>` through the inner InputText's pass-through.
function inputAttrs(describedBy: string | undefined) {
  return {
    pcInputText: {
      root: {
        'aria-describedby': describedBy,
        'aria-required': props.field.required ? 'true' : undefined,
      },
    },
  }
}

const shell = ref<InstanceType<typeof FieldShell> | null>(null)
defineExpose({ focusFirstControl: () => shell.value?.focusFirstControl() })
</script>

<template>
  <FieldShell
    ref="shell"
    :field="field"
    :model-value="modelValue"
    :errors="errors"
    :disabled="disabled"
    :readonly="readonly"
    layout="stacked"
  >
    <template #default="{ id, describedBy, invalid }">
      <DatePicker
        :model-value="pickerModel"
        :input-id="id"
        update-model-type="string"
        date-format="yy-mm-dd"
        placeholder="YYYY-MM-DD"
        :min-date="minDate"
        :max-date="maxDate"
        :disabled="disabled"
        :invalid="invalid"
        :pt="inputAttrs(describedBy)"
        :part="inputPart.part"
        :class="inputPart.class"
        :show-on-focus="false"
        show-icon
        size="small"
        fluid
        @update:model-value="onPicked"
        @input="onTyped"
        @blur="onBlur"
      />
    </template>
  </FieldShell>
</template>
