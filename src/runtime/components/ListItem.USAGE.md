---
kind: component
category: Media & misc
purpose: list row, list item, selectable row, list entry
short: `<li>` row with start/end slots and optional selectable checkbox-style behavior
invariants: true
---

# ListItem — agent-only invariants

`<orio-list-item>` is a `<li>` row with three content zones (start /
center / end) and an optional selectable mode. It is also the row
primitive used internally by `<orio-selector>`.

## Invariants

- **Renders an `<li>`.** Must be a child of `<ul>` / `<ol>` for valid
  HTML. Rendering it loose works but breaks list semantics.
- **`selectable` prop** turns the row into an interactive checkbox-style
  control:
  - `tabindex="0"` (keyboard focusable).
  - `role="checkbox"` + `aria-checked` reflect `selected`.
  - Click and Enter / Space toggle the v-model.
  - `cursor: pointer`.
- **v-model is `selected: boolean`.** Updates on toggle. Without
  `selectable`, the model is still bound but no toggle handler runs.
- **Three slots**:
  - `#start` — left zone. **Only renders** when the slot is provided
    OR `selectable` is true. When selectable and no slot, defaults to
    `<orio-check-box :model-value="selected">`.
  - `#default` — center content. Always renders, `flex-grow: 1`.
  - `#end` — right zone. Only renders when the slot is provided.
- **Selected state** uses `--color-accent` background and
  `--color-accent-soft-darker` text. Hover swaps to surface bg when
  not selected.
- **Used internally by `<orio-selector>`** as `role="option"` rows. In
  that usage the role gets overridden via `$attrs`.

## Gotchas

- **No multi-selection grouping.** A single ListItem holds one
  selected boolean. For grouped list selection, wire each item's
  `v-model:selected` to a parent array.
- **Default `<orio-check-box>` in `#start`** uses bare props — it has
  no label, no accent state of its own. If the row is `selected`, the
  checkbox shows checked.
- **Keyboard `Enter` and `Space` `.preventDefault()`** — Space won't
  scroll the page, Enter won't submit a form. Useful, but
  unconfigurable.
- **Without `selectable`**, the row is still clickable but no toggle /
  focus / role is applied. To make it a button-like row without a
  checkbox-style toggle, wrap content in a real `<button>` inside
  `#default`.

## Quick reference

```vue
<template>
  <ul>
    <orio-list-item
      v-for="item in items"
      :key="item.id"
      v-model:selected="item.selected"
      selectable
    >
      <template #start>
        <orio-icon :name="item.icon" />
      </template>

      {{ item.label }}

      <template #end>
        <orio-tag :text="item.badge" variant="accent" />
      </template>
    </orio-list-item>
  </ul>
</template>
```

## Related

- `<orio-selector>` — uses this as listbox rows.
- `<orio-check-box>` — default `#start` content when selectable.
- Public API reference: `docs/components/list-item.md`.
