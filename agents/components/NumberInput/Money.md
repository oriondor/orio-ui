---
kind: component
category: Form inputs
purpose: money input, currency input, price field, amount field, minor units, cents
short: locale-aware currency amount input with fixed symbol affix, text-driven paste parsing and optional minor-unit (cents) model
invariants: true
---

# NumberInput/Money — agent-only invariants

`<orio-number-input-money>` wraps `<orio-input>` (`type="text"`,
`inputmode="decimal"`, `autocomplete="off"`, overridable via attrs). It is
independent of `<orio-number-input>`: text parsing lives here, the plain
number input stays native.

## Invariants

- **Props** (`NumberInputMoneyProps`, exported): `ControlProps` minus
  `layout`, plus `layout?: InputLayout`, `currency` (ISO 4217, required),
  `locale?`, `currencyDisplay?` (default `"symbol"`), `decimalPlaces?`,
  `minorUnits?`, `min?` (default `0`), `max?`, `step?` (default `1`).
  `decimalPlaces` must be an integer 0-20, else `console.warn` and the
  currency default (Intl throws above 100, so never forward it unchecked).
  Values above ~15 leave almost no showable amounts (shared ceiling).
- **v-model is `number | null`.** Major units by default; with `minorUnits`
  an integer of minor units (`12.50` USD -> `1250`). Empty is `null`, `-0`
  is `0`.
- **Locale**: `locale` prop, else `navigator.language` set in `onMounted`;
  SSR and the first client render use `en-US`, so no hydration mismatch. A
  `locale`/`currency`/`decimalPlaces`/`minorUnits` change re-renders the text
  when not typing.
- **`decimalPlaces` default** is the currency's CLDR `maximumFractionDigits`
  (USD 2, JPY 0, KWD 3). Explicit prop wins. **Gotcha**: CLDR and your backend
  may disagree (HUF/ISK are 2 in CLDR, often whole units in storage). With
  `minorUnits` the model scales with this number, so set `decimalPlaces`
  explicitly whenever the backend exponent differs.
- **Minor units are exact**: conversion shifts decimal digits as strings,
  never multiplies floats (`0.29` -> `29`). Ceiling: see Parsing.
- **Display**: focused -> raw text, no grouping, locale decimal mark; blur ->
  grouping plus exactly `decimalPlaces` fraction digits. Always Latin digits
  (`numberingSystem: "latn"`). Text is not rewritten while the user types a
  value that already equals the model (`12.` stays).
- **Affix** comes from `formatToParts` (side = `currency` part before/after
  `integer`), is muted, `aria-hidden`, `pointerdown` focuses the input. The
  currency name goes to a visually hidden span referenced by the input's
  `aria-describedby`. Chrome may render `грн` for UAH where Node renders `₴`:
  never hard-code the symbol in tests. Unknown currency -> `Intl` RangeError
  is caught: no affix, 2 places, `console.warn`.
- **Parsing** (typed and pasted; the format is read from the text, the field
  locale only breaks a true tie). Accepts digits of any script, whitespace
  incl. NBSP/NNBSP, the field's own currency symbol, narrowSymbol or code
  (whatever `currencyDisplay` is), U+2212, bidi marks, U+066B/U+066C. Any
  letter or other currency symbol is unparsable. Sign and at most one
  currency token are read at the edges only (`1USD5`, `$$5`, `$10 $50`
  error).
  - Valid groups: first `[1-9]\d{0,2}`, middle 2-3 digits (Indian
    `12,34,567`), last exactly 3.
  - Both `.` and `,`: the last is the decimal, the other must be valid
    grouping.
  - One mark kind, once: decimal unless it could be grouping (3-digit
    fraction and integer `[1-9]\d{0,2}`, a tie). `1234.5`, `12,5`, `0,500`,
    `.5` are decimal. A tie goes to the locale: its group mark means
    grouping (`1,234` en = 1234), else decimal (`1,234` de = error).
  - Repeated mark with valid groups is grouping (`1.234.567`); repeated and
    invalid is an error unless a prefix of valid groups (`1,234,5`:
    incomplete).
  - Space/apostrophe are only ever grouping and need valid groups (`1 234`,
    `100 200` = 100200). A single one with a short last group (`1 2`,
    `1 23`, `1'`) or `12 5`, `1'2` is INCOMPLETE while typing, an error on
    blur; `1'2'3` errors at once.
  - Extra fraction digits beyond `decimalPlaces`: all zeros are dropped
    (`12.500` USD = 12.5), a non-zero one is an error.
  - One shared ceiling (`withinCeiling`) for text AND model, both modes: at
    most 15 significant digits and a safe-integer minor value. Text beyond
    it gets `moneyInput.tooLarge`; an outside model beyond it is unshowable
    with the same message; `stepBy` refuses non-finite or ceiling results.
- **Copy/cut** put the raw value (`1234.5`, major units, `-` sign) on the
  clipboard only when `parse(display)` equals the model; partial
  selections, empty, error, incomplete or otherwise differing text fall back
  to the browser.
- **Form `name`**: removed from the visible input. A hidden
  `<input type="hidden" :name>` (inside the `#after` slot) holds the
  canonical raw value in model units (`1234.5`, or `1250` with `minorUnits`),
  empty while `invalid` (parse error, incomplete, unshowable, out of range)
  or the model is `null`; it is `disabled` with the field.
- **Errors**: unparsable text keeps the last valid model, sets the built-in
  `moneyInput.invalid` (`invalidWhole` when `decimalPlaces` is 0) message
  (en + uk) as ControlElement `error` (`aria-invalid`, `aria-describedby`).
  A non-empty consumer `error` prop wins; `""` does not hide the built-in
  one. A `#controls` step clears the error. Incomplete
  prefixes (`.`, `$`, `US`, lone `-`) show no visible error while typing,
  judged on blur, but set custom validity and `invalid` at once; never-valid text errors at once. On blur unparsable text and its
  error stay. Error clears on valid input, a step or an emptied field. With
  `min >= 0` any `-` errors at once; a lone `-` is incomplete only when
  `min < 0`.
- **Unshowable outside model** (non-finite, more decimals than
  `decimalPlaces`, non-integer with `minorUnits`, beyond the ceiling): error state +
  `console.warn`, shown as its own plain digits (empty for NaN/Infinity),
  never rounded, rewritten or emitted; blur and steps leave it alone.
- **Native validity**: parse error, incomplete text and out-of-range call
  `input.setCustomValidity(message)` (cleared when valid), so native submit
  blocks; one computed message, so it follows the UI language. The model stays
  unclamped while focused; clamp happens on blur. When the bound cannot be shown exactly with the field's decimals (or as a whole number with `minorUnits`), blur leaves the value unclamped and the field shows the out-of-range error; a step toward such a bound does nothing. An untouched outside value
  below `min` is out of range (no parse error) and clamps on blur.
- **Clamp** to `min`/`max` on blur and step. `min`/`max` are in **model units**
  (cents with `minorUnits`); `step` is always **major units**. `min` defaults
  to `0`, so negatives are opt-in: pass `min` below 0 (`-Infinity` for no
  bound), otherwise a minus sign is unparsable at once.
- **No steppers by default.** `#controls` slot exposes `{ increase, decrease,
isAtMax, isAtMin }`; `increase`/`decrease` do nothing while `disabled` or
  with a `readonly` attr.
- **`defineExpose({ input, focused, invalid })`**: `input` and `focused` proxy
  the inner `<orio-input>` (`focused` is writable, like Input); `invalid` is
  true on a parse error, incomplete text, an unshowable model or an
  out-of-range value.
- **Currency description** uses the vue-i18n UI language (`Intl.DisplayNames`),
  not the field `locale`.
- **`inheritAttrs: false`**; `$attrs` go to the inner input, ControlProps
  keys are forwarded, the Money-only props are stripped.
- **Browser floor**: `Intl.NumberFormat` v3 (exact decimal-string formatting):
  Chrome 106, Safari 15.4, Firefox 116.

## Gotchas

- **Model meaning flips with `minorUnits`.** Never toggle it at runtime with a
  live value; the same number changes by a factor of `10^decimalPlaces`.
- **`1.005` is rejected, not rounded** (a non-zero extra fraction digit is an
  error; extra zeros like `12.500` are dropped).
- **Format comes from the text**: uk `1.5` is 1.5, `1,234` in en is 1234;
  only a true tie uses the locale. Do not add locale-only guessing back.
- **Pass `locale` for deterministic output** in tests and SSR-sensitive
  screens; omitting it switches from `en-US` to the browser locale after mount.

## Quick reference — minor units (from docs/components/number-input-money.md)

```vue
<orio-number-input-money
  v-model="cents"
  currency="USD"
  locale="en-US"
  minor-units
  label="Price"
/>
```

`cents` starts as `ref(1250)`; the field shows `$12.50` unfocused.

## Quick reference — decimal places override (from docs/components/number-input-money.md)

```vue
<orio-number-input-money
  v-model="huf"
  currency="HUF"
  locale="hu-HU"
  :decimal-places="2"
  label="Ár"
/>
```

## Quick reference — controls slot (from docs/components/number-input-money.md)

```vue
<orio-number-input-money
  v-model="stepped"
  currency="USD"
  locale="en-US"
  :max="20"
  label="Tip"
>
  <template #controls="{ increase, decrease, isAtMax, isAtMin }">
    <orio-button :disabled="isAtMin" @click="decrease">-</orio-button>
    <orio-button :disabled="isAtMax" @click="increase">+</orio-button>
  </template>
</orio-number-input-money>
```

## Related

- `<orio-number-input>` — plain native number input.
- `<orio-input>` — the wrapped field.
- Public API reference: `docs/components/number-input-money.md`.
