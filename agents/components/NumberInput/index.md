---
kind: component
category: Form inputs
purpose: number input, numeric input, custom-control numeric stepper
short: native number input with overlay controls slot; pair with Horizontal/Vertical variants for ready-made spinners
invariants: true
---

# NumberInput — agent-only invariants

`<orio-number-input>` is the **base** numeric input. It always renders a
native `<input type="number">` with no spinner (browser parsing, `.` decimal
mark, no locale text handling). Custom step controls go in the `#controls`
slot. For ready-made stepper UIs, use `<orio-number-input-horizontal>` or
`<orio-number-input-vertical>`. For currency amounts with locale parsing, use
`<orio-number-input-money>` (see `Money.md`).

## Invariants

- **Extends `NumberInputProps`** (exported from this file): `ControlProps`
  minus `layout`, plus `layout?: InputLayout`, `min`, `max`, `step`,
  `decimalPlaces`. Same `"inner"` layout trick as Input/Textarea.
- **No `type` prop.** The input is always `type="number"`; a consumer `type`
  attr is overridden. There is no `inputmode` default and no locale code.
- **v-model is `number | null`** (default `null`). Empty/unbound is `null`;
  it never becomes `0` (not on input, not on blur). `-0` becomes `0`.
- **Typing** emits `Number(raw)` immediately, unclamped. Empty emits `null`.
- **Blur** clears native bad input (a lone `-`, `e`, or a trailing `.` such as
  `1.` in Chrome; the browser reports it as empty) so the field matches the
  `null` model; the partial text is dropped, not kept as `1`. Then a
  non-null model is rounded and clamped, and the display reformatted.
- **Precision = `max(decimalPlaces, decimals in step)`.** Rounding is
  decimal-exponent based (half away from zero), not `toFixed`: `1.005` at 2
  places is `1.01`; `0.1` step three times is exactly `0.3`. Huge values
  (`1e21`) are left untouched. Helper: `utils/decimal` (`roundTo`).
- **`decimalPlaces` defaults to `0`**, so `:step="0.01"` alone already gives
  2 places and `:decimalPlaces="2"` alone rounds typed values to 2 places.
  It is a rounding precision, not a display format (no trailing zeros).
- **Clamp to `min`/`max` only when finite** (`0` honored), on blur (except a `readonly` field, which blur leaves unclamped) and on step.
- **Stepping** (`increase`/`decrease`) starts from the model, or `min ?? 0`
  when `null`, applies `step`, rounds, clamps. No-op while `disabled` or when
  the input has a `readonly` attr. Steppers from an empty field land on `min + step`
  (`step` without `min`). ArrowUp/ArrowDown are the native number input's own;
  from empty the browser goes to `min`.
- **Native webkit/firefox spin buttons are hidden** via CSS (`appearance:
  textfield`).
- **The input shrinks** (`min-inline-size: 0`) and the wrapper margin comes
  from the `--control-margin` token.
- **`#controls` slot overlays the input absolutely** with `pointer-events:
  none` on the container and `:deep(button) { pointer-events: auto }`.
  Only buttons receive clicks; the rest of the overlay passes through to
  the input.
- **`#controls` slot props**: `{ increase, decrease, isAtMax, isAtMin }`.
  `increase`/`decrease` apply `step` and run validation; `isAtMax`/`isAtMin`
  are `false` when `min`/`max` are undefined or the model is `null`.
- **`min`, `max`, `step`, `decimalPlaces` are stripped from `controlProps`**
  before forwarding to ControlElement; `min`/`max`/`step` go to the native input.
- **`$attrs` is spread before `control`** on the inner `<input>`, same as Input.
- **`defineExpose({ input, focused })`** — `input` is the template ref to the
  native `<input>`; `focused` is the **writable** `Ref<boolean>` from
  `useFocus`. Reading reflects focus state; assigning `true`/`false` focuses or
  blurs the element. Drive programmatic focus via `focused`, not `input.focus()`.

## Gotchas

- **No spinner UI without the slot or a variant.** A bare
  `<orio-number-input v-model="n" />` renders nothing in the controls area.
- **`min`/`max` of `0` are honored** because the check uses `Number.isFinite`,
  not truthiness.
- **No locale parsing.** `1,5` typed into a native number input is the
  browser's call (often bad input, cleared on blur). Use
  `<orio-number-input-money>` when users type or paste localized amounts.
- **`focused` from `useFocus` is unreliable mid-typing** (the control slot
  re-render resets the template ref), so the external-change check uses
  `document.activeElement`.
- **Negative `step` is not blocked.** Passing `step: -1` makes increase
  decrement.

## Quick reference — empty value (from docs/components/number-input.md)

```vue
<orio-number-input-horizontal
  v-model="empty"
  :min="0"
  :step="0.1"
  :decimal-places="2"
  label="Amount"
/>
```

`empty` starts as `ref(null)`; clearing the field returns it to `null`.

## Quick reference — custom controls slot

```vue
<template>
  <orio-number-input
    v-model="quantity"
    :min="1"
    :max="99"
    :label="$t('cart.qty')"
  >
    <template #controls="{ increase, decrease, isAtMax, isAtMin }">
      <orio-button type="button" :disabled="isAtMin" @click="decrease">−</orio-button>
      <orio-button type="button" :disabled="isAtMax" @click="increase">+</orio-button>
    </template>
  </orio-number-input>
</template>
```

## Related

- `<orio-number-input-horizontal>` — pre-styled minus/plus on either side.
- `<orio-number-input-vertical>` — pre-styled chevron stack on the right.
- `<orio-number-input-money>` — currency amounts with locale parsing (`Money.md`).
- `<orio-input>` — when you want raw text, not a number.
- Public API reference: `docs/components/number-input.md`.
