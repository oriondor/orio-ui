---
kind: composable
category: Composables
purpose: long-press detection, press-and-hold, auto-repeat, mousedown-hold ramp
short: fires a callback once immediately, then repeats every 50 ms after a 500 ms hold
invariants: true
---

# usePressAndHold — agent-only invariants

`usePressAndHold()` returns `{ pressAndHold, stop }` for press-and-hold
auto-repeat. Used by `<orio-number-input-horizontal>` and
`<orio-number-input-vertical>` to ramp values while a spinner button is
held.

## Invariants

- **`pressAndHold(callback)` calls the callback once immediately**, then
  starts a 500 ms timeout. After 500 ms, it begins calling the callback
  every 50 ms via `setInterval`.
- **`stop()` clears both the pending timeout and the active interval.**
  Always call on `mouseup`, `mouseleave`, and `pointercancel` — leaks
  fire forever otherwise.
- **No reactivity, no state ref.** Just two functions. The internal
  refs hold `setTimeout` / `setInterval` IDs only.
- **No press duration / counter.** The composable only knows
  "callback fires." Track elapsed time in the callback if needed.

## Gotchas

- **Timer leaks if `stop()` isn't called.** Common pitfall: forgetting
  to wire `@mouseleave` means a user dragging off the button leaves
  the interval running.
- **Touch behavior is not handled.** `@mousedown` does fire on touch
  in most browsers but not all. For reliable mobile press-and-hold,
  consider also wiring `@touchstart` / `@touchend`.
- **Re-entrancy not guarded.** Calling `pressAndHold(fn)` while a
  previous press is active will create overlapping timers. Always
  `stop()` before starting a new one.
- **Fixed timing (500 ms delay, 50 ms repeat).** Not configurable. Fork
  if you need different cadence.

## Quick reference

```vue
<script setup lang="ts">
import { usePressAndHold } from "../composables/usePressAndHold";

const { pressAndHold, stop } = usePressAndHold();

let count = ref(0);
function increment() { count.value += 1; }
</script>

<template>
  <button
    @mousedown="pressAndHold(increment)"
    @mouseup="stop"
    @mouseleave="stop"
  >
    +1 ({{ count }})
  </button>
</template>
```

## Related

- `<orio-number-input-horizontal>` — uses this for ± buttons.
- `<orio-number-input-vertical>` — uses this for chevron buttons.
- Public API reference: `docs/composables/use-press-and-hold.md`.
