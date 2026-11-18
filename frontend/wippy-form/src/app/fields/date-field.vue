<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { DateFormField, FieldAnswer, FieldError } from '../../lib/definition'
import DatePicker from 'primevue/datepicker'
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { partAttrs } from '../../lib/part-attrs'
import { isValidIsoDate } from '../../lib/scalar-answers'
import FieldShell from './field-shell.vue'

/**
 * The date field: a PrimeVue `DatePicker` in string mode, so its value is the
 * `YYYY-MM-DD` wire text itself, with no `Date` object and no timezone
 * conversion. Typing is allowed; the calendar opens from its button (not on
 * focus), so a keyboard user can just type. On a touch screen (a coarse
 * pointer) a tap on the box opens it too, because PrimeVue gives the box
 * `inputmode="none"` and there is no keyboard to type with.
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
 * What the draft holds. Typed text is judged on its own (`typedValue`), never
 * by the date the picker read from it. A complete date written loosely
 * (`2026-6-5`: a year of 1 to 4 digits, a month and a day of 1 or 2) that is
 * a real day from year 1 to 9999 becomes the full date (`2026-06-05`), which
 * is what will be saved; the box shows it once it is left. Any other text is
 * the draft exactly as typed, so unparseable, impossible or out-of-range text
 * reaches the client check as typed and is named at submit (`invalid_date`,
 * `below_min`, `above_max`). The picker's own reading would differ: it reads a
 * year below 100 as a two-digit year (`0050` is 1950, `0000` is 2000) and
 * ignores trailing text (`2026-06-05 suffix`). A day picked in the calendar
 * (`date-select`) is saved as picked, with a four-digit year.
 *
 * What the calendar shows (decision D53). The calendar covers years 100 to
 * 9999: PrimeVue builds a picked day with `new Date(year, month, day)`, which
 * reads years 0 to 99 as 1900 to 1999, and checks its bounds against that
 * wrong day. So its lower bound is the later of the field's `min` and
 * 0100-01-01, and a date before year 100 (typed or handed in) leaves the
 * calendar without a date; such a date is still a valid answer that can be
 * typed. Any other real day the box holds is the calendar's date, handed to
 * the picker as a `Date` built with `setFullYear`, never as text (the picker
 * reads text with a short year as 19xx). A field whose whole range is before
 * year 100 has a calendar with no enabled day.
 *
 * The picker also writes its own spelling of its day into the box when it
 * is created, when its day changes and when the box loses focus
 * (`999-05-15`), which would lose unparseable text; the box's own text is put
 * back after it, so the user can correct it.
 *
 * The calendar opens in the theme plugin's overlay layer, not inline: the
 * layer is promoted out of every clipping ancestor, so the calendar is never
 * cut off by the message bubble around a short form (`appendTo="self"` was
 * tried and left a one-question form with a quarter of its calendar visible).
 * The layer follows the theme class of the calendar's trigger, so the calendar
 * takes a forced Light or Dark theme from the plugin.
 *
 * The theme opens the calendar at least as wide as the date control, so the
 * control is not left as wide as the whole form: the picker carries the `date`
 * state of the `field-input` part, which the stylesheet bounds to
 * `--wippy-form-date-width` (full width only on a narrower form). The calendar
 * is not overridden; it follows the control.
 *
 * Where focus goes when the calendar closes: to the box, when it is still in the
 * calendar (`onCalendarHide`). A pick or Escape from a day hands focus to the
 * box, but the picker's own delayed re-focus of its day cells can run after that
 * and take it back (inside a shadow root its "focus is already in the calendar"
 * check reads `document.activeElement`, which is the shadow host), and when the
 * calendar then closes the browser drops focus to the page. Focus that has
 * already moved on (a click elsewhere, Tab) is left where it is.
 *
 * Tab inside the calendar: the picker keeps Tab in the panel, but it finds the
 * focused control through `document.activeElement`, which inside a shadow root
 * is the shadow host, so every Tab lands on the same day. In a shadow root the
 * panel moves focus itself, before the picker sees the key (`onCalendarTab`).
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

// The first day the calendar covers (D53): PrimeVue builds a picked day with
// `new Date(year, month, day)`, which reads years 0 to 99 as 1900 to 1999.
const FIRST_CALENDAR_DAY = '0100-01-01'

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

// The picker is created again whenever the field leaves the read-only view,
// so the box is put back for every new picker, not only on this mount.
onMounted(restoreBox)
watch(picker, (instance) => {
  if (instance)
    restoreBoxAfterPicker()
})

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
// text does. The calendar never reaches before FIRST_CALENDAR_DAY; when that
// is after `max`, it has no enabled day.
const minText = computed(() => {
  const min = props.field.min
  return min && isValidIsoDate(min) && min > FIRST_CALENDAR_DAY ? min : FIRST_CALENDAR_DAY
})
const maxText = computed(() => props.field.max)
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
  boxText.value = iso
  syncPicker(iso, true)
  report(iso)
  restoreBoxAfterPicker()
}
// A tap on a touch screen. PrimeVue gives the box `inputmode="none"` (no
// keyboard) and this field does not open the calendar on focus, so the tap
// would do nothing; it opens the calendar, as the calendar button does. A
// click with a mouse, and focus from the keyboard, are left as they were.
function onBoxClick(event: MouseEvent) {
  const box = event.target
  if (!(box instanceof HTMLInputElement) || props.disabled || props.readonly)
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
const inputPart = computed(() => partAttrs('field-input', 'date'))
const calendarPart = computed(() => partAttrs('field-calendar'))

// The calendar is closing, and its panel is still in the page for this one
// moment (the picker emits `hide` as the leave starts). A mouse click outside
// has moved focus already and a Tab has moved it on, so only focus that is
// still inside the panel is acted on: it is about to be dropped to the page.
// It is given to the box. `document.activeElement` is no use for the check
// inside a shadow root (it is the shadow host), so the root's own is read.
// `preventScroll`: a page scrolled away closes the calendar too, and focusing
// the box must not scroll it back.
function onCalendarHide() {
  const box = (picker.value?.$el as HTMLElement | undefined)?.querySelector('input')
  if (!box)
    return
  const focused = (box.getRootNode() as Document | ShadowRoot).activeElement
  if (focused?.closest(`.${calendarPart.value.class}`))
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
      part: calendarPart.value.part,
      class: calendarPart.value.class,
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
        :part="inputPart.part"
        :class="inputPart.class"
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
