---
kind: composable
category: Composables
purpose: fuzzy search, client-side filter, in-memory search, search-as-you-type
short: typed Fuse.js wrapper that returns a computed list of matched items (strings or objects)
invariants: false
---

# useFuzzySearch — agent-only invariants

`useFuzzySearch(dataSource, search, options?)` is a thin wrapper around
`@vueuse/integrations/useFuse`. It accepts either a `string[]` (no options)
or a `T[]` of objects (with `FuseOptions<T>`) and returns a `ComputedRef`
of matches — items only, no scores.

## Invariants

- **Two overloads**:
  - `useFuzzySearch(dataSource: MaybeRef<string[]>, search: MaybeRef<string>)`
    → matches against the strings directly.
  - `useFuzzySearch<T>(dataSource: MaybeRef<T[]>, search: MaybeRef<string>, options: FuseOptions<T>)`
    → matches against keys you specify in `options.keys`.
- **`matchAllWhenSearchEmpty: true`** is forced — when `search` is `""`,
  the returned list equals the full dataSource. No empty results on
  empty query.
- **Returns a `ComputedRef`**, so it updates as `search` or `dataSource`
  changes (when passed as refs).
- **The result is item-only**, not Fuse's `{ item, score }` records.
  Score data is not exposed — if you need it, use `useFuse` directly.

## Gotchas

- **No debouncing.** Every keystroke runs the match against the full
  dataset. For very large lists (10k+ items) or expensive options,
  debounce `search` upstream.
- **No highlighting of matched substrings.** Use `useFuse` directly if
  you need the match indices for highlighting.
- **`MaybeRef` means raw arrays work too** — but they won't be
  reactive. Wrap in `ref` / `computed` if the underlying data changes.

## Quick reference — string list

```ts
import { ref } from "vue";
import { useFuzzySearch } from "../composables/useFuzzySearch";

const query = ref("");
const colors = ["red", "green", "blue", "yellow"];
const matches = useFuzzySearch(colors, query);
```

## Quick reference — object list

```ts
interface User { id: string; name: string; email: string }
const users = ref<User[]>([...]);
const query = ref("");
const matches = useFuzzySearch(users, query, {
  keys: ["name", "email"],
  threshold: 0.3,
});
```

## Related

- `<orio-selector>` — pair with this composable + the `#options-addon`
  slot to build a filterable dropdown.
- Public API reference: `docs/composables/use-fuzzy-search.md`.
