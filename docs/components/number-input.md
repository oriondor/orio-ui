# NumberInput

Numeric input components with min/max constraints and optional step controls. Available in three variants.

## Live Demo

<script setup>
import { ref } from 'vue'

const basic = ref(10)
const vertical = ref(5)
const horizontal = ref(1)
const price = ref(9.99)
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

## Variants

| Component | Description |
|-----------|-------------|
| `orio-number-input` | Basic number input without controls |
| `orio-number-input-vertical` | Controls stacked vertically on the right |
| `orio-number-input-horizontal` | Minus/plus controls on left and right sides |

## Usage

### Basic

```vue
<template>
  <orio-number-input v-model="value" :min="0" :max="100" />
</template>

<script setup>
const value = ref(0)
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

## Features

- **Boundary validation** - Values are clamped to min/max range on blur
- **Increment/Decrement buttons** - Click to adjust value by step amount (Vertical & Horizontal)
- **Press and hold** - Hold button to continuously adjust after 500ms delay (Vertical & Horizontal)
- **Decimal precision** - Control decimal places with `decimalPlaces` prop

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number` | `0` | Input value (v-model) |
| `min` | `number` | `undefined` | Minimum allowed value |
| `max` | `number` | `undefined` | Maximum allowed value |
| `step` | `number` | `1` | Amount to increment/decrement per step |
| `decimalPlaces` | `number` | `0` | Number of decimal places to display |
| `label` | `string` | `undefined` | Label text displayed above input |
| `placeholder` | `string` | `undefined` | Placeholder text |

All standard HTML input attributes are supported via `v-bind="$attrs"`.

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `number` | Emitted when input value changes |

## Styling

```css
--color-bg           /* Input background */
--color-border       /* Border color */
--color-text         /* Text color */
--color-accent       /* Focus border color */
```
