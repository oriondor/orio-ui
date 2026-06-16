# Fix oversized vertical NumberInput spinner buttons

Date: 2026-06-14

## Problem

The vertical `NumberInput` variant renders its stacked chevron-up / chevron-down
buttons far too large; the two buttons overflow the field height. A previous
change to the control size system (notably icon sizing) surfaced the issue. A
stopgap `size="sm"` was added to the buttons in `Vertical.vue` (uncommitted) but
does not fully resolve it.

## Root cause (confirmed)

Icon-only buttons in `Button.vue` use `aspect-ratio: 1` combined with
**asymmetric** padding — `--control-px` (e.g. `0.5rem` at `sm`) is larger than
`--control-py` (`0.25rem`). `aspect-ratio: 1` forces the button to a square
sized to the *wider* horizontal-padding dimension, so each icon button balloons
wider and taller than the icon needs.

- The **horizontal** variant tolerates this: the minus/plus buttons flank the
  field horizontally, so extra width is harmless.
- The **vertical** variant stacks two buttons in a column inside the field, so
  the oversized squares overflow the field vertically.

Only the vertical variant is visibly broken.

## Goals

1. Vertical spinner chevrons fit comfortably within the field height at the
   default (`md`) field size and at `sm`.
2. Introduce a reusable, first-class `xs` control size for future use across any
   control.
3. Add a reusable `pill` prop to `Button`.

## Non-goals

- Do **not** change the global icon-only button geometry (`aspect-ratio` /
  padding) in `Button.vue`. The horizontal variant depends on current behavior
  and is not broken. The geometry fix is achieved by scoping CSS to the vertical
  variant plus the smaller `xs` tokens.
- Do **not** change the horizontal variant — it is not broken.

## Changes

### 1. First-class `xs` control size

**`src/runtime/components/ControlElement.vue`**
- Extend the union: `export type ControlSize = "xs" | "sm" | "md" | "lg" | "xl";`

**`src/runtime/composables/useControlSize.ts`**
- Add an `xs` entry to `sizeTokens`. Keep text readable while tightening spacing:
  - `--control-font-size: var(--font-sm)` (same as `sm` — readable)
  - `--control-label-font-size: var(--font-xs)`
  - `--control-py`: smaller than `sm` (≈ `0.125rem`)
  - `--control-px`: smaller than `sm` (≈ `0.25rem`)
  - `--control-gap`: ≈ `0.125rem`
  - `--control-radius: var(--border-radius-sm)`
  - `--control-icon-size`: ≈ `0.625rem`
  - inner-label tokens (`--control-inner-block-start`, `--control-inner-block-end`,
    `--control-label-block-start`): scaled-down values consistent with `sm`.
- Exact rem values are tuned visually during implementation; the values above are
  the starting point.

**`src/runtime/composables/useControlSize.USAGE.md`**
- Update the size enumeration to `xs/sm/md/lg/xl` wherever sizes are listed.

> Note: `ControlElement.vue`'s `size` prop default stays `md`. Adding `xs` to the
> union is additive and does not change any existing component's default.

### 2. `pill` prop on `Button`

**`src/runtime/components/Button.vue`**
- Add `pill?: boolean` to the component `Props` interface (default `false`).
- When `pill` is true, apply `border-radius: var(--border-radius-pill)` (token
  already exists) to the button, overriding `--control-radius`.
- Default `false` ⇒ no visual change to any existing button.

### 3. Vertical variant uses `xs` + `pill`

**`src/runtime/components/NumberInput/Vertical.vue`**
- Replace the uncommitted `size="sm"` stopgap on both chevron buttons with
  `size="xs"` and add `pill`.
- Tighten the `.vertical :deep(.controls)` scoped CSS as needed so the two
  stacked chevrons sit within the field height. This CSS is scoped to the
  vertical variant only — the global icon-only geometry is untouched.

## Testing

- Existing `Button`, `ControlElement`, and `NumberInput` tests must still pass.
- Verify the `xs` size resolves to the new token bag (e.g. a control rendered at
  `size="xs"` exposes the expected `--control-*` CSS variables).
- Verify `pill` applies `--border-radius-pill` and is absent by default.
- Visual check: two vertical chevrons fit the field at default (`md`) field size
  and at `sm`; horizontal variant is unchanged.

## Risk

Low. All three changes are additive:
- `xs` extends a union and adds a token entry; no existing default changes.
- `pill` defaults off; no existing button changes.
- Vertical CSS is scoped; horizontal and global button geometry are untouched.
