---
kind: component
category: Form inputs
purpose: toggle, on/off switch, pill toggle, boolean button
short: boolean on/off pill button (not a sliding switch) wrapping ControlElement; click/Enter/Space toggle
invariants: true
---

# SwitchButton — agent-only invariants

`<orio-switch-button>` is a **pill-shaped button** that toggles a boolean.
Despite the name it is **not** a sliding toggle switch — it is a chip-style
button that flips between active and inactive states.

## Invariants

- **Renders a `<button type=...>` element**, not a checkbox or sliding
  knob. The "switch" is purely visual state via the `.active` class.
- **v-model is `boolean`** (not required — renders as off when unbound).
- **Click, Enter, and Space all toggle.** `Enter` and `Space` use
  `.prevent` to avoid form submit / page scroll.
- **`disabled` blocks toggling** and applies `.disabled` styles (0.5
  opacity, `cursor: not-allowed`). Keyboard activation is also gated.
- **Default slot is the button content** (label, icon, or both). Visual
  active state changes background/border/color; the slot does not
  receive any reactive prop.
- **Wraps `<orio-control-element>`** — supports the standard `label`,
  `error`, `layout`, `size`, etc. The control bag is spread on the
  inner `<button>` along with `$attrs`.

## Gotchas

- **The component name is misleading.** If you want a sliding toggle
  switch (knob that animates), this is not it. Build that yourself or
  pick another primitive.
- **No `aria-pressed`.** The active state is visual only. For correct
  screen reader semantics, pass `:aria-pressed="modelValue"` via
  `$attrs`.
- **`@keydown.enter.prevent`** swallows form-submit Enter inside a
  `<form>`. If the SwitchButton is inside a form, Enter on it will
  toggle but not submit.

## Quick reference

```vue
<template>
  <orio-switch-button
    v-model="notifications"
    :label="$t('settings.notifications')"
    :aria-pressed="notifications"
  >
    <orio-icon :name="notifications ? 'bell' : 'bell-off'" />
    {{ notifications ? $t("common.on") : $t("common.off") }}
  </orio-switch-button>
</template>
```

## Related

- `<orio-check-box>` — when you want a real checkbox.
- `<orio-radio-button>` — single-choice from a group.
- Public API reference: `docs/components/switch-button.md`.
