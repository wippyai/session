<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { DateFormField, FieldAnswer, FieldError } from '../../lib/definition'
import DatePicker from 'primevue/datepicker'
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { partAttrs } from '../../lib/part-attrs'
import { isValidIsoDate } from '../../lib/scalar-answers'
import FieldShell from './field-shell.vue'

/**
 * The date field: a PrimeVue `DatePicker` that reports text
 * (`update-model-type="string"`) and is handed a `Date` (`pickerModel`).
 * Typing is allowed; the calendar opens from its button, not on focus, so a
 * keyboard user can just type. On a touch screen a tap on the box opens it
 * (`onBoxClick`).
 *
 * This control owns the box's text. A `DatePicker`'s box only follows the
 * last date the picker accepted, and every re-render writes that date back over
 * what is typed, so the text is handed to the box as its `value` through the
 * picker's pass-through (`pickerPt`) and put back after the picker writes its
 * own spelling (`restoreBox`).
 *
 * The draft is the typed text, judged on its own (`typedValue`), never the
 * picker's reading of it; a day picked in the calendar is saved as picked.
 *
 * The calendar covers years 100 to 9999 within the field's own range
 * (`FIRST_CALENDAR_DAY`, `LAST_CALENDAR_DAY`). A date before year 100 is
 * still a valid answer that can be typed; the calendar shows no date for it.
 *
 * The calendar opens in the theme plugin's overlay layer, not inline
 * (`appendTo="self"` left a one-question form with a quarter of its calendar
 * visible), and takes the theme of its trigger. Its width follows the control,
 * which the `date` state of the `field-input` part bounds to
 * `--wippy-form-date-width`.
 *
 * Inside a shadow root the picker reads `document.activeElement`, which is
 * the shadow host, so this control keeps focus in the box when the calendar
 * closes (`onCalendarHide`) and moves Tab through the panel itself
 * (`onCalendarTab`).
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

function toDate(iso: string | null | undefined): Date | undefined {
  if (!iso || !isValidIsoDate(iso))
    return undefined
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(2000, month - 1, day)
  // `new Date(year, ...)` maps years 0-99 to 1900-1999.
  date.setFullYear(year)
  return date
}

// The first day the calendar covers: PrimeVue builds a picked day with
// `new Date(year, month, day)`, which reads years 0 to 99 as 1900 to 1999.
const FIRST_CALENDAR_DAY = '0100-01-01'
// The last day an answer can hold. Without it as a bound, PrimeVue goes on to
// year 10000 when no field max is set.
const LAST_CALENDAR_DAY = '9999-12-31'

// The date the calendar holds for a day, or null for none: a day before
// FIRST_CALENDAR_DAY is a valid answer, but the calendar cannot hold it.
function calendarDate(iso: string | null): Date | null {
  if (iso === null || iso < FIRST_CALENDAR_DAY)
    return null
  return toDate(iso) ?? null
}

// The last real day typed, picked or handed in (`YYYY-MM-DD`), or null. Text
// that is no day leaves it where it was.
let picked: string | null = isValidIsoDate(boxText.value) ? boxText.value : null
// What the picker is given: a `Date` built by `toDate`, never text, because
// the picker reads text with a short year as 19xx. A forced sync hands it a
// fresh value, so it drops its own reading of typed text even when the day is
// unchanged; with no date, null and undefined take turns for the same reason.
const pickerModel = shallowRef<Date | null | undefined>(calendarDate(picked))

// Moves the calendar to `next`. Without `force` the picker is only touched
// when the calendar's date changes: a new model makes the picker write its
// own spelling into the box, which is then put back.
function syncPicker(next: string | null, force = false) {
  const changed = (calendarDate(next)?.getTime() ?? null) !== (calendarDate(picked)?.getTime() ?? null)
  picked = next
  if (!changed && !force)
    return
  pickerModel.value = calendarDate(next) ?? (pickerModel.value === null ? undefined : null)
  restoreBoxAfterPicker()
}

// The last value this control reported, to tell the form handing it back from
// the form changing the answer.
let lastReported = boxText.value

function report(text: string) {
  lastReported = text
  emit('update:modelValue', text)
}

const picker = ref<ComponentPublicInstance | null>(null)

function boxInput(): HTMLInputElement | null {
  return (picker.value?.$el as HTMLElement | undefined)?.querySelector('input') ?? null
}

// The picker writes its own spelling of its day into the box when it is
// created, when its model changes and when the box is left (`999-05-15`);
// the box's own text is put back over it.
function restoreBox() {
  const input = boxInput()
  if (input && input.value !== boxText.value)
    input.value = boxText.value
}

function restoreBoxAfterPicker() {
  void nextTick(restoreBox)
}

onMounted(restoreBox)

watch(() => props.modelValue, (next) => {
  const text = textOf(next)
  if (text === lastReported)
    return
  lastReported = text
  boxText.value = text
  syncPicker(isValidIsoDate(text) ? text : null, true)
})

// The bounds are turned into dates from their text, through a computed of the
// text itself: a state reload hands over a new field object with the same
// min and max, and a new `Date` for the same day would make the picker reset an
// open calendar to the month of the selection. The `Date` changes only when the
// text does. No day before FIRST_CALENDAR_DAY or after LAST_CALENDAR_DAY is
// enabled; when FIRST_CALENDAR_DAY is after `max`, no day is.
const minText = computed(() => {
  const min = props.field.min
  return min && isValidIsoDate(min) && min > FIRST_CALENDAR_DAY ? min : FIRST_CALENDAR_DAY
})
const maxText = computed(() => {
  const max = props.field.max
  return max && isValidIsoDate(max) && max < LAST_CALENDAR_DAY ? max : LAST_CALENDAR_DAY
})
const minDate = computed(() => toDate(minText.value))
const maxDate = computed(() => toDate(maxText.value))

// The picker reports its reading of typed text with `update:modelValue`, then
// fires `input` in the same tick; a day picked in the calendar comes with
// `date-select` instead. Its reading is never the answer (`onTyped`,
// `onDateSelect`), but it tells that the picker replaced its own date.
let pickerReadThisTick = false

function onPickerRead() {
  pickerReadThisTick = true
  queueMicrotask(() => { pickerReadThisTick = false })
}

// A complete date written loosely: a year of 1 to 4 digits, a month and a day
// of 1 or 2 digits, and nothing else.
const LOOSE_DATE = /^(\d{1,4})-(\d{1,2})-(\d{1,2})$/

/**
 * What typed text reports: the full `YYYY-MM-DD` date of a loosely written
 * real day from year 1 to 9999 (`2026-6-5` is `2026-06-05`), else the text
 * exactly as typed, which the submit then names `invalid_date`. It is read
 * from the text itself, never from the date the picker read from it: the
 * picker reads a year below 100 as a two-digit year (`0050` is 1950, `0000`
 * is 2000) and ignores trailing text (`2026-06-05 suffix`).
 */
function typedValue(text: string): string {
  const match = LOOSE_DATE.exec(text)
  if (!match)
    return text
  const iso = `${match[1].padStart(4, '0')}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
  return isValidIsoDate(iso) ? iso : text
}

function onTyped(event: Event) {
  // What the user typed stays in the box, whether or not the picker understood it.
  boxText.value = (event.target as HTMLInputElement).value
  const value = typedValue(boxText.value)
  // The calendar follows the text, whether or not the picker read it (it
  // refuses `50-3-4` outright): the day the text says, or none for an emptied
  // box. For text that is no day it keeps its last date, and a reading the
  // picker put in its place is undone.
  if (isValidIsoDate(value))
    syncPicker(value, pickerReadThisTick)
  else if (value.trim() === '')
    syncPicker(null, pickerReadThisTick)
  else if (pickerReadThisTick)
    syncPicker(picked, true)
  report(value)
}

function isoOf(date: Date): string {
  const pad = (value: number, width: number) => String(value).padStart(width, '0')
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}`
}

// A day picked in the calendar, with the mouse or the keyboard. The calendar
// starts at FIRST_CALENDAR_DAY, so the picker's `new Date(year, ...)` is
// always the day shown.
function onDateSelect(date: Date) {
  const iso = isoOf(date)
  // The bounds keep every enabled day within the calendar's years; a date
  // outside them (year 10000 is written with five digits) is still ignored, so
  // the box and the answer never take one.
  if (!isValidIsoDate(iso) || iso < FIRST_CALENDAR_DAY)
    return
  boxText.value = iso
  syncPicker(iso, true)
  report(iso)
}
// A tap on a touch screen. PrimeVue gives the box `inputmode="none"` (no
// keyboard) and this field does not open the calendar on focus, so the tap
// would do nothing; it opens the calendar, as the calendar button does. A
// click with a mouse, and focus from the keyboard, are left as they were.
function onBoxClick(event: MouseEvent) {
  const box = event.target
  if (!(box instanceof HTMLInputElement) || props.disabled)
    return
  if (box.getAttribute('aria-expanded') === 'true' || !window.matchMedia('(pointer: coarse)').matches)
    return
  ;(event.currentTarget as HTMLElement).querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')?.click()
}

function onBlur() {
  // The picker writes its own spelling of its day into the box right after
  // this handler returns. The typed text is put back, as the full date when it
  // is a loosely written one, so unparseable text can still be corrected.
  boxText.value = typedValue(boxText.value)
  restoreBoxAfterPicker()
}
// The `date` state is what the stylesheet bounds the control's width by.
const inputPart = partAttrs('field-input', 'date')
const calendarPart = partAttrs('field-calendar')

// The calendar is closing, and its panel is still in the page for this one
// moment (the picker emits `hide` as the leave starts). A mouse click outside
// has moved focus already and a Tab has moved it on, so only focus that is
// still inside the panel is acted on: it is about to be dropped to the page.
// It is given to the box. `document.activeElement` is no use for the check
// inside a shadow root (it is the shadow host), so the root's own is read.
// `preventScroll`: a page scrolled away closes the calendar too, and focusing
// the box must not scroll it back.
function onCalendarHide() {
  const box = boxInput()
  if (!box)
    return
  const focused = (box.getRootNode() as Document | ShadowRoot).activeElement
  if (focused?.closest(`.${calendarPart.class}`))
    box.focus({ preventScroll: true })
}

// What the picker walks with Tab: the header buttons and the one day in the tab order.
const CALENDAR_STOPS = 'button:not([disabled]):not([tabindex="-1"]), [tabindex="0"]'

function onCalendarTab(event: KeyboardEvent) {
  const panel = event.currentTarget as HTMLElement
  const root = panel.getRootNode()
  if (event.code !== 'Tab' || !(root instanceof ShadowRoot))
    return
  const stops = Array.from(panel.querySelectorAll<HTMLElement>(CALENDAR_STOPS))
  const at = stops.indexOf(root.activeElement as HTMLElement)
  const next = stops[(at + (event.shiftKey ? -1 : 1) + stops.length) % stops.length]
  if (!next)
    return
  event.preventDefault()
  event.stopPropagation()
  next.focus()
}

const shell = ref<InstanceType<typeof FieldShell> | null>(null)

// A DatePicker puts `$attrs` on its wrapper span; the description and error
// links go to its real `<input>` through its inner InputText's pass-through,
// where `value` is the text the box shows (see above). The calendar panel
// carries the styling-API part and class, and the Tab handler.
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
      part: calendarPart.part,
      class: calendarPart.class,
      onKeydownCapture: onCalendarTab,
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
        ref="picker"
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
        v-bind="inputPart"
        :show-on-focus="false"
        show-icon
        size="small"
        fluid
        @update:model-value="onPickerRead"
        @date-select="onDateSelect"
        @click="onBoxClick"
        @input="onTyped"
        @blur="onBlur"
        @hide="onCalendarHide"
      />
    </template>
  </FieldShell>
</template>
