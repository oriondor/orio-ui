---
kind: component
category: Date
purpose: date picker trigger button, date input button, popover-anchored date trigger
short: shared button + popover trigger used by date Picker and RangePicker; default slot renders the picker body
invariants: true
---

# date/PickerTrigger — agent-only invariants

`<orio-date-picker-trigger>` is the trigger button shared by
`<orio-date-picker>` and `<orio-date-range-picker>`. You usually do not
use it directly — pick those higher-level pickers unless you are building
a new date primitive.

## Invariants

- **Renders a `<button>` inside `<orio-control-element>` and an
  `<orio-popover>`** with `position="bottom-right"`, `offset: 5`.
- **`text` prop is the visible display text.** When empty, `placeholder`
  renders muted.
- **`text` and `placeholder` are stripped from `controlProps`** — they
  don't leak to the ControlElement wrapper.
- **Default slot is the popover content** and receives `{ toggle }`. Call
  `toggle(false)` to close after a user picks.
- **Calendar icon (`name="calendar"`) is hardcoded** on the right of the
  button. No prop to swap it.
- **`aria-expanded` reflects popover state** for screen reader support.
- **Inherits all ControlElement contract**: `label`, `error`, `size`,
  `layout`, etc. The control bag is bound to the inner `<button>`.

## Gotchas

- **Not for general "click-to-open" needs.** For a non-date trigger, use
  `<orio-popover>` directly — this one is calendar-themed (icon, padding,
  i18n placeholder).
- **No multi-popover stacking story.** Both single and range pickers use
  this same component, with the same `bottom-right` placement. Side-by-
  side pickers may collide.

## Quick reference

You normally consume this through `<orio-date-picker>` or
`<orio-date-range-picker>`. Direct use:

```vue
<template>
  <orio-date-picker-trigger
    :text="display"
    :placeholder="$t('date.placeholder')"
    :label="$t('date.label')"
  >
    <template #default="{ toggle }">
      <orio-calendar v-model:anchor="anchor" @select="onSelect($event, toggle)" />
    </template>
  </orio-date-picker-trigger>
</template>
```

## Related

- `<orio-date-picker>` — single-date picker built on this trigger.
- `<orio-date-range-picker>` — range picker built on this trigger.
- `<orio-popover>` — for non-date trigger needs.
- Public API reference: `docs/components/date/`.
