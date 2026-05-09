# DatePicker

Single-date picker built on top of [`Calendar`](../calendar.md). Renders as a button trigger that opens a popover with the calendar.

## Live Demo

<script setup>
import { ref } from 'vue'

const birthDate = ref('')
const startDate = ref('2024-01-15')
</script>

<div class="demo-container">
  <orio-date-picker v-model="birthDate" label="Birth Date" />
  <orio-date-picker v-model="startDate" label="Start Date" />
</div>

<div class="demo-output">
  <strong>Selected dates:</strong><br>
  Birth: {{ birthDate || '(not selected)' }}<br>
  Start: {{ startDate }}
</div>

## Usage

```vue
<template>
  <orio-date-picker v-model="birthDate" label="Birth Date" />
</template>

<script setup>
const birthDate = ref(null);
</script>
```

## Props

Inherits all `ControlProps` (`label`, `size`, `layout`, `error`, ...).

| Prop          | Type                                           | Default     | Description                                            |
| ------------- | ---------------------------------------------- | ----------- | ------------------------------------------------------ |
| `placeholder` | `string`                                       | i18n string | Trigger text when nothing selected                     |
| `min`         | `string \| null`                               | `null`      | ISO `YYYY-MM-DD` lower bound                           |
| `max`         | `string \| null`                               | `null`      | ISO `YYYY-MM-DD` upper bound                           |
| `markers`     | `CalendarMarker[]`                             | `[]`        | Highlight ranges — passed through to Calendar          |
| `getMarker`   | `(iso) => CalendarMarker \| null`              | —           | Per-day marker callback                                |
| `isDisabled`  | `(iso) => boolean`                             | —           | Extra disabled predicate, combined with `min` / `max`  |

See [Calendar](../calendar.md) for the `CalendarMarker` type and resolution rules.

## v-model

`string | null` — ISO `YYYY-MM-DD` date string.

## Events

| Event               | Payload          | Description               |
| ------------------- | ---------------- | ------------------------- |
| `update:modelValue` | `string \| null` | Emitted when date changes |
