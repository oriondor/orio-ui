---
kind: component
category: Date
purpose: month picker, month grid, "pick a month", year view
short: 3×4 month grid for one year with roving-focus keyboard a11y, the month-granularity sibling of Calendar
invariants: true
---

# date/MonthCalendar — agent-only invariants

`<orio-date-month-calendar>` renders one year as a 3-column × 4-row grid of
months. It is the month-granularity sibling of `<orio-calendar>` and owns no
selection state: the parent passes `selected` / `markers` and listens to
`select`. `<orio-date-picker>` and `<orio-date-range-picker>` render it
instead of the day calendar when given `month`.

## Invariants

- **Every ISO date is pinned to the first of its month.** `selected`,
  marker bounds and the `select` payload all compare and emit as
  `YYYY-MM-01`. Passing `2026-05-17` as `selected` highlights May 2026.
- **`v-model:anchor` controls the visible year** (any ISO date in it, `null`
  falls back to `selected`, then today). The component writes the anchor
  back as `YYYY-01-01` whenever keyboard navigation leaves the year.
- **`isDisabled` / `getMarker` receive the first-of-month ISO**, not the
  original day. Keep them reactive — both run inside a computed.
- **Markers are matched in reverse order** — the last marker in the array
  wins on overlap; `getMarker` takes precedence when it returns non-null.
  Bounds are normalized to first-of-month, so a marker of
  `2026-02-10 → 2026-04-05` covers February through April.
- **Roving focus, one tab stop.** The grid is `role="grid"` with a single
  `tabindex="0"` cell; arrows/Home/End/PageUp/PageDown move it. Do not add
  manual `tabindex` to cells.
- **Arrow overflow and paging skip disabled months** in the travel
  direction, up to a ~20-year horizon (240 steps), and page the anchor to
  the resolved year. Focus never lands on a disabled (unfocusable) cell; if
  nothing enabled is found the key press is a no-op.
- **PageUp/PageDown jump one year**, keeping the same month as the starting
  point. `shift` does not widen the jump (unlike `<orio-calendar>`, where it
  jumps a year instead of a month).
- **Selected renders as a filled accent cell** via CSS, not the
  `<orio-badge>` the day calendar uses, and it wins over marker styling.
- **`monthEnter` fires on pointer hover only** (`mouseenter`), not on
  keyboard focus. Use it for range-picking previews; selection is `select`.
- **i18n keys used**: `calendar.previousYear`, `calendar.nextYear` for the
  chevron labels. Month names come from `Intl.DateTimeFormat` in the active
  vue-i18n locale (`short` in the cell, `long + year` in `aria-label`).

## Gotchas

- **No year-chevron roving toolbar.** The day Calendar has a four-button
  nav with its own roving focus; this one has two plain buttons.
- **No `min` / `max` props.** Bounds are the picker's job — `date/Picker`
  and `date/RangePicker` merge their `min`/`max` into the `isDisabled` they
  pass down. Do the same if you use MonthCalendar directly.
- **The grid renders 12 real months only** — no leading/trailing filler
  cells, so `outOfMonth` never appears on a month cell.
- **`aria-current` is not set** on the current month (the day calendar sets
  `aria-current="date"` on today). Today is still styled via `.today`.
- Tests need `Element.prototype.scrollIntoView` and a `CSS.escape` stub —
  the roving grid uses both. See `tests/components/MonthCalendar.spec.ts`.

## Quick reference

```vue
<script setup>
import { ref } from "vue";

const anchor = ref("2026-01-01");
const picked = ref(null);
const preview = ref(null);
const markers = [{ variant: "success", start: "2026-02-01", end: "2026-04-01" }];
</script>

<template>
  <orio-date-month-calendar
    v-model:anchor="anchor"
    :selected="picked"
    :markers="markers"
    :is-disabled="(iso) => iso < '2026-03-01'"
    @select="picked = $event"
    @month-enter="preview = $event"
  />
</template>
```

## Related

- `<orio-calendar>` — the day-granularity sibling; same marker rules.
- `date/components/CalendarGrid.vue` — shared grid + cell rendering for
  both calendars (`CalendarCell`, `type="day" | "month"`).
- `<orio-date-picker month>` / `<orio-date-range-picker month>` — pickers
  that host this component in a popover.
- Public API reference: `docs/components/date/month-calendar.md`.
