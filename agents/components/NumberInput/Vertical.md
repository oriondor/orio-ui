---
kind: component
category: Form inputs
purpose: number input vertical, chevron stepper, stacked-arrow numeric input
short: number input variant with chevron up/down stacked on the right and press-and-hold repeat
invariants: true
---

# NumberInput/Vertical — agent-only invariants

`<orio-number-input-vertical>` is a pre-styled wrapper around
`<orio-number-input>` that renders stacked chevron up/down buttons on the
right edge. Read `index.md` first — this variant inherits all
of its contract.

## Invariants

- **Accepts the full `NumberInputProps` interface** plus a `disabled` prop
  for the buttons. Forwarded via `v-bind="$props"`.
- **Buttons use `usePressAndHold`** — `@mousedown` starts auto-repeat,
  `@mouseup`/`@mouseleave` stops.
- **Chevron up = `increase`, chevron down = `decrease`.** Standard
  direction; do not swap them in a consumer.
- **Buttons are stacked vertically** in a column flex (`flex-direction:
  column; justify-content: space-around`) anchored to `right: 3px`.
- **Input remains left-aligned** — text stays at its natural alignment;
  only the controls move.

## Gotchas

- **Padding-right may need a bump on long values.** The chevron stack
  overlaps the input's right edge. For decimal values with many digits,
  numbers may render under the buttons. Pad the input or switch to
  `<orio-number-input-horizontal>`.
- **No keyboard auto-repeat.** Same limitation as the horizontal variant.

## Quick reference

```vue
<template>
  <orio-number-input-vertical
    v-model="zoomPercent"
    :min="10"
    :max="400"
    :step="5"
    :label="$t('editor.zoom')"
  />
</template>
```

## Related

- `<orio-number-input>` — base; use for custom controls.
- `<orio-number-input-horizontal>` — minus/plus variant.
- `usePressAndHold` — composable behind auto-repeat.
