import type { FormDefinition } from './lib/definition'

export interface ComponentProps {
  formVersion?: number
  definition?: FormDefinition
  state?: 'active' | 'idle'
}
