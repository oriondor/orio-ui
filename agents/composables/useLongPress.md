---
kind: composable
category: Composables
purpose: long press detection, hold to trigger, force click, haptic touch, press and hold once
short: long-press detection on any element with move/cancel handling, Safari force click, and click swallow after trigger
invariants: true
---

# useLongPress — agent-only invariants

`useLongPress(target, options)` → `{ isPressing, isHolding }`. Fires `onTrigger` once
per press. Use `<orio-long-press>` unless you need no scale feedback.

## Invariants

- **Must run inside a component setup / effect scope** — listeners use
  `useEventListener`; timer is cleared on scope dispose.
- **Options accept refs or getters** (`MaybeRefOrGetter`) and are read on
  each press — changing `delay` affects the next press.
- **`disabled` turning true mid-press cancels** (calls `onCancel`).
- **`onCancel` is not called after a trigger.**
- **Click swallow:** one pointer `click` after a trigger is stopped in the
  capture phase on `window` (the release may land outside `target`);
  disarmed by the next pointerdown anywhere on the page — never by a timer,
  because touch browsers send the click in a later task than touchend.
  Keyboard clicks (`detail === 0`) pass. Ctrl+click never starts a press.
- **Nested targets:** first (innermost) handler claims the pointerdown.
- **Force:** `webkitmouseforcewillbegin` is `preventDefault`ed while
  `forceTouch` is on (suppresses Look Up); `webkitmouseforcedown` triggers
  with `source: "force"` only during an active press.
- **`isPressing` vs `isHolding`:** `isPressing` ends at trigger or cancel;
  `isHolding` lasts until the finger lifts (window-level pointerup, so a
  release over an overlay counts). While holding, `selectstart` and
  `contextmenu` on `target` are prevented; trigger clears any selection
  inside `target`.
- **Not `usePressAndHold`** — that one fires immediately and repeats.

## Quick reference

```ts
// from docs/composables/use-long-press.md
const target = ref<HTMLElement | null>(null);

const { isPressing, isHolding } = useLongPress(target, {
  delay: 600,
  onStart: () => log.value.unshift("start"),
  onCancel: () => log.value.unshift("cancel"),
  onTrigger: (event, source) => log.value.unshift(`trigger (${source})`),
});
```
