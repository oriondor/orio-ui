---
kind: component
category: Media & misc
purpose: read-only date display, formatted date range, date range view
short: locale-aware read-only date or date range display; inline `<orio-view-text>` for start/end
invariants: true
---

# view/Dates — agent-only invariants

`<orio-view-dates>` renders a `DateRange` (`{ start, end }`) as inline
formatted text using the active vue-i18n locale.

## Invariants

- **`dates` is required** and typed `DateRange` (ISO strings).
- **Format options**:
  - Default: `{ day: "numeric", month: "short", year: "numeric" }` →
    `"10 Jun 2026"`.
  - `month: true` → omits the day → `"Jun 2026"`. Use for
    month-resolution ranges (subscription periods, etc.).
- **Uses `formatDate(iso, locale, options)` from `utils/date`**. Output
  follows the locale — `en` vs `uk` will render different month
  abbreviations.
- **Separator**: literal `" - "` rendered between start and end when
  both are present. No en-dash, no localization.
- **Renders two `<orio-view-text>`** with `type` and `size` forwarded
  (defaults `type: "italics"`, `size: "small"`).
- **`* { display: inline }`** on the wrapper forces both view-text
  blocks inline so they read as one sentence.

## Gotchas

- **Only start, only end, or both**: rendering gracefully handles a
  missing `end` (no separator, no second block). A missing `start` with
  an `end` renders the separator alone — degraded UX.
- **No relative formatting** (e.g. "yesterday", "3 days ago"). For
  relative output, format in the consumer and pass via
  `<orio-view-text>` instead.
- **`size` is forwarded to view-text** but the wrapper itself has no
  size. Custom CSS that targets the wrapper won't see a size class.

## Quick reference

```vue
<script setup lang="ts">
const period = { start: "2026-06-01", end: "2026-06-30" };
</script>

<template>
  <orio-view-dates :dates="period" />

  <orio-view-dates
    :dates="{ start: subscriptionStart, end: subscriptionEnd }"
    month
    type="title"
    size="medium"
  />
</template>
```

## Related

- `<orio-view-text>` — used internally for each end of the range.
- `<orio-date-range-picker>` — picker that produces `DateRange` values.
- `utils/date` — `formatDate`, `DateRange` type.
- Public API reference: `docs/components/view/dates.md` (if present).
