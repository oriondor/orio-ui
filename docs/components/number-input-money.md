# NumberInputMoney

Currency amount input. The symbol is a fixed affix beside the field, typing and pasting read the format from the text (the field's locale only breaks a tie), and the model is either a number in major units or an integer of minor units (cents).

## Live Demo

<script setup>
import { ref } from 'vue'

const usd = ref(1234.5)
const uah = ref(1234.5)
const eur = ref(1234.5)
const cents = ref(1250)
const huf = ref(1234)
const negative = ref(-20)
const inner = ref(99.9)
const invalid = ref(5)
const stepped = ref(10)
</script>

### Default (USD)

<div class="demo-container">
  <orio-number-input-money
    v-model="usd"
    currency="USD"
    locale="en-US"
    label="Price"
  />
  <div class="demo-output">Value: {{ usd }}</div>
</div>

### Ukrainian locale (UAH, suffix)

<div class="demo-container">
  <orio-number-input-money
    v-model="uah"
    currency="UAH"
    locale="uk-UA"
    label="Ціна"
  />
  <div class="demo-output">Value: {{ uah }}</div>
</div>

### German locale (EUR, suffix)

<div class="demo-container">
  <orio-number-input-money
    v-model="eur"
    currency="EUR"
    locale="de-DE"
    label="Preis"
  />
  <div class="demo-output">Value: {{ eur }}</div>
</div>

### Minor units

<div class="demo-container">
  <orio-number-input-money
    v-model="cents"
    currency="USD"
    locale="en-US"
    minor-units
    label="Price"
  />
  <div class="demo-output">Model (cents): {{ cents }}</div>
</div>

### Decimal places override

<div class="demo-container">
  <orio-number-input-money
    v-model="huf"
    currency="HUF"
    locale="hu-HU"
    :decimal-places="2"
    label="Ár"
  />
  <div class="demo-output">Value: {{ huf }}</div>
</div>

### Negative amounts

<div class="demo-container">
  <orio-number-input-money
    v-model="negative"
    currency="USD"
    locale="en-US"
    :min="-1000"
    label="Balance"
  />
  <div class="demo-output">Value: {{ negative }}</div>
</div>

### Inner layout

<div class="demo-container">
  <orio-number-input-money
    v-model="inner"
    currency="USD"
    locale="en-US"
    layout="inner"
    label="Total"
  />
</div>

### Error

<div class="demo-container">
  <orio-number-input-money
    v-model="invalid"
    currency="USD"
    locale="en-US"
    error="Amount exceeds your balance"
    label="Withdraw"
  />
</div>

### Controls slot

<div class="demo-container">
  <orio-number-input-money
    v-model="stepped"
    currency="USD"
    locale="en-US"
    :max="20"
    label="Tip"
  >
    <template #controls="{ increase, decrease, isAtMax, isAtMin }">
      <orio-button type="button" :disabled="isAtMin" @click="decrease">-</orio-button>
      <orio-button type="button" :disabled="isAtMax" @click="increase">+</orio-button>
    </template>
  </orio-number-input-money>
  <div class="demo-output">Value: {{ stepped }}</div>
</div>

## Usage

```vue
<orio-number-input-money
  v-model="usd"
  currency="USD"
  locale="en-US"
  label="Price"
/>
```

### Minor units

```vue
<orio-number-input-money
  v-model="cents"
  currency="USD"
  locale="en-US"
  minor-units
  label="Price"
/>
```

### Decimal places override

```vue
<orio-number-input-money
  v-model="huf"
  currency="HUF"
  locale="hu-HU"
  :decimal-places="2"
  label="Ár"
/>
```

### Negative amounts

```vue
<orio-number-input-money
  v-model="negative"
  currency="USD"
  locale="en-US"
  :min="-1000"
  label="Balance"
/>
```

### Controls slot

```vue
<orio-number-input-money
  v-model="stepped"
  currency="USD"
  locale="en-US"
  :max="20"
  label="Tip"
>
  <template #controls="{ increase, decrease, isAtMax, isAtMin }">
    <orio-button type="button" :disabled="isAtMin" @click="decrease">-</orio-button>
    <orio-button type="button" :disabled="isAtMax" @click="increase">+</orio-button>
  </template>
</orio-number-input-money>
```

## Features

- **Locale-aware display** - Focused, the field shows raw editable text without grouping (`1234.5` in `en`, `1234,5` in `de`). On blur it shows grouping and a fixed number of fraction digits (`1,234.50` in `en`, `1.234,50` in `de`, `1 234,50` in `uk`), always with Latin digits
- **Currency affix** - The symbol sits outside the editable text, muted, on the side the locale uses (`$` before in `en-US`, `₴` after in `uk-UA`, `€` after in `de-DE`). It is hidden from assistive technology; the currency name is announced as the input's description instead. The symbol comes from `Intl`, so a browser may show `грн` for UAH where Node shows `₴`. A malformed currency code (a `RangeError`, e.g. `US`) renders no affix, uses `decimalPlaces` or 2 places and logs a warning; a well-formed unknown code (`ZZZ`) is shown as the affix without a warning
- **Value alignment** - Digits are end-aligned with tabular numerals so amounts line up
- **Nullable model** - Empty is `null`, never `0`; `-0` becomes `0`
- **No negatives by default** - `min` defaults to `0`, so any `-` (`-`, `-5`, `-1,234`) is an error at once. Pass a negative `min` to allow them (`-Infinity` for no lower bound); then a lone `-` is incomplete and shows no error while typing. Values are clamped to `min`/`max` on blur and on step (except a `readonly` field, which blur leaves unclamped), and stay unclamped while the field is focused. If the bound cannot be shown exactly with the field's decimals (or as a whole number with `minorUnits`), blur leaves the value unclamped and the field shows the out-of-range error; a step toward such a bound does nothing
- **No steppers by default** - Use the `#controls` slot; `step` is in major units (default `1`)

## Parsing rules

The separator format is read from the text itself, in any locale; the field's `locale` only breaks a true tie. Typed and pasted text use the same parser.

- **Accepted** - Digits of any script (read as Latin), the locale's decimal and group marks, whitespace including non-breaking spaces around the value, the field's own currency symbol, narrow symbol or code (whatever `currencyDisplay` shows), the Unicode minus `−`, invisible bidi marks, and the Arabic separators `٫` and `٬`
- **Edges only** - The sign and at most one currency token are read only at the edges (`$ 5`, `-$5`, `5 USD`). Inside the number, whitespace or an apostrophe is only ever grouping and needs valid groups (`1 234,50`, `1'234`; `100 200` gives `100200`). A single space or apostrophe with a short last group (`1 2`, `1 23`, `1'`) is incomplete while typing and an error on blur, like `12 5` and `1'2`. `1'2'3`, `1USD5`, `$10 $50`, `5USD5` and `$$5` are errors at once
- **Rejected** - Any letter or any other currency symbol (`€5` in a USD field)
- **Valid groups** - First group 1-3 digits without a leading zero, middle groups 2 or 3 digits (Indian `12,34,567`), last group exactly 3
- **Both `.` and `,` present** - The last one is the decimal mark, the other must group valid groups (`1.234,50`, `1,234.50`, `12,34,567.00`); otherwise unparsable (`0,123.45`)
- **One kind of mark** - Once, it is the decimal when it cannot be grouping: the fraction is not 3 digits, or the integer part starts with 0, is empty or is longer than 3 digits (`1234.5`, `12,5`, `0,500`, `1.2`, `.5`). Repeated with valid groups it is grouping (`1.234.567`); repeated and invalid is unparsable, except a prefix of a valid grouped number (`1,234,5`, `12,34,5`), which is incomplete. A true tie (`1,234`, `1.234`) is decided by the field locale: its group mark means grouping, otherwise decimal. `1,234` in `en` is grouping → `1234`; `1,234` in `de` EUR is a decimal → error (too many decimals); `1.234` in `de` is grouping → `1234`; `1.234` in `en` is a decimal → error (too many decimals)
- **Too many fraction digits** - Extra digits beyond `decimalPlaces` that are all zeros are dropped (`0,500` and `12.500` in USD give `0.5` and `12.5`); a non-zero extra digit is unparsable, never rounded (`12.505` in USD, `12.5` in JPY)
- **Ceiling** - In both modes a value holds at most 15 significant digits and its minor-unit integer must be a safe integer. Beyond it the text is rejected with its own message ("Amount is too large"); an outside model beyond it is shown as an error and never emitted, and a step that would pass it does nothing
- **Paste examples** - `$1,234.50` in `en-US` USD gives `1234.5`; `1 234,50` followed by the UAH symbol (`₴` in Node, `грн` in Chrome, either also parses) in `uk-UA` gives `1234.5`; `1.234,50` in `de-DE` EUR gives `1234.5`

## Error behaviour

- **Unparsable text** - The model keeps the last valid value and the field shows a built-in translated error (`aria-invalid="true"`, linked with `aria-describedby`). The error clears on the next valid input or when the field is emptied
- **While typing** - Incomplete text that may still become valid (`.`, `$`, `US`, a lone `-`) shows no error until blur, but it already blocks native submit (`invalid` is true). `12.` is a complete `12`. Text that can never become valid errors at once
- **On blur** - Unparsable or incomplete text stays so it can be fixed, and the error stays
- **Your own `error`** - A non-empty `error` prop wins over the built-in message; an empty string does not hide it
- **Steps** - A step from the `#controls` slot clears the parse error and shows the stepped value. A `step` finer than the field's decimals (`0.005` for USD) is refused
- **Outside value that cannot be shown** - A model that is not finite, has more decimals than `decimalPlaces`, is not a whole number with `minor-units`, or is beyond the safe ceiling is never rounded, rewritten or emitted. The field shows the built-in error and a console warning, with the value's own exact digits (empty for `NaN`/`Infinity`)
- **Native validation** - A parse error, incomplete text or an out-of-range value calls `setCustomValidity(message)` on the input, so a native form submit is blocked; it is cleared when the value is valid. A `readonly` field is barred from constraint validation and does not block submit. `defineExpose` also gives `invalid` (boolean), `input` and a writable `focused`
- **Form submission** - The visible input carries no `name`. With a `name` prop a hidden `<input type="hidden">` submits the canonical raw value in model units (`1234.5`, or `1250` with `minor-units`), empty while the text is invalid, incomplete, out of range, cannot be shown or is not the model (a declined update)
- **Messages** - Built-in messages are translated (en, uk); with `decimalPlaces` 0 the message asks for a whole amount. The currency name in the description follows the UI language (vue-i18n), not the field `locale`
- **Copy and cut** - Copy and cut put the raw value on the clipboard, but only when the shown text is the model value (not while it is incomplete or invalid; then the browser copies the text as is): plain digits, `.` as decimal, no grouping or symbol, `-` for negatives (`1234.5`, always in major units, even with `minor-units`); a 3-digit fraction gets a trailing `0` (`1.2340`) so a locale that groups with `.` does not read it as grouping. A partial selection copies as selected. Formatted copy is not supported
- **Outside value below `min`** - An untouched value below `min` is out of range (native validity message), not a parse error; it is clamped on blur (not in a `readonly` field)
- **Valid typing** - A valid value is not rewritten while focused, so `12.` is not clobbered

## Units of min, max and step

- `min` and `max` are in **model units**: cents when `minor-units` is set, so `:max="5000"` is 50.00 USD
- `step` is always in **major units** (`:step="1"` moves by 1.00 USD, or 100 cents with `minor-units`)

## Minor units

With `minor-units` the model is an integer: `12.50` USD is `1250`, `0.29` is `29`, `1.005` in a 2-place currency is rejected as having too many digits. Conversion shifts the decimal digits as text, never multiplies floats, so there is no drift. JPY has 0 places (`1250` stays `1250`), KWD has 3 (`1.250` is `1250`).

**Ceiling** - In both modes a value holds at most 15 significant digits (a double cannot hold more exactly) and its minor-unit integer must be a safe integer (`Number.MAX_SAFE_INTEGER`, 9,007,199,254,740,991). `90071992547409.91` in USD is rejected, and so is any outside model beyond the ceiling.

## Decimal places: CLDR versus your backend

`decimalPlaces` defaults to the currency's digits from the browser's CLDR data (USD 2, JPY 0, KWD 3). CLDR and payment backends can disagree: CLDR lists HUF and ISK with 2 places (as ISO 4217 does), while many systems store them as whole units. With `minor-units` the model changes meaning with this number, so a mismatch silently multiplies amounts by 100. Set `decimalPlaces` explicitly when your backend's exponent differs from the browser default.

## Browser support

Needs `Intl.NumberFormat` v3, which formats exact decimal strings: Chrome 106, Safari 15.4, Firefox 116 or newer. Older browsers lose the exact digit shifting for minor units and are not supported.

## Props

| Prop              | Type                                             | Default      | Description                                                                              |
| ----------------- | ------------------------------------------------ | ------------ | ---------------------------------------------------------------------------------------- |
| `modelValue`      | `number \| null`                                 | `null`       | Major units, or integer minor units with `minorUnits`; empty is `null`                   |
| `currency`        | `string`                                         | required     | ISO 4217 code, e.g. `"USD"`                                                              |
| `locale`          | `string`                                         | browser      | BCP 47 tag; defaults to `navigator.language` after mount (`en-US` during SSR)            |
| `currencyDisplay` | `"symbol" \| "narrowSymbol" \| "code" \| "name"` | `"symbol"`   | `Intl` currency display for the affix                                                    |
| `decimalPlaces`   | `number`                                         | currency's   | Fraction digits (integer 0-20); overrides the CLDR default, invalid warns and falls back. Above ~15 almost no amounts are showable (shared ceiling) |
| `minorUnits`      | `boolean`                                        | `false`      | Model is an integer of minor units                                                       |
| `min`             | `number`                                         | `0`          | Minimum in model units; negative allows negatives                                        |
| `max`             | `number`                                         | `undefined`  | Maximum in model units                                                                   |
| `step`            | `number`                                         | `1`          | Step of `increase`/`decrease`, in major units                                            |
| `layout`          | `"vertical" \| "horizontal" \| "inner"`          | `"vertical"` | Label position relative to input                                                         |
| `label`           | `string`                                         | `undefined`  | Label text                                                                               |
| `error`           | `string`                                         | `undefined`  | Error message; replaces the built-in parse error                                         |

The input is always `type="text"`; `inputmode="decimal"` and `autocomplete="off"` are defaults you can override; other attributes (`disabled`, `readonly`, `required`, `placeholder`) pass through.

## Slots

| Slot       | Props                                      | Description                         |
| ---------- | ------------------------------------------ | ----------------------------------- |
| `controls` | `{ increase, decrease, isAtMax, isAtMin }` | Custom step buttons after the affix |

## Events

| Event               | Payload          | Description                  |
| ------------------- | ---------------- | ---------------------------- |
| `update:modelValue` | `number \| null` | Emitted on every valid value |
