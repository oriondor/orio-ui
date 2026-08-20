---
kind: component
category: Date
purpose: date input, single date picker, "pick a date"
short: single date picker built from Calendar plus PickerTrigger
invariants: true
---

# date/Picker — agent-only invariants

`<orio-date-picker>` is the single-date picker: a `<orio-date-picker-trigger>`
button that opens a popover containing `<orio-calendar>`. For ranges use
`<orio-date-range-picker>`.

## Invariants

- **Extends `ControlProps`.** Pass `label`, `error`, `size`, `disabled`,
  `required` straight through — they reach the trigger via ControlElement.
  See `../ControlElement.md`.
- **v-model is `string | null`** in ISO `YYYY-MM-DD` form. `null` means
  unpicked.
- **`min` / `max`** are ISO strings. They merge with the consumer's
  `isDisabled(iso)` callback — Picker's `calendarIsDisabled` returns true
  when either the min/max bound is violated OR the consumer says so.
- **Selecting a day closes the popover** automatically (`toggle(false)` is
  called inside the `@select` handler). Do not wire your own close.
- **Markers + getMarker** are forwarded to the inner Calendar unchanged.
  See `../Calendar.md` for the matching rules.
- **Placeholder text** falls back to the i18n key `datePicker.placeholder`
  if no `placeholder` prop is given.

## Gotchas

- The trigger displays the date via `formatDate(value, locale)` from
  `../../utils/date`. If you need a custom display format, wrap the
  picker — the prop is not exposed.
- `<orio-date-picker-trigger>` is the popover host. Wiring up your own
  trigger means re-creating popover focus management — prefer composing
  with the existing trigger via its `#default` scoped slot if you need
  custom calendar content (this is exactly how Picker itself works).

## Quick reference

```vue
<orio-date-picker
  v-model="checkInDate"
  label="Check-in"
  :min="todayIso"
  :max="maxBookingIso"
  :is-disabled="(iso) => blockedDates.has(iso)"
/>
```
