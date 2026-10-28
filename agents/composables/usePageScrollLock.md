---
kind: composable
category: Composables
purpose: body scroll lock, prevent page scroll under overlay, scrollbar layout shift, stacked modals lock
short: ref-counted page scroll lock shared by all callers, with scrollbar-width padding and `--orio-scrollbar-gap`
invariants: true
---

# usePageScrollLock — agent-only invariants

`usePageScrollLock(locked)` locks page scroll while `locked` is true.

**Don't call it for `<orio-modal>`** — the modal already does, internally.
Consumers only need it when building their own page-covering overlay
(custom drawer, sheet, fullscreen menu).

## Invariants

- **Ref-counted, module-level.** All callers share one counter. The first
  caller to lock locks `<body>` (one detached `useScrollLock` from
  `@vueuse/core`); the last to release unlocks it. Stacked overlays never
  unlock each other.
- **Scrollbar compensation.** On the first lock the scrollbar width is
  measured *before* locking and **added** to body's computed padding-right
  (stylesheet or inline), and set on `<html>` as `--orio-scrollbar-gap`.
  The last release restores body's original inline padding-right and
  removes the var.
  Gap 0 (no scrollbar, overlay scrollbars) → nothing is written.
- **Immediate.** Watches `locked` with `immediate: true`, so a caller
  mounted with `locked` already true locks right away.
- **Unlock after the leave animation, not on `show = false`.** Pass a ref
  that stays true until the overlay's `@after-leave`; unlocking earlier
  brings the scrollbar back mid-animation (visible jump).
- **Releases on unmount.** `onBeforeUnmount` drops this caller's hold.
  Must be called inside component `setup`.
- **Client-only.** Guarded by `typeof document`; no-op during SSR.

## Gotchas

- `position: fixed` consumer elements don't get the body padding. They
  must opt in: `padding-right: var(--orio-scrollbar-gap, 0px)`.
- Don't change body's inline padding-right while locked; the last release
  restores the value saved at lock time.
- Only `<body>` is locked. An overlay inside an inner scroll container
  does not lock that container.

## Quick reference

```ts
// from src/runtime/components/Modal.vue
import { usePageScrollLock } from "../composables/usePageScrollLock";

const show = defineModel<boolean>("show");

// keep the page locked through the close animation so the scrollbar
// doesn't pop back while the modal is still shrinking
const visible = ref(false);

watch(
  show,
  (open) => {
    if (open) visible.value = true;
  },
  { immediate: true },
);

usePageScrollLock(visible);
// template: <transition @after-leave="visible = Boolean(show)">
// after-leave also fires when reopening mid-leave; `false` would unlock an open modal
```

## Related

- `<orio-modal>` — the main caller.
