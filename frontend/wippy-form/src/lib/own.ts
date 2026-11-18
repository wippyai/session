/**
 * The value a map keyed by field id holds under `key` itself, never one it
 * inherits. A field id is an agent-written string, and `constructor` is a
 * valid one (it is the one `Object.prototype` name that matches the id pattern
 * `^[a-z][a-z0-9_]*$`), so a plain `map[id]` on a map without that id would
 * read the inherited `Object` function. Maps keyed by option values, which can
 * be any text, are `Map`s instead.
 *
 * The key is read before the own-key test, and always: on a Vue reactive map
 * the read is what tracks the key (`Object.hasOwn` is not tracked), so a key
 * added later still updates what read it while it was missing.
 */
export function ownValue<T>(map: Readonly<Record<string, T>> | null | undefined, key: string): T | undefined {
  if (map === null || map === undefined)
    return undefined
  const value = map[key]
  return Object.hasOwn(map, key) ? value : undefined
}
