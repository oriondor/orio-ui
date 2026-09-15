---
kind: composable
category: Composables
purpose: show toast, notify user, flash message, snackbar queue, undo notification, transient alert
short: shared toast queue with per-toast position, target, timeout and actions; the module mounts the host that draws it
invariants: true
---

# useToast — agent-only invariants

`useToast()` is a module-level singleton, not a factory. Every call site
shares one queue, one timer map and one defaults object — that is what lets
`showToast()` work from a plain function with no component around it.

## Invariants

- **No container to place.** The module's client plugin mounts the host.
  See [`Toast`](../components/Toast.md) for the non-Nuxt escape hatch.
- **`showToast(options)` returns the id** — keep it if you want to
  `closeToast(id)` later (progress toasts, "connection restored").
- **`timeout: 0` means sticky**, not "instant". Any value ≤ 0 skips the
  timer entirely.
- **A stack is one position on one target.** `limit` (default 5) is
  enforced per stack, so `bottom-end` filling up never evicts a
  `top-center` toast. Overflow drops the *oldest* toast of that stack.
- **Stack identity uses the raw `target` value**, by reference. Two refs
  pointing at the same element are two stacks; the same ref is one.
- **`triggerAction(toast, action)` owns the close behavior**: it awaits
  `onClick({ close, toast })`, then closes the toast unless the action set
  `keepOpen` or the handler already called `close()`. An async handler
  keeps the toast on screen for its whole duration.
- **`showTimeout` (default `false`) only asks for the bar.** The card
  draws it from the toast's `timeout`; `timeout: 0` shows nothing. The
  host freezes a stack's bars alongside its timers on hover and focus.
- **`pauseToast` / `resumeToast` are remaining-time based**, not
  restart-based. The host calls them for every toast in a stack on
  hover and focus.
- **`setToastDefaults` mutates the shared defaults** for toasts shown
  afterwards. Already-queued toasts keep the values they were created with.

## Gotchas

- **Module-level state is per server process.** Calling `showToast()`
  during SSR would leak a toast across requests, and the host is
  client-only anyway. Queue toasts from event handlers and `onMounted`,
  never in setup body that runs on the server.
- **Tests must clear the queue.** `useToast().clearToasts()` in
  `beforeEach`, and restore defaults if the test changed them — the
  singleton survives between test cases.
- **`toasts` is a `Ref<ToastItem[]>`**, replaced wholesale on every
  change. Do not push into it; that bypasses the limit and the timers.
- **`target` is resolved at render time, not at show time.** A ref that is
  still `null` falls back to `body` and moves into the element once it
  resolves. Selector strings are resolved to their element too (so they
  get anchored like any other target); `"body"` and a selector matching
  nothing both stay on `body`.

## Quick reference

```vue
<!-- from docs/composables/use-toast.md -->
<script setup>
const { showToast } = useToast();

function deleteFile(file) {
  showToast({
    message: "File deleted",
    timeout: 0,
    actions: [
      // closes once restore() resolves
      { label: "Undo", onClick: () => restore(file) },

      // stays open
      { label: "Details", keepOpen: true, onClick: ({ close }) => openModal() },
    ],
  });
}
</script>
```

Scoped to an element:

```vue
<!-- from docs/composables/use-toast.md -->
<script setup>
const panel = ref(null);
const { showToast } = useToast();

function notifyInPanel() {
  showToast({
    message: "Saved to this panel",
    target: panel,
    position: "top-end",
  });
}
</script>

<template>
  <section ref="panel">
    <orio-button @click="notifyInPanel">Notify</orio-button>
  </section>
</template>
```
