import { describe, expect, it } from 'vitest'
import { computed, reactive } from 'vue'
import { ownValue } from './own'

describe('ownValue', () => {
  it('reads a key the map holds itself', () => {
    expect(ownValue({ constructor: 'x', a: 1 }, 'constructor')).toBe('x')
    expect(ownValue({ a: 1 }, 'a')).toBe(1)
  })

  it('never reads an inherited member', () => {
    expect(ownValue({}, 'constructor')).toBeUndefined()
    expect(ownValue({}, 'toString')).toBeUndefined()
    expect(ownValue(null, 'constructor')).toBeUndefined()
    expect(ownValue(undefined, 'a')).toBeUndefined()
  })

  it('updates what read a missing key of a reactive map once the key is added', () => {
    const key: string = 'constructor'
    const map = reactive<Record<string, string>>({})
    const read = computed(() => ownValue(map, key) ?? 'none')
    expect(read.value).toBe('none')
    map[key] = 'set'
    expect(read.value).toBe('set')
  })
})
