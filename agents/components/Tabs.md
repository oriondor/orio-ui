---
kind: component
category: Buttons & indicators
purpose: tabs, tab bar, segmented control, pill toggle group, radio group strip, period picker
short: single-choice button strip, underline or segmented look, tablist or radiogroup semantics, roving-tabindex keyboard
invariants: true
---

# Tabs — agent-only invariants

`<orio-tabs>` is one component with two independent axes: `variant`
(`underline` | `segmented`) is **look only**, `role` (`tablist` |
`radiogroup`) is **semantics only**. Any combination is valid.

## Invariants

- **`role` is semantics, not look.** `tablist` gives container `role="tablist"`,
  items `role="tab"` + `aria-selected`. `radiogroup` gives `role="radiogroup"`,
  items `role="radio"` + `aria-checked`, never `aria-controls`.
- **Use `tablist` only when the strip switches panels.** Value pickers
  (period, filter) are `radiogroup`, even with the underline look.
- **The consumer renders the panels.** With `id-prefix="x"` tabs get
  `x-tab-{value}` and `aria-controls="x-panel-{value}"`; panels must be
  `role="tabpanel"` with `id="x-panel-{value}"` and `aria-labelledby="x-tab-{value}"`.
- **`id-prefix` must be unique per page** (duplicate ids otherwise) and only
  applies to `tablist`. Option values must be unique as strings and id-safe (no whitespace).
- **Duplicate option values: first match wins.**
- **Types:** `TabsProps` and `TabsOption` are exported from `Tabs.vue`.
- **Per-option `disabled` is `aria-disabled`** (still focusable-looking, never
  selectable, skipped by keys). Arrows step from the focused item, even a
  disabled selected one, to the nearest enabled neighbour, wrapping. **The whole-component `disabled` prop sets
  native `disabled`** on every button.
- **Selection follows focus.** Arrow keys (wrap, flipped under `dir="rtl"`),
  Home/End move focus and select at once. In `radiogroup` only, ArrowDown/ArrowUp also step forward/backward (never flipped for RTL); `tablist` ignores them. There is no manual-activation mode.
- **Emits only on change.** Re-selecting the current value does not emit;
  a model not in `options` (or `undefined`) selects nothing and never auto-emits.
- **Roving tabindex:** the selected item is the only tab stop, even if it
  became disabled; with no selection the first enabled item is.
- Value `0` is a valid selection.
- **Sliding indicator:** one `aria-hidden` `<span class="indicator">` after the
  buttons takes the selected item's measured box (offsetLeft/Top/Width/Height
  via `useResizeObserver` on strip and items) and glides on selection change
  only. It is instant on first render, resize, options/size/variant/block
  change, and under `prefers-reduced-motion: reduce`. Absent with no selection
  or while the strip is `display:none` (re-measured when shown). Until it is
  placed (SSR) the selected item paints its own fill. Items sit above it
  (`z-index`), so text and focus ring stay on top. Never position it yourself. Known ceiling: a `dir` flip alone does not re-measure a `fit-content` strip until selection, label or strip size changes.
- Name the strip: `label` (aria-label) or consumer `aria-labelledby`.

## Gotchas

- Do not restyle with internal classes; override `--orio-tabs-gap`,
  `--orio-tabs-radius`, `--orio-tabs-track-bg`, `--orio-tabs-active-bg`,
  `--orio-tabs-active-ink`, `--orio-tabs-transition` (default `250ms ease`; `0s` disables the slide).
- `segmented` is `width: fit-content`; add `block` for full width (`true`/`"equal"`: equal columns; `"content"`: `minmax(0, auto)` tracks + `justify-content: stretch`, so labels keep their content width while they fit and spare space is shared). **Density:** `dense` (boolean, default false) only toggles the compact style (padding x0.6, gap x0.5, font x0.9, derived from the size tokens); `--orio-tabs-gap`, `--orio-tabs-padding-x`, `--orio-tabs-font-size` win over it. It never switches by itself (automatic switching was tried and dropped: it cancelled the indicator glide, caused ResizeObserver loops and cost layout per frame); bind it to your own breakpoint (recipe below). A change re-measures the indicator instantly. Layout is a CSS grid
  (`minmax(0, max-content)` columns; `block`: `minmax(0, 1fr)`): items stay inside
  the strip while it is wider than count x 2 x the control's horizontal padding
  plus the gaps (button padding is a floor, so extreme widths, e.g. 8 options in
  100px, overflow). When narrower than the content,
  free space is shared equally, so short labels keep their width and only the
  longer ones ellipsise (very narrow strips ellipsise every label). Constrain
  width on the parent, not the item.
- The `option` slot replaces icon + label, so it also owns any icon.
- The `option` slot renders inside the tab `<button>`: text, icon or badge only, never interactive elements.
- Overflow scrolling, vertical orientation and panels are out of scope.

## Quick reference

Copied from the live demo in `docs/components/tabs.md` ("Underline with
panels"); the `<orio-tabs>` markup is identical for consumers.

```vue
<template>
  <orio-tabs v-model="tab" :options="tabOptions" label="Project sections" id-prefix="demo" />
  <div
    v-for="option in tabOptions"
    v-show="tab === option.value"
    :id="`demo-panel-${option.value}`"
    :key="option.value"
    role="tabpanel"
    :aria-labelledby="`demo-tab-${option.value}`"
    tabindex="0"
  >
    Panel: {{ option.label }}
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tab = ref('overview')
const tabOptions = [
  { value: 'overview', label: 'Overview', icon: 'edit' },
  { value: 'activity', label: 'Activity' },
  { value: 'settings', label: 'Settings' },
]
</script>
```

## Recipe: compact on narrow screens

Copied from the live demo in `docs/components/tabs.md` ("Dense"). Gate the
binding on `useMounted()`: `useMediaQuery` already matches during client
setup, so binding it directly renders `dense` on the client but not in the
server HTML (hydration mismatch).

```vue
<template>
  <orio-tabs v-model="period" :options="periodOptions" variant="segmented" role="radiogroup" :dense="mounted && narrow" label="Dense on narrow screens" />
</template>

<script setup>
import { ref } from 'vue'
import { useMediaQuery, useMounted } from '@vueuse/core'

const narrow = useMediaQuery('(max-width: 400px)')
const mounted = useMounted()
const period = ref('month')
const periodOptions = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]
</script>
```

## Related

- `<orio-switch-button>` — independent boolean toggles.
- `<orio-radio-button>` — form radio inputs with labels and errors.
- Public API reference: `docs/components/tabs.md`.
