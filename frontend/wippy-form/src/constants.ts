import { useEvents, usePropsErrors, useProps } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types'

export interface Events {
  /** Fired after a submission is durably accepted (including an exact replay). */
  'answer-submitted': { requestId: string, answerMessageId: string, late: boolean }
  load: undefined
  unload: undefined
  error: { message: string, error: unknown }
  invalid: { message: string }
}

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()
export const useComponentPropsErrors = usePropsErrors
