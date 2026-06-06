# useFilter

Composable for defining a named filter group whose state can be read and mutated from any component on the page — picker in the header, bar in the sidebar, anywhere.

**Mental model:**

- A **group** has an `id` and contains one or more **filters**.
- Each filter exposes a `v-model`-compatible **bind bag** — `v-bind="filters.<name>"` onto any component.
- Helpers (`clear`, `isActive`, `value`) live under `filters.$.<name>`.
- A reactive `$active` list drives "selected chips with unselect" UIs.
- `{ url: true }` lazily wires [useUrlSync](./use-url-sync.md) — the dependency is only loaded when the flag is set.

## Live Demo

<script setup>
import { useFilter } from '../../src/runtime/composables/useFilter'

const filters = useFilter('demo-appointments', {
  category:  { value: null },
  status:    { value: [] },
})

const categories = [
  { id: 'consultation', name: 'Consultation' },
  { id: 'checkup',      name: 'Checkup' },
  { id: 'follow-up',    name: 'Follow-up' },
]

const statuses = [
  { value: 'confirmed',  label: 'Confirmed' },
  { value: 'pending',    label: 'Pending' },
  { value: 'cancelled',  label: 'Cancelled' },
]

// Retrieved by id elsewhere — same instance
const remoteHandle = useFilter('demo-appointments')
</script>

### Pickers — placed anywhere

<div class="demo-container">
  <div class="demo-row" style="gap: 1rem; flex-wrap: wrap;">
    <orio-selector
      v-bind="filters.category"
      :options="categories"
      label="Category"
      placeholder="Any category"
      style="min-width: 220px;"
      option-name="name"
    />
    <orio-checkbox-group
      v-bind="filters.status"
      :options="statuses"
      label="Status"
      layout="horizontal"
    />
  </div>
</div>

### Filter bar — reads `$active`, calls `clear` per chip

<div class="demo-container">
  <div class="demo-row" style="align-items: center; gap: 0.5rem; flex-wrap: wrap;">
    <span v-if="!remoteHandle.$active.value.length" style="color: var(--vp-c-text-2)">
      Nothing selected.
    </span>
    <orio-button
      v-for="f in remoteHandle.$active.value"
      :key="f.name"
      @click="f.clear"
    >
      <strong>{{ f.name }}:</strong>
      <span>{{ Array.isArray(f.value) ? f.value.join(', ') : f.value }}</span>
      <template #icon-right>
        <orio-icon name="close" />
      </template>
    </orio-button>
    <orio-button
      v-if="remoteHandle.$active.value.length"
      variant="secondary"
      @click="remoteHandle.$clearAll"
    >
      Clear all
    </orio-button>
  </div>
</div>

<div class="demo-container">
  <p style="margin: 0; color: var(--vp-c-text-2); font-size: 0.875rem;">
    The <code>{ url: true }</code> flag is intentionally off here — its dependency on Nuxt's
    <code>useRoute</code> only matters when set. In a Nuxt app, pass it as the
    third argument and the URL will update reactively.
  </p>
</div>

<style scoped>
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.6rem;
  border-radius: var(--border-radius-lg, 999px);
  background: var(--color-surface, #f4f4f5);
  border: 1px solid var(--color-border, #e4e4e7);
  font-size: 0.875rem;
  cursor: pointer;
  font: inherit;
}
.filter-chip:hover {
  background: var(--color-surface-hover, #e4e4e7);
}
</style>

## Defining a group

```ts
const filters = useFilter("appointments", {
  category: { value: null },
  status: { value: [] as string[] },
  dateRange: { value: { from: null, to: null } },
});
```

### Mirror state to the URL

Pass `{ url: true }` as the third argument:

```ts
const filters = useFilter("appointments", config, { url: true });
```

`useUrlSync` is dynamically imported only when this flag is set — so `useFilter` works in non-Nuxt environments (tests, Storybook, VitePress demos) as long as `url` stays off. Filter names become top-level URL keys; avoid colliding names across multiple URL-synced groups on the same page.

## Retrieving the same group

Call `useFilter(id)` with no config — anywhere in the app:

```ts
const filters = useFilter("appointments");
```

If the group has not been defined yet, this throws. Define before consumers mount (e.g. at a parent component or layout level).

## Binding to components

Each filter is a `v-model`-compatible bag — spread it onto any component that supports `v-model`:

```vue
<orio-selector v-bind="filters.category" :options="categories" />
<orio-checkbox-group v-bind="filters.status" :options="statuses" />
<orio-date-range-picker v-bind="filters.dateRange" />
```

App data (options, labels, etc.) is passed on the component normally — it is **not** part of the filter config.

## Building a filter bar

Iterate `$active` — a computed list of every filter whose current value differs from its initial:

```vue
<template>
  <button v-for="f in filters.$active.value" :key="f.name" @click="f.clear">
    {{ f.name }}: {{ f.value }} &times;
  </button>

  <orio-button v-if="filters.$active.value.length" @click="filters.$clearAll">
    Clear all
  </orio-button>
</template>
```

## API reference

### `useFilter(id, config?, options?)`

| Argument  | Type                        | Description                                                                                   |
| --------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| `id`      | `string`                    | Stable identifier for the group.                                                              |
| `config`  | `Record<string, { value }>` | Map of filter name → initial value. Required on the first call for a given id.                |
| `options` | `{ url?: boolean }`         | `url: true` lazy-loads `useUrlSync` and mirrors `$state` to URL query params. Off by default. |

Returns a `FilterGroup`.

### `FilterGroup` shape

```ts
filters.<name>              // { modelValue, 'onUpdate:modelValue' } — spread with v-bind
filters.$.<name>            // { value, initial, isActive, clear }
filters.$active             // ComputedRef<{ name, value, clear }[]>
filters.$clearAll()         // reset every filter to its initial value
filters.$state              // Ref<Record<string, unknown>> — raw reactive state
```

### `disposeFilter(id)`

Removes a group from the registry. Use in SPAs where filter groups are page-scoped:

```ts
import { disposeFilter } from "orio-ui";
onBeforeUnmount(() => disposeFilter("appointments"));
```

## Caveats

- **Define before consume.** Calling `useFilter(id)` without config throws if the id is unknown. Define the group at a level that runs before any consumer.
- **No auto-cleanup.** Groups persist for the app lifetime. Call `disposeFilter(id)` manually when scoping to a route.
- **URL sync requires Nuxt.** `{ url: true }` depends on `useUrlSync`, which uses Nuxt's `#imports` for SSR-safe pre-population. The dependency is lazy-loaded, so leaving the flag off keeps `useFilter` usable outside of Nuxt.

## See also

- [useUrlSync](./use-url-sync.md) — underlying URL serialization (composed by `{ url: true }`).
