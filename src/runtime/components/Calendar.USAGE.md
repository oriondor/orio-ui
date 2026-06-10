---
kind: component
category: Date
purpose: month calendar, date grid, day picker UI
short: month grid with roving-focus keyboard a11y
invariants: true
---

# Calendar — agent-only invariants

`<orio-calendar>` is the month-grid primitive. `date/Picker.vue` and
`date/RangePicker.vue` compose it inside a popover.

## Invariants

- **All dates are ISO `YYYY-MM-DD` strings** at the API boundary
  (`selected`, `markers.start`/`end`, `getMarker`, `isDisabled`, `@select`,
  `@dayEnter`). Never pass `Date` objects.
- **Two reactive states**:
  - `selected` (prop) — the picked day. Calendar does not own it; emit
    `@select` and let the parent update its v-model.
  - `anchor` (v-model:anchor) — the visible month. Calendar owns this when
    uncontrolled, derived from `selected` if not provided. Pass it as
    `v-model:anchor` if you need cross-component sync (RangePicker uses
    this to keep two months in lockstep).
- **Keyboard a11y via `useRovingGrid`.** Arrow keys, Home/End, PageUp/Down
  navigate. Only one day cell is in the tab order at a time. Do not add
  manual `tabindex` to day cells from outside.
- **42-cell grid (6 rows × 7 cols).** Leading/trailing days from neighbour
  months are rendered with `inMonth: false`. Selection and disabled checks
  apply to them too — `isDisabled` is called for every cell.
- **Markers are matched in reverse order** — the last marker in the array
  wins on overlap. `getMarker` takes precedence over `markers[]` when both
  are provided.
- **`weekStartsOn`** is `0` (Sunday) or `1` (Monday, default). Weekday
  header labels are derived via `Intl.DateTimeFormat` in the active i18n
  locale.

## Gotchas

- Disabled-day logic should be reactive — `isDisabled` is called inside a
  computed. Wrap any external state it reads in `computed`/`ref` or it will
  not re-render on change.
- The Calendar emits `@dayEnter` on hover/keyboard-focus, **not** on
  selection. Use for range-picking previews; selection is only `@select`.
- i18n keys used: `calendar.previousYear`, `calendar.previousMonth`,
  `calendar.nextMonth`, `calendar.nextYear`. Override these if you ship a
  locale not bundled in `runtime/i18n/`.

## Quick reference

```vue
<orio-calendar
  :selected="iso"
  :markers="[{ variant: 'accent', start: '2026-06-01', end: '2026-06-07' }]"
  :is-disabled="(iso) => iso < todayIso"
  @select="iso = $event"
/>
```
