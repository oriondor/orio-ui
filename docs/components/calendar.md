# Calendar

Pure UI primitive that renders a single month grid. Owns no selection state — the parent passes visual props (`selected`, `markers`) and listens to `select` / `dayEnter` events.

Used internally by [`DatePicker`](./date/picker.md) and [`DateRangePicker`](./date/range-picker.md). Use it directly only when you need a custom selection flow.

## Live Demo

<script setup>
import { ref } from 'vue'

const anchor = ref('2026-07-01')
const picked = ref(null)

const annotated = ref('2026-07-14')
const annotatedAnchor = ref('2026-07-01')
const markers = [
  { variant: 'success', start: '2026-07-03', end: '2026-07-07' },
  { variant: 'alert', start: '2026-07-12', end: '2026-07-14' },
  { variant: 'danger', start: '2026-07-20', end: '2026-07-20' },
]
const isDisabled = (iso) => {
  const day = new Date(iso).getDay()
  return day === 0 || day === 6
}
</script>

<div class="demo-container">
  <orio-calendar
    v-model:anchor="anchor"
    :selected="picked"
    @select="picked = $event"
  />
  <div class="demo-output">Picked: {{ picked ?? '(none)' }}</div>
</div>

### Markers + disabled weekends

<div class="demo-container">
  <orio-calendar
    v-model:anchor="annotatedAnchor"
    :selected="annotated"
    :markers="markers"
    :is-disabled="isDisabled"
    @select="annotated = $event"
  />
</div>

## Usage

```vue
<script setup>
import { ref } from "vue";

const anchor = ref("2026-07-01");
const picked = ref(null);

const markers = [
  { variant: "success", start: "2026-07-03", end: "2026-07-07" },
  { variant: "alert", start: "2026-07-12", end: "2026-07-14" },
  { variant: "danger", start: "2026-07-20", end: "2026-07-20" },
];

const isDisabled = (iso) => {
  const day = new Date(iso).getDay();
  return day === 0 || day === 6; // disable weekends
};
</script>

<template>
  <orio-calendar
    v-model:anchor="anchor"
    :selected="picked"
    :markers="markers"
    :is-disabled="isDisabled"
    @select="picked = $event"
  />
</template>
```

## Props

| Prop           | Type                              | Default | Description                                         |
| -------------- | --------------------------------- | ------- | --------------------------------------------------- |
| `selected`     | `string \| null`                  | `null`  | ISO date highlighted as the active pick             |
| `markers`      | `CalendarMarker[]`                | `[]`    | Declarative ranges to highlight                     |
| `getMarker`    | `(iso) => CalendarMarker \| null` | —       | Per-day callback, overrides `markers` when non-null |
| `isDisabled`   | `(iso) => boolean`                | —       | Predicate; days returning `true` are non-clickable  |
| `weekStartsOn` | `0 \| 1`                          | `1`     | `0` = Sunday, `1` = Monday                          |

## Types

```typescript
type MarkerVariant = "accent" | "success" | "alert" | "danger" | "muted";

interface CalendarMarker {
  variant: MarkerVariant;
  start: string; // inclusive ISO YYYY-MM-DD
  end: string; // inclusive — equal to start for single-day
}
```

## Marker resolution

For each day:

1. If `getMarker(iso)` returns a marker, it wins.
2. Otherwise, the **last** matching marker in the `markers` array (last-wins for overlap).
3. The active `selected` date renders as a filled accent badge **on top** of any marker.
4. `isDisabled(iso) === true` makes the cell non-clickable and dimmed.

Multi-day markers render as a connected band — only the marker's `start` and `end` cells round their outer corners.

## v-model

| Model    | Type             | Description                            |
| -------- | ---------------- | -------------------------------------- |
| `anchor` | `string \| null` | ISO date controlling the visible month |

## Events

| Event           | Payload  | Description                                |
| --------------- | -------- | ------------------------------------------ |
| `select`        | `string` | Emitted when a non-disabled day is clicked |
| `dayEnter`      | `string` | Emitted on day hover (for range preview)   |
| `update:anchor` | `string` | Emitted when the user navigates months     |

All dates use ISO `YYYY-MM-DD` strings.
