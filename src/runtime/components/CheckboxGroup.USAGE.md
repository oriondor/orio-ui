---
kind: component
category: Form inputs
purpose: group of checkboxes, multi-value boolean group, multi-select boolean
short: group of CheckBox children bound to an `unknown[]` v-model; supports `options` prop or default slot
invariants: true
---

# CheckboxGroup — agent-only invariants

`<orio-checkbox-group>` wires a list of checkboxes to a single array
v-model. It uses `<orio-control-element group>` so the wrapper renders as
a `role="group"` with an `aria-labelledby` label — semantically a fieldset
group, not a `<fieldset>` element.

## Invariants

- **v-model is `unknown[]`** (default `[]`). Each entry is one option's
  `value`. Comparison is strict `===` — primitives or shared references,
  not deep equality.
- **Two modes**: `options` prop (array of `{ label, value }`) **or** the
  default slot (you render `<orio-check-box>` children yourself). The slot
  wins when present.
- **In `options` mode**, each rendered checkbox is `appearance="minimal"`
  (hardcoded). To change appearance, switch to the slot.
- **Toggle replaces the array**: `modelValue.value = modelValue.value.filter(...)`
  / `[...modelValue.value, value]`. Reactive arrays survive; readonly arrays
  break silently.
- **Wrapper omits `appearance`, `group`, `id` from `ControlProps`.**
  `group` is forced true; `id` is internal.
- **Defaults**: `layout: "vertical"`, `size: "md"`, `error: null`.
- **Horizontal layout aligns label top** (`align-items: flex-start`) so the
  label sits next to the first checkbox, not centered against the full
  column.

## Gotchas

- **`isChecked` uses `Array.includes` with `===`.** Object option values
  must be the **same reference** as in the model, not a structural match.
  For object values, store ids and resolve to objects in the parent.
- **No "select all" / "indeterminate parent" affordance.** Build it in the
  consumer if needed.
- **Label rendering depends on `group` mode in ControlElement** — the
  label becomes a `<span>` with `aria-labelledby` wiring, not a `<legend>`.
  Screen readers announce it as a group label.
- **`error` is forwarded** to the group wrapper; per-checkbox errors are
  not supported. Surface validation at the group level.

## Quick reference — options prop

```vue
<script setup lang="ts">
const interests = defineModel<string[]>({ default: () => [] });
const options = [
  { label: "Books", value: "books" },
  { label: "Films", value: "films" },
  { label: "Music", value: "music" },
];
</script>

<template>
  <orio-checkbox-group
    v-model="interests"
    :options="options"
    :label="$t('profile.interests')"
  />
</template>
```

## Quick reference — slot mode (custom rendering)

```vue
<template>
  <orio-checkbox-group v-model="features" :label="$t('settings.features')">
    <orio-check-box
      v-for="feature in availableFeatures"
      :key="feature.id"
      :model-value="features.includes(feature.id)"
      checked-icon="star-filled"
      unchecked-icon="star"
      @update:model-value="toggle(feature.id)"
    >
      {{ feature.name }}
    </orio-check-box>
  </orio-checkbox-group>
</template>
```

## Related

- `<orio-check-box>` — single checkbox; rendered children inside this
  group.
- `<orio-control-element>` (`group` mode) — wrapper; provides the group
  label semantics.
- Public API reference: `docs/components/checkbox-group.md`.
