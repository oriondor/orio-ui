---
kind: composable
category: Composables
purpose: programmatic modal control, open modal from code, modal binding bag
short: returns a `modalProps` bag (show, origin, update handler) plus `openModal(event?)` that derives origin from a click target
invariants: true
---

# useModal — agent-only invariants

`useModal` returns a binding bag for `<orio-modal>` plus an `openModal`
helper that captures the click target's rect for the open-from-origin
animation. Spread `modalProps` on the Modal — no manual `v-model:show`,
no `:origin` wiring.

## Invariants

- **`modalProps` ref** has shape:
  ```ts
  {
    show: boolean;
    origin: OriginRect | null;
    "onUpdate:show": (state: boolean) => void;
  }
  ```
  Designed to be spread on `<orio-modal v-bind="modalProps">`. The
  `"onUpdate:show"` listener is wired internally so the modal's close
  button / backdrop click syncs back to the bag.
- **`OriginRect`** (exported): `{ x, y, width, height }` — derived from
  `getBoundingClientRect()` of the event target.
- **`openModal(event?)`**:
  - With an event: reads `event.target.getBoundingClientRect()` and
    sets `origin` so the modal animates from the target. Sets `show`
    to true.
  - Without an event: clears `origin` to `null` and opens with a plain
    fade.
- **No close helper** is returned — `modalProps.show = false` works, or
  use the modal's built-in close button.

## Gotchas

- **`event.target` is the clicked DOM node**, which may be a child of
  the actual button (e.g. an icon inside). The rect then comes from
  the icon, not the button — the animation origin will be tiny. To
  capture the button itself, use `event.currentTarget` semantics by
  reading the rect manually before calling `openModal`:
  ```ts
  function onClick(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    modalProps.value.origin = rect;
    modalProps.value.show = true;
  }
  ```
- **Only one modal per call site.** For multiple modals, call
  `useModal()` once per modal — they don't share state.
- **No `v-model:show`** on the returned bag — the bag uses the explicit
  `onUpdate:show` listener form because spreading an object cannot
  declare v-model sugar.

## Quick reference

```vue
<script setup lang="ts">
import { useModal } from "../composables/useModal";

const { modalProps, openModal } = useModal();
</script>

<template>
  <orio-button @click="openModal">Open</orio-button>

  <orio-modal v-bind="modalProps" title="Settings">
    <p>Modal body…</p>
  </orio-modal>
</template>
```

## Related

- `<orio-modal>` — the consumer of this bag; supports `v-model:show`
  and `origin` as plain props if you prefer manual wiring.
- Public API reference: `docs/composables/use-modal.md`.
