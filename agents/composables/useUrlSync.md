---
kind: composable
category: Composables
purpose: sync state to URL query params, URL-backed state, persist state in URL, shareable URL state
purpose-extras: filter URL persistence, query params sync
short: bidirectional sync between a reactive object and URL query params; SSR-safe initial read, client-only writes
invariants: true
---

# useUrlSync — agent-only invariants

`useUrlSync(state, keys?)` keeps a reactive `Record<string, unknown>` in
sync with the URL's query string. Nuxt-only (depends on `#imports`'s
`useRoute`).

## Invariants

- **Initial population is synchronous and SSR-safe.** Reads `useRoute().query`
  (populated by Nuxt from the request URL on the server) and writes
  matching keys into `state.value` before child components mount —
  no hydration mismatch.
- **Reactive writes are client-only.** Uses
  `useUrlSearchParams('history')` which only writes to
  `window.location`. On the server the watcher never fires.
- **`keys` is optional but recommended.**
  - When omitted: initial population pulls *all* top-level keys
    currently in the URL; ongoing sync watches *all* keys in
    `state.value`. Easy to leak unrelated state into the URL.
  - When provided: only listed keys go in either direction.
- **Serialization conventions**:
  - Plain values: `?key=value`.
  - Nested objects: dot notation (`filters.category=shirts`).
  - Arrays: bracket notation (`tags[0]=cats&tags[1]=dogs`).
  - Combinations: mixed (`items[0].name=John`).
  - `File` / `Blob` values: **silently skipped** (not serializable).
  - Empty strings: **removed** from the URL.
- **URL writes use `router.replace`-like semantics** (via
  `useUrlSearchParams` `'history'` mode) — no new browser history
  entry. Back button still goes to the previous page, not the
  previous filter state.
- **Watcher key**: the composable serializes only the synced keys to a
  primitive string for cheap diffing — avoids deep-equality on File
  arrays.
- **Flatten/unflatten helpers** live in `utils/urlParams`. Forming the
  same dot/bracket conventions from outside requires going through
  those helpers, not building strings manually.

## Gotchas

- **Nuxt-only**: imports `useRoute` from `#imports`. Will not run in a
  Vite/Vue-only consumer without Nuxt's auto-import config or a
  manual shim.
- **No two-way URL-changes-update-state listener.** This composable
  flows state → URL, not URL → state, after the initial read. Back /
  forward navigation does not re-populate the state.
- **`keys` omitted = global sync.** Local UI state (open/close flags,
  hover, cursor positions) accidentally listed in `state` will land in
  the URL. Always pass an explicit `keys` array unless `state` IS the
  URL state.
- **Top-level key matching includes dotted and bracketed children**:
  `key === "filter"` matches `filter`, `filter.tag`, `filter[0]`.
- **`File` values are dropped**: the user-visible behavior is "I added
  a file then the URL didn't update". By design, but surprising.

## Quick reference

```ts
import { ref } from "vue";
import { useUrlSync } from "../composables/useUrlSync";

const filters = ref({
  category: "",
  tags: [] as string[],
  sort: "newest",
});

// Sync only the listed keys — recommended.
useUrlSync(filters, ["category", "tags", "sort"]);
```

```ts
// State IS the URL state — sync all keys.
const properties = ref<Record<string, string | File[]>>({});
useUrlSync(properties);
```

## Related

- `useFilter` — wraps this for filter groups; pass `urlSync: true`.
- `utils/urlParams` — `flattenParams`, `unflattenParams`, `topLevelKeys`.
- Public API reference: `docs/composables/use-url-sync.md`.
