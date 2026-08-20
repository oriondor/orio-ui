---
kind: component
category: Form inputs
purpose: label + error + a11y wrapper for any form control
short: label/legend wrapper, owns a11y attrs, exposes the `control` slot prop bag
invariants: true
---

# ControlElement — agent-only invariants

`ControlElement` is the wrapper every form input uses (Input, Textarea,
NumberInput, Selector, CheckBox, etc.). When you build a new orio form
component, wrap it in `<orio-control-element>`. When you consume an existing
one, pass `ControlProps` straight through — they are usually re-exported.

## Invariants

- **`inheritAttrs: false`.** Attrs do **not** auto-flow onto the wrapper or
  the inner element. The component exposes a `control` slot prop containing
  the a11y/form attr bag (`id`, `ariaDescribedby`, `ariaInvalid`,
  `ariaRequired`, plus passthrough `tabindex`, `focusKey`, `disabled`,
  `required`, `name`, `ariaLabel`). The inner element **must** spread it:
  ```vue
  <orio-control-element v-slot="{ control }" v-bind="props">
    <input v-bind="control" />
  </orio-control-element>
  ```
- **`group` prop changes the semantic root.** When `true`, the wrapper gets
  `role="group"` + `aria-labelledby`, and the label renders as `<span>`
  (still id-linked) instead of `<label>`. Use this for `CheckboxGroup`,
  radio groups, anything where the "control" is multiple inputs.
- **Error wiring is automatic.** Setting `error` to a non-null string:
  - Renders a `.control-error` span below the slot.
  - Sets `aria-invalid` and `aria-describedby` on the inner element via the
    `control` slot prop.
  - Adds a red border to `.slot-wrapper` (unless the wrapper contains a
    `:deep(.error-fields)` element, in which case the inner component owns
    error styling — see TaggableSelector).
- **`size` is provided to descendants** via `provideControlSize`. Children
  that use `useControlSize()` (e.g. inner buttons, icons) inherit it
  automatically — do not re-pass `size` down manually.
- **`appearance="minimal"`** zeros margin and strips border + box-shadow from
  the first slot child. Use for inputs embedded in a row with their own
  surrounding chrome.

## Gotchas

- The slot's `id` matches what the `<label>` points to via `for`. The inner
  element receives the same `id` through the `control` bag. Do **not**
  override it — it is `useId()` by default and accessibility breaks if two
  inputs in the same render share an id.
- `disabled` is forwarded to the inner element AND drives the wrapper's
  `.disabled` class for styling. Pass `disabled` on the wrapper, never on the
  inner element directly.
- The exported types are the contract:
  - `ControlProps` — what consumers pass to ControlElement.
  - `ControlPassthroughProps` — the subset that travels to the inner element.
  - `ControlSlotAttrs` — the bag exposed via the `control` slot prop.
  - `ControlLayout = "vertical" | "horizontal"`.
  Components that wrap ControlElement extend `ControlProps`, e.g.
  `interface Props extends ControlProps { ... }`.

## Quick reference

```vue
<script setup lang="ts">
import type { ControlProps } from "./ControlElement.vue";
interface Props extends ControlProps { /* component-specific props */ }
const props = defineProps<Props>();
</script>

<template>
  <orio-control-element v-slot="{ control }" v-bind="props">
    <my-inner-element v-bind="control" />
  </orio-control-element>
</template>
```
