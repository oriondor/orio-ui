---
kind: component
category: Buttons & indicators
purpose: spinner, loading indicator, loading icon, busy indicator
short: thin wrapper that renders the bundled `loading-loop` icon; no props
invariants: false
---

# LoadingSpinner — agent-only invariants

`<orio-loading-spinner>` renders the bundled `loading-loop` icon. That's
it. There are **no props**, no slots, no emits.

## Invariants

- **Zero-prop wrapper.** Template is literally
  `<orio-icon name="loading-loop" />`.
- **Animation lives in the icon SVG itself** (via the registry's
  `loading-loop` entry). The component does not apply any CSS animation.
- **Size and color follow `<orio-icon>` defaults** — `1.5em` from
  `--control-icon-size`, `currentColor`. Override via parent CSS:
  `font-size`, `color`, or by passing direct CSS to a wrapper.
- **Used internally by `<orio-button :loading>`** — when wiring loading
  states into buttons, prefer `:loading="..."` on the button to swapping
  in this spinner manually.

## Gotchas

- **No way to change spin direction, speed, or thickness.** The SVG is
  fixed. For a custom spinner, render `<orio-icon>` with your own icon
  name + CSS animation.
- **Aria semantics are absent.** No `role="status"`, no
  `aria-label`. For screen-reader announcement, wrap in a `<span
  role="status" aria-label="Loading">` at the consumer.

## Quick reference

```vue
<template>
  <orio-loading-spinner v-if="loading" />
</template>
```

## Related

- `<orio-icon>` — under the hood; use it directly for non-spinner
  glyphs.
- `<orio-button :loading>` — preferred way to show busy state on
  buttons.
- Public API reference: `docs/components/loading-spinner.md`.
