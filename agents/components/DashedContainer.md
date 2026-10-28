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

- **Two slots.** Default slot replaces the `text` label
  (`<span class="text-class">`); `#icon` slot replaces the icon chip and
  receives `iconSize` as a slot prop.
- **Root is a native `<button type="button">`.** Keyboard (Enter/Space)
  and focus come from the platform; it never submits a surrounding form.
  Always clickable and emits `click` — do not use as a passive container.
  Only phrasing content is valid inside a button, so slot content should
  be `<span>`-level like the built-in label, not `<div>`/`<p>`.
- **`size` only scales the icon.** `small` → 2rem, `medium` → 3rem, `large`
  → 5rem. Padding (2rem), gap (0.75rem), text size, and border are fixed
  regardless of `size`.
- **`icon` is forwarded to `<orio-icon :name>`.** Must be a name registered
  in `utils/iconRegistry`. Missing names render nothing; check the registry
  before passing a string.
- **All styling is scoped.** 1.5px dashed border, transparent surface tint;
  hover turns the border accent with an 8% accent wash, the label to
  `--color-text`, and scales the icon chip; `:active` presses to 0.98;
  `:focus-visible` draws an accent outline. Reduced motion drops the
  transitions and scaling. No `gradient-hover`.
- **The `icon` prop renders inside a round accent chip** (`.icon-chip`).
- **`width: 100%`** of its container (buttons otherwise shrink to fit).

## Gotchas

- **Pass an i18n string, not a literal.** Project convention (see
  CLAUDE.md / translations note): `:text="$t('addItem')"`, not
  `text="Add Item"`.
- **Both `icon` and `text` are optional.** With neither, the tile is an
  empty dashed box that still emits `click`. Confirm at least one is set
  unless that empty look is intentional.
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
