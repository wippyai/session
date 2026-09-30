import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import QuestionCardAnswerItems from './question-card-answer-items.vue'

// A multi-line "Own answer" (the Other textarea allows Shift+Enter) must
// not collapse onto one line in the review step and the answered card,
// even though the stored value keeps the "\n". Both surfaces render
// through this shared component, so the fix belongs here.
describe('QuestionCardAnswerItems — an own (Other) answer keeps its line breaks', () => {
  it('renders a <br> between lines instead of collapsing them onto one line', () => {
    const wrapper = mount(QuestionCardAnswerItems, {
      props: { items: [{ label: 'text me\nafter 6', own: true }] },
    })

    expect(wrapper.text()).toContain('text me')
    expect(wrapper.text()).toContain('after 6')
    expect(wrapper.find('br').exists()).toBe(true)
    // The line break is a real element, not collapsed whitespace in one
    // text node — innerHTML shows the two lines split around a <br>.
    expect(wrapper.html()).toMatch(/text me<br[^>]*>after 6/)
  })

  it('a single-line own answer renders with no <br>', () => {
    const wrapper = mount(QuestionCardAnswerItems, {
      props: { items: [{ label: 'call after 6 pm', own: true }] },
    })
    expect(wrapper.find('br').exists()).toBe(false)
    expect(wrapper.text()).toContain('call after 6 pm')
  })

  it('a chosen option (not own) still renders normally, with its note intact', () => {
    const wrapper = mount(QuestionCardAnswerItems, {
      props: { items: [{ label: 'Courier', note: 'leave at the door' }] },
    })
    expect(wrapper.text()).toContain('Courier')
    expect(wrapper.text()).toContain('leave at the door')
  })
})
