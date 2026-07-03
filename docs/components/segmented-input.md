# Segmented input

Fixed-length code input split into individual segments — one focusable box per
segment. Typing auto-advances to the next segment, Backspace on an empty
segment moves back. Ideal for OTP / verification codes and PINs.

## Live Demo

<script setup>
import { ref } from 'vue'

const otp = ref('')
const pairs = ref('')
const word = ref('')
const boundary = ref('')
const lastBoundary = ref('none')
</script>

### Basic (OTP)

<div class="demo-container">
  <orio-segmented-input v-model="otp" />
  <div>Value: {{ otp || '—' }}</div>
</div>

### Custom segment count and size

Two characters per segment, four segments:

<div class="demo-container">
  <orio-segmented-input v-model="pairs" :segments="4" :segment-size="2" />
  <div>Value: {{ pairs || '—' }}</div>
</div>

### Text segments

`type="string"` accepts any character:

<div class="demo-container">
  <orio-segmented-input v-model="word" type="string" :segments="5" />
  <div>Value: {{ word || '—' }}</div>
</div>

### Boundary events

`start` fires when Backspace steps before the first segment, `end` when focus
moves past the last one:

<div class="demo-container">
  <orio-segmented-input
    v-model="boundary"
    :segments="4"
    @start="lastBoundary = 'start'"
    @end="lastBoundary = 'end'"
  />
  <div>Last boundary event: {{ lastBoundary }}</div>
</div>

## Usage

### Basic

```vue
<template>
  <orio-segmented-input v-model="code" />
</template>

<script setup>
const code = ref("");
</script>
```

### Custom segment count and size

```vue
<orio-segmented-input v-model="licenseKey" :segments="4" :segment-size="2" />
```

### Text segments

```vue
<orio-segmented-input v-model="word" type="string" :segments="5" />
```

### Boundary events

```vue
<orio-segmented-input
  v-model="code"
  @start="focusPreviousField()"
  @end="submitCode()"
/>
```

## Props

| Prop          | Type                   | Default    | Description                                          |
| ------------- | ---------------------- | ---------- | ---------------------------------------------------- |
| `modelValue`  | `string \| number`     | `""`       | Joined value of all segments (v-model)               |
| `segments`    | `number \| string`     | `6`        | Number of segment boxes                              |
| `segmentSize` | `number \| string`     | `1`        | Characters per segment                               |
| `type`        | `"number" \| "string"` | `"number"` | `"number"` rejects non-digit keys on typed input     |

## Events

| Event               | Payload  | Description                                              |
| ------------------- | -------- | -------------------------------------------------------- |
| `update:modelValue` | `string` | Emitted with the joined segment values on every change    |
| `start`             | —        | Backspace pressed while the first segment is empty        |
| `end`               | —        | Focus moved past the last segment (all segments consumed) |

## Behavior notes

- The model is the plain concatenation of all segments — a 6-segment input
  with `segmentSize: 1` produces a 6-character string when complete.
- Pasting into any segment writes the whole pasted text into the model at
  once. With `type="number"` non-digit characters are stripped first; the
  result is truncated to the total capacity (`segments × segmentSize`). A
  paste that fills every segment also emits `end`.
- With `type="number"` each segment renders with `inputmode="numeric"`, so
  mobile devices show the digit keyboard.
- The first segment carries `autocomplete="one-time-code"`, letting supported
  browsers offer SMS code autofill.

## Styling

Segments are regular `<orio-input>` fields — they inherit its tokens:

```css
--color-bg           /* Segment background */
--color-border       /* Border color */
--color-text         /* Text color */
--color-accent       /* Focus border color */
--color-accent-soft  /* Focus ring color */
```
