---
kind: component
category: Buttons & indicators
purpose: long press, press and hold to open, haptic touch, 3d touch, force click, hold for context menu, hidden action on hold
short: wrapper that scales its child down while held and emits `trigger` after a delay or on Safari force click
invariants: true
---

# LongPress — agent-only invariants

`<orio-long-press>` wraps any element (default slot only — no `#wrapping`)
and emits `trigger(event, source)` after a hold. Behavior lives in
`useLongPress`; the component adds scale feedback.

## Invariants

- **Click after a trigger is swallowed.** A window-level capture listener
  stops the release's `click` — even when it lands outside the wrapper
  (e.g. on a modal overlay the trigger opened) — so a wrapped
  `<orio-button @click>` does not also fire — on touch too, where the click
  comes a task after touchend. Disarmed by the next pointerdown anywhere. Keyboard clicks (`detail === 0`) always pass.
  A short press is a normal click.
- **`trigger` passes the original event.** `@trigger="openModal"` works with
  `useModal` — origin comes from `event.target`.
- **`source` is `"hold"` or `"force"`.** `"force"` only in macOS Safari with a
  Force Touch trackpad (`webkitmouseforce*` events). Everywhere else it is
  always `"hold"`.
- **Primary pointer + left button only.** Right-click-hold and Ctrl+click
  (macOS context menu) do nothing.
- **Cancels** on pointerup/leave/cancel or movement ≥ `moveTolerance` before
  the delay. Releasing *after* a trigger does not emit `press-cancel`.
- **Nested wrappers:** only the innermost reacts to a press.
- **Wrapper is `display: inline-flex`** with `touch-action: manipulation`.
- **Selection is blocked only while held.** `.holding` (pointerdown → finger
  lifts, outliving the trigger) adds `user-select: none` and
  `-webkit-touch-callout: none`; `selectstart` / `contextmenu` are prevented
  and any selection inside is cleared on trigger. Text is selectable otherwise.
- **Two state classes:** `.pressing` (scale, ends at trigger) and `.holding`
  (selection block, ends on release).
- **Reduced motion:** scale disabled, `trigger` still fires.

## Gotchas

- **No keyboard trigger.** Provide another path to the same action.
- **Block-level children** stay shrink-wrapped by `inline-flex`; set
  `style="display: flex"` on the wrapper if the child must stretch.
- **Don't wrap in another element that also handles long press**
  (e.g. a draggable) — both will compete for the pointer.

## Quick reference

```vue
<!-- from docs/components/long-press.md -->
<template>
  <orio-long-press @trigger="openModal">
    <orio-button>Hold me</orio-button>
  </orio-long-press>

  <orio-modal v-bind="modalProps">
    <orio-view-text type="title">Hidden feature</orio-view-text>
    <orio-view-text>Opened by a long press.</orio-view-text>
    <orio-button @click="modalProps.show = false">Close</orio-button>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal();
</script>
```

### Context menu / peek in a popover

`<orio-long-press>` goes **inside** the popover's default slot and calls
`toggle(true)` — a normal click on the wrapped element still does its own
thing (the click after a trigger is swallowed).

```vue
<!-- from docs/components/long-press.md -->
<template>
  <orio-popover position="bottom">
    <template #default="{ toggle }">
      <orio-long-press @trigger="toggle(true)">
        <orio-button variant="secondary" icon="file" @click="openFile">
          report.pdf
        </orio-button>
      </orio-long-press>
    </template>
    <template #content="{ toggle }">
      <div class="menu-panel">
        <orio-button
          v-for="action in fileActions"
          :key="action.label"
          variant="subdued"
          :icon="action.icon"
          @click="runFileAction(action, () => toggle(false))"
        >
          {{ action.label }}
        </orio-button>
      </div>
    </template>
  </orio-popover>
</template>
```

More demos in the docs page: user card peek, toast quick action, hold to
confirm (`:delay="1500"` + `@press-cancel` hint), reveal hidden value.

Props: `delay` (500), `scale` (0.95), `forceTouch` (true), `disabled`
(false), `moveTolerance` (10). Events: `trigger`, `press-start`,
`press-cancel`.
