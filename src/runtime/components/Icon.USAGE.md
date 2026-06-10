---
kind: component
category: Buttons & indicators
purpose: icon, SVG renderer, glyph, symbol
short: SVG icon renderer that pulls from `utils/icon-registry` and renders via v-html
invariants: true
---

# Icon — agent-only invariants

`<orio-icon>` renders an SVG icon from `utils/icon-registry` into a
`<span>` via `v-html`. Unknown icon names render empty.

## Invariants

- **`name` is required.** Either a registered `IconName` (typed) or any
  string. Unregistered names render as empty string (no visible
  output, no warning).
- **`size`**: `string | number`. A number is treated as pixels (`"24px"`).
  A string is used verbatim (`"1.5em"`, `"2rem"`, `"100%"`). When
  `undefined`, falls back to the CSS var `--control-icon-size` (default
  `1.5em`).
- **`color` defaults to `"currentColor"`** — the icon inherits parent
  text color. Pass a CSS color string to override.
- **`v-html` is used to inject the raw SVG markup.** The icon registry
  is the trust boundary — never render dynamic / user-controlled SVG
  strings through it.
- **SVGs inside use `fill: currentColor`** so the `color` prop / parent
  color flows through.
- **`flex-shrink: 0`** is set on the span. The icon never shrinks inside
  a flex layout — important for inline labels with overflow.
- **The wrapper is `display: inline-flex; align-items: center; justify-content: center`**
  so the SVG is centered when the size exceeds the SVG viewBox.

## Gotchas

- **Bypass-XSS surface is the registry.** Anything in `utils/icon-registry`
  is rendered as raw HTML. Do not extend the registry with strings
  derived from user input.
- **Sizing a string `100%` requires a sized parent.** The span goes to
  the size you pass; the inner SVG fills 100% of that.
- **`color` is applied via inline style**, so it beats class-based
  styling. To recolor via CSS class, omit the `color` prop.
- **Spelling errors silently render nothing.** If an icon is missing
  during dev, check the registry — there's no console warning.

## Quick reference

```vue
<template>
  <orio-icon name="check" :size="24" />
  <orio-icon name="warning" size="1.5rem" color="var(--color-alert)" />
  <orio-icon name="search" />
</template>
```

## Related

- `<orio-loading-spinner>` — thin wrapper for the `loading-loop` icon.
- `utils/icon-registry` — the source of all available icon names.
- Public API reference: `docs/components/icon.md`.
