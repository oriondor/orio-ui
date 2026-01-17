# NumberInput

Numeric input component with min/max constraints, step controls, and press-and-hold functionality.

## Live Demo

<script setup>
import { ref } from 'vue'

const quantity = ref(1)
const price = ref(9.99)
</script>

<div class="demo-container">
  <div class="demo-grid">
    <orio-number-input
      v-model="quantity"
      :min="0"
      :max="100"
      :step="1"
      label="Quantity"
      placeholder="Enter quantity"
    />
    <orio-number-input
      v-model="price"
      :min="0"
      :max="1000"
      :step="0.01"
      :decimal-places="2"
      label="Price"
      placeholder="Enter price"
    />
  </div>

  <div class="demo-output">
    <strong>Current values:</strong><br>
    Quantity: {{ quantity }}<br>
    Price: {{ price }}
  </div>
</div>

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

### With Label and Step

```vue
<orio-number-input
  v-model="quantity"
  :min="1"
  :max="99"
  :step="1"
  label="Quantity"
  placeholder="Enter quantity"
/>
```

### Decimal Values

```vue
<orio-number-input
  v-model="price"
  :min="0"
  :max="1000"
  :step="0.01"
  :decimal-places="2"
  label="Price"
/>
```

## Features

- **Increment/Decrement buttons** - Click to adjust value by step amount
- **Press and hold** - Hold button to continuously adjust after 500ms delay
- **Boundary validation** - Values are clamped to min/max range
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
