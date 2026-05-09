# DateRangePicker

Date range picker built on top of [`Calendar`](../calendar.md). Renders a trigger that opens a popover containing two independently navigable calendars — pick a month/year on each side freely.

## Live Demo

<script setup>
import { ref } from 'vue'

const employmentDates = ref({
  start: '2020-01-01',
  end: '2024-12-31'
})

const projectDates = ref({
  start: null,
  end: null
})
</script>

<div class="demo-container">
  <orio-date-range-picker v-model="employmentDates" label="Employment Period" />
</div>

<div class="demo-container">
  <orio-date-range-picker v-model="projectDates" label="Project Window" />
</div>

<div class="demo-output">
  <strong>Employment:</strong> {{ employmentDates.start }} → {{ employmentDates.end }}<br>
  <strong>Project:</strong> {{ projectDates.start }} → {{ projectDates.end }}
</div>

## Usage

```vue
<script setup>
import { ref } from "vue";
const dates = ref({ start: null, end: null });
</script>

<template>
  <orio-date-range-picker v-model="dates" label="Project Window" />
</template>
```

## Selection behaviour

- First click sets `start`, clears `end`.
- Second click sets `end`. If the picked date is before `start`, the two are swapped.
- A third click (when the range is complete) starts a fresh range.
- Hovering after the first click previews the range across both calendars.

## Props

Inherits all `ControlProps` (`label`, `size`, `layout`, `error`, ...).

| Prop          | Type                                          | Default     | Description                                                                              |
| ------------- | --------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| `placeholder` | `string`                                      | i18n string | Trigger text when nothing selected                                                       |
| `min`         | `string \| null`                              | `null`      | ISO `YYYY-MM-DD` lower bound                                                             |
| `max`         | `string \| null`                              | `null`      | ISO `YYYY-MM-DD` upper bound                                                             |
| `markers`     | `CalendarMarker[]`                            | `[]`        | Highlight ranges — passed through to both calendars                                      |
| `getMarker`   | `(iso) => CalendarMarker \| null`             | —           | Per-day marker callback. The hover-preview range overrides this while picking            |
| `isDisabled`  | `(iso) => boolean`                            | —           | Extra disabled predicate, combined with `min` / `max`                                    |

See [Calendar](../calendar.md) for the `CalendarMarker` type and resolution rules.

## v-model

`DateRange` — `{ start: string | null, end: string | null }` with ISO date strings.

```typescript
interface DateRange {
  start: string | null;
  end: string | null;
}
```

## Events

| Event               | Payload     | Description                |
| ------------------- | ----------- | -------------------------- |
| `update:modelValue` | `DateRange` | Emitted when range changes |
