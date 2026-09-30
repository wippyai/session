import type { FormState } from '../../lib/definition'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import QuestionCardSummary from './question-card-summary.vue'

const baseState: FormState = {
  form_version: 1,
  artifact_id: 'artifact-1',
  session_id: 'session-1',
  status: 'idle',
  stale: false,
  late: false,
  content_version: 2,
  definition: {
    title: 'Question',
    fields: [
      {
        id: 'f1',
        type: 'choice',
        label: 'Pick one',
        required: true,
        options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
        multiple: false,
        allow_other: false,
      },
    ],
  },
  data: { f1: 'a' },
  submitted_at: '2026-01-01T00:00:00.000Z',
  answer_message_id: 'msg-1',
  delivery: 'complete',
}

describe('QuestionCardSummary — required indicator hidden on the read-only answered summary (P2 tracker line 107b)', () => {
  it('does not show "(required)" for a required, already-answered field', () => {
    const wrapper = mount(QuestionCardSummary, { props: { state: baseState }, global: { plugins: [PrimeVuePlugin] } })
    expect(wrapper.text()).not.toContain('(required)')
    expect(wrapper.text()).toContain('A')
  })

  it('does not show "(required)" even for a question the user left unanswered (skipped)', () => {
    const skipped: FormState = { ...baseState, data: {} }
    const wrapper = mount(QuestionCardSummary, { props: { state: skipped }, global: { plugins: [PrimeVuePlugin] } })
    expect(wrapper.text()).not.toContain('(required)')
    expect(wrapper.text()).toContain('Skipped')
  })
})
