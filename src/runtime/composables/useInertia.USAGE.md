---
kind: composable
category: Composables
purpose: inertia, momentum decay for gestures, fling-and-decelerate, momentum scroll
short: post-drag momentum loop that calls a tick callback with decaying velocity each frame
invariants: true
---

# useInertia — agent-only invariants

`useInertia(onTick, options?)` runs a `requestAnimationFrame` loop that
decays velocity by `friction` each frame and calls `onTick(vx, vy)`. The
consumer applies the delta to its own state (pan offset, scroll, etc.).

## Invariants

- **`onTick(dx, dy)`** is called every frame while velocity exceeds
  `minVelocity` (default `0.5`). The consumer is responsible for
  applying the delta to its state.
- **`friction` defaults to `0.92`** — velocity multiplier per frame.
  Lower = quicker decay.
- **`trackMove(dx, dy)`** must be called on every pointermove during
  the drag — it captures the velocity from the delta and time since
  the last call (`16 / dt` factor to normalize to ~60fps).
- **`resetTime()`** must be called at drag start (and on
  resume-after-release) so the first `trackMove` doesn't compute a
  velocity from a stale timestamp.
- **`release()`** must be called on drag end. It starts the inertia
  loop only if:
  - The last `trackMove` was less than 50ms ago, AND
  - The captured velocity exceeds `minVelocity`.
  Otherwise it does nothing — slow / paused releases don't fling.
- **`stop()`** cancels any in-flight inertia and zeroes velocity. Call
  it on a new pointer-down to interrupt momentum.
- **Time-gap larger than 100ms in `trackMove` resets velocity to 0** —
  catching a pause mid-drag prevents a stale fling on release.

## Gotchas

- **The composable owns no DOM**. It's just math + RAF. The consumer
  must wire `trackMove` to `pointermove`, `release` to `pointerup`,
  `stop` to new `pointerdown`, `resetTime` to drag-start.
- **Velocity units are "pixels per ~16ms frame"** because of the
  `16 / dt` normalization. The `onTick` deltas can be directly applied
  to translate values without further scaling.
- **No max-velocity clamp.** Very fast flings produce very fast inertia
  — clamp upstream if needed.
- **No multi-axis independence**: friction is symmetric. To decay axes
  at different rates, scale `dx` / `dy` inside `onTick`.

## Quick reference

```ts
import { useInertia } from "../composables/useInertia";

const tx = ref(0);
const ty = ref(0);

const inertia = useInertia(
  (dx, dy) => {
    tx.value += dx;
    ty.value += dy;
  },
  { friction: 0.9, minVelocity: 0.3 },
);

function onPointerDown() { inertia.stop(); inertia.resetTime(); }
function onPointerMove(dx: number, dy: number) {
  tx.value += dx;
  ty.value += dy;
  inertia.trackMove(dx, dy);
}
function onPointerUp() { inertia.release(); }
```

## Related

- `<orio-zoomable-container>` — uses this for post-pan momentum.
- `<orio-canvas>` — same.
- Public API reference: `docs/composables/use-inertia.md`.
