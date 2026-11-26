# Tabs

Single-choice strip of buttons. One component, two looks (`variant`) and two semantics (`role`).

## Live Demo

<script setup>
import { ref } from 'vue'
import { useMediaQuery, useMounted } from '@vueuse/core'

const tab = ref('overview')
const narrow = useMediaQuery('(max-width: 400px)')
const mounted = useMounted()
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

### Segmented with panels

`variant="segmented"` works with `tablist` too: the look is independent of the semantics. Use a different `id-prefix` per strip.

<div class="demo-container">
  <orio-tabs v-model="tab" :options="tabOptions" variant="segmented" label="Segmented sections" id-prefix="seg" />
  <div
    v-for="option in tabOptions"
    v-show="tab === option.value"
    :id="`seg-panel-${option.value}`"
    :key="option.value"
    role="tabpanel"
    :aria-labelledby="`seg-tab-${option.value}`"
    tabindex="0"
  >
    Panel: {{ option.label }}
  </div>
</div>

### Block and long labels

`block` stretches the strip to full width with equal-width items. `block="content"` sizes items by their labels and shares the spare space, so a label is never narrower than it needs while it fits. Long labels
ellipsise inside the item. Labels that still truncate in a narrow space can use the compact `dense` style (see Dense below).

<div class="demo-container">
  <orio-tabs v-model="tab" :options="tabOptions" block role="radiogroup" label="Block underline" />
  <orio-tabs v-model="period" :options="periodOptions" variant="segmented" role="radiogroup" block label="Block segmented" />
  <orio-tabs v-model="period" :options="periodOptions" variant="segmented" role="radiogroup" block="content" label="Block content" />
  <orio-tabs v-model="longLabel" :options="longOptions" variant="segmented" role="radiogroup" label="Long labels" style="max-width: min(16rem, 100%)" />
</div>

### Dense

`dense` applies a compact style (padding x0.6, gap x0.5, font x0.9) so labels fit in tight spaces. It never switches by itself: bind it to your own breakpoint, for example with VueUse. `--orio-tabs-gap`, `--orio-tabs-padding-x` and `--orio-tabs-font-size` still win over it.

<div class="demo-container">
  <orio-tabs v-model="period" :options="periodOptions" variant="segmented" role="radiogroup" :dense="mounted && narrow" label="Dense on narrow screens" />
</div>

Gate the binding on `useMounted()`: `useMediaQuery` already matches during client setup, so binding it directly renders `dense` on the client but not in the server HTML, which is a hydration mismatch.

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
  <orio-tabs v-model="disabledOption" :options="disabledOptions" role="radiogroup" label="Disabled option" />
  <orio-tabs v-model="disabledOption" :options="disabledOptions" role="radiogroup" disabled label="Whole strip disabled" />
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

Props are typed by the exported `TabsProps`; each option is a `TabsOption` (`{ value, label, icon?, disabled? }`).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \| number` | `undefined` | Selected value (v-model) |
| `options` | `{ value, label, icon?, disabled? }[]` | required | Items; **first match wins** if values repeat |
| `variant` | `'underline' \| 'segmented'` | `'underline'` | Look |
| `role` | `'tablist' \| 'radiogroup'` | `'tablist'` | Semantics |
| `label` | `string` | - | Accessible name (`aria-label`); use `aria-labelledby` for a visible label |
| `idPrefix` | `string` | - | Wires `{prefix}-tab-{value}` / `{prefix}-panel-{value}` (tablist only) |
| `block` | `boolean \| "equal" \| "content"` | `false` | Full width. `true` / `"equal"`: equal-width items; `"content"`: items sized by their labels, spare space shared |
| `disabled` | `boolean` | `false` | Disables the whole strip |
| `dense` | `boolean` | `false` | Compact padding, gap and font; never switches by itself |
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
| `--orio-tabs-padding-x` | `var(--control-px)` (tighter with `dense`) | Item horizontal padding |
| `--orio-tabs-font-size` | `var(--control-font-size)` (smaller with `dense`) | Item font size |
| `--orio-tabs-gap` | `var(--control-gap)` | Gap between items |
| `--orio-tabs-radius` | `var(--control-radius)` (pill for segmented) | Item and track radius |
| `--orio-tabs-track-bg` | `var(--color-surface)` | Segmented track background |
| `--orio-tabs-active-bg` | `var(--color-accent)` | Segmented active pill background |
| `--orio-tabs-active-ink` | `var(--color-accent-ink)` | Segmented active pill text |
| `--orio-tabs-transition` | `250ms ease` | Duration and easing of the sliding selection (pill or bar) and the text colour crossfade; `0s` turns the slide off |

The selected pill or underline bar glides to the new item and resizes to its width. It is placed instantly on first render, on resize and when options change, and under `prefers-reduced-motion: reduce`. With nothing selected there is no indicator.
