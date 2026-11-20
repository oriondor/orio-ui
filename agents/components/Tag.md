---
kind: component
category: Buttons & indicators
purpose: tag, chip, label, removable chip, category pill
short: small text chip with neutral or accent variant; optional `removable` native remove button emitting `remove`
invariants: true
---

# Tag — agent-only invariants

`<orio-tag>` is a text chip. Display only by default; `removable` adds a
native remove button that emits `remove`.

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

- **`removable`** (default `false`) renders a native
  `<button type="button">` with `aria-label` from i18n `tag.remove`
  ("Remove {text}", en + uk) and emits `remove`. The button stops click and
  Enter/Space keydown propagation, so a parent trigger (e.g. a Selector
  `#trigger`) never sees them. Tab and Escape still bubble (Modal focus trap,
  Popover close). Removing is the consumer's job: update your list in
  `@remove`; the tag does not hide itself.
- With `removable` false the markup has no button.

## Gotchas

- **Focus after removal is yours.** The removed tag's button unmounts;
  move focus to a neighbour's remove button or the owning control.
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

Removable chips with focus handoff, from `docs/components/tag.md`
("Removable"):

```vue
<template>
  <div ref="removableRow">
    <orio-tag v-for="tag in removableTags" :key="tag" :text="tag" removable @remove="removeTag(tag)" />
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
const removableTags = ref(['Vue', 'Nuxt', 'Vite'])
const removableRow = ref(null)
async function removeTag(tag) {
  const index = removableTags.value.indexOf(tag)
  removableTags.value = removableTags.value.filter((item) => item !== tag)
  await nextTick()
  const buttons = removableRow.value.querySelectorAll('button')
  ;(buttons[index] ?? buttons[index - 1])?.focus()
}
</script>
```

## Related

- `<orio-taggable-selector>` — uses `TagProps` as its option shape.
- `<orio-badge>` — when you need a status pill with semantic color
  variants.
- Public API reference: `docs/components/tag.md`.
