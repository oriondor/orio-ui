# Slider

Single-value range slider built on a native `<input type="range">`, wrapped in `ControlElement`.

## Live Demo

<script setup>
import { ref } from 'vue'

const area = ref(60)
const volume = ref(40)
const opacity = ref(0.5)
const sizes = ['xs', 'sm', 'md', 'lg', 'xl']
</script>

### Basic

<div class="demo-container">
  <orio-slider v-model="volume" label="Volume" />
</div>

<div class="demo-output">
  <strong>Value:</strong> {{ volume }}
</div>

### Value readout

<div class="demo-container">
  <orio-slider v-model="area" label="Area" :min="20" :max="200" :step="5">
    <template #after>
      <orio-view-text>{{ area }} m²</orio-view-text>
    </template>
  </orio-slider>
</div>

### Fractional step

<div class="demo-container">
  <orio-slider v-model="opacity" label="Opacity" :min="0" :max="1" :step="0.1">
    <template #after>
      <orio-view-text>{{ opacity }}</orio-view-text>
    </template>
  </orio-slider>
</div>

### Sizes

<div class="demo-container">
  <orio-slider v-for="size in sizes" :key="size" v-model="volume" :size :label="size" />
</div>

### Horizontal layout, disabled, error

<div class="demo-container">
  <orio-slider v-model="volume" label="Horizontal" layout="horizontal" />
  <orio-slider v-model="volume" label="Disabled" disabled />
  <orio-slider v-model="volume" label="With error" error="Too loud" />
</div>

## Usage

```vue
<template>
  <orio-slider v-model="area" label="Area" :min="20" :max="200" :step="5">
    <template #after>
      <orio-view-text>{{ area }} m²</orio-view-text>
    </template>
  </orio-slider>
</template>

<script setup>
import { ref } from 'vue'

const area = ref(60)
</script>
```

## Props

Extends `ControlProps` (`label`, `error`, `size`, `layout`, `disabled`, `required`, `name`, …) — see [ControlElement](./control-element.md).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number` | `0` | Current value (v-model) |
| `min` | `number` | `0` | Lowest value |
| `max` | `number` | `100` | Highest value |
| `step` | `number` | `1` | Increment; emitted values snap to it |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `number` | Emitted while dragging or on keyboard change; clamped to `min`–`max` and snapped to `step` |

## Slots

| Slot | Description |
|------|-------------|
| `before` | Content inline before the track |
| `after` | Content inline after the track (e.g. value readout) |

## Keyboard Support

Native range behavior: **Arrow keys** step, **Page Up/Down** jump, **Home/End** go to `min`/`max`.

## Styling

```css
--color-accent          /* Filled track, thumb outline, focus ring */
--color-accent-hover    /* Thumb disc */
--color-border          /* Unfilled track */
--color-bg              /* Thumb ring */
--control-slider-thumb  /* Thumb diameter, from size */
--control-slider-track  /* Track height, from size */
```
