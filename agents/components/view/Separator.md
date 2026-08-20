---
kind: component
category: Media & misc
purpose: separator, divider, horizontal rule, divider line
short: horizontal separator line with configurable border style, size in px, and block margin in rem
invariants: false
---

# view/Separator — agent-only invariants

`<orio-view-separator>` is a horizontal rule rendered as a `<div>` with a
`border-block-end`. It is **not** an `<hr>` element.

## Invariants

- **`style` prop** is the CSS border style: `"solid"` (default),
  `"dotted"`, `"dashed"`, `"double"`, `"groove"`, `"ridge"`.
- **`size`** (number, default `1`) is the border width in **pixels**.
- **`margin`** (number, default `1`) is the **rem** spacing above and
  below via `margin-block`. So `margin: 1` → `1rem` top + `1rem`
  bottom.
- **Color is `var(--color-border)`** — not themable per-instance. Use
  CSS overrides if you need a different color.
- **Block-direction aware**: `border-block-end` and `margin-block`
  respect the writing mode. In a horizontal writing mode it's a bottom
  border + vertical margins; in vertical writing modes it flips.

## Gotchas

- **Renders a `<div>`, not an `<hr>`.** Screen readers may not announce
  a section break. For semantic separation, add `role="separator"` via
  `$attrs`.
- **`size` is unitless number → px** by template binding. Strings get
  used verbatim (`"2px"` works, but loses the type signal).
- **No vertical orientation.** For a vertical divider, write a custom
  `<div>` with `border-inline-start` rather than using this component.

## Quick reference

```vue
<template>
  <p>First section</p>

  <orio-view-separator />

  <p>Second section</p>

  <orio-view-separator style="dashed" :size="2" :margin="2" />

  <p>Third section</p>
</template>
```

## Related

- Public API reference: `docs/components/view/separator.md` (if
  present).
