# Popover (experiment)

::: warning EXPERIMENT
Ships as the `orio-ui/experiments` subpath, **not** as an auto-imported
component. Names, props, and behaviour can change in any release, including a
patch. Use `<orio-popover>` when you need stability.
:::

Popover built on the native HTML Popover API — no teleport, no measured
positioning, light-dismiss and Esc handled by the browser.

## Live Demo

Two instances, so you can check that each panel anchors to its own trigger:

<div class="demo-container">
  <div class="demo-row">
    <orio-x-popover position="bottom span-right">
      <template #trigger="triggerProps">
        <orio-button variant="secondary" v-bind="triggerProps">Bottom</orio-button>
      </template>
      <template #body="bodyProps">
        <div v-bind="bodyProps" class="demo-output" style="min-width: 200px;">
          <p>Native popover content.</p>
          <p>Click outside or press Esc to dismiss.</p>
        </div>
      </template>
    </orio-x-popover>
    <orio-x-popover position="top" :gap="0.5">
      <template #trigger="triggerProps">
        <orio-button variant="secondary" v-bind="triggerProps">Top, centered</orio-button>
      </template>
      <template #body="bodyProps">
        <div v-bind="bodyProps" class="demo-output" style="min-width: 200px;">
          <p>Anchored to its own trigger.</p>
        </div>
      </template>
    </orio-x-popover>
  </div>
</div>

Unslotted, to show the defaults — `<orio-button>` trigger, surfaced panel,
fade-and-slide on open:

<div class="demo-container">
  <div class="demo-row">
    <orio-x-popover id="demo-auto" />
  </div>
</div>

`flip="initial"` keeps whichever side it opened on, even once scrolling pushes
it out of view:

<div class="demo-container">
  <div class="demo-row">
    <orio-x-popover id="demo-initial" flip="initial" />
  </div>
</div>

## Usage

Experiments are never auto-imported. Import from the subpath:

```vue
<script setup lang="ts">
import { Popover } from "orio-ui/experiments";
</script>

<template>
  <Popover>
    <template #trigger="triggerProps">
      <orio-button v-bind="triggerProps">Open</orio-button>
    </template>

    <template #body="bodyProps">
      <div v-bind="bodyProps">
        <p>Your content here</p>
      </div>
    </template>
  </Popover>
</template>
```

Both slot bags must be spread onto a real element — the `popovertarget` /
`id` pairing is what wires the trigger to the panel.

The demos on this page use `<orio-x-popover>`, the docs-only global alias for
the same component.

## Props

| Prop       | Type              | Default    | Description                                    |
| ---------- | ----------------- | ---------- | ---------------------------------------------- |
| `id`       | `string`          | `useId()`  | Id shared by trigger and panel; keep it unique |
| `position` | `PopoverPosition` | `'bottom'` | Placement, as a CSS `position-area` value      |
| `gap`      | `number`          | `1`        | Distance between trigger and panel, in rem     |
| `flip`     | `PopoverFlip`     | `'auto'`   | How hard the panel works to stay in the viewport |

### Position Values

A single keyword spans the cross axis, so `bottom` centers the panel below the
trigger:

- Centered: `'top'`, `'bottom'`, `'left'`, `'right'`
- Edge-aligned: `'bottom span-right'` (panel's left edge meets the trigger's),
  `'bottom span-left'`, `'top span-right'`, `'top span-left'`,
  `'left span-top'`, `'left span-bottom'`, `'right span-top'`,
  `'right span-bottom'`
- Corner tiles: `'top left'`, `'top right'`, `'bottom left'`, `'bottom right'`

The union is deliberately closed rather than csstype's `Property.PositionArea`
— that type accepts any string, and this value is interpolated into a
`<style>` tag.

## Slots

| Slot      | Props                     | Description     |
| --------- | ------------------------- | --------------- |
| `trigger` | `{ popovertarget }`       | Trigger element |
| `body`    | `{ id, class, popover }`  | Popover panel   |

## Defaults

Unslotted, the component already renders something usable:

- **Trigger** — `<orio-button>`, so it matches the design system out of the box.
- **Surface** — panel background, border, radius, padding, and shadow from the
  theme tokens.
- **Motion** — fade and slide away from the trigger on open, via
  `@starting-style` and `transition-behavior: allow-discrete`. Respects
  `prefers-reduced-motion`.

All of it is emitted inside `:where()`, which has zero specificity — a single
class of your own overrides any of it, no `!important` needed:

```vue
<template #body="bodyProps">
  <div v-bind="bodyProps" class="my-panel">…</div>
</template>

<style scoped>
.my-panel {
  background: var(--color-accent-soft);
  padding: 1.5rem;
  --popover-enter-distance: 0; /* kill the slide, keep the fade */
}
</style>
```

## Edge flipping

Unless `flip` is `'off'`, the panel emits `position-try-fallbacks`, so the
browser retries the placement when it would overflow the viewport — block axis
first for `top`/`bottom`, inline axis first for `left`/`right`, then both.

### Flip values

| Value | Flips on open | Flips while open |
| --- | --- | --- |
| `'auto'` (default) | yes | yes — re-resolved on scroll idle and resize |
| `'initial'` | yes | no — the side is fixed once the panel opens |
| `'off'` | no | no — always renders on the requested side |

`'initial'` is the plain-CSS behaviour: the browser emits
`position-try-fallbacks` and resolves them at layout time. `'auto'` adds the
silent reopen described below.

### Why `'auto'` needs a trick

The browser picks a fallback only when the panel is laid out — that is, when it
opens. While it stays open the panel tracks its trigger, but the chosen side is
sticky: a panel that opened below its trigger and is then scrolled to the
viewport edge stays below, overflowing. Measured in Chrome 151, forcing a style
invalidation does not help; rewriting `position-area` and toggling
`position-try-fallbacks` both leave the resolved side untouched. Only a fresh
layout at show time re-resolves it.

So `flip="auto"` closes and reopens the panel to trigger that fresh layout. The
swap is invisible:

- hide and show happen in the same task, so no frame is ever painted with the
  panel closed — measured at zero hidden frames;
- transitions are suppressed for the swap, so the open animation does not
  replay;
- the native `beforetoggle`/`toggle` pair is swallowed, so listeners on the
  panel see no spurious close/open;
- focus and the panel's own scroll offsets are restored, since hiding a popover
  returns focus to the invoker and the display change would reset `scrollTop`.

It runs on scroll idle (100 ms after the last scroll event) and on resize, and
only when the panel actually overflows the viewport — one relayout per gesture,
not one per frame. Drop to `flip="initial"` if you would rather the panel keep
the side it opened on.

## Compared to `<orio-popover>`

| | `<orio-popover>` | `<orio-x-popover>` |
| --- | --- | --- |
| Placement | measured in JS, auto-flip | CSS anchor positioning, `position-try-fallbacks` |
| Reposition on scroll | capture-phase listeners | compositor tracks the anchor, no JS |
| Re-flip on scroll | yes, re-measured every event | yes, via a silent reopen on scroll idle |
| Stacking | teleport + `z-index: 999999` | native top layer |
| Light dismiss | hand-rolled click-outside | browser |
| Esc to close | no | browser |
| Open state | internal ref + `toggle` slot prop | DOM (`popovertarget`) |

## Not implemented

- `position-visibility` — the panel stays put when its trigger scrolls out of
  view, instead of hiding with it
- Focus management (`popover="auto"` is not a dialog, so focus is not trapped)
- `aria-expanded` / `aria-haspopup` on the trigger bag
- Browser support check for CSS anchor positioning and `@starting-style` —
  where unsupported, the panel falls back to the native centered position and
  appears without animation
