---
kind: component
category: Layout & containers
purpose: pinch/scroll zoom viewport, pan-zoom canvas, infinite board, image inspector
short: pan + pinch/wheel zoom viewport with inertia, momentum, space-to-grab and bounds clamping
invariants: true
---

# ZoomableContainer — agent-only invariants

`<orio-zoomable-container>` is a pan-zoom viewport that transforms a "world"
(its slot) inside a fixed-size viewport. Pinch on touch, ctrl/cmd+wheel on
mouse, drag-to-pan with space-or-middle-button.

## Invariants

- **Viewport sizes to its parent.** The viewport is `width: 100%; height:
  100%`. **A parent with explicit dimensions is required** — without it,
  the viewport collapses to 0 and nothing is visible.
- **World is the slot.** It is `position: absolute; transform-origin: 0 0`.
  The container measures it via `ResizeObserver`, so the slot can be any
  size — fixed, content-driven, or dynamic.
- **First-mount auto-center is one-shot.** Once viewport and world both
  have non-zero dimensions, the world centers exactly once. Later size
  changes call `applyBounds` only — they do **not** re-center. Use the
  exposed `centerWorld()` to re-center on demand.
- **Drag-to-pan needs space, middle button, OR clicking the viewport background.**
  Pointer-down on slot content does **not** pan by default. Hold `Space`
  (cursor becomes `grab`/`grabbing`) or click an area outside the world to
  pan. This is `shouldPan(e)` — confirm interactive children inside the
  slot stop propagation if needed.
- **Touch gestures use `usePinchZoom`**, mouse/pen uses pointer-capture
  drag. Wheel does pan; **ctrl/cmd + wheel** zooms at cursor; **shift +
  vertical wheel** pans horizontally.
- **`v-model:scale` works; `v-model:translate` does NOT.** `update:scale`
  emits one value, but `update:translate` emits `(x, y)` as two args — not
  a tuple. Bind a callback to read translate, or read it via `ref` on the
  exposed `tx`/`ty`.
- **Exposed methods (via `defineExpose`)**: `scale`, `tx`, `ty`,
  `setScaleAt(target, px, py)`, `panBy(dx, dy)`, `resetView()`,
  `centerWorld()`. Get a `ref` on the component to call them.
- **Pan bounds let the world drift halfway off either edge.** Clamp is
  `tx ∈ [vw/2 − worldW, vw/2]`, so the world can move until its trailing
  edge reaches viewport center. Intentional — keeps something always
  reachable.
- **`touch-action: none` and `user-select: none`** are set on the viewport.
  Children inside cannot select text or trigger native touch scrolling.
- **Context menu is suppressed** inside the viewport (`@contextmenu.prevent`).
- **Global keydown listener for Space.** `useEventListener("keydown", ...)`
  binds to `document`, so holding space in a text input elsewhere on the
  page still flips `spaceHeld` — be aware when composing with form inputs.

## Gotchas

- **Slot prop shape**: `<template v-slot="{ scale, tx, ty }">`. Use these
  for overlays that need to track the world transform (rulers, minimaps).
- **No `v-model:translate` shortcut.** Wire it as
  `@update:translate="(x, y) => { ... }"`.
- **Pinch zoom resets `dragId` on `onPinchStart`** to cancel any in-flight
  single-pointer drag. If you mix touch + pen on a hybrid device, the drag
  state can drop mid-gesture.
- **`zoomSpeed` is exponential**, not linear. `factor = exp(-deltaY *
  zoomSpeed)`. Default `0.0015` is tuned for typical mousewheel deltas;
  trackpad wheel events with tiny deltas barely zoom — bump to ~0.005 if
  your audience is trackpad-heavy.
- **`minScale` / `maxScale` are clamped, not normalized.** Setting
  `initialScale` outside the range still applies the clamp on the first
  zoom interaction.

## Quick reference

```vue
<script setup lang="ts">
import { ref, useTemplateRef } from "vue";

const board = useTemplateRef<{ resetView: () => void; centerWorld: () => void }>("board");
const scale = ref(1);
const translate = ref({ x: 0, y: 0 });
</script>

<template>
  <div style="width: 100%; height: 80vh">
    <orio-zoomable-container
      ref="board"
      v-model:scale="scale"
      :min-scale="0.25"
      :max-scale="4"
      @update:translate="(x, y) => (translate = { x, y })"
    >
      <template #default="{ scale: worldScale }">
        <div class="board-world" :style="{ width: '2000px', height: '1500px' }">
          <p>Zoom: {{ worldScale.toFixed(2) }}×</p>
        </div>
      </template>
    </orio-zoomable-container>
  </div>

  <orio-button @click="board?.resetView()">Reset</orio-button>
</template>
```

## Related

- `usePinchZoom` — pinch gesture composable used internally.
- `useInertia` — momentum/decay used for release-after-drag.
- `<orio-canvas>` — when you need a tool-driven editor, not just a pan-zoom
  viewport. Canvas is built on the same gestures with extras.
- Public API reference: `docs/components/zoomable-container.md`.
