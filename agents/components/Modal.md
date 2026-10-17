---
kind: component
category: Layout & containers
purpose: modal, dialog, popup overlay, lightbox
short: teleported overlay dialog with open-from-origin animation
invariants: true
---

# Modal — agent-only invariants

`<orio-modal>` is the teleported overlay dialog.

## Invariants

- **Teleported to `<body>`.** Renders outside the parent DOM subtree. Any
  CSS that targets `.modal` from a parent will not apply; scope styles via
  `:deep()` from a parent or write global styles.
- **`origin` prop drives the open animation.** Pass the `getBoundingClientRect`
  of the element that triggered the open (e.g. the clicked button) to
  animate the modal **from** that rect to centered. Pass `null` to fade in
  at center with no scale-from.
- **`v-model:show`** controls visibility. Backdrop click closes (`@click.self`
  on the overlay). The default close button (rendered when no `header`
  slot is supplied) also toggles `show`.
- **Body scroll lock** is applied automatically while `show` is true, via
  `useScrollLock` from `@vueuse/core`. SSR-safe: ref defaults to `false`
  on the server.
- **Header/footer are auto-hidden** when no `title` prop and no
  `#header`/`#footer` slot is present. The content section (`#default`)
  always renders.

## Gotchas

- Multiple modals stacked at once will all lock body scroll; closing one
  releases the lock for all. If you nest modals, manage the lock yourself.
- `origin`'s `width` / `height` should be the trigger's rendered size, not
  the modal's. Open is a FLIP: the modal measures its own laid-out rect,
  jumps onto `origin` (translate + non-uniform scale, `transform-origin:
  top left`), then transitions to `transform: none`. Close reverses it:
  shrinks back onto `origin` and fades at the tail, so keep `origin` set
  until the modal has closed. Wrong size = visible jump.
- The overlay transition fades only the backdrop (`background`,
  `backdrop-filter`), never `opacity` — fading the overlay would hide the
  modal mid-morph. Leave completes on the overlay's own `transitionend`.
- `prefers-reduced-motion: reduce` skips the morph (plain 0.15s fade).
  The transition has `appear`, so mounting with `show` already true
  still plays the enter hook.
- The component writes `style.transform`, `style.transition` and
  `style.opacity` inline on the wrapper. Do not animate them from outside;
  the component overwrites them on every open.

## Quick reference

```vue
<script setup lang="ts">
import { ref } from "vue";
const open = ref(false);
const origin = ref<DOMRect | null>(null);

function trigger(event: MouseEvent) {
  origin.value = (event.currentTarget as HTMLElement).getBoundingClientRect();
  open.value = true;
}
</script>

<template>
  <orio-button @click="trigger">Open settings</orio-button>

  <orio-modal v-model:show="open" :origin="origin" title="Settings">
    <p>Modal body…</p>
    <template #footer>
      <orio-button @click="open = false">Done</orio-button>
    </template>
  </orio-modal>
</template>
```

## Related

- `useModal` composable — programmatic open/close API without managing
  `show` yourself. See `docs/composables/use-modal.md`.
