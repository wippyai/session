import type { FormDefinition } from '../lib/definition'
import { describe, expect, it, vi } from 'vitest'
import { useQuestionCard } from './use-question-card'

const singleDef: FormDefinition = {
  title: 'T',
  fields: [{
    id: 'f1',
    type: 'choice',
    label: 'Pick one',
    required: true,
    options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
    multiple: false,
    allow_other: true,
  }],
}

const multiDef: FormDefinition = {
  title: 'T',
  fields: [{
    id: 'f1',
    type: 'choice',
    label: 'Pick any',
    required: true,
    options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
    multiple: true,
    allow_other: true,
  }],
}

const twoQDef: FormDefinition = {
  title: 'T',
  fields: [
    { id: 'f1', type: 'choice', label: 'Q1', required: true, options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], multiple: false, allow_other: false },
    { id: 'f2', type: 'choice', label: 'Q2', required: false, options: [{ value: 'x', label: 'X' }, { value: 'y', label: 'Y' }], multiple: true, allow_other: false },
  ],
}

describe('useQuestionCard — single question, single answer', () => {
  it('activate() on an option immediately submits', () => {
    const onSubmit = vi.fn()
    const c = useQuestionCard(singleDef, null, onSubmit)
    c.activate(singleDef.fields[0], 0)
    expect(onSubmit).toHaveBeenCalledWith({ f1: 'a' })
  })

  it('activate() with that row\'s note editor open does not commit — it focuses the note', () => {
    const onSubmit = vi.fn()
    const c = useQuestionCard(singleDef, null, onSubmit)
    const q = singleDef.fields[0]
    c.toggleNote(q, 'a', true)
    c.activate(q, 0)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(c.focusTarget.value).toBe('note-a')
  })

  it('sendNote() answers with the note attached, trimmed', () => {
    const onSubmit = vi.fn()
    const c = useQuestionCard(singleDef, null, onSubmit)
    const q = singleDef.fields[0]
    c.setNote(q, 'a', '  extra context  ')
    c.sendNote(q, 'a')
    expect(onSubmit).toHaveBeenCalledWith({ f1: { value: 'a', note: 'extra context' } })
  })

  it('sendNote() with a blank note answers with the plain value (no note wrapper)', () => {
    const onSubmit = vi.fn()
    const c = useQuestionCard(singleDef, null, onSubmit)
    const q = singleDef.fields[0]
    c.setNote(q, 'a', '   ')
    c.sendNote(q, 'a')
    expect(onSubmit).toHaveBeenCalledWith({ f1: 'a' })
  })

  it('activate() past the last row (Other\'s slot) only focuses Other', () => {
    const onSubmit = vi.fn()
    const c = useQuestionCard(singleDef, null, onSubmit)
    const q = singleDef.fields[0]
    c.activate(q, q.options.length)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(c.focusTarget.value).toBe('other')
  })

  it('sendOther() with blank text does nothing', () => {
    const onSubmit = vi.fn()
    const c = useQuestionCard(singleDef, null, onSubmit)
    c.sendOther(singleDef.fields[0])
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('sendOther() with text submits { other }', () => {
    const onSubmit = vi.fn()
    const c = useQuestionCard(singleDef, null, onSubmit)
    const q = singleDef.fields[0]
    c.answers[q.id].other = 'my own answer'
    c.sendOther(q)
    expect(onSubmit).toHaveBeenCalledWith({ f1: { other: 'my own answer' } })
  })
})

describe('useQuestionCard — single question, several answers', () => {
  it('activate() ticks and unticks without submitting', () => {
    const onSubmit = vi.fn()
    const c = useQuestionCard(multiDef, null, onSubmit)
    const q = multiDef.fields[0]
    c.activate(q, 0)
    expect(c.ans(q).chosen).toEqual(['a'])
    expect(onSubmit).not.toHaveBeenCalled()
    c.activate(q, 0)
    expect(c.ans(q).chosen).toEqual([])
  })

  it('commit() sends the ticked answers, options first in definition order, then Other', () => {
    const onSubmit = vi.fn()
    const c = useQuestionCard(multiDef, null, onSubmit)
    const q = multiDef.fields[0]
    c.activate(q, 1)
    c.activate(q, 0)
    c.answers[q.id].other = 'plus this'
    c.commit(q)
    expect(onSubmit).toHaveBeenCalledWith({ f1: ['a', 'b', { other: 'plus this' }] })
  })

  it('sendNote() ticks the answer and saves the note without submitting', () => {
    const onSubmit = vi.fn()
    const c = useQuestionCard(multiDef, null, onSubmit)
    const q = multiDef.fields[0]
    c.setNote(q, 'b', 'note text')
    c.sendNote(q, 'b')
    expect(onSubmit).not.toHaveBeenCalled()
    expect(c.ans(q).chosen).toEqual(['b'])
    expect(c.ans(q).noteOpen).toBeNull()
  })

  it('a note left open does not block ticking a different row', () => {
    const onSubmit = vi.fn()
    const c = useQuestionCard(multiDef, null, onSubmit)
    const q = multiDef.fields[0]
    c.toggleNote(q, 'a', true)
    c.activate(q, 1)
    expect(c.ans(q).chosen).toEqual(['b'])
  })

  it('activate() on a row whose OWN note is open still ticks it (M16: was silently dropped)', () => {
    const onSubmit = vi.fn()
    const c = useQuestionCard(multiDef, null, onSubmit)
    const q = multiDef.fields[0]
    c.toggleNote(q, 'a', true)
    c.setNote(q, 'a', 'full value please')
    c.activate(q, 0) // click the row/checkbox for 'a' while its own note is still open
    expect(c.ans(q).chosen).toEqual(['a'])
    expect(c.ans(q).noteOpen).toBe('a') // the note stays open, not silently closed either
    c.answers[q.id].other = 'also a card'
    c.sendOther(q)
    expect(onSubmit).toHaveBeenCalledWith({ f1: [{ value: 'a', note: 'full value please' }, { other: 'also a card' }] })
  })
})

describe('useQuestionCard — several questions', () => {
  it('advances to the next unseen question on commit, then to review once every question is seen', () => {
    const onSubmit = vi.fn()
    const c = useQuestionCard(twoQDef, null, onSubmit)
    expect(c.index.value).toBe(0)
    expect(c.inReview.value).toBe(false)

    c.activate(twoQDef.fields[0], 0) // single-choice Q1 -> commits -> advances
    expect(c.index.value).toBe(1)
    expect(c.inReview.value).toBe(false)
    expect(onSubmit).not.toHaveBeenCalled()

    c.commit(twoQDef.fields[1]) // Q2 (optional, nothing ticked) -> still advances/seen
    expect(c.inReview.value).toBe(true)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('go() moves between questions without losing an earlier answer', () => {
    const c = useQuestionCard(twoQDef, null, vi.fn())
    c.activate(twoQDef.fields[0], 0)
    expect(c.index.value).toBe(1)
    c.go(0)
    expect(c.index.value).toBe(0)
    expect(c.ans(twoQDef.fields[0]).chosen).toEqual(['a'])
  })

  it('submitAll() is blocked while a required question is unanswered, and sends everything once complete', () => {
    const onSubmit = vi.fn()
    const c = useQuestionCard(twoQDef, null, onSubmit)
    c.go(2) // straight to the review step without answering Q1
    expect(c.missingRequired.value.map(m => m.index)).toEqual([0])
    c.submitAll()
    expect(onSubmit).not.toHaveBeenCalled()

    c.activate(twoQDef.fields[0], 0)
    expect(c.missingRequired.value).toEqual([])
    c.submitAll()
    expect(onSubmit).toHaveBeenCalledWith({ f1: 'a' })
  })

  it('answerItemsFor() reports null for an unanswered optional question and items for an answered one', () => {
    const c = useQuestionCard(twoQDef, null, vi.fn())
    expect(c.answerItemsFor(twoQDef.fields[1])).toBeNull()
    c.activate(twoQDef.fields[1], 0)
    c.commit(twoQDef.fields[1])
    expect(c.answerItemsFor(twoQDef.fields[1])).toEqual([{ label: 'X', note: undefined }])
  })
})

describe('useQuestionCard — commits an unsent multi-choice tick on navigating away (item 8)', () => {
  it('counts a ticked-but-never-sent answer as answered once the user leaves the question', () => {
    const c = useQuestionCard(twoQDef, null, vi.fn())
    c.activate(twoQDef.fields[0], 0) // Q1 (single) answers and advances to Q2
    expect(c.index.value).toBe(1)

    c.activate(twoQDef.fields[1], 0) // tick Q2's first option — no footer Send, no Enter
    expect(c.ans(twoQDef.fields[1]).chosen).toEqual(['x'])
    expect(c.answered(twoQDef.fields[1])).toBe(false) // not yet committed

    c.go(2) // navigate to review without an explicit send
    expect(c.answered(twoQDef.fields[1])).toBe(true)
    expect(c.answerItemsFor(twoQDef.fields[1])).toEqual([{ label: 'X', note: undefined }])
  })

  it('leaves a question with no ticks and no Other text as Skipped (not falsely committed)', () => {
    const c = useQuestionCard(twoQDef, null, vi.fn())
    c.activate(twoQDef.fields[0], 0)
    expect(c.index.value).toBe(1)

    c.go(2)
    expect(c.answered(twoQDef.fields[1])).toBe(false)
    expect(c.answerItemsFor(twoQDef.fields[1])).toBeNull()
  })
})

describe('useQuestionCard — review focus on a missing required answer (item 4)', () => {
  it('targets the first missing question\'s review row, not the disabled "send-all"', () => {
    const c = useQuestionCard(twoQDef, null, vi.fn())
    c.go(2) // straight to review without answering the required Q1
    expect(c.missingRequired.value.map(m => m.index)).toEqual([0])
    expect(c.focusTarget.value).toBe('review-item-0')
  })

  it('still targets "send-all" when nothing required is missing', () => {
    const c = useQuestionCard(twoQDef, null, vi.fn())
    c.activate(twoQDef.fields[0], 0) // Q1 (required, single) -> advances to Q2
    c.commit(twoQDef.fields[1]) // Q2 (optional, multi, nothing ticked) -> seen -> advances to review
    expect(c.inReview.value).toBe(true)
    expect(c.missingRequired.value).toEqual([])
    expect(c.focusTarget.value).toBe('send-all')
  })
})

describe('useQuestionCard — hydrating from a previously loaded answer', () => {
  it('reads back a plain value, a {value, note}, and an {other} shape', () => {
    const def: FormDefinition = {
      title: 'T',
      fields: [
        { id: 'plain', type: 'choice', label: 'Plain', required: false, options: [{ value: 'a', label: 'A' }], multiple: false, allow_other: false },
        { id: 'noted', type: 'choice', label: 'Noted', required: false, options: [{ value: 'a', label: 'A' }], multiple: false, allow_other: false },
        { id: 'own', type: 'choice', label: 'Own', required: false, options: [{ value: 'a', label: 'A' }], multiple: false, allow_other: true },
      ],
    }
    const c = useQuestionCard(def, { plain: 'a', noted: { value: 'a', note: 'hi' }, own: { other: 'mine' } }, vi.fn())
    expect(c.ans(def.fields[0]).chosen).toEqual(['a'])
    expect(c.ans(def.fields[1]).chosen).toEqual(['a'])
    expect(c.ans(def.fields[1]).notes.a).toBe('hi')
    expect(c.ans(def.fields[2]).useOther).toBe(true)
    expect(c.ans(def.fields[2]).other).toBe('mine')
  })
})
