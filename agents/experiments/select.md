---
kind: experiment
category: Form inputs
purpose: select, dropdown, listbox picker, single-select
short: experimental single-select listbox built on the native-popover experiment instead of the teleported Popover
invariants: true
---

# Select (experiment) — agent-only invariants

Lives in `src/runtime/experiments/select/`, published as part of
`orio-ui/experiments`. Mirrors `<orio-selector>`'s API for the single-select
case, but renders its listbox inside the experimental native-popover
`[[popover]]` rather than `<orio-popover>`.

## Invariants

- **Unstable by contract.** Ships, but props/names/behaviour may change in any
  release including a patch. `<orio-selector>` is the stable component.
- **Never auto-imported.** `import { Select } from "orio-ui/experiments"`.
  Registered in the docs app only as `<orio-x-select>`.
- **Single-select only.** No `multiple`, no array model, no tag chips — that is
  deliberate scope, not an oversight. Choosing an option always closes the
  panel.
- **Imports the sibling experiment directly** (`../popover/index.vue`), not a
  global tag, because experiments are not registered in consumer apps. Library
  components (`<orio-control-element>`, `<orio-list-item>`,
  `<orio-empty-state>`, `<orio-icon>`) are used as global tags, matching the
  rest of `src/runtime`.
- **Open state comes from the panel's native `toggle` event**, not from Vue.
  There is no `toggle` slot prop to call and no `v-model:open`. Light-dismiss
  and Esc close the panel without this component being involved, and `isOpen`
  still updates because the event fires either way. The Popover suppresses the
  toggle pair its silent reopen produces, so that never registers as a
  close/open here.
- **The panel is reached through a template ref, not `getElementById`.** The
  panel element is authored in this SFC (it is the Popover's `#body` slot
  content), so `useTemplateRef` reaches it directly. Keyboard open/close call
  `showPopover()`/`hidePopover()` on that ref.
- **`options` accepts `string` or object items.** For objects set `field`
  (defaults to `"id"`) for identity and `optionName` for the label — without
  `optionName`, objects render as `JSON.stringify(option)`, which is a visible
  bug in the trigger.
- **Selection compares by `field`, not identity.** A fresh object with a
  matching `field` value reads as selected, so re-fetched lists keep their
  selection.
- **v-model is required** and holds the option itself (string or object), never
  the extracted key.
- **`controlProps` strip is exhaustive.** `options`, `field`, `optionName`, and
  `placeholder` never reach ControlElement. Adding a select-specific prop means
  adding it to that strip.
- **Placement props are not re-declared.** `position`, `gap`, and `flip` belong
  to the Popover; the template hardcodes `position="bottom span-right"` and takes
  the rest of the defaults, exactly as `<orio-selector>` hardcodes its own
  popover placement. Do not mirror popover props here — document them once, on
  the Popover.
- **i18n keys are shared with the shipped Selector** — `selector.placeholder`
  and `selector.noOptions`. No new keys were introduced; consumers already have
  them.

## Gotchas

- **The panel inherits the Popover's flip behaviour**, including that the side
  is re-resolved by a silent reopen while scrolling (`flip="auto"`, the
  default). A silent reopen resets nothing here — highlight state lives in Vue,
  not the DOM — but it does fire `toggle` internally, which is why the Popover
  suppresses those.
- **Placement is fixed at `bottom span-right`**, i.e. the panel's left edge meets
  the trigger's. Not the shipped Selector's `bottom-right`, which means the
  opposite in `position-area` grammar.
- **Selected rows are styled by `<orio-list-item>`, via its `selected` prop —
  not by a local class.** That keeps the accent fill and ink identical to
  `<orio-selector>`. The only row style this component adds is `.highlighted`
  (keyboard/hover), matching ListItem's own hover surface. Do not reintroduce a
  local `.selected` background; the earlier one used a `--color-accent-bg` token
  that does not exist and silently fell back to the hover colour.
- **The panel is in the top layer, so descendant selectors from a parent do not
  reach it.** Scoped styles work because the element is authored here; consumer
  overrides need a class on the element via the `#option` slot or a global rule.
- **Trigger is a `<button>`, not a native `<select>`.** No form serialization,
  no native submission — handle submit manually.
- **No search or filtering.** Pass a pre-filtered `options` array, or render an
  input through `#options-addon`.
- **Keyboard is `useListKeyboard`** wired to the trigger's `@keydown`: ArrowDown
  opens, arrows/Home/End move the highlight, Enter selects, Esc closes. The
  highlight seeds from the selected option each time the panel opens.

## Slots

- `#trigger` — replaces the whole button. Receives `{ trigger, control, isOpen,
  getOptionKey, getOptionLabel }`. `trigger` is the complete binding bag —
  popover pairing (`popovertarget`, `class`), ControlElement's `control` attrs,
  `type="button"`, `aria-haspopup="listbox"`, `aria-expanded`, and `onKeydown`.
  You **must** spread `trigger` onto a `<button>`: without it the panel cannot
  open and the listbox loses its ARIA and keyboard support.
- `#trigger-label` — replaces just the label text inside the default button.
- `#option` — replaces a row's content. Receives `{ option, selected,
  getOptionKey, getOptionLabel }`.
- `#no-options` — replaces the empty state.
- `#options-addon` — extra content after the list.

## Quick reference

Lifted from the object-options demo on `docs/experiments/select.md` (there it
is `<orio-x-select>`, the docs-only alias; consumers import `Select`):

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

## Related

- `<orio-selector>` — the stable equivalent, with multi-select and more slots.
- `[[popover]]` — the sibling experiment this renders inside.
- `useListKeyboard` — the roving-highlight composable both use.
- Demo page: `docs/experiments/select.md`.
