---
kind: composable
category: Composables
purpose: control size tokens, sizing tokens for form controls, control variant sizing
short: provide/inject `ControlSize` (xs/sm/md/lg/xl) and read a CSS-var token bag for the active size
invariants: true
---

# useControlSize — agent-only invariants

This composable owns the **CSS variable bag** that maps a `ControlSize`
(`xs` / `sm` / `md` / `lg` / `xl`) to concrete padding, font, gap, radius, and
icon-size tokens. Used internally by ControlElement and friends.

## Invariants

- **Two exports**: `provideControlSize(size)` and `useControlTokens(explicit?, fallback?)`.
  Most consumers don't need either — ControlElement wires them — but you
  can use them to size custom controls.
- **Provide key is a module-local `Symbol`** — there is exactly one
  channel per app. `provideControlSize(ref("lg"))` from a parent scopes
  every nested `useControlTokens()` call to that size.
- **`useControlTokens(explicit, fallback = "md")`** returns:
  - `size: ComputedRef<ControlSize>` — resolved size (explicit ?? injected
    ?? fallback).
  - `tokens: ComputedRef<Record<string, string>>` — the CSS-var bag for
    that size. Spread it onto a `style` binding to apply the sizing.
- **Token keys** include `--control-font-size`, `--control-label-font-size`,
  `--control-py`, `--control-px`, `--control-gap`, `--control-radius`,
  `--control-icon-size`, `--control-inner-block-start`, `--control-inner-block-end`,
  `--control-label-block-start`. Adding new tokens requires extending
  every size in `sizeTokens`.
- **`sizeTokens` is exported** as the raw record — useful for previews or
  ad-hoc lookups outside Vue.

## Gotchas

- **`useControlTokens` works outside an `<orio-control-element>`** — it
  falls back to `md` (or the provided fallback) when no provider exists.
  No error is thrown.
- **The `explicit` argument wins over the injection.** Use it when the
  caller takes an own `size` prop and wants it to override an ambient
  one.
- **Style binding requires the `tokens` value, not the ref.** Spread it
  on `:style`:
  ```vue
  <div :style="tokens">...</div>
  ```

## Quick reference — custom control consuming the tokens

```ts
import { computed, toRef } from "vue";
import { useControlTokens } from "../composables/useControlSize";
import type { ControlSize } from "../components/ControlElement.vue";

interface Props { size?: ControlSize }
const props = defineProps<Props>();
const { tokens } = useControlTokens(toRef(props, "size"));
```

```vue
<template>
  <div :style="tokens" class="my-control">…</div>
</template>
```

## Related

- `<orio-control-element>` — provides and consumes this composable.
- `<orio-selector>` — uses `useControlTokens(size)` to size the
  dropdown popover content.
- Public API reference: `docs/composables/use-control-size.md`.
