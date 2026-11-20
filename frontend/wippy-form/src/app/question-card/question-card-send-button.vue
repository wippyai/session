<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import { partAttrs } from '../../lib/part-attrs'

/**
 * The button that sends the answers. It is the control that just failed when a
 * send is rejected, and it usually still has focus. While the card is blocked,
 * by a send in flight or by being offline, the button is marked `aria-disabled`
 * and dimmed with the theme's `p-disabled` marker instead of getting the
 * `disabled` attribute, because a focused button that becomes disabled hands
 * focus to <body>. Activation is ignored then. When there is nothing to send
 * it is a real disabled button, and focus is on a row.
 *
 * The fields form uses it as its `submit` button, with `sending` set while a
 * send is in flight: a spinner then takes the place of the send icon (it
 * stands still under reduced motion), and the part gets its `sending` state.
 */
const props = defineProps<{
  /** The part, the class and the `data-focus` value of the button. */
  name: 'send' | 'send-all'
  label: string
  blocked?: boolean
  nothingToSend?: boolean
  describedBy?: string
  type?: 'button' | 'submit'
  sending?: boolean
}>()

const emit = defineEmits<{ send: [] }>()

function onClick() {
  if (!props.blocked)
    emit('send')
}
</script>

<template>
  <Button
    :type="type ?? 'button'"
    v-bind="partAttrs(name, sending && 'sending')"
    :class="blocked && 'p-disabled'"
    :data-focus="name"
    :aria-describedby="describedBy"
    :aria-disabled="blocked ? 'true' : undefined"
    :disabled="nothingToSend"
    @click="onClick"
  >
    {{ label }}
    <Icon
      :icon="sending ? 'tabler:loader-2' : 'tabler:send-2'"
      aria-hidden="true"
      :class="sending && 'animate-spin motion-reduce:animate-none'"
    />
  </Button>
</template>
