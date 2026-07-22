# MonthCalendar

Pure UI primitive that renders a year as a 3×4 grid of months. The month-granularity sibling of [`Calendar`](../calendar.md) — it owns no selection state; the parent passes visual props (`selected`, `markers`) and listens to `select` / `monthEnter`.

Every ISO date is pinned to the **first of its month**, so `selected`, `markers`, and the emitted `select` value all align on `YYYY-MM-01`. Chevrons page the visible year; keyboard arrows rove the grid and page across years at the edges.

## Live Demo

<script setup>
import { ref } from 'vue'

const anchor = ref('2026-01-01')
const picked = ref(null)

const annotatedAnchor = ref('2026-01-01')
const annotated = ref('2026-05-01')
const markers = [
  { variant: 'success', start: '2026-02-01', end: '2026-04-01' },
  { variant: 'alert', start: '2026-07-01', end: '2026-08-01' },
  { variant: 'danger', start: '2026-11-01', end: '2026-11-01' },
]
// disable months before today
const isDisabled = (iso) => new Date(iso) < new Date('2026-03-01')
</script>

<div class="demo-container">
  <orio-date-month-calendar
    v-model:anchor="anchor"
    :selected="picked"
    @select="picked = $event"
  />
  <div class="demo-output">Picked: {{ picked ?? '(none)' }}</div>
</div>

### Markers + disabled months

<div class="demo-container">
  <orio-date-month-calendar
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

const anchor = ref("2026-01-01");
const picked = ref(null);

const markers = [
  { variant: "success", start: "2026-02-01", end: "2026-04-01" },
  { variant: "alert", start: "2026-07-01", end: "2026-08-01" },
  { variant: "danger", start: "2026-11-01", end: "2026-11-01" },
];

const isDisabled = (iso) => new Date(iso) < new Date("2026-03-01");
</script>

<template>
  <orio-date-month-calendar
    v-model:anchor="anchor"
    :selected="picked"
    :markers="markers"
    :is-disabled="isDisabled"
    @select="picked = $event"
  />
</template>
```

## Props

| Prop         | Type                              | Default | Description                                            |
| ------------ | --------------------------------- | ------- | ------------------------------------------------------ |
| `selected`   | `string \| null`                  | `null`  | ISO date highlighted as the active pick (pinned to its month) |
| `markers`    | `CalendarMarker[]`                | `[]`    | Declarative ranges to highlight                        |
| `getMarker`  | `(iso) => CalendarMarker \| null` | —       | Per-month callback, overrides `markers` when non-null  |
| `isDisabled` | `(iso) => boolean`                | —       | Predicate; months returning `true` are non-clickable   |

Marker and disabled callbacks receive the first-of-month ISO string (`YYYY-MM-01`).

## Types

```typescript
// re-used from Calendar
type MarkerVariant = "accent" | "success" | "alert" | "danger" | "muted";

interface CalendarMarker {
  variant: MarkerVariant;
  start: string; // inclusive ISO YYYY-MM-DD (pinned to month for comparison)
  end: string; // inclusive — equal to start for a single month
}

// exported from MonthCalendar.vue
interface MonthCalendarProps {
  selected?: string | null;
  markers?: CalendarMarker[];
  getMarker?: (iso: string) => CalendarMarker | null;
  isDisabled?: (iso: string) => boolean;
}
```

## Marker resolution

For each month:

1. If `getMarker(iso)` returns a marker, it wins.
2. Otherwise, the **last** matching marker in the `markers` array (last-wins for overlap).
3. The active `selected` month renders as a filled accent badge **on top** of any marker.
4. `isDisabled(iso) === true` makes the cell non-clickable and dimmed.

Multi-month markers render as a connected band — only the marker's `start` and `end` cells round their outer corners.

## v-model

| Model    | Type             | Description                           |
| -------- | ---------------- | ------------------------------------- |
| `anchor` | `string \| null` | ISO date controlling the visible year |

## Events

| Event           | Payload  | Description                                          |
| --------------- | -------- | --------------------------------------------------- |
| `select`        | `string` | First-of-month ISO of the clicked month             |
| `monthEnter`    | `string` | Emitted on month hover (for range preview)          |
| `update:anchor` | `string` | Emitted when the user pages to another year         |

All dates use ISO `YYYY-MM-DD` strings, normalized to the first of the month.

## Keyboard

| Key                | Action                                             |
| ------------------ | -------------------------------------------------- |
| Arrow keys         | Move focus within the grid; wrap to the adjacent year at the edges |
| `PageUp` / `PageDown` | Jump one year back / forward                    |
| `Enter` / `Space`  | Select the focused month                           |

Disabled months are skipped during arrow navigation.
