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
const otherLabelId = `${groupId}-other-label`

const fieldsetEl = ref<HTMLFieldSetElement | null>(null)

const describedBy = computed(() => {
  const ids: string[] = []
  if (props.field.description)
    ids.push(descriptionId)
  if (props.errors.length > 0)
    ids.push(errorId)
  return ids.length > 0 ? ids.join(' ') : undefined
})

// ── Single choice ──────────────────────────────────────────────
const OTHER_TOKEN = '__wippy_form_other__'

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
})
</script>

<template>
  <fieldset
    ref="fieldsetEl"
    class="flex flex-col gap-2 border-0 p-0 m-0 min-w-0"
  >
    <legend class="text-sm font-medium text-surface-900 dark:text-surface-0 p-0">
      {{ field.label }}<span
        v-if="field.required"
        class="text-red-600 dark:text-red-400"
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
      class="text-sm text-surface-900 dark:text-surface-0 break-words"
    >
      {{ readOnlyText }}
    </p>

    <div
      v-else
      class="flex flex-col gap-1.5"
      :aria-describedby="describedBy"
    >
      <template v-if="!field.multiple">
        <div
          v-for="option in field.options"
          :key="option.value"
          class="flex items-start gap-2"
        >
          <RadioButton
            v-model="singleSelected"
            :input-id="`${groupId}-${option.value}`"
            :name="groupId"
            :value="option.value"
            :disabled="disabled"
          />
          <label
            :for="`${groupId}-${option.value}`"
            class="text-sm text-surface-900 dark:text-surface-0 break-words"
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
            :input-id="`${groupId}-other`"
            :name="groupId"
            :value="OTHER_TOKEN"
            :disabled="disabled"
          />
          <div class="flex flex-col gap-1 min-w-0 grow">
            <label
              :id="otherLabelId"
              :for="`${groupId}-other-text`"
              class="text-sm text-surface-900 dark:text-surface-0"
            >Other</label>
            <InputText
              :id="`${groupId}-other-text`"
              v-model="singleOtherText"
              :aria-labelledby="otherLabelId"
              :disabled="disabled || singleSelected !== OTHER_TOKEN"
              size="small"
              maxlength="2000"
              class="w-full"
            />
          </div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="option in field.options"
          :key="option.value"
          class="flex items-start gap-2"
        >
          <Checkbox
            :model-value="multiSelected.includes(option.value)"
            binary
            :input-id="`${groupId}-${option.value}`"
            :disabled="disabled"
            @update:model-value="(checked) => toggleOption(option.value, !!checked)"
          />
          <label
            :for="`${groupId}-${option.value}`"
            class="text-sm text-surface-900 dark:text-surface-0 break-words"
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
            :input-id="`${groupId}-other`"
            :disabled="disabled"
            @update:model-value="(checked) => toggleOther(!!checked)"
          />
          <div class="flex flex-col gap-1 min-w-0 grow">
            <label
              :id="otherLabelId"
              :for="`${groupId}-other-text`"
              class="text-sm text-surface-900 dark:text-surface-0"
            >Other</label>
            <InputText
              :id="`${groupId}-other-text`"
              v-model="multiOtherText"
              :aria-labelledby="otherLabelId"
              :disabled="disabled || !multiOtherChecked"
              size="small"
              maxlength="2000"
              class="w-full"
            />
          </div>
        </div>
      </template>
    </div>

    <ul
      v-if="!readonly && errors.length > 0"
      :id="errorId"
      class="text-xs text-red-600 dark:text-red-400 list-none p-0 m-0 flex flex-col gap-0.5"
      role="alert"
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
