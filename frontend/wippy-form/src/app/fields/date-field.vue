<script setup lang="ts">
import type { DateFormField, FieldAnswer, FieldError } from '../../lib/definition'
import DatePicker from 'primevue/datepicker'
import { computed, nextTick, ref, watch } from 'vue'
import { useThemeModeClass } from '../../composables/use-theme-mode-class'
import { partClass } from '../../lib/part-class'
import { isValidIsoDate } from '../../lib/scalar-answers'
import FieldShell from './field-shell.vue'

/**
 * The date field: a PrimeVue `DatePicker` in string mode, so its value is the
 * `YYYY-MM-DD` wire text itself, with no `Date` object and no timezone
 * conversion. Typing is allowed; the calendar opens from its button (not on
 * focus), so a keyboard user can just type.
 *
 * What the box shows. A `DatePicker`'s box is uncontrolled: it only follows
 * the last date the picker itself accepted, and every time the box is
 * re-rendered (any change to the form, an error appearing, the field being
 * disabled during a submit) Vue writes that accepted date back over whatever
 * is in the box. Left alone, that erased each key as it was typed and put a
 * stale date back next to an error. So this control owns the box's text: it
 * is handed to the box as its `value` through the picker's own pass-through,
 * and every render writes exactly what the user typed (a no-op for Vue, which
 * leaves the caret where it is). The text in the box changes only when the
 * user types or picks a day, or when the form changes the answer.
 *
 * What the draft holds. Whatever the box holds, so unparseable or
 * out-of-range text reaches the client check as typed and is named at submit
 * (`invalid_date`, `below_min`, `above_max`). One exception: when the picker
 * understood the text (`2026-6-5`), the draft is the full date it read
 * (`2026-06-05`), which is what will be saved; the box shows that text once it
 * is left.
 *
 * The picker also resets the box to its last accepted date when it loses
 * focus, which would lose unparseable text; the typed text is put back after
 * that reset so the user can correct it.
 *
 * The calendar opens in the theme plugin's overlay layer, not inline: the
 * layer is promoted out of every clipping ancestor, so the calendar is never
 * cut off by the message bubble around a short form (`appendTo="self"` was
 * tried and left a one-question form with a quarter of its calendar visible).
 * That layer is a sibling of the themed container, so the calendar would not
 * follow a forced Light or Dark theme; it carries the container's theme class
 * itself (`useThemeModeClass`).
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

function textOf(value: FieldAnswer | undefined): string {
  return typeof value === 'string' ? value : ''
}

// The text the box shows.
const boxText = ref(textOf(props.modelValue))
// True while the box holds text the picker understood (or is empty); false
// for text it rejected, which the picker would reset to its last date.
let boxAccepted = true
// What the picker itself holds: only its own accepted selections move it.
// Text it rejected changes the box and the draft but never this, because a
// new model value makes the picker rewrite the box.
const picked = ref<string | null>(isValidIsoDate(boxText.value) ? boxText.value : null)
// PrimeVue's typings only list Date models; in string mode it takes and gives text.
const pickerModel = computed(() => picked.value as unknown as Date | null)

// The last value this control reported, to tell the form handing it back from
// the form changing the answer.
let lastReported = boxText.value

function report(text: string) {
  lastReported = text
  emit('update:modelValue', text)
}

watch(() => props.modelValue, (next) => {
  const text = textOf(next)
  if (text === lastReported)
    return
  lastReported = text
  boxText.value = text
  boxAccepted = true
  picked.value = isValidIsoDate(text) ? text : null
})

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

// The picker reports an accepted selection (a calendar pick or typed text it
// parsed) with `update:modelValue`, then fires `input` in the same tick for
// typed text.
let acceptedThisTick = false

function onPicked(value: unknown) {
  acceptedThisTick = true
  queueMicrotask(() => { acceptedThisTick = false })
  const text = typeof value === 'string' ? value : ''
  picked.value = text === '' ? null : text
  boxAccepted = true
  boxText.value = text
  report(text)
}

function onTyped(event: Event) {
  // What the user typed stays in the box, whether or not the picker understood it.
  boxText.value = (event.target as HTMLInputElement).value
  // The picker understood this text and already reported the date.
  if (acceptedThisTick)
    return
  boxAccepted = false
  report(boxText.value)
}

function onBlur(event: { originalEvent: Event, value: string }) {
  // The picker resets the box to its last accepted date right after this
  // handler returns. Text it accepted is shown as the full date it read.
  if (boxAccepted) {
    boxText.value = picked.value ?? ''
    return
  }
  // Text it rejected is put back once the reset has run.
  const input = event.originalEvent.target as HTMLInputElement
  void nextTick(() => {
    if (input.value !== boxText.value)
      input.value = boxText.value
  })
}

const inputPart = computed(() => partClass('field-input'))
const calendarPart = computed(() => partClass('field-calendar'))

const shell = ref<InstanceType<typeof FieldShell> | null>(null)
// The theme class of the container, for the calendar (see above).
const themeClass = useThemeModeClass(() => shell.value?.$el as Element | undefined)

// A DatePicker puts `$attrs` on its wrapper span; the description and error
// links go to its real `<input>` through its inner InputText's pass-through,
// where `value` is the text the box shows (see above). The calendar panel
// carries the styling-API part and class.
function pickerPt(describedBy: string | undefined) {
  return {
    pcInputText: {
      root: {
        'value': boxText.value,
        'aria-describedby': describedBy,
        'aria-required': props.field.required ? 'true' : undefined,
      },
    },
    panel: {
      part: calendarPart.value.part,
      class: [calendarPart.value.class, themeClass.value],
    },
  }
}

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
        :pt="pickerPt(describedBy)"
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
