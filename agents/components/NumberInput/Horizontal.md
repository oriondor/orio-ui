---
kind: component
category: Form inputs
purpose: number input horizontal, minus-plus stepper, quantity stepper
short: number input variant with minus/plus buttons flanking the field and press-and-hold repeat
invariants: true
---

# NumberInput/Horizontal — agent-only invariants

`<orio-number-input-horizontal>` is a pre-styled wrapper around
`<orio-number-input>` that renders minus/plus buttons on either side of the
field. Read `index.md` first — this variant inherits all of its
contract.

## Invariants

- **Accepts the full `NumberInputProps` interface** plus a `disabled` prop
  for the buttons. All props are forwarded via `v-bind="$props"`.
- **Buttons use `usePressAndHold`** — `@mousedown` starts the auto-repeat,
  `@mouseup`/`@mouseleave` stops it. Hold to ramp through a range.
- **`disabled` and the per-button bound state both apply.** A minus button
  is disabled when `disabled || isAtMin`; a plus button when
  `disabled || isAtMax`.
- **Input text is centered** (`text-align: center` via `:deep(.number-input)`).
- **Controls are full-width inside the wrapper**: `justify-content: space-between`
  with 3px horizontal padding. Buttons sit at the edges.
- **`layout="inner"` is supported** — the label centers between the two
  buttons (`left: 0; right: 0; text-align: center`).
- **No keyboard auto-repeat.** Press-and-hold listens to mouse events
  only; holding Enter on a focused button does not ramp.

## Gotchas

- **Buttons are `<orio-button appearance="minimal" variant="subdued">`** —
  they take theme tokens but are not slotted. To swap iconography, fall
  back to the base `<orio-number-input>` with a custom `#controls` slot.
- **Touch behavior**: press-and-hold uses `@mousedown`/`@mouseup`. On touch
  devices these may not fire reliably across all browsers — confirm on
  iOS Safari if mobile is a target.

## Quick reference

```vue
<template>
  <orio-number-input-horizontal
    v-model="quantity"
    :min="0"
    :max="10"
    :step="1"
    :label="$t('cart.quantity')"
  />
</template>
```

## Related

- `<orio-number-input>` — the base; use it when you need custom button
  iconography or layout.
- `<orio-number-input-vertical>` — chevron-stack variant.
- `usePressAndHold` — composable behind the auto-repeat.
