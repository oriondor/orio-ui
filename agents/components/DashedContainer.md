---
kind: component
category: Layout & containers
purpose: dashed empty/drop zone, add-item card, upload tile, empty state with action
short: clickable dashed-border tile with icon and label, used for add/upload affordances
invariants: true
---

# DashedContainer — agent-only invariants

`<orio-dashed-container>` is a self-styled clickable tile that renders an
optional icon and a label inside a dashed border. It is **not** a generic
slot wrapper.

## Invariants

- **No default slot.** The template only renders `icon` and `text` props.
  Children placed between the tags are dropped. To compose richer content,
  use a different primitive.
- **Always clickable.** The wrapper has `cursor: pointer` and emits
  `click` unconditionally — even with no listener attached, the tile looks
  interactive. Do not use as a passive container.
- **`size` only scales the icon.** `small` → 2rem, `medium` → 3rem, `large`
  → 5rem. Padding (2rem), gap (0.5rem), text size, and border are fixed
  regardless of `size`.
- **`icon` is forwarded to `<orio-icon :name>`.** Must be a name registered
  in `utils/iconRegistry`. Missing names render nothing; check the registry
  before passing a string.
- **Hover effect comes from the global `gradient-hover` class**, not from
  scoped styles. The dashed border, padding, and layout are scoped; the
  hover gradient is project-global.

## Gotchas

- **`text` defaults to English in consumer code.** Project convention
  (see CLAUDE.md / translations note) is to pass an i18n key: `:text="$t('addItem')"`,
  not `text="Add Item"`.
- **Both `icon` and `text` are optional.** With neither, the tile is an
  empty dashed box that still emits `click`. Confirm at least one is set
  unless that empty look is intentional.
- **The `<span :size>` shorthand** in the template forwards `size` as a
  DOM attribute on the label. It's not styled — harmless, but visible
  in devtools.
- **No `disabled` state.** If a consumer needs disabled-looking behaviour,
  wrap or override styles externally; do not rely on a prop.

## Quick reference

```vue
<template>
  <orio-dashed-container
    icon="plus"
    :text="$t('gallery.addImage')"
    size="medium"
    @click="openPicker"
  />
</template>
```

## Related

- `orio-icon` — icon renderer driven by the same `name` string.
- `orio-upload` — full file-picker widget; prefer it over hand-rolling
  click-to-upload on a `DashedContainer`.
- Public API reference: `docs/components/dashed-container.md`.
