---
kind: composable
category: Composables
purpose: named filter group, v-bind bags for pickers, active chips, URL-synced filters, filter state
short: named filter group with v-bind bags, $-helpers, $active chips, $clearAll, optional URL sync via lazy import
invariants: true
---

# useFilter — agent-only invariants

`useFilter` defines or retrieves a **named filter group** stored in a
module-level registry. Any component that knows the `id` can read and
mutate the same reactive state — independent of the component tree.

There's a dedicated `use-filter-onboarder` subagent that owns the canonical
integration patterns. Trigger it for non-trivial setups (filter bars,
chip rows, URL-synced filters).

## Invariants

- **Two overloads**:
  - `useFilter(id, config, options?)` — defines a group.
  - `useFilter(id)` — retrieves an existing group. Throws if no group
    by that id has been defined.
- **Module-level `registry`** — calls with the same `id` return the
  same `FilterGroup` reference. Defining twice warns and returns the
  existing group (the new config is ignored).
- **`FilterDefinition.value` is both the initial value AND the
  "empty" baseline.** Used to compute `isActive` (deep `!== initial`)
  and to reset via `clear()`.
- **`structuredClone`** copies the initial values so mutating the
  returned `value` does not mutate the baseline.
- **`isEqual`** is a hand-rolled deep equality (`===` for primitives,
  recursive for arrays and plain objects). Custom classes / Date /
  Map / Set fall back to `===` → likely a false negative.
- **Each filter exposes a v-bind bag** via `filters[name]`:
  ```ts
  { modelValue, "onUpdate:modelValue": (v) => state[name] = v }
  ```
  Spread on any `v-model`-compatible component:
  `<orio-selector v-bind="filters.category" />`.
- **`filters.$.<name>`** has helpers per filter: `value`, `initial`,
  `isActive`, `clear()`.
- **`filters.$active`** is a `ComputedRef<ActiveFilter[]>` — array of
  `{ name, value, clear }` for filters whose value differs from the
  initial. Use for chip rows.
- **`filters.$clearAll()`** resets every filter to its initial value.
- **`filters.$state`** is the raw `Ref<Record<string, unknown>>` —
  serialize for API calls or persist externally.
- **URL sync (`options.url: true`)** lazy-imports `./useUrlSync`. The
  Nuxt `#imports` dep is **not** loaded unless this flag is set,
  keeping `useFilter` runnable in non-Nuxt contexts.
- **URL-synced watcher lives in a detached `effectScope`** owned by
  the registry, not by the component that defined the group — the
  watcher outlives the defining component.
- **`disposeFilter(id)`** removes the group and stops its URL-sync
  effect scope. Use in SPAs to clear page-scoped filter groups on
  route change.

## Gotchas

- **Filter names become top-level URL keys** when `url: true`.
  Collisions across multiple URL-synced groups on the same page
  silently overwrite each other.
- **`structuredClone` doesn't handle Functions, DOM nodes, or class
  instances** — passing them in `value` will throw at define time.
- **`$active` recomputes on every state change**, doing a deep
  comparison per filter. For large filter groups with deep objects,
  consider shallow representations.
- **Lazy URL sync arrives one microtask late** — the initial render
  may flash the default values before the URL values land. Acceptable
  for chips/dropdowns; not for visibly-important first paint.
- **Retrieving an undefined group throws** — always define first
  somewhere in the tree (layout / page setup) before retrieving in
  children.

## Quick reference — define + bind + chips

```ts
const filters = useFilter(
  "appointments",
  {
    category: { value: null as string | null },
    status:   { value: [] as string[] },
    dateRange:{ value: { from: null, to: null } as { from: string | null; to: string | null } },
  },
  { url: true },
);
```

```vue
<template>
  <orio-selector v-bind="filters.category" :options="categories" />
  <orio-taggable-selector v-bind="filters.status" :options="statuses" />

  <orio-tag
    v-for="active in filters.$active"
    :key="active.name"
    :text="active.name"
    variant="accent"
  />
  <orio-button v-if="filters.$active.length" @click="filters.$clearAll">
    Clear all
  </orio-button>
</template>
```

## Quick reference — retrieve elsewhere

```ts
const filters = useFilter("appointments"); // same instance
```

## Related

- `useUrlSync` — lazy-loaded when `url: true`.
- `use-filter-onboarder` subagent — canonical patterns for filter
  bars, chip rows, URL sync, and splitting filter UI across the page
  tree.
- Public API reference: `docs/composables/use-filter.md`.
