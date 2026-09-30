<script setup lang="ts">
import type { FieldAnswer, FieldError, FormField, OtherAnswer } from '../../lib/definition'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'
import { computed, ref, useId, watch } from 'vue'
import { answerHasOther, answerOtherText } from '../../lib/definition'

const props = defineProps<{
  field: FormField
  modelValue: FieldAnswer | undefined
  errors: FieldError[]
  disabled: boolean
  /** Read-only, submitted display — no controls, just the accepted values as text. */
  readonly: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FieldAnswer | undefined]
}>()

const groupId = useId()
const descriptionId = `${groupId}-desc`
const errorId = `${groupId}-err`
// Distinct prefixes ("opt-<index>" vs "other"/"other-text") so the Other
// control's id can never collide with an option id, regardless of what the
// option values are (they may contain spaces, or literally be "other").
const otherControlId = `${groupId}-other`
const otherLabelId = `${otherControlId}-label`
const otherTextId = `${groupId}-other-text`
const otherTextLabelId = `${otherTextId}-label`

function optionId(index: number): string {
  return `${groupId}-opt-${index}`
}

const fieldsetEl = ref<HTMLFieldSetElement | null>(null)

const describedBy = computed(() => {
  const ids: string[] = []
  if (props.field.description)
    ids.push(descriptionId)
  if (!props.readonly && props.errors.length > 0)
    ids.push(errorId)
  return ids.length > 0 ? ids.join(' ') : undefined
})

// ── Single choice ──────────────────────────────────────────────
// Local sentinel value for the "Other" radio's v-model binding — never sent
// anywhere; just distinguishes "Other is selected" from a real option value.
const OTHER_TOKEN = 'choice-field-other-sentinel'

const singleSelected = computed<string>({
  get() {
    const v = props.modelValue
    if (typeof v === 'string')
      return v
    if (isOther(v))
      return OTHER_TOKEN
    return ''
  },
  set(next) {
    if (next === OTHER_TOKEN)
      emit('update:modelValue', { other: singleOtherText.value })
    else if (next === '')
      emit('update:modelValue', undefined)
    else
      emit('update:modelValue', next)
  },
})

const singleOtherText = ref(answerOtherText(props.modelValue))
watch(() => props.modelValue, (v) => {
  if (!props.field.multiple)
    singleOtherText.value = answerOtherText(v)
})
watch(singleOtherText, (text) => {
  if (!props.field.multiple && singleSelected.value === OTHER_TOKEN)
    emit('update:modelValue', { other: text })
})

// ── Multiple choice ─────────────────────────────────────────────
const multiSelected = computed<string[]>(() => {
  const v = props.modelValue
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
})
const multiOtherChecked = computed(() => props.field.multiple && answerHasOther(props.modelValue))
const multiOtherText = ref(answerOtherText(props.modelValue))
watch(() => props.modelValue, (v) => {
  if (props.field.multiple)
    multiOtherText.value = answerOtherText(v)
})

function emitMulti(values: string[], includeOther: boolean, otherText: string) {
  const arr: Array<string | OtherAnswer> = [...values]
  if (includeOther)
    arr.push({ other: otherText })
  emit('update:modelValue', arr.length > 0 ? arr : undefined)
}

function toggleOption(value: string, checked: boolean) {
  const set = new Set(multiSelected.value)
  if (checked)
    set.add(value)
  else
    set.delete(value)
  emitMulti(props.field.options.filter(o => set.has(o.value)).map(o => o.value), multiOtherChecked.value, multiOtherText.value)
}

function toggleOther(checked: boolean) {
  emitMulti(multiSelected.value, checked, multiOtherText.value)
}

watch(multiOtherText, (text) => {
  if (multiOtherChecked.value)
    emitMulti(multiSelected.value, true, text)
})

function isOther(v: FieldAnswer | undefined): v is OtherAnswer {
  return !!v && typeof v === 'object' && !Array.isArray(v) && typeof (v as OtherAnswer).other === 'string'
}

// ── Read-only display ────────────────────────────────────────────
const readOnlyText = computed<string>(() => {
  const v = props.modelValue
  if (v === undefined)
    return '—'
  const labelFor = (value: string) => props.field.options.find(o => o.value === value)?.label ?? value
  const parts: string[] = []
  if (Array.isArray(v)) {
    for (const item of v) {
      if (typeof item === 'string')
        parts.push(labelFor(item))
      else if (isOther(item))
        parts.push(`Other: ${item.other}`)
    }
  }
  else if (typeof v === 'string') {
    parts.push(labelFor(v))
  }
  else if (isOther(v)) {
    parts.push(`Other: ${v.other}`)
  }
  return parts.length > 0 ? parts.join(', ') : '—'
})

defineExpose({
  focusFirstControl() {
    fieldsetEl.value?.querySelector<HTMLElement>('input, textarea')?.focus()
  },
  // For a blank Other answer the text box is what needs fixing.
  focusOtherText() {
    // Ids come from Vue's useId plus a fixed suffix, so a quoted attribute
    // selector needs no escaping.
    const text = fieldsetEl.value?.querySelector<HTMLElement>(`[id="${otherTextId}"]`)
    if (text)
      text.focus()
    else
      fieldsetEl.value?.querySelector<HTMLElement>('input, textarea')?.focus()
  },
})
</script>

<template>
  <fieldset
    ref="fieldsetEl"
    class="flex flex-col gap-2 border-0 p-0 m-0 min-w-0"
    :aria-describedby="describedBy"
  >
    <legend class="text-sm font-medium text-color p-0">
      {{ field.label }}<span
        v-if="!readonly && field.required"
        class="text-danger-600 dark:text-danger-400"
      > (required)</span>
    </legend>
    <p
      v-if="field.description"
      :id="descriptionId"
      class="text-xs text-muted-color m-0"
    >
      {{ field.description }}
    </p>

    <p
      v-if="readonly"
      class="text-sm text-color break-words"
    >
      {{ readOnlyText }}
    </p>

    <div
      v-else
      class="flex flex-col gap-1.5"
      :role="field.multiple ? 'group' : 'radiogroup'"
      :aria-required="field.required ? 'true' : undefined"
    >
      <template v-if="!field.multiple">
        <div
          v-for="(option, index) in field.options"
          :key="option.value"
          class="flex items-start gap-2"
        >
          <RadioButton
            v-model="singleSelected"
            :input-id="optionId(index)"
            :name="groupId"
            :value="option.value"
            :disabled="disabled"
          />
          <label
            :for="optionId(index)"
            class="text-sm text-color break-words"
          >
            {{ option.label }}
            <span
              v-if="option.description"
              class="block text-xs text-muted-color"
            >{{ option.description }}</span>
          </label>
        </div>
        <div
          v-if="field.allow_other"
          class="flex items-start gap-2"
        >
          <RadioButton
            v-model="singleSelected"
            :input-id="otherControlId"
            :name="groupId"
            :value="OTHER_TOKEN"
            :disabled="disabled"
          />
          <div class="flex flex-col gap-1 min-w-0 grow">
            <label
              :id="otherLabelId"
              :for="otherControlId"
              class="text-sm text-color"
            >Other</label>
            <label
              :id="otherTextLabelId"
              :for="otherTextId"
              class="sr-only"
            >Other answer</label>
            <InputText
              :id="otherTextId"
              v-model="singleOtherText"
              :disabled="disabled || singleSelected !== OTHER_TOKEN"
              size="small"
              class="w-full"
            />
          </div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="(option, index) in field.options"
          :key="option.value"
          class="flex items-start gap-2"
        >
          <Checkbox
            :model-value="multiSelected.includes(option.value)"
            binary
            :input-id="optionId(index)"
            :disabled="disabled"
            @update:model-value="(checked) => toggleOption(option.value, !!checked)"
          />
          <label
            :for="optionId(index)"
            class="text-sm text-color break-words"
          >
            {{ option.label }}
            <span
              v-if="option.description"
              class="block text-xs text-muted-color"
            >{{ option.description }}</span>
          </label>
        </div>
        <div
          v-if="field.allow_other"
          class="flex items-start gap-2"
        >
          <Checkbox
            :model-value="multiOtherChecked"
            binary
            :input-id="otherControlId"
            :disabled="disabled"
            @update:model-value="(checked) => toggleOther(!!checked)"
          />
          <div class="flex flex-col gap-1 min-w-0 grow">
            <label
              :id="otherLabelId"
              :for="otherControlId"
              class="text-sm text-color"
            >Other</label>
            <label
              :id="otherTextLabelId"
              :for="otherTextId"
              class="sr-only"
            >Other answer</label>
            <InputText
              :id="otherTextId"
              v-model="multiOtherText"
              :disabled="disabled || !multiOtherChecked"
              size="small"
              class="w-full"
            />
          </div>
        </div>
      </template>
    </div>

    <ul
      v-if="!readonly && errors.length > 0"
      :id="errorId"
      class="text-xs text-danger-600 dark:text-danger-400 list-none p-0 m-0 flex flex-col gap-0.5"
    >
      <li
        v-for="(err, i) in errors"
        :key="i"
      >
        {{ err.message }}
      </li>
    </ul>
  </fieldset>
</template>
