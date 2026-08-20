---
kind: component
category: Form inputs
purpose: radio, radio button, single-choice from group
short: single radio option wrapping ControlElement; group by sharing the same v-model
invariants: true
---

# RadioButton — agent-only invariants

`<orio-radio-button>` is one radio option. There is **no `RadioGroup`** —
grouping is done by sharing the same v-model across multiple instances.

## Invariants

- **`value` is the option's payload.** It is what gets written to v-model
  when this radio is selected. Comparison is strict (`===`).
- **v-model is `unknown`** (typically `string` / `number` / object id) —
  the selected value. Two `<orio-radio-button>`s with the same v-model
  form a group; whichever value matches the model is checked.
- **`text` prop _or_ default slot** for the inline label. Slot wins.
  Render nothing if both are absent.
- **`hideLabel` prop** applies `.sr-only` to the text — visually hidden,
  still announced by screen readers. Use for icon-only radios that still
  need an accessible name.
- **Visual is a CSS-only rounded box** with `::after` for the inner dot
  when checked.
- **Native `<input type="radio">` has `tabindex="-1"`** in the template.
  Default tab order skips it; clicking the label still toggles. If you
  need keyboard arrow-key roving across the group, layer that on top —
  it is not provided.
- **No `name` HTML attribute by default.** Two browser radios with the
  same DOM `name` form a native group; this component groups via Vue
  v-model only. Set `name` via `$attrs` if a `<form>` submission needs
  the radio group serialized natively.

## Gotchas

- **Multiple instances bound to the same v-model are not visually grouped.**
  Layout (column / row) is up to the consumer — wrap them in a div or
  `<orio-control-element group>` with a shared label.
- **Object values must be the same reference** as the one stored in the
  model. Comparing `{ id: 1 }` to a new `{ id: 1 }` is false. Bind to
  primitive ids when possible.
- **No "deselect" behavior.** Once a radio is selected, clicking it again
  does not clear. To allow clearing, expose a separate "None" radio with
  `value: null`.
- **`required` from `ControlProps`** flows through but only takes effect
  inside a `<form>` that calls `reportValidity`.

## Quick reference

```vue
<script setup lang="ts">
const plan = defineModel<"basic" | "pro" | "team">();
</script>

<template>
  <orio-control-element group :label="$t('billing.plan')">
    <orio-radio-button v-model="plan" value="basic" :text="$t('billing.basic')" />
    <orio-radio-button v-model="plan" value="pro"   :text="$t('billing.pro')" />
    <orio-radio-button v-model="plan" value="team"  :text="$t('billing.team')" />
  </orio-control-element>
</template>
```

## Related

- `<orio-control-element>` (group mode) — wrap multiple radios for an
  accessible group label.
- `<orio-switch-button>` — boolean on/off pill button.
- Public API reference: `docs/components/radio-button.md`.
