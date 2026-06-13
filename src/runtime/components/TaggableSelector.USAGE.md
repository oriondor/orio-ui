---
kind: component
category: Form inputs
purpose: multi-select with tag chips, taggable selector, chip picker
short: multi-select Selector that renders chosen options as tag chips in the trigger
invariants: true
---

# TaggableSelector — agent-only invariants

`<orio-taggable-selector>` is a thin wrapper over `<orio-selector>` that
forces `multiple` mode and renders the selection as a row of `<orio-tag>`
chips inside the trigger. Read `Selector.USAGE.md` for the full contract.

## Invariants

- **Always multi-select.** The internal `<orio-selector>` is passed
  `multiple` unconditionally; the prop cannot be turned off.
- **`optionName` defaults to `"text"`** to align with `TagProps.text`. If
  your option type uses a different label key, pass `option-name`.
- **v-model type is `TagProps[]`** — `{ id?: string; text: string;
  variant?: "neutral" | "accent" }[]`. Options must be tag-shaped or
  augmented to satisfy this contract.
- **Tags in the trigger are display-only.** Clicking a chip does **not**
  remove the option. The user must reopen the dropdown and uncheck it.
  This is a real usability tradeoff — for click-to-remove, fall back to
  `<orio-selector>` with a custom `#trigger-label`.
- **Trigger lays chips out as `flex-wrap`** with `0.5rem` gap, left-aligned.
  Selecting many chips grows the trigger height; constrain it if your
  layout depends on a fixed height.

## Gotchas

- **`field` (uniqueness key) still defaults to `"id"`** from the underlying
  Selector. Each tag should have a stable `id` — without one, multi-select
  add/remove will mis-match items with identical `text`.
- **No empty-state placeholder by default in the trigger.** When the
  selection is empty, the trigger is empty space. Pass a `placeholder` so
  the dropdown shows a hint, but the trigger label itself will not show
  it (the `#trigger-label` slot renders an empty chip list).
- **Variant per chip is per-option.** Set `variant: "accent"` on individual
  option objects to tint specific chips.

## Quick reference

```vue
<script setup lang="ts">
import type { TagProps } from "../components/Tag.vue";

const allCategories: TagProps[] = [
  { id: "fiction", text: "Fiction" },
  { id: "non-fiction", text: "Non-fiction", variant: "accent" },
  { id: "poetry", text: "Poetry" },
];

const selected = defineModel<TagProps[]>({ default: () => [] });
</script>

<template>
  <orio-taggable-selector
    v-model="selected"
    :options="allCategories"
    :label="$t('book.categories')"
  />
</template>
```

## Related

- `<orio-selector>` — base; use with custom `#trigger-label` for
  removable chips or different layouts.
- `<orio-tag>` — the chip primitive rendered in the trigger.
- Public API reference: `docs/components/taggable-selector.md`.
