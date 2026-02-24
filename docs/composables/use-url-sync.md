# useUrlSync

Syncs a reactive state object to/from URL query params, bidirectionally and SSR-safe.

**On call (sync):** reads the current URL and pre-populates state before any child mounts — no flash of defaults on page load or after a hard refresh.

**Reactively:** watches state and updates the URL on every change via `router.replace` (no new history entries).

## Usage

```ts
const filters = ref({
  search: '',
  sort: 'newest',
  price: { min: 0, max: 500 },
})

useUrlSync(filters)
```

Pass an explicit key list to avoid accidentally syncing internal or non-serialisable state:

```ts
const state = ref({
  category: '',
  sort: 'newest',
  _sessionToken: 'abc123', // never touches the URL
})

useUrlSync(state, ['category', 'sort'])
```

## Encoding

| Value | URL |
| ----- | --- |
| `{ price: { min: 10, max: 500 } }` | `price.min=10&price.max=500` |
| `{ tags: ['vue', 'ts'] }` | `tags[0]=vue&tags[1]=ts` |
| `{ items: [{ name: 'Alice' }] }` | `items[0].name=Alice` |
| empty string | removed from URL |
| `File` / `Blob` | silently skipped |

## Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `state` | `Ref<Record<string, unknown>>` | Reactive object to sync |
| `keys` | `string[]` | Top-level keys to sync. Omit to sync all keys in state / URL |

Returns `void`.
