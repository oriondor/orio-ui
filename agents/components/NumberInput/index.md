---
kind: component
category: Form inputs
purpose: number input, numeric input, custom-control numeric stepper
short: numeric input base with overlay controls slot; pair with Horizontal/Vertical variants for ready-made spinners
invariants: true
---

# NumberInput — agent-only invariants

`<orio-number-input>` is the **base** numeric input. By itself it renders a
`<input type="number">` with no spinner. Custom step controls go in the
`#controls` slot. For ready-made stepper UIs, use
`<orio-number-input-horizontal>` or `<orio-number-input-vertical>`.

## Invariants

- **Extends `NumberInputProps`** (exported from this file): `ControlProps`
  minus `layout`, plus `layout?: InputLayout`, `min`, `max`, `step`,
  `decimalPlaces`. Same `"inner"` layout trick as Input/Textarea.
- **v-model is `number`** (default `0`). Native input value is coerced via
  Vue's `v-model.number` semantics.
- **Validation runs on blur and on every increase/decrease.** Value is
  clamped to `[min, max]` (if finite) and then rounded to `decimalPlaces`
  via `toFixed`. Typing an out-of-range value is allowed *during* edit;
  blur snaps it back.
- **`decimalPlaces` defaults to `0`.** Decimal input requires both
  `decimalPlaces` and a matching `step` (e.g. `:decimalPlaces="2" :step="0.01"`).
- **Native webkit/firefox spin buttons are hidden** via CSS. Always
  `appearance: textfield`.
- **`#controls` slot overlays the input absolutely** with `pointer-events:
  none` on the container and `:deep(button) { pointer-events: auto }`.
  Only buttons receive clicks; the rest of the overlay passes through to
  the input.
- **`#controls` slot props**: `{ increase, decrease, isAtMax, isAtMin }`.
  `increase`/`decrease` apply `step` and run validation; `isAtMax`/`isAtMin`
  are `false` when `min`/`max` are undefined.
- **`min`, `max`, `step`, `decimalPlaces` are stripped from `controlProps`**
  before forwarding to ControlElement — they do not pollute the wrapper's
  prop bag.
- **`$attrs` is spread before `control`** on the inner `<input>`, same as
  Input.
- **`defineExpose({ input, focused })`** — `input` is the template ref to the
  native `<input>`; `focused` is the **writable** `Ref<boolean>` from
  `useFocus`. Reading reflects focus state; assigning `true`/`false` focuses or
  blurs the element. Drive programmatic focus via `focused`, not `input.focus()`.

## Gotchas

- **No spinner UI without the slot or a variant.** A bare
  `<orio-number-input v-model="n" />` renders nothing in the controls area.
- **`min`/`max` of `0` are honored** because the check uses `Number.isFinite`,
  not truthiness.
- **Blur normalization rewrites the model.** Even if the user types a value
  that is already valid, it gets re-`toFixed`d on blur — `"3"` becomes
  `"3.00"` displayed when `decimalPlaces: 2`.
- **Negative `step` is not blocked.** Passing `step: -1` makes increase
  decrement.

## Quick reference — custom controls slot

```vue
<template>
  <orio-number-input v-model="quantity" :min="1" :max="99" :label="$t('cart.qty')">
    <template #controls="{ increase, decrease, isAtMax, isAtMin }">
      <orio-button :disabled="isAtMin" @click="decrease">−</orio-button>
      <orio-button :disabled="isAtMax" @click="increase">+</orio-button>
    </template>
  </orio-number-input>
</template>
```

## Related

- `<orio-number-input-horizontal>` — pre-styled minus/plus on either side.
- `<orio-number-input-vertical>` — pre-styled chevron stack on the right.
- `<orio-input>` — when you want raw text, not a number.
- Public API reference: `docs/components/number-input.md`.
