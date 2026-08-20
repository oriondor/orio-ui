---
kind: component
category: Media & misc
purpose: carousel, image slider, gallery, lightbox slider, image viewer
short: image carousel with swipe gestures, prev/next buttons, dynamic sizing, and per-image slot
invariants: true
---

# gallery/Carousel — agent-only invariants

`<orio-gallery-carousel>` cycles through a list of images with swipe and
prev/next buttons. Pair it with `<orio-gallery-carousel-preview>` for a
thumbnail strip that binds to the same `activeImage` model.

## Invariants

- **v-model name is `activeImage`** and the type is `string` (the image
  URL or id), **not** an index. Bind via `v-model:active-image="..."`.
- **`size` prop is a `"W:H"` string** parsed as `width:height` in
  pixels:
  - `"400:550"` → fixed 400×550.
  - `"400:"` (empty after colon) → fixed width, **dynamic height** —
    measured from the slot content via a hidden `.carousel-measure`
    container.
  - `":550"` → fixed height, dynamic width.
- **`fit`**: `"contain"` (default), `"fill"`, `"cover"`, `"scale-down"`.
  Applied as `object-fit` to the inner image via `v-bind(fit)` CSS
  binding.
- **`appearance`**: `"default"` (border + background) or `"minimal"` (no
  border, no background; prev/next buttons appear only on hover).
- **Swipe threshold is 10px** of horizontal pointer movement. Drag-right
  → `previousImage`, drag-left → `nextImage`. Below threshold = no
  change.
- **Looping is implicit.** `nextImage` past the last → first, `previousImage`
  before the first → last. No flag to disable.
- **Only 3 items are visible at once**: previous (translated −100%),
  active (0), next (translated +100%). All others have `opacity: 0;
  pointer-events: none`.
- **`#image` slot** overrides the default `<img>` render. Receives `{ image }`.
  Use for videos, captions, complex viewer markup. Slotted content is
  also rendered into the hidden measure container when `size` has a
  dynamic dimension.
- **Auto-init on mount**: if `activeImage` is unbound or empty, it is
  set to `images[0]`.
- **Switch buttons only render when `images.length > 1`.**
- **Transitions**: opacity + transform, 0.5s ease-in-out.
- **`max-height` clamp**: when both dimensions are fixed, the carousel
  scales down to `carouselWidth / aspectRatio` to respect the parent
  width while preserving the aspect.

## Gotchas

- **Image URLs must be unique** — they are used as v-for keys and the
  active-image model. Duplicate URLs collapse to one logical slide.
- **No keyboard arrow nav.** Swipe + click only. Add `@keydown` on a
  parent if needed.
- **Switch buttons use `mix-blend-mode: difference`** on supporting
  browsers (not Safari) to remain visible over any image. Custom themes
  may need to override the `.switch-button :deep(.icon)` styles.
- **Dynamic sizing causes a one-frame measurement flicker** while the
  hidden measure container resolves. For non-changing content, prefer a
  fixed `size` like `"400:550"`.
- **The carousel `<img>` has `alt="image-url"`** by default — visually
  fine but bad for accessibility. Override via `#image` slot to render
  proper alt text.

## Quick reference

```vue
<script setup lang="ts">
const images = [
  "/photos/1.jpg",
  "/photos/2.jpg",
  "/photos/3.jpg",
];
const active = ref(images[0]);
</script>

<template>
  <orio-gallery-carousel
    v-model:active-image="active"
    :images="images"
    size="600:"
    fit="contain"
  />
  <orio-gallery-carousel-preview
    v-model:active-image="active"
    :images="images"
  />
</template>
```

## Related

- `<orio-gallery-carousel-preview>` — thumbnail strip bound to the same
  active-image model.
- `<orio-modal>` — wrap a carousel for lightbox viewing.
- Public API reference: `docs/components/gallery/`.
