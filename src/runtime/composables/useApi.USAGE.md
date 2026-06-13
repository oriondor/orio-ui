---
kind: composable
category: Composables
purpose: fetch, API client, HTTP request, JSON fetch
short: thin typed wrapper around ofetch's `$fetch` for GET/POST/PUT/DELETE/PATCH requests
invariants: false
---

# useApi — agent-only invariants

`useApi` is a typed async function (not a reactive composable) that
wraps `ofetch`'s `$fetch`. It returns a `Promise<T>` — no loading/error
refs, no Vue lifecycle.

## Invariants

- **Not a Vue composable.** It is a plain typed async function, safe to
  call anywhere — outside `setup`, inside event handlers, in route
  middleware.
- **Two overloads**: `useApi<T>(url)` for GET, `useApi<T>(url, options)`
  for everything else.
- **`ApiOptions`** fields:
  - `method`: `"GET"` (default), `"POST"`, `"PUT"`, `"DELETE"`, `"PATCH"`.
  - `body`: `Record<string, unknown>` — JSON object. Not FormData, not
    a string.
  - `query`: `Record<string, unknown>` — appended as query params.
  - `signal`: `AbortSignal` for cancellation.
- **Return type is `T`** — pass the generic for type safety. Without
  it, you get `unknown`.

## Gotchas

- **No retry, no caching, no de-dupe.** Bring `@tanstack/vue-query` or
  similar if you need those.
- **`body` does not handle non-JSON payloads.** For file uploads,
  use `fetch` directly or extend the composable.
- **Errors throw.** Wrap calls in try/catch — `ofetch` throws on non-2xx
  responses.

## Quick reference

```ts
import { useApi } from "../composables/useApi";

interface User { id: string; name: string }

const user = await useApi<User>("/api/users/123");

const created = await useApi<User>("/api/users", {
  method: "POST",
  body: { name: "Vlad" },
});

const controller = new AbortController();
const results = await useApi<User[]>("/api/users", {
  query: { search: "vl" },
  signal: controller.signal,
});
controller.abort(); // cancels the request
```

## Related

- Public API reference: `docs/composables/use-api.md` (if present).
