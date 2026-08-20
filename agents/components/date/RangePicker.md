---
kind: component
category: Date
purpose: date range, from-to picker, date range input, calendar range
short: two-month range picker with hover-preview, min/max bounds, and ISO `{ start, end }` model
invariants: true
---

# date/RangePicker — agent-only invariants

`<orio-date-range-picker>` is the date range picker: a
`<orio-date-picker-trigger>` opens a popover containing **two side-by-side
calendars** (left = start month, right = start month + 1). Read
`../Calendar.md` and `Picker.md` first.

## Invariants

- **v-model is `DateRange = { start: string | null; end: string | null }`**
  (ISO date strings). `DateRange` is re-exported from this file. Both
  fields can be null (no selection) or just `start` (mid-pick).
- **Click sequence is "set start → set end".** First click clears `end`,
  writes `start`. Second click writes `end`. If the second pick is
  earlier than the existing start, start and end **swap automatically**.
- **The popover closes on range completion** (second pick), via
  `toggle(false)`. A single click leaves it open.
- **Two-month anchored display** — `leftAnchor` = first of start's month,
  `rightAnchor` = `leftAnchor + 1 month`. They re-sync when the model's
  start changes to a month not currently visible.
- **Hover preview**: hovering a day in the popover renders an "accent"
  range marker from `start` to the hovered day (or hovered day to start
  if the hover is earlier). Requires `start` to be already picked.
- **`min` / `max` are ISO strings** that gate selection via the calendar's
  `isDisabled`. Consumer's own `isDisabled(iso)` predicate ORs in.
- **`getMarker(iso)` is the consumer's marker provider.** The preview
  marker **wins** over consumer markers for days inside the previewed
  range.
- **Built on `<orio-calendar>` × 2**, side-by-side in a flex row with
  0.75rem gap.
- **i18n key**: `dateRangePicker.placeholder` for the empty-display label.
- **Display string**: `"start – end"` when both exist (en-dash, spaces).
  Just `start` or just `end` if only one. Empty string if both null.

## Gotchas

- **The picked `start` does NOT render a marker by itself** when no `end`
  and no hover — `previewMarker` requires both `previewStart` and
  `previewEnd`. There is no visible feedback that a start was picked
  until the user hovers or clicks an end. If you need a "just-start"
  indicator, pass it via `markers` from the consumer.
- **Both calendars share the same `markers`, `get-marker`, and
  `is-disabled` props.** Consumer markers spanning across months draw
  correctly because they're date-based, not anchor-based.
- **Hover state clears on `mouseleave` of the popover content**, not on
  picking. Quick double-click sequences clear hover only after the
  second click.
- **No keyboard support for range selection** — arrow-key roving inside
  Calendar still works, but Enter on the keyboard-focused day picks one
  end at a time, mirroring mouse behavior.
- **Min/max bounds are ISO string comparisons**: `iso < min` works
  because ISO dates sort lexicographically. Pass YYYY-MM-DD strings, not
  arbitrary Date objects.

## Quick reference

```vue
<script setup lang="ts">
import type { DateRange } from "../components/date/RangePicker.vue";

const range = defineModel<DateRange>({
  default: () => ({ start: null, end: null }),
});

const bookedDays = ["2026-06-15", "2026-06-16"];
function isDisabled(iso: string) {
  return bookedDays.includes(iso);
}
</script>

<template>
  <orio-date-range-picker
    v-model="range"
    :label="$t('booking.dates')"
    min="2026-06-10"
    max="2026-12-31"
    :is-disabled="isDisabled"
  />
</template>
```

## Related

- `<orio-calendar>` — the underlying grid; rendered twice.
- `<orio-date-picker>` — single-date variant.
- `<orio-date-picker-trigger>` — the shared trigger button.
- `utils/date` — `DateRange`, `parseISO`, `formatISO`, `addMonths`,
  `startOfMonth`, `formatDate`.
- Public API reference: `docs/components/date/`.
