---
kind: component
category: Form inputs
purpose: select, dropdown, combobox, listbox picker, single or multi-select
short: button-triggered listbox in a popover; supports single and multi-select with string or object options
invariants: true
---

# Selector — agent-only invariants

`<orio-selector>` is a button-triggered listbox rendered inside an
`<orio-popover>`. It is **not** a `<select>` element and **not** a
combobox — there is no text input or filter. For free-text + filter,
combine with `useFuzzySearch` and slot `#options-addon`. Generic over
`T extends object`.

## Invariants

- **`options` accepts `string` or object items** (typed
  `SelectableOption<T> = string | T`). Mixing is allowed but uncommon —
  treat the array as homogenous.
- **For object options, set `field`** (defaults to `"id"`) to the
  uniqueness key, and **`optionName`** to the display label key. Without
  `optionName`, objects render as `JSON.stringify(option)` — visible bug.
- **v-model is required.** Type: `SelectableOption | SelectableOption[] |
  null | undefined`. Single-select binds the option (or its primitive);
  multi-select binds an array.
- **`multiple: true` mutates the bound array in place** via
  `modelValue.value.splice(...)` / `modelValue.value.push(...)`. The bound
  ref must be a writable array — a deep `readonly` v-model blocks those
  mutations: Vue warns in dev (`Set operation on key … failed: target is
  readonly`) and fails silently in prod, so the selection won't update.
- **Single-select closes the popover on choice**; multi-select keeps it
  open. Wire your own close on multi-select via the `option` slot
  `toggle` prop if needed.
- **Built on `<orio-popover>` with `position="bottom-right"` offset 5**.
  Same teleport/scroll/auto-flip caveats apply.
- **Built on `<orio-list-item>` rows** with `role="option"` and
  `aria-selected`. Listbox itself has `role="listbox"` and
  `aria-multiselectable` when `multiple` is set.
- **Keyboard via `useListKeyboard`**: arrow-down opens (or moves
  highlight), Enter selects, Esc closes. `popoverToggleRef` is captured
  lazily from the trigger slot — the first keydown after mount may
  no-op if the popover hasn't initialized; subsequent keys work.
- **i18n keys are required.** The component calls `useI18n()` and
  references `selector.placeholder`, `selector.selected` ({count}), and
  `selector.noOptions`. Consumers must have these keys in their locale
  files.
- **`useControlTokens(size)`** injects CSS vars (`--control-py`,
  `--control-px`, etc.) onto the popover content — size prop on the
  Selector flows through to dropdown padding.

## Slots

- `#trigger` — replaces the entire button. Receives `{ toggle, control }`.
- `#trigger-content` — replaces the *inside* of the default button.
  Receives `{ toggle, getOptionKey, getOptionLabel, attrs }`. Use to
  customize the label/chevron without rebuilding the button shell.
- `#trigger-label` — replaces only the label text. Receives same props.
  Use to render tags for multi-select instead of "N selected".
- `#option` — replaces each row's content. Receives `{ option, toggle,
  selected, getOptionKey, getOptionLabel }`.
- `#no-options` — replaces the default `<orio-empty-state>` when
  `options.length === 0`.
- `#options-addon` — extra content rendered **after** the list (e.g. a
  "create new" button, a search input).

## Gotchas

- **No built-in search.** For filterable selectors, render an
  `<orio-input>` in `#options-addon` and pass a filtered array to
  `:options`.
- **Multi-select trigger shows "N selected" by default.** Override via
  `#trigger-label` to render tags — consider `<orio-tag>` chips. Removal
  must call `toggleOption` (exposed via `#option` slot, not the trigger).
- **String options bypass `field`/`optionName`.** Selection equality is
  `===`. Object options compare via `field`.
- **`placeholder` falls back to `t("selector.placeholder")`**. Pass an
  explicit `placeholder` to override per-instance; do not assume English.
- **`controlProps` strip is exhaustive** — `options`, `multiple`,
  `field`, `optionName`, `placeholder` never reach the ControlElement
  wrapper. Adding new selector-specific props requires adding them to the
  strip list.
- **Trigger is a `<button>`**, not a real `<select>`. Form serialization
  and native submission do not include the value — handle submit
  manually.

## Quick reference — single-select with object options

```vue
<script setup lang="ts">
interface Country { id: string; name: string }
const countries: Country[] = [
  { id: "uk", name: "United Kingdom" },
  { id: "fi", name: "Finland" },
];
const country = defineModel<Country | null>({ default: null });
</script>

<template>
  <orio-selector
    v-model="country"
    :options="countries"
    field="id"
    option-name="name"
    :label="$t('settings.country')"
  />
</template>
```

## Quick reference — multi-select with tag chips

```vue
<template>
  <orio-selector v-model="tags" :options="allTags" multiple field="id" option-name="label">
    <template #trigger-label>
      <orio-tag v-for="tag in tags" :key="tag.id" removable @remove="removeTag(tag)">
        {{ tag.label }}
      </orio-tag>
    </template>
  </orio-selector>
</template>
```

## Related

- `<orio-taggable-selector>` — pre-built multi-select with tag chips.
- `<orio-list-item>` — the row primitive used inside the listbox.
- `useListKeyboard` — keyboard nav composable.
- `useFuzzySearch` — pair with `#options-addon` for a search filter.
- Public API reference: `docs/components/selector.md`.
