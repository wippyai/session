import type { ComponentProps } from './types'
import { useProps, usePropsErrors } from '@wippy-fe/webcomponent-vue'

/** The events the base element dispatches. This component adds none. */
export interface Events {
  load: undefined
  unload: undefined
  error: { message: string, error: unknown }
  invalid: { message: string }
}

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentPropsErrors = usePropsErrors
