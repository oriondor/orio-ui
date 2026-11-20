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
- **Fallthrough attrs reach the default trigger button.** The button
  binds `{ ...$attrs, ...control }` (same order as Input and Button), so
  `data-*`, `title`, `aria-describedby` etc. land on the `<button>` and
  `control` always wins on conflicts. `class`/`style` additionally reach
  the `.control` wrapper — ControlElement has `inheritAttrs: false` and
  renders `$attrs.class` / `$attrs.style` itself — so a class passed to
  `<orio-selector>` appears in both places.
- **A custom `#trigger` replaces the button, so it must bind attrs
  itself.** The slot exposes `attrs` (the raw `$attrs` bag) alongside
  `control`; spread `{ ...attrs, ...control }` on your root element, the
  way TaggableSelector does. Without that, `data-*`/`title` are dropped.
- **`useControlTokens(size)`** injects CSS vars (`--control-py`,
  `--control-px`, etc.) onto the popover content — size prop on the
  Selector flows through to dropdown padding.

## Slots

- `#trigger` — replaces the entire button. Receives `{ toggle, control,
  isOpen, listboxId, triggerKeydown, selectHighlighted, getOptionKey,
  getOptionLabel, attrs }`. `listboxId` is the unique (`useId`) id set on the
  `ul[role=listbox]`; put it on a custom combobox's `aria-controls`.
  Wire `triggerKeydown` onto your element's `@keydown` to reuse the roving
  list navigation (arrows/Home/End/Enter/Escape); it skips typing keys when
  the event comes from an inner `<input>`/editable (only
  ArrowUp/ArrowDown/Escape pass through). **`toggle` seeds the highlight
  itself** — opening the list (`toggle(true)`, or `toggle()` from a closed
  state) resets the roving highlight to the selected/first item, so a custom
  trigger just opens and never manages the highlight. `selectHighlighted()`
  toggles the currently highlighted option (returns `false` if none).
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
  "create new" button, a search input). Keyboard: Tab from the open trigger
  (built-in or `triggerKeydown`) focuses its first focusable; ArrowUp/Down
  in it move the list highlight and Enter in a text `<input>` selects it
  (Space/letters/Home/End stay with the field); Shift+Tab from its first
  control returns to the trigger; Tab past its last control closes and
  continues after the trigger (no trap); Escape closes and refocuses the
  trigger (Popover). No focusable content means Tab behaves as before.

## Gotchas

- **No built-in search.** For filterable selectors, render an
  `<orio-input>` in `#options-addon` and pass a filtered array to
  `:options`.
- **Multi-select trigger shows "N selected" by default.** Override via
  `#trigger-label` for display-only chips; removable chips need a custom
  `#trigger` (see Quick reference). No slot
  exposes a selection-toggle function: to remove a chip you mutate the
  `v-model` array yourself (e.g. splice the option out). The `toggle` prop
  on the `#option`/`#content` slots only opens/closes the popover — it does
  not add or remove a selection.
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

Use a custom `#trigger` holding `<orio-tag removable @remove>` chips. The
tag's remove button stops its own click and Enter/Space, so it never toggles
the list or reaches `triggerKeydown` (Escape still bubbles and closes it). Put `listboxId` on `aria-controls`, honour
`control.disabled`, and keep the consumer's `tabindex` (`control.tabindex`).
Removal reassigns the bound array; the demo's `removeTag` then moves focus to
the next chip's remove button, else the previous, else the trigger (via a
template ref on the trigger).

```vue
<template>
<orio-selector v-model="selectedTags" :options="tagItems" multiple field="id" option-name="label" placeholder="Select tags" aria-label="Select tags">
  <template #trigger="{ toggle, control, attrs, isOpen, listboxId, triggerKeydown, getOptionKey, getOptionLabel }">
    <div ref="tagsTrigger" v-bind="{ ...attrs, ...control }" class="demo-tags-trigger" role="combobox" :tabindex="control.disabled ? undefined : (control.tabindex ?? 0)" :aria-disabled="control.disabled || undefined" aria-haspopup="listbox" :aria-expanded="isOpen" :aria-controls="listboxId" @click="!control.disabled && toggle()" @keydown="!control.disabled && triggerKeydown($event)">
      <span v-if="!selectedTags.length" class="demo-tags-placeholder">{{ getOptionLabel(undefined) }}</span>
      <orio-tag v-for="tag in selectedTags" :key="getOptionKey(tag)" :text="getOptionLabel(tag)" :removable="!control.disabled" @remove="removeTag(tag)" />
      <orio-icon name="chevron-down" class="demo-tags-chevron" />
    </div>
  </template>
</orio-selector>
</template>

<script setup>
import { nextTick, ref } from 'vue'
const tagItems = [
  { id: 1, label: 'Urgent' },
  { id: 2, label: 'Billing' },
  { id: 3, label: 'Bug' },
  { id: 4, label: 'Feature' },
  { id: 5, label: 'Docs' }
]
const selectedTags = ref([])
const tagsTrigger = ref(null)
async function removeTag(tag) {
  const index = selectedTags.value.findIndex((item) => item.id === tag.id)
  selectedTags.value = selectedTags.value.filter((item) => item.id !== tag.id)
  await nextTick()
  const buttons = tagsTrigger.value.querySelectorAll('button')
  const next = buttons[index] ?? buttons[index - 1] ?? tagsTrigger.value
  next.focus()
}
</script>
```

Source: `docs/components/selector.md` ("Multi-select with tag chips"); the
demo also holds the scoped `.demo-tags-*` styles.

## Related

- `<orio-taggable-selector>` — pre-built multi-select with tag chips.
- `<orio-list-item>` — the row primitive used inside the listbox.
- `useListKeyboard` — keyboard nav composable.
- `useFuzzySearch` — pair with `#options-addon` for a search filter.
- Public API reference: `docs/components/selector.md`.
