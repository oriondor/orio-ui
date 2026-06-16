---
kind: component
category: Buttons & indicators
purpose: button, primary action, CTA, icon button, action button
short: primary action button with variants, loading, icon slots, and auto icon-only sizing
invariants: true
---

# Button — agent-only invariants

`<orio-button>` is the primary action button. Wraps `<orio-control-element>`
so it can carry a label/error like other form controls, but it is most
often used standalone.

## Invariants

- **`variant`**: `"primary"` (default), `"secondary"`, `"subdued"`. Primary
  is filled; secondary is outline; subdued is bare text. All use the
  global `gradient-hover` class for the hover treatment.
- **`icon` prop OR `#icon` slot**: pass an icon name (registered in
  `utils/iconRegistry`) OR slot in arbitrary content before the label.
  Slot wins.
- **`#icon-right` slot**: trailing icon, rendered after the default slot.
- **`loading` prop**: renders `<orio-loading-spinner>` in place of all
  slot content (icon, label, icon-right are all hidden). Clicks and
  mousedown are blocked while loading.
- **Icon-only mode is auto-detected.** When an icon is present and the
  default slot is empty, `.icon-only` is applied → `aspect-ratio: 1`,
  `line-height: 0`. No need to pass a prop.
- **`pill` prop**: `false` by default. When `true`, swaps the button's
  `border-radius` to `var(--border-radius-pill)` (fully rounded),
  overriding the size-driven `--control-radius`. No effect when omitted.
- **`disabled` blocks `click` and `mousedown` emits.** `mouseup` and
  `mouseleave` always fire (so press-and-hold callers can release
  state).
- **Emits**: `click`, `mousedown`, `mouseup`, `mouseleave`. Only `click`
  and `mousedown` honor the loading/disabled gates.
- **Wraps ControlElement** — supports `label`, `error`, `size`, `layout`,
  etc. The control bag is spread on the inner `<button>` along with
  `$attrs`.

## Gotchas

- **`$attrs` are duplicated.** Because ControlElement does **not** set
  `inheritAttrs: false` and Button also spreads `$attrs` on the inner
  `<button>`, an attr like `data-test="x"` may appear on both the
  wrapper `<div>` (from ControlElement's root) and the inner `<button>`.
  For attrs that must be unique (e.g. `data-key` for list keying,
  `tabindex` override), bind a plain native `<button>` instead of
  `<orio-button>`.
- **`type` defaults to `submit`** (native default). Inside an
  `<orio-form>`, every `<orio-button>` will submit unless you pass
  `type="button"`.
- **Loading hides the icon and the icon-right slot.** No way to keep
  the trailing icon while showing a spinner — render the spinner
  yourself in `#icon-right` if you need that.
- **No `aria-busy` on loading.** Set it via `$attrs` if you need
  screen-reader signal.

## Quick reference

```vue
<template>
  <orio-button @click="onSave" :loading="saving">
    {{ $t("common.save") }}
  </orio-button>

  <orio-button variant="secondary" icon="trash" @click="onDelete">
    {{ $t("common.delete") }}
  </orio-button>

  <orio-button variant="subdued" icon="close" aria-label="Close" />

  <orio-button pill icon="plus" aria-label="Add" />
</template>
```

## Related

- `<orio-nav-button>` — link-styled button with `active` state.
- `<orio-loading-spinner>` — used internally when `loading` is true.
- `<orio-icon>` — used internally for the `icon` prop and slots.
- Public API reference: `docs/components/button.md`.
