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

- **Model is `number | null` (default `null`)**; the base is a native `type="number"` input, there is no `type` prop.
- **Accepts the full `NumberInputProps` interface** plus a `disabled` prop
  for the buttons. All props are forwarded via `v-bind="$props"`.
- **Buttons use `usePressAndHold`** — `@mousedown` starts the auto-repeat,
  `@mouseup`/`@mouseleave` stops it. Hold to ramp through a range.
- **`disabled` and the per-button bound state both apply.** A minus button
  is disabled when `disabled || isAtMin`; a plus button when
  `disabled || isAtMax`.
- **Input text is centered** (`text-align: center` via `:deep(.number-input)`).
- **Controls are full-width inside the wrapper**: `justify-content: space-between`;
  buttons sit at the edges with margins that match the top/bottom gap.
- **`layout="inner"` is supported** — the label is centered across the full
  field width (`left: 0; right: 0; text-align: center`).
- **Stepper buttons are `tabindex="-1"` with i18n names** — `aria-label` from
  `numberInput.decrease` / `numberInput.increase` (en + uk). Keyboard path is
  ArrowUp/ArrowDown on the input (WAI spinbutton), not Tab to the buttons.
- **No keyboard auto-repeat.** Press-and-hold listens to mouse events
  only; holding Enter on a focused button does not ramp.

## Gotchas

- **Even gaps, every layout.** Buttons are vertically centred on the whole
  field and the side gap equals the top/bottom gap. `.controls` is a size
  container (`container-type: size`) and each button wrapper gets
  `margin-inline: calc((100cqh - var(--control-icon-size) - 2 * var(--control-px)) / 2)`
  — the tile's own tokens, so the gap stays even at any root font size or
  token override. xs/sm fields use `xs` (18px) buttons, md and
  up use `sm` (28px) — this keeps the tile >=2px clear of the border, even in
  the 24px xs field. Don't add padding to `.controls` or fixed margins.
- **Inner layout layering.** The full-width label overlaps the buttons, so
  inner `.controls` has `z-index: 2` to keep them clickable; the label stays
  visible above the input. Never put a `z-index` on the field's
  `.control-group` — it stacks the input over the label and hides it.

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
