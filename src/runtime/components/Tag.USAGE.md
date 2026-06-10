---
kind: component
category: Buttons & indicators
purpose: tag, chip, label, removable chip, category pill
short: small text chip with neutral or accent variant; static display only (no remove behavior)
invariants: true
---

# Tag — agent-only invariants

`<orio-tag>` is a static text chip. No close button, no click handler, no
removal behavior — display only.

## Invariants

- **`text` is required.** It is the only way to set the chip's visible
  content — there is no default slot.
- **`variant`**: `"neutral"` (default, gray) or `"accent"` (themed
  accent). No `danger` / `alert` colors here — use `<orio-badge>` for
  that.
- **`id` is an optional uniqueness key** used by upstream components
  (`<orio-taggable-selector>`) to match selected tags. Pass it whenever
  the tag participates in selection state.
- **`user-select: none`** — text inside the chip cannot be selected with
  the cursor.

## Gotchas

- **No remove / close button.** The `TagProps` shape is intentionally
  passive. For removable chips, wrap a custom button next to it or build
  your own primitive.
- **No icon support.** No `icon` prop, no slot. For icon+text chips,
  build directly from a `<span>` with `<orio-icon>`.
- **No size variants.** Padding (`0.25rem 0.6rem`) and font size
  (`--font-sm`) are fixed.

## Quick reference

```vue
<template>
  <orio-tag :text="$t('category.urgent')" variant="accent" />
  <orio-tag :text="$t('category.draft')" />
</template>
```

## Related

- `<orio-taggable-selector>` — uses `TagProps` as its option shape.
- `<orio-badge>` — when you need a status pill with semantic color
  variants.
- Public API reference: `docs/components/tag.md`.
