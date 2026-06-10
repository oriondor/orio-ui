---
kind: component
category: Form inputs
purpose: single checkbox, boolean toggle, opt-in
short: single boolean checkbox wrapping ControlElement; custom check icon via prop or slot
invariants: true
---

# CheckBox — agent-only invariants

`<orio-check-box>` is a single boolean checkbox. The native `<input
type="checkbox">` is visually hidden; the rendered tick lives in a sibling
`<span class="checkbox-box">`. Read `ControlElement.USAGE.md` first.

## Invariants

- **v-model is `boolean`**, not required (renders as unchecked when
  unbound).
- **Default slot is the label text** rendered to the right of the box.
- **Default tick is a CSS rotate-45-border checkmark** drawn in
  `::after`, applied when no `checkedIcon` is passed.
- **`checkedIcon` / `uncheckedIcon` props** swap in `<orio-icon>` glyphs
  for either state. Pass icon names registered in `utils/iconRegistry`.
- **`#icon` slot** lets you render arbitrary indicator content; receives
  `{ checked }`. Overrides both the default tick and any icon props.
- **ControlElement is passed `fill`** so the checkbox row fills the wrapper
  width. Label slot of ControlElement is bypassed — the visible label is
  the CheckBox's own default slot, not ControlElement's `label` prop.
- **`--box-size` defaults to `var(--control-icon-size, 1rem)`**. Override
  the CSS var on the host to resize the box.

## Gotchas

- **The native input has `tabindex="-1"`** in the template, but the
  styles target `:focus-visible` on it. Keyboard focus for the checkbox
  may not behave the way an a11y audit expects — confirm tab order
  before shipping critical forms. If you need keyboard-focusable
  checkboxes, override `tabindex` via `$attrs`.
- **`required` from `ControlProps` flows through**, but native checkbox
  required validation only fires inside a `<form>` that calls
  `reportValidity`.
- **No indeterminate state.** v-model is strictly boolean; the
  underlying input never gets `indeterminate = true`.
- **Passing both `checkedIcon` and `#icon` slot** — the slot wins; the
  prop becomes dead code.

## Quick reference

```vue
<template>
  <orio-check-box v-model="agreed" :error="errors.terms">
    {{ $t("signup.acceptTerms") }}
  </orio-check-box>

  <orio-check-box v-model="bookmarked" checked-icon="bookmark-filled" unchecked-icon="bookmark" />
</template>
```

## Related

- `<orio-checkbox-group>` — multi-value group of checkboxes.
- `<orio-control-element>` — wrapper; owns label/error/a11y.
- Public API reference: `docs/components/checkbox.md`.
