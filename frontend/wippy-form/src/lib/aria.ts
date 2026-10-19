/** Joins the ids that apply into one `aria-describedby` value, or returns `undefined` when none does. */
export function joinIds(...ids: Array<string | false | null | undefined>): string | undefined {
  return ids.filter(Boolean).join(' ') || undefined
}
