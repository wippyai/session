import type { FormState } from '../../lib/definition'
import { mount } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { describe, expect, it } from 'vitest'
import { choiceField, definitionOf, formState } from '../../test-support/fixtures'
import QuestionCardSummary from './question-card-summary.vue'

const definition = definitionOf(choiceField({ required: true }))

const baseState = formState({ status: 'idle', definition, content_version: 2, data: { f1: 'a' }, submitted_at: '2026-01-01T00:00:00.000Z', answer_message_id: 'msg-1', delivery: 'complete' })

function mountSummary(overrides: Partial<FormState> = {}) {
  return mount(QuestionCardSummary, { props: { state: { ...baseState, ...overrides } }, attachTo: document.body, global: { plugins: [PrimeVuePlugin] } })
}

describe('QuestionCardSummary: answers', () => {
  it('shows the chosen option in the answer, and no "(required)" marker', () => {
    const wrapper = mountSummary()
    expect(wrapper.find('.w-form__summary-answer').text()).toBe('Option A')
    expect(wrapper.text()).not.toContain('(required)')
  })

  it('shows "Skipped" for a question left unanswered', () => {
    const wrapper = mountSummary({ data: {} })
    expect(wrapper.find('.w-form__summary-answer').text()).toBe('Skipped')
    expect(wrapper.text()).not.toContain('(required)')
  })
})

describe('QuestionCardSummary: status text', () => {
  const lines = [
    ['pending', 'Submitted. Waiting for the assistant.'],
    ['running', 'The assistant is reading your answer.'],
    ['interrupted', 'The assistant stopped before answering. Send a message to continue.'],
  ] as const

  it.each(lines)('says what a %s delivery means', (delivery, text) => {
    expect(mountSummary({ delivery }).find('.w-form__status').text()).toContain(text)
  })

  it('shows no delivery line once the answer is complete, or when there is no delivery', () => {
    for (const delivery of ['complete', null] as const) {
      const status = mountSummary({ delivery }).find('.w-form__status').text()
      for (const [, text] of lines)
        expect(status).not.toContain(text)
    }
  })

  it('shows when the form was answered, and says nothing about it without a time', () => {
    expect(mountSummary().find('.w-form__status').text()).toContain('Answered')
    expect(mountSummary({ submitted_at: null }).find('.w-form__status').text()).not.toContain('Answered')
  })

  it('says a late answer was given after the conversation moved on', () => {
    expect(mountSummary({ late: true }).find('.w-form__status').text()).toContain('Late answer')
    expect(mountSummary().find('.w-form__status').text()).not.toContain('Late answer')
  })

  it('is focusable by script only (tabindex -1, not a tab stop), and focusStatus() puts focus on it', () => {
    const wrapper = mountSummary()
    const status = wrapper.find('.w-form__status')
    expect(status.attributes('tabindex')).toBe('-1')
    expect(status.attributes('part')).toBe('status')

    ;(wrapper.vm as unknown as { focusStatus: () => void }).focusStatus()
    expect(document.activeElement).toBe(status.element)
  })
})

describe('QuestionCardSummary: form description', () => {
  it('shows the form description with backticks as inline code', () => {
    const wrapper = mountSummary({ definition: { ...definition, description: 'Answers go straight to `ops`.' } })
    const description = wrapper.find('.w-form__form-description')
    expect(description.exists()).toBe(true)
    expect(description.find('code').text()).toBe('ops')
  })

  it('renders no description element when the definition has none', () => {
    expect(mountSummary().find('.w-form__form-description').exists()).toBe(false)
  })
})
