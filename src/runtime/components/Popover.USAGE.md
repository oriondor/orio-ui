---
kind: component
category: Layout & containers
purpose: popover, anchored floating panel, dropdown menu base, contextual menu
short: anchored floating panel teleported to body with auto-flip placement and click-outside dismissal
invariants: true
---

# Popover — agent-only invariants

`<orio-popover>` anchors a floating panel to a trigger element. The trigger
is the default slot; the panel content is the `#content` slot.

## Invariants

- **Two slots, both get `{ toggle, isOpen }`.** Default slot wraps the
  trigger; `#content` is the floating panel. You **must** call `toggle`
  yourself — the component does not auto-attach a click handler to the
  trigger.
- **Panel is teleported to `<body>`**. Parent CSS scoping does not reach
  it. Use `:deep()` from a parent, global styles, or scope the panel via
  classes you control.
- **`toggle(force?)`** — `toggle(true)` forces open, `toggle(false)` forces
  close, `toggle()` flips. While `disabled` is true, all three are no-ops.
- **`position` syntax is `main-sub`, not "diagonal".** `top-left` means
  *above the trigger* with the panel's **right edge** aligned to the
  trigger's right edge — NOT "above and to the left of the trigger".
  `left-top` means *left of the trigger* with **top** edges aligned.
  Single-word values (`"top"`, `"left"`, …) center on the cross axis.
- **Placement auto-flips.** If the requested position doesn't fit in the
  viewport, the component tries the opposite-main, then center variants,
  then perpendicular axes — first fit wins. `currentPosition` is the
  resolved value. No way to disable the fallback.
- **`offset` is gap in px between trigger and panel.** Default `10`.
- **Click outside closes**, with `triggerRef` in the ignore list.
- **Reposition on scroll/resize** uses capture-phase listeners on `window`,
  so it catches nested scrolling ancestors. Panel resizes via
  `useElementBounding` also trigger reposition.
- **No keyboard support.** No Esc-to-close, no focus trap, no return-focus.
  If you need those, wire them at the consumer level on the `#content`
  slot.
- **No visual chrome.** The wrapper is `background: transparent; border: 0;
  position: fixed; z-index: 999999`. The `#content` slot must render its
  own surface (card, panel, menu).

## Gotchas

- **Trigger must accept the slot props.** Use `v-slot="{ toggle, isOpen }"`
  on the default slot — without it, the trigger has no way to open the
  popover.
- **No arrow / caret.** Add your own pseudo-element on the content slot if
  needed; the wrapper offers no anchor point.
- **First-paint flicker is avoided via `visibility: hidden`** during
  measurement, but only briefly. If your trigger animates while opening,
  the trigger rect read on `nextTick` may be mid-animation — measure after
  the animation, or open without animating the trigger.
- **`appear` transition fires only on first paint.** Reopening the same
  popover does not re-trigger `appear` — only the standard enter
  transition. Make sure your `animate-fade-slide` styles cover both.
- **z-index is hard-coded to `999999`.** Stacking with other body-teleports
  (Modal at the same z-index) is order-dependent — the later-mounted
  element wins. Mount-order is not stable across HMR.
- **No `v-model:show`.** State is internal. Drive it through `toggle` (via
  the slot prop) or by mounting/unmounting the component with `v-if`.

## Quick reference

```vue
<template>
  <orio-popover position="bottom-left" :offset="8">
    <template #default="{ toggle, isOpen }">
      <orio-button @click="toggle()">
        Menu {{ isOpen ? "▴" : "▾" }}
      </orio-button>
    </template>

    <template #content="{ toggle }">
      <div class="menu-panel">
        <button @click="onEdit(); toggle(false)">Edit</button>
        <button @click="onDelete(); toggle(false)">Delete</button>
      </div>
    </template>
  </orio-popover>
</template>

<style scoped>
.menu-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
}
</style>
```

## Related

- `<orio-tooltip>` — for hover/focus hints; do not use Popover for tooltips.
- `<orio-modal>` — when you need a backdrop, focus trap, and centered
  dialog.
- Public API reference: `docs/components/popover.md`.
