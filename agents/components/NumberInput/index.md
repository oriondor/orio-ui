---
kind: component
category: Form inputs
purpose: number input, numeric input, custom-control numeric stepper
short: numeric input base with overlay controls slot; pair with Horizontal/Vertical variants for ready-made spinners
invariants: true
---

# NumberInput — agent-only invariants

`<orio-number-input>` is the **base** numeric input. By itself it renders a
text input (`type="text" inputmode="decimal"`) with no spinner. Custom step controls go in the
`#controls` slot. For ready-made stepper UIs, use
`<orio-number-input-horizontal>` or `<orio-number-input-vertical>`.

## Invariants

- **Extends `NumberInputProps`** (exported from this file): `ControlProps`
  minus `layout`, plus `layout?: InputLayout`, `type`, `min`, `max`,
  `step`, `decimalPlaces`. Same `"inner"` layout trick as Input/Textarea.
- **v-model is `number | null`** (default `null`). Empty/unbound is `null`;
  it never becomes `0` (not on input, not on blur).
- **`type?: 'text' | 'number'`, default `'text'`.** Text mode keeps a local
  display string apart from the model and parses typed text with
  `useDecimalFormatter().toNumber` (`1.5` and `1,5` both 1.5, `-1,5` is -1.5).
  `type="number"` is the native input (browser parsing, native arrows).
- **Typing** emits the parsed number immediately, unclamped. Empty text emits
  `null`. Unparsable text (`-`, `abc`) emits nothing; the model keeps its last
  value (a lone `-` never wipes it).
- **Blur** (text mode): empty stays `null`; unparsable text reverts to the
  model's display; a valid value (in bounds, within precision) is NOT rewritten
  — no emit, typed text kept (so `1,` stays `1,`); out-of-range is clamped and
  excess decimals rounded, then the display is reformatted.
- **Display**: while the field is focused the text is what the user typed.
  Model changes from outside (prop, step, clamp, rounding) and `locale`
  switches reformat it with the vue-i18n locale's decimal separator, no
  grouping (`de` `1234,5`, `en` `1234.5`). If an external change arrives
  while focused it wins only when it differs from the parsed typed text, so
  our own echo never clobbers `1,`.
- **Precision = `max(decimalPlaces, decimals in step)`.** Rounding is
  decimal-exponent based (half away from zero), not `toFixed`: `1.005` at 2
  places is `1.01`; `0.1` step three times is exactly `0.3`.
- **Clamp to `min`/`max` only when finite** (`0` honored).
- **Stepping** (`increase`/`decrease`, ArrowUp/ArrowDown in text mode with
  `preventDefault`) starts from the model, or `min ?? 0` when `null`, applies
  `step`, rounds, clamps. No-op while `disabled` or when the input has a `readonly` attr.
- **`decimalPlaces` defaults to `0`**; precision is
  `max(decimalPlaces, decimals in step)`, so `:step="0.01"` alone already gives
  2 places and `:decimalPlaces="2"` alone rounds typed values to 2 places.
  It is a rounding precision, not a display format (no trailing zeros).
- **Native webkit/firefox spin buttons are hidden** via CSS. Always
  `appearance: textfield`.
- **`#controls` slot overlays the input absolutely** with `pointer-events:
none` on the container and `:deep(button) { pointer-events: auto }`.
  Only buttons receive clicks; the rest of the overlay passes through to
  the input.
- **`#controls` slot props**: `{ increase, decrease, isAtMax, isAtMin }`.
  `increase`/`decrease` apply `step` and run validation; `isAtMax`/`isAtMin`
  are `false` when `min`/`max` are undefined or the model is `null`.
- **`type`, `min`, `max`, `step`, `decimalPlaces` are stripped from `controlProps`**
  before forwarding to ControlElement — they do not pollute the wrapper's
  prop bag.
- **`$attrs` is spread before `control`** on the inner `<input>`, same as
  Input. `inputmode` from `$attrs` wins over the default `decimal`.
- **`type="number"` blur** clears any native bad input (a lone `-`, `e`, or a
  trailing `.` such as `1.` in Chrome) so the field matches the `null` model.
  The partial text is dropped, not kept as `1`.
- **Text mode letters rule**: text with any character other than digits,
  whitespace, `.`, `,`, `-` or `−` (U+2212) is unreadable. It emits nothing
  while typing (model keeps the last value) and blur reverts the text to the
  model's display, so `1a5` / `1e5` never become 15. The check lives in
  NumberInput, not in `useDecimalFormatter`.
- **`defineExpose({ input, focused })`** — `input` is the template ref to the
  native `<input>`; `focused` is the **writable** `Ref<boolean>` from
  `useFocus`. Reading reflects focus state; assigning `true`/`false` focuses or
  blurs the element. Drive programmatic focus via `focused`, not `input.focus()`.

## Gotchas

- **No spinner UI without the slot or a variant.** A bare
  `<orio-number-input v-model="n" />` renders nothing in the controls area.
- **`min`/`max` of `0` are honored** because the check uses `Number.isFinite`,
  not truthiness.
- **No locale-aware parsing of grouping.** `toNumber` is heuristic: with no
  dot, the last comma is the decimal mark, so `1,234` parses as 1.234 and
  `1,234.5` as 1234.5. U+2212 `−` (sv/fi/nb output) counts as minus.
- **`focused` from `useFocus` is unreliable mid-typing** (the control slot
  re-render resets the template ref), so the external-change check uses
  `document.activeElement`.
- **iOS `inputmode="decimal"` has no minus key.** Negative entry on iOS needs
  `type="number"` or pasting.
- **Negative `step` is not blocked.** Passing `step: -1` makes increase
  decrement.

## Quick reference — empty value, money (from docs/components/number-input.md)

```vue
<orio-number-input-horizontal
  v-model="money"
  :min="0"
  :step="0.1"
  :decimal-places="2"
  label="Amount"
/>
```

`money` starts as `ref(null)`; clearing the field returns it to `null`.

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
