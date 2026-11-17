<script setup lang="ts">
import type { FormField } from '../../lib/definition'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'
import { computed, useId } from 'vue'
import { ERROR_TEXT_CLASS } from '../../lib/error-text'

/** One question as disabled, unselected controls: radio buttons for one answer, checkboxes for several. */
const props = defineProps<{
  field: FormField
}>()

const groupId = useId()
const descriptionId = `${groupId}-desc`
// Ids are built from the index and fixed suffixes, never from option values,
// which may contain spaces or be the word "other".
const otherControlId = `${groupId}-other`
const otherTextId = `${groupId}-other-text`

const control = computed(() => props.field.multiple ? Checkbox : RadioButton)

function optionId(index: number): string {
  return `${groupId}-opt-${index}`
}

function controlProps(inputId: string, value?: string) {
  return props.field.multiple
    ? { inputId, binary: true, modelValue: false, disabled: true }
    : { inputId, name: groupId, value, disabled: true }
}
</script>

<template>
  <fieldset
    class="flex flex-col gap-2 border-0 p-0 m-0 min-w-0"
    :aria-describedby="field.description ? descriptionId : undefined"
  >
    <legend class="text-sm font-medium text-color p-0">
      {{ field.label }}<span
        v-if="field.required"
        :class="ERROR_TEXT_CLASS"
      > (required)</span>
    </legend>
    <p
      v-if="field.description"
      :id="descriptionId"
      class="text-xs text-muted-color m-0"
    >
      {{ field.description }}
    </p>

    <div
      class="flex flex-col gap-1.5"
      :role="field.multiple ? 'group' : 'radiogroup'"
    >
      <div
        v-for="(option, index) in field.options"
        :key="option.value"
        class="flex items-start gap-2"
      >
        <component
          :is="control"
          v-bind="controlProps(optionId(index), option.value)"
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
        <component
          :is="control"
          v-bind="controlProps(otherControlId, 'other')"
        />
        <div class="flex flex-col gap-1 min-w-0 grow">
          <label
            :for="otherControlId"
            class="text-sm text-color"
          >Other</label>
          <label
            :for="otherTextId"
            class="sr-only"
          >Other answer</label>
          <InputText
            :id="otherTextId"
            disabled
            size="small"
            class="w-full"
          />
        </div>
      </div>
    </div>
  </fieldset>
</template>
