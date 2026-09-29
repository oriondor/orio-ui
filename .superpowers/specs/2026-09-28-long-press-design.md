# LongPress — design

Date: 2026-09-28
Status: draft, awaiting review

## Goal

A wrapper component that makes any element respond to a **long press**
(press and hold) — the web analogue of Apple's Haptic Touch. It gives visual
feedback while held (element scales down), then emits `trigger`. The consumer
decides what the trigger does (open a modal, popover, context menu, …).

On macOS Safari with a Force Touch trackpad, a **force click** fires the
trigger immediately, as a progressive enhancement.

## Browser support findings

| Platform | Pressure available | Mechanism |
|---|---|---|
| macOS Safari + Force Touch trackpad | yes | `webkitmouseforcewillbegin`, `webkitmouseforcedown`, `webkitmouseforceup`, `webkitmouseforcechanged` (`event.webkitForce`) |
| Chrome / Firefox / Edge (any OS) | no | `PointerEvent.pressure` is a fixed `0.5` for mouse/trackpad while pressed |
| iOS Safari | no (current devices) | `Touch.force` only on legacy 3D Touch hardware; Haptic Touch is a long press |
| Android | no | long press |

Therefore: **time-based hold is the baseline everywhere; force click is
Safari-only and only shortens the wait.**

## Public API

### Component: `<orio-long-press>`

File: `src/runtime/components/LongPress.vue`

Usage (default slot only, no `#wrapping`):

```vue
<orio-long-press @trigger="openModal">
  <orio-button>Hold me</orio-button>
</orio-long-press>
```

Props (`interface LongPressProps`, `withDefaults`):

| prop | type | default | purpose |
|---|---|---|---|
| `delay` | `number` (ms) | `500` | hold time before `trigger` |
| `scale` | `number` | `0.95` | scale reached at the moment of trigger |
| `forceTouch` | `boolean` | `true` | Safari force click triggers immediately and suppresses Look Up |
| `disabled` | `boolean` | `false` | no feedback, no events; children still receive normal clicks |
| `moveTolerance` | `number` (px) | `10` | pointer movement beyond this cancels the press |

Emits:

| event | payload | when |
|---|---|---|
| `trigger` | `(event: PointerEvent \| MouseEvent, source: LongPressSource)` | hold reached `delay`, or force click |
| `pressStart` | `(event: PointerEvent)` | primary pointer went down |
| `pressCancel` | `()` | press ended without triggering (release, move, leave, pointercancel) |

`export type LongPressSource = "hold" | "force";` — exported from the
composable file and re-exported from the component.

Passing the original event keeps `@trigger="openModal"` working with
`useModal`, which reads the origin rect from `event.target`.

### Composable: `useLongPress`

File: `src/runtime/composables/useLongPress.ts`

```ts
useLongPress(target: MaybeRefOrGetter<HTMLElement | null | undefined>, {
  delay?: MaybeRefOrGetter<number>,          // 500
  moveTolerance?: MaybeRefOrGetter<number>,  // 10
  forceTouch?: MaybeRefOrGetter<boolean>,    // true
  disabled?: MaybeRefOrGetter<boolean>,      // false
  onStart?: (event: PointerEvent) => void,
  onCancel?: () => void,
  onTrigger: (event: PointerEvent | MouseEvent, source: LongPressSource) => void,
}): { isPressing: Readonly<Ref<boolean>> }
```

The composable owns all behavior end to end; the component only maps
props/emits and renders the scale feedback.

## Behavior

State per press: `pressing` (bool), `triggered` (bool), start position, timer.

1. **pointerdown** (primary button only: `event.button === 0`, `isPrimary`):
   ignored when `disabled`. Record start position, set `pressing = true`,
   `triggered = false`, start `delay` timer, call `onStart`.
2. **pointermove**: if distance from start ≥ `moveTolerance` → cancel.
3. **pointerup / pointerleave / pointercancel** before trigger → cancel.
   After trigger → just reset state.
4. **Timer fires**: `triggered = true`, `pressing = false`,
   `onTrigger(downEvent, "hold")`, arm click swallow.
5. **Safari force** (only when `forceTouch`):
   - `webkitmouseforcewillbegin` → `preventDefault()` (suppresses Look Up /
     system force-click action).
   - `webkitmouseforcedown` → if a press is active and not yet triggered:
     clear timer, `triggered = true`, `pressing = false`,
     `onTrigger(event, "force")`, arm click swallow.
   These events never fire outside Safari, so no feature detection needed.
6. **Cancel**: clear timer, `pressing = false`, call `onCancel` once.
7. **Click swallow**: after a trigger, a one-shot capture-phase `click`
   listener on the target calls `stopPropagation()` + `preventDefault()`, so
   the wrapped button does not also activate. It is disarmed on the next
   `pointerdown` (touch browsers may never deliver that click).
8. **contextmenu**: `preventDefault()` while `pressing` or right after a
   trigger — stops the mobile long-press menu from competing.
9. **disabled** switching to `true` mid-press → cancel.
10. **Unmount**: timer cleared; listeners removed via `useEventListener`.

### Why not VueUse `onLongPress`

Checked `@vueuse/core` 11.3.0. `onLongPress` would need patching on four
points, which is more code than implementing directly:

- no press-start hook (needed for scale feedback);
- exceeding `distanceThreshold` clears silently — no cancel signal, so the
  scale would get stuck;
- no `pointercancel` handling — on touch, scrolling fires `pointercancel`,
  the timer keeps running and the trigger fires mid-scroll;
- no mouse-button filter — right-click-and-hold would trigger.

The composable uses VueUse `useEventListener` for every listener and
`toValue` for options, per repo convention (no raw `addEventListener`).

## Visual feedback (component)

- Root: `<div class="long-press" :class="{ pressing: isPressing, disabled }">`
  with `display: inline-flex`, `user-select: none`,
  `-webkit-touch-callout: none`, `touch-action: manipulation`.
- CSS custom properties set inline from props:
  `--long-press-scale: scale`, `--long-press-duration: ${delay}ms`.
- `.long-press { transform: scale(1); transition: transform 150ms ease-out; }`
  (quick spring back on release/trigger).
- `.long-press.pressing { transform: scale(var(--long-press-scale));
  transition-duration: var(--long-press-duration); transition-timing-function: ease-in; }`
  (slow squeeze that finishes exactly at trigger).
- `@media (prefers-reduced-motion: reduce)` → no transform; trigger still fires.
- No colors, so no design tokens needed beyond timing.

## Testing

Vitest + jsdom, fake timers. jsdom lacks `PointerEvent` constructor details —
dispatch `new MouseEvent("pointerdown", …)` with `button`, `clientX/Y`, and
define `isPrimary` where needed (follow existing pointer tests, e.g.
`ZoomableContainer`/`usePinchZoom` specs).

`tests/composables/useLongPress.spec.ts`:
- hold ≥ `delay` → `onTrigger(event, "hold")` exactly once
- release before `delay` → `onCancel`, no trigger
- move past `moveTolerance` → `onCancel`, no trigger
- `pointercancel` → `onCancel`, no trigger
- non-primary button → nothing
- `webkitmouseforcedown` during press → immediate `onTrigger(event, "force")`,
  hold timer does not fire a second trigger
- `forceTouch: false` → force event ignored
- `webkitmouseforcewillbegin` gets `defaultPrevented` when `forceTouch`
- `disabled` → nothing fires; toggling to disabled mid-press cancels
- click after trigger is swallowed; click without trigger passes through;
  next pointerdown disarms the swallow

`tests/components/LongPress.spec.ts`:
- default slot renders
- `.pressing` toggles on pointerdown / release
- `--long-press-scale` and `--long-press-duration` reflect props
- `trigger`, `pressStart`, `pressCancel` emitted with expected payloads
- wrapped `orio-button` click handler not called after a trigger

## Docs

- `docs/components/long-press.md` — live demo: `orio-long-press` around an
  `orio-button`, `@trigger="openModal"` with `useModal` + `orio-modal`; second
  demo logging `source` to show hold vs force. Note on Safari-only force click.
- `docs/composables/use-long-press.md` — API + demo on a plain element.
- `agents/components/LongPress.md` — frontmatter (`kind: component`,
  `category: Buttons & indicators`, `invariants: true`), invariants (click
  swallow, force is Safari-only, reduced motion, inline-flex wrapper), quick
  reference copied verbatim from the docs demo.
- `agents/composables/useLongPress.md` — same, for the composable.
- Regenerate routing block in `CLAUDE.md` via `scripts/generate-routing.mjs`.
- Add entries to VitePress sidebar config alongside existing components.

## Out of scope

- Haptics (`navigator.vibrate`) on Android.
- Pressure-proportional scale from `webkitForce`.
- Built-in menu / popover.
- Keyboard long-press (holding Enter/Space). Keyboard users reach the same
  action via whatever the consumer provides; revisit if needed.
