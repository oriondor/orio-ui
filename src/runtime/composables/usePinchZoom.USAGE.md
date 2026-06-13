---
kind: composable
category: Composables
purpose: pinch-to-zoom, two-finger touch zoom, pinch gesture
short: touch-only pinch handler that tracks up to 2 pointers and exposes scale factor, midpoint, and midpoint delta
invariants: true
---

# usePinchZoom — agent-only invariants

`usePinchZoom(callbacks)` tracks **touch** pointers (up to 2) and emits a
`scaleFactor` for two-finger gestures plus delegate callbacks for single-
finger phases. The consumer wires the returned handlers to pointer events.

## Invariants

- **Touch-only.** `onPointerDown` returns `false` for non-touch (mouse,
  pen) events. Mouse zoom needs separate wheel handling.
- **Tracks at most 2 pointers.** A third touch is ignored.
- **Callback shape**:
  - `onPinchStart()` — fires when the second pointer goes down.
  - `onPinchMove(scaleFactor, midX, midY, dx, dy)` — fires on each
    two-finger move:
    - `scaleFactor` = `currentDistance / startDistance` (cumulative
      since pinch start).
    - `midX`, `midY` = current viewport-coord midpoint between fingers.
    - `dx`, `dy` = delta of the midpoint since the last move (for
      pan-during-pinch).
  - `onSingleDown(event)` — fires when the FIRST pointer goes down.
  - `onSingleUp(remainingId, x, y)` — fires when one of two pointers
    lifts, leaving one behind. Pass these to the caller's single-
    pointer drag logic.
  - `onAllUp()` — fires when the last pointer lifts.
- **Pointer capture is set on `event.currentTarget`** for every down.
  The consumer must wire `onPointerDown` to a real element so capture
  works.
- **`scaleFactor` is relative to pinch-start distance**, not the
  previous frame. Multiply the consumer's "baseline scale at pinch
  start" by `scaleFactor` to derive the new scale.
- **`startDist` resets** when pointer count drops from 2 → 1 or 0.
- **`pointers` is an exposed `Map`** keyed by pointerId — read it for
  debugging.

## Gotchas

- **Single-pointer drag is the consumer's responsibility.** The
  composable only signals down/up; you wire the actual move handling
  outside.
- **No pinch-axis lock.** Both x and y midpoint changes flow through;
  diagonal pinch produces both zoom and pan. Filter in
  `onPinchMove` if you want zoom-only.
- **`scaleFactor` can exceed sensible ranges** on fast pinches. Clamp
  upstream (e.g. against `minScale` / `maxScale`).
- **PointerType check is exact `"touch"`.** Microsoft Surface pen
  inputs and Apple Pencil have `pointerType: "pen"` — those won't
  pinch via this composable.

## Quick reference

```ts
import { usePinchZoom } from "../composables/usePinchZoom";

let baseScale = 1;
const scale = ref(1);
const tx = ref(0);
const ty = ref(0);

const pinch = usePinchZoom({
  onPinchStart() { baseScale = scale.value; },
  onPinchMove(scaleFactor, midX, midY, dx, dy) {
    scale.value = baseScale * scaleFactor;
    tx.value += dx;
    ty.value += dy;
    // (also re-anchor scale around midpoint here)
  },
  onSingleDown(event) { /* hand off to single-pointer drag */ },
  onSingleUp(id, x, y) { /* resume drag tracking on remaining finger */ },
});
```

```vue
<template>
  <div
    @pointerdown="pinch.onPointerDown"
    @pointermove="pinch.onPointerMove"
    @pointerup="pinch.onPointerUp"
  />
</template>
```

## Related

- `<orio-zoomable-container>` — uses this for touch pinch.
- `<orio-canvas>` — same.
- Public API reference: `docs/composables/use-pinch-zoom.md`.
