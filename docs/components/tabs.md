# Tabs

Single-choice strip of buttons. One component, two looks (`variant`) and two semantics (`role`).

## Live Demo

<script setup>
import { ref } from 'vue'

const tab = ref('overview')
const tabOptions = [
  { value: 'overview', label: 'Overview', icon: 'edit' },
  { value: 'activity', label: 'Activity' },
  { value: 'settings', label: 'Settings' },
]

const period = ref('month')
const periodOptions = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

const longLabel = ref('a')
const longOptions = [
  { value: 'a', label: 'A very long label that cannot possibly fit in the track' },
  { value: 'b', label: 'Short' },
]

const size = ref('month')
const disabledOption = ref('week')
const disabledOptions = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month', disabled: true },
  { value: 'year', label: 'Year' },
]

const slotChoice = ref('month')
const level = ref(2)
const levelOptions = [
  { value: 0, label: 'Off' },
  { value: 1, label: 'Low' },
  { value: 2, label: 'High' },
]
</script>

### Underline with panels

`role="tablist"` (default) when the strip switches content. Pass `id-prefix`
so each tab gets `{prefix}-tab-{value}` and `aria-controls="{prefix}-panel-{value}"`;
give your panels the matching ids.

<div class="demo-container">
  <orio-tabs v-model="tab" :options="tabOptions" label="Project sections" id-prefix="demo" />
  <div
    v-for="option in tabOptions"
    v-show="tab === option.value"
    :id="`demo-panel-${option.value}`"
    :key="option.value"
    role="tabpanel"
    :aria-labelledby="`demo-tab-${option.value}`"
    tabindex="0"
  >
    Panel: {{ option.label }}
  </div>
</div>

### Segmented value picker

`role="radiogroup"` when the strip chooses a value and switches no panel.

<div class="demo-container">
  <orio-tabs v-model="period" :options="periodOptions" variant="segmented" role="radiogroup" label="Period" />
  <div class="demo-output">Period: {{ period }}</div>
</div>

### Block and long labels

`block` stretches the strip to full width with equal-width items. Long labels
ellipsise inside the item.

<div class="demo-container">
  <orio-tabs v-model="tab" :options="tabOptions" block label="Block underline" />
  <orio-tabs v-model="period" :options="periodOptions" variant="segmented" role="radiogroup" block label="Block segmented" />
  <orio-tabs v-model="longLabel" :options="longOptions" variant="segmented" role="radiogroup" label="Long labels" style="max-width: 16rem" />
</div>

### Sizes

<div class="demo-container">
  <orio-tabs v-model="size" :options="periodOptions" variant="segmented" role="radiogroup" size="xs" label="xs" />
  <orio-tabs v-model="size" :options="periodOptions" variant="segmented" role="radiogroup" size="sm" label="sm" />
  <orio-tabs v-model="size" :options="periodOptions" variant="segmented" role="radiogroup" size="md" label="md" />
  <orio-tabs v-model="size" :options="periodOptions" variant="segmented" role="radiogroup" size="lg" label="lg" />
</div>

### Disabled

A disabled option is skipped by the arrow keys and cannot be selected. The
`disabled` prop disables the whole strip.

<div class="demo-container">
  <orio-tabs v-model="disabledOption" :options="disabledOptions" label="Disabled option" />
  <orio-tabs v-model="disabledOption" :options="disabledOptions" disabled label="Whole strip disabled" />
</div>

### Option slot

<div class="demo-container">
  <orio-tabs v-model="slotChoice" :options="periodOptions" variant="segmented" role="radiogroup" label="Custom option">
    <template #option="{ option, selected }">
      {{ selected ? '●' : '○' }} {{ option.label }}
    </template>
  </orio-tabs>
</div>

### Numeric values

`0` is a valid selection.

<div class="demo-container">
  <orio-tabs v-model="level" :options="levelOptions" variant="segmented" role="radiogroup" label="Level" />
  <div class="demo-output">Level: {{ level }}</div>
</div>

## Usage

```vue
<template>
  <orio-tabs v-model="tab" :options="tabOptions" label="Project sections" id-prefix="demo" />
  <div
    v-for="option in tabOptions"
    v-show="tab === option.value"
    :id="`demo-panel-${option.value}`"
    :key="option.value"
    role="tabpanel"
    :aria-labelledby="`demo-tab-${option.value}`"
    tabindex="0"
  >
    Panel: {{ option.label }}
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tab = ref('overview')
const tabOptions = [
  { value: 'overview', label: 'Overview', icon: 'edit' },
  { value: 'activity', label: 'Activity' },
  { value: 'settings', label: 'Settings' },
]
</script>
```

## Choosing `role` and `variant`

- `variant` (`underline` | `segmented`) is look only; `role` (`tablist` | `radiogroup`) is semantics only. Any combination is valid.
- Use `tablist` **only** when the strip switches visible panels. The consumer renders the panels (`role="tabpanel"`).
- Use `radiogroup` for value pickers (period, filter, mode) where nothing is swapped.
- `id-prefix` applies to `tablist` only and must be **unique per page**; two instances with the same prefix produce duplicate ids.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \| number` | `undefined` | Selected value (v-model) |
| `options` | `{ value, label, icon?, disabled? }[]` | required | Items; **first match wins** if values repeat |
| `variant` | `'underline' \| 'segmented'` | `'underline'` | Look |
| `role` | `'tablist' \| 'radiogroup'` | `'tablist'` | Semantics |
| `label` | `string` | - | Accessible name (`aria-label`); use `aria-labelledby` for a visible label |
| `idPrefix` | `string` | - | Wires `{prefix}-tab-{value}` / `{prefix}-panel-{value}` (tablist only) |
| `block` | `boolean` | `false` | Full width, equal-width items |
| `disabled` | `boolean` | `false` | Disables the whole strip |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | inherited | Control size |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string \| number` | Emitted only when the selection changes |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `option` | `{ option, selected }` | Replaces the item content (default: optional icon + label) |

## Keyboard Support

- **Tab** - Focus the selected item (or the first enabled one when nothing is selected)
- **ArrowRight / ArrowLeft** - Move and select the next / previous enabled item, wrapping; flipped under `dir="rtl"`
- **Home / End** - First / last enabled item
- Selection follows focus; disabled options are skipped.

## Styling

Override on the element or an ancestor:

| Custom property | Default | Description |
|-----------------|---------|-------------|
| `--orio-tabs-gap` | `var(--control-gap)` | Gap between items |
| `--orio-tabs-radius` | `var(--control-radius)` (pill for segmented) | Item and track radius |
| `--orio-tabs-track-bg` | `var(--color-surface)` | Segmented track background |
| `--orio-tabs-active-bg` | `var(--color-accent)` | Segmented active pill background |
| `--orio-tabs-active-ink` | `var(--color-accent-ink)` | Segmented active pill text |
