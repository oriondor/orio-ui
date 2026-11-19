# NumberInput

Native numeric input with min/max constraints and optional step controls. Available in three variants. For currency amounts see [NumberInputMoney](./number-input-money).

## Live Demo

<script setup>
import { ref } from 'vue'

const basic = ref(10)
const vertical = ref(5)
const horizontal = ref(1)
const price = ref(9.99)
const horizontalLayout = ref(3)
const innerBasic = ref(25)
const innerVertical = ref(8)
const innerHorizontal = ref(4)
const empty = ref(null)
</script>

### Basic (No Controls)

<div class="demo-container">
  <orio-number-input
    v-model="basic"
    :min="0"
    :max="100"
    label="Quantity"
    placeholder="Enter quantity"
  />
  <div class="demo-output">Value: {{ basic }}</div>
</div>

### Vertical Controls

<div class="demo-container">
  <orio-number-input-vertical
    v-model="vertical"
    :min="0"
    :max="100"
    :step="1"
    label="Quantity"
  />
  <div class="demo-output">Value: {{ vertical }}</div>
</div>

### Horizontal Controls

<div class="demo-container">
  <orio-number-input-horizontal
    v-model="horizontal"
    :min="0"
    :max="10"
    :step="1"
    label="Items"
  />
  <div class="demo-output">Value: {{ horizontal }}</div>
</div>

### Decimal Values

<div class="demo-container">
  <orio-number-input-horizontal
    v-model="price"
    :min="0"
    :max="1000"
    :step="0.01"
    :decimal-places="2"
    label="Price"
  />
  <div class="demo-output">Value: {{ price }}</div>
</div>

### Empty Value

<div class="demo-container">
  <orio-number-input-horizontal
    v-model="empty"
    :min="0"
    :step="0.1"
    :decimal-places="2"
    label="Amount"
  />
  <div class="demo-output">Value: {{ empty }}</div>
</div>

### Horizontal Layout

<div class="demo-container">
  <orio-number-input-vertical
    v-model="horizontalLayout"
    :min="0"
    :max="10"
    label="Amount"
    layout="horizontal"
  />
</div>

### Inner Layout

<div class="demo-container">
  <div class="demo-grid">
    <orio-number-input
      v-model="innerBasic"
      :min="0"
      :max="100"
      label="Quantity"
      layout="inner"
    />
    <orio-number-input-vertical
      v-model="innerVertical"
      :min="0"
      :max="50"
      label="Stock"
      layout="inner"
    />
    <orio-number-input-horizontal
      v-model="innerHorizontal"
      :min="0"
      :max="20"
      label="Count"
      layout="inner"
    />
  </div>
</div>

## Variants

| Component                      | Description                                 |
| ------------------------------ | ------------------------------------------- |
| `orio-number-input`            | Basic number input without controls         |
| `orio-number-input-vertical`   | Controls stacked vertically on the right    |
| `orio-number-input-horizontal` | Minus/plus controls on left and right sides |

## Usage

### Basic

```vue
<template>
  <orio-number-input v-model="value" :min="0" :max="100" />
</template>

<script setup>
const value = ref(0);
</script>
```

### Vertical Controls

```vue
<orio-number-input-vertical
  v-model="quantity"
  :min="1"
  :max="99"
  :step="1"
  label="Quantity"
/>
```

### Horizontal Controls

```vue
<orio-number-input-horizontal
  v-model="count"
  :min="0"
  :max="10"
  :step="1"
  label="Count"
/>
```

### Decimal Values

```vue
<orio-number-input-horizontal
  v-model="price"
  :min="0"
  :max="1000"
  :step="0.01"
  :decimal-places="2"
  label="Price"
/>
```

### Horizontal Layout

```vue
<orio-number-input v-model="value" label="Amount" layout="horizontal" />
```

### Inner Layout

```vue
<orio-number-input v-model="value" label="Quantity" layout="inner" />
```

## Features

- **Native number input** - Always renders `<input type="number">`: browser parsing, `.` as the decimal mark, no locale text handling. A `type` attribute is ignored. For currency amounts use [`orio-number-input-money`](./number-input-money)
- **Nullable model** - Clearing the field emits `null` and never `0`; `-0` becomes `0`. The steppers start from `min ?? 0`, so from an empty field they land on `min + step` (`step` when there is no `min`). Native ArrowUp/ArrowDown from an empty field is the browser's own and goes to `min`
- **Boundary clamping** - Values are clamped to min/max on blur and on step; `disabled` and `readonly` block the steppers
- **Exact decimal rounding** - Control decimal places with `decimalPlaces`; `1.005` at 2 places is `1.01`, `0.1 + 0.2` steps give `0.3`. Precision is the larger of `decimalPlaces` and the decimals of `step`
- **Bad input is cleared** - Native bad input (a lone `-`, `e`, a trailing `.` such as `1.` in Chrome) is cleared on blur and the value is `null`
- **Increment/Decrement buttons** - Click to adjust value by step amount (Vertical & Horizontal)
- **Accessible steppers** - The buttons are named from vue-i18n (`numberInput.increase` / `numberInput.decrease`) and skipped by Tab (`tabindex="-1"`); the keyboard path is ArrowUp/ArrowDown on the input (spinbutton pattern)
- **Press and hold** - Hold button to continuously adjust after 500ms delay (Vertical & Horizontal)

## Props

| Prop            | Type                                    | Default      | Description                                                                    |
| --------------- | --------------------------------------- | ------------ | ------------------------------------------------------------------------------ |
| `modelValue`    | `number \| null`                        | `null`       | Input value (v-model); empty is `null`                                         |
| `layout`        | `"vertical" \| "horizontal" \| "inner"` | `"vertical"` | Label position relative to input                                               |
| `min`           | `number`                                | `undefined`  | Minimum allowed value                                                          |
| `max`           | `number`                                | `undefined`  | Maximum allowed value                                                          |
| `step`          | `number`                                | `1`          | Amount to increment/decrement per step                                         |
| `decimalPlaces` | `number`                                | `0`          | Decimal places values are rounded to (never fewer than the decimals of `step`) |
| `label`         | `string`                                | `undefined`  | Label text                                                                     |
| `placeholder`   | `string`                                | `undefined`  | Placeholder text                                                               |

All standard HTML input attributes are supported via `v-bind="$attrs"`.

## Events

| Event               | Payload          | Description                      |
| ------------------- | ---------------- | -------------------------------- |
| `update:modelValue` | `number \| null` | Emitted when input value changes |

## Styling

```css
--color-bg           /* Input background */
--color-border       /* Border color */
--color-text         /* Text color */
--color-accent       /* Focus border color */
```
