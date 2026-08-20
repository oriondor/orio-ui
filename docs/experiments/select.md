# Select (experiment)

::: warning EXPERIMENT
Ships as the `orio-ui/experiments` subpath, **not** as an auto-imported
component. Names, props, and behaviour can change in any release, including a
patch. Use `<orio-selector>` when you need stability or multi-select.
:::

Single-select listbox built on the [native-popover experiment](./popover), so
placement, light-dismiss, Esc, and edge flipping all come from the browser
rather than from JS.

## Live Demo

<script setup>
import { ref } from 'vue'

const framework = ref(null)
const country = ref(null)

const frameworks = ['Nuxt', 'Vue', 'Svelte', 'Astro']
const countries = [
  { id: 'uk', name: 'United Kingdom' },
  { id: 'fi', name: 'Finland' },
  { id: 'ua', name: 'Ukraine' },
]
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-x-select
      v-model="framework"
      :options="frameworks"
      label="Framework"
    />
  </div>
  <p>Selected: {{ framework ?? '—' }}</p>
</div>

Object options, keyed by `field` and labelled by `option-name`:

<div class="demo-container">
  <div class="demo-row">
    <orio-x-select
      v-model="country"
      :options="countries"
      field="id"
      option-name="name"
      label="Country"
    />
  </div>
  <p>Selected: {{ country?.name ?? '—' }}</p>
</div>

## Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Select } from "orio-ui/experiments";

const country = ref(null);
const countries = [
  { id: "uk", name: "United Kingdom" },
  { id: "fi", name: "Finland" },
  { id: "ua", name: "Ukraine" },
];
</script>

<template>
  <Select
    v-model="country"
    :options="countries"
    field="id"
    option-name="name"
    label="Country"
  />
</template>
```

The demos on this page use `<orio-x-select>`, the docs-only global alias.

## Props

| Prop          | Type                | Default                | Description                                  |
| ------------- | ------------------- | ---------------------- | -------------------------------------------- |
| `options`     | `SelectOption[]`    | —                      | Strings or objects; required                 |
| `field`       | `string`            | `'id'`                 | Identity key for object options              |
| `optionName`  | `string`            | —                      | Label key for object options                 |
| `placeholder` | `string`            | `t('selector.placeholder')` | Trigger text when nothing is selected   |

Placement is not configurable: the panel always opens below the trigger, left
edges aligned, and flips at the viewport edge. That behaviour and its props live
on the [Popover](./popover) — this component just picks a side.

Everything from `ControlProps` (`label`, `size`, `error`, `layout`, `disabled`,
`required`, …) is forwarded to `<orio-control-element>` as usual.

## v-model

Required, and holds the option itself — the string, or the whole object — never
the extracted key:

```ts
const country = ref<{ id: string; name: string } | null>(null);
```

Object options are compared by `field`, so a re-fetched list with fresh object
identities keeps its selection.

## Slots

| Slot            | Props                                                       | Description                    |
| --------------- | ----------------------------------------------------------- | ------------------------------ |
| `trigger`       | `{ trigger, control, isOpen, getOptionKey, getOptionLabel }` | Replaces the whole button |
| `trigger-label` | `{ getOptionKey, getOptionLabel }`                           | Replaces just the label text   |
| `option`        | `{ option, selected, getOptionKey, getOptionLabel }`         | Replaces a row's content       |
| `no-options`    | —                                                            | Replaces the empty state       |
| `options-addon` | —                                                            | Extra content after the list   |

`trigger` is the complete binding bag: the popover pairing (`popovertarget`),
ControlElement's a11y attrs (`id`, `aria-*`, `disabled`, …), `type="button"`,
the listbox ARIA state (`aria-haspopup`, `aria-expanded`) and the keyboard
handler. A custom `#trigger` must spread it onto a `<button>` — without it
there is nothing to open the panel, and the listbox loses its ARIA and
keyboard support:

```vue
<template #trigger="{ trigger }">
  <button v-bind="trigger">Open</button>
</template>
```

## Keyboard

| Key | Behaviour |
| --- | --- |
| `ArrowDown` / `ArrowUp` | Opens when closed; moves the highlight when open |
| `Home` / `End` | Jumps to the first / last option |
| `Enter` | Selects the highlighted option |
| `Esc` | Closes — handled natively by the popover |

The highlight seeds from the currently selected option each time the panel
opens.

## Compared to `<orio-selector>`

| | `<orio-selector>` | `<orio-x-select>` |
| --- | --- | --- |
| Multi-select | yes | no, single only |
| Panel | `<orio-popover>`, teleported | native popover, top layer |
| Open state | Vue ref + `toggle` slot prop | DOM, read from the `toggle` event |
| Esc / light dismiss | click-outside only | browser |
| Slots | 6, including `trigger-content` | 5 |

## Not implemented

- Multi-select, tag chips, and the `trigger-content` slot
- Built-in search or filtering (use `#options-addon`)
- `aria-activedescendant` — the highlight is visual, with focus staying on the
  trigger
