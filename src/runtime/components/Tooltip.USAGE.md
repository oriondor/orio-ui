---
kind: component
category: Layout & containers
purpose: tooltip, hover hint, focus hint, label-on-hover
short: hover/focus-triggered tooltip teleported to body, with delay, arrow, and four placements
invariants: true
---

# Tooltip — agent-only invariants

`<orio-tooltip>` wraps a trigger in an `inline-flex` div and shows a small
floating bubble on hover or focus. It is not for click-driven menus — use
`<orio-popover>` for that.

## Invariants

- **Trigger wrapper is `display: inline-flex`** (centered). The slot lives
  inside it. Block-level children are coerced into the flex layout.
- **Mouse + keyboard both trigger.** `@mouseenter`/`@focus` show,
  `@mouseleave`/`@blur` hide. Touch is not supported.
- **`delay` (default 500 ms) gates open only.** Hide is immediate. Setting
  `delay: 0` makes it instant.
- **`disabled` watcher closes an open tooltip.** Flipping to disabled mid-
  display hides it. Re-enabling does not reopen — the user has to re-hover.
- **Two content sources, slot wins.** `#content` slot renders if provided,
  otherwise the `text` prop. Both being empty renders an empty bubble.
- **Teleported to body only while visible.** Unlike Popover, the tooltip is
  mounted/unmounted around the visible window — no leftover DOM at rest.
- **No placement fallback.** `placement` (`top`/`bottom`/`left`/`right`) is
  honored as-is. If the bubble overflows the viewport, it stays offscreen.
  Compare with Popover, which auto-flips.
- **Position is recalculated on scroll/resize** while visible (capture-phase
  listeners catch nested scrollers).
- **`pointer-events: none` on the bubble.** It never intercepts the cursor —
  so leaving the trigger always closes it.
- **Has a CSS-triangle arrow** (`.orio-tooltip-arrow-{placement}`) anchored
  on the appropriate edge.
- **Styles are intentionally unscoped** in the second `<style>` block,
  because teleported nodes escape scoped CSS. Class names use the
  `orio-tooltip-` prefix to avoid collisions. Consumers **can** override
  them globally — useful for theming, dangerous if not namespaced.
- **`white-space: nowrap`** on the bubble. Long `text` does not wrap. For
  multi-line, render `#content` with your own line-breaking CSS.
- **A11y is partial.** The bubble has `role="tooltip"` and `aria-hidden`,
  but the trigger does **not** receive `aria-describedby`. Screen readers
  may not announce the tooltip. Wire `aria-describedby` on the trigger
  child yourself if it matters.

## Gotchas

- **`text` defaults to English.** Project convention: pass an i18n key —
  `:text="$t('action.delete.hint')"`.
- **`inline-flex` wrapper can change layout.** Wrapping a block-level
  element (a card, a list row) in a Tooltip squashes it. Wrap a smaller
  trigger (button, icon) instead.
- **`delay` does not debounce reopens.** Rapid hover toggles can still
  flash the tooltip on the second mount if the first delay completed.
- **Z-index is `9999`** on the bubble — less than Popover (`999999`) and
  Modal. Tooltips above an open popover may render behind it.
- **No click-to-dismiss.** Clicking the trigger does not close the bubble.
  The user has to move focus or hover away.

## Quick reference

```vue
<template>
  <orio-tooltip :text="$t('action.delete.hint')" placement="top" :delay="200">
    <orio-button icon-only icon="trash" @click="onDelete" />
  </orio-tooltip>

  <orio-tooltip placement="right">
    <span>Hover me</span>
    <template #content>
      <strong>Custom</strong> content with <em>markup</em>.
    </template>
  </orio-tooltip>
</template>
```

## Related

- `<orio-popover>` — click-driven anchored panel; do not reach for Tooltip
  for menus.
- Public API reference: `docs/components/tooltip.md`.
