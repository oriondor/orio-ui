# RadioButton

Custom radio button component. Use a shared `v-model` and unique `value` props to group radios — only one can be selected at a time.

## Live Demo

<script setup>
import { ref } from 'vue'

const plan = ref('monthly')
const size = ref('md')
</script>

<div class="demo-container">
  <div class="demo-grid">
    <orio-radio-button v-model="plan" name="plan" value="monthly">Monthly</orio-radio-button>
    <orio-radio-button v-model="plan" name="plan" value="yearly">Yearly</orio-radio-button>
    <orio-radio-button v-model="plan" name="plan" value="lifetime">Lifetime</orio-radio-button>
  </div>
</div>

<div class="demo-output">
  <strong>Selected plan:</strong> {{ plan }}
</div>

## Hide Label

The label is visually hidden but still announced by screen readers.

<div class="demo-container">
  <div class="demo-grid">
    <orio-radio-button v-model="size" name="size" value="sm" label="Small" hide-label />
    <orio-radio-button v-model="size" name="size" value="md" label="Medium" hide-label />
    <orio-radio-button v-model="size" name="size" value="lg" label="Large" hide-label />
  </div>
</div>

<div class="demo-output">
  <strong>Selected size:</strong> {{ size }}
</div>

## Usage

```vue
<template>
  <orio-radio-button v-model="plan" name="plan" value="monthly">Monthly</orio-radio-button>
  <orio-radio-button v-model="plan" name="plan" value="yearly">Yearly</orio-radio-button>
  <orio-radio-button v-model="plan" name="plan" value="lifetime">Lifetime</orio-radio-button>
</template>

<script setup>
import { ref } from 'vue'

const plan = ref('monthly')
</script>
```

## Props

| Prop         | Type      | Default | Description                                                      |
| ------------ | --------- | ------- | ---------------------------------------------------------------- |
| `modelValue` | `unknown` | -       | Shared group value (v-model); radio is checked when it matches `value` |
| `value`      | `unknown` | -       | The value this radio represents                                  |
| `name`       | `string`  | -       | HTML `name` attribute — groups radios for keyboard nav and form submission |
| `label`      | `string`  | -       | Inline label text (alternative to default slot)                  |
| `hideLabel`  | `boolean` | `false` | Visually hides the label while keeping it accessible to screen readers |

## Events

| Event               | Payload   | Description                        |
| ------------------- | --------- | ---------------------------------- |
| `update:modelValue` | `unknown` | Emitted when the radio is selected |

## Slots

| Slot      | Props | Description                              |
| --------- | ----- | ---------------------------------------- |
| `default` | -     | Label text / content (overrides `label` prop) |
