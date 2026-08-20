---
kind: component
category: Media & misc
purpose: read-only text display, formatted view, typography primitive, label
short: typed text primitive (text/title/subtitle/italics) with size, uppercase, line-clamp, and inline icon
invariants: true
---

# view/Text — agent-only invariants

`<orio-view-text>` is the typography primitive for read-only labels and
text blocks. Use it instead of bare `<p>` / `<span>` / `<h*>` for inline
icons, theming, and line-clamping.

## Invariants

- **`type`**: `"text"` (default) / `"title"` (bold) / `"subtitle"`
  (semi-bold, muted) / `"italics"` (italic, muted). Affects font-weight,
  style, and color.
- **`size`**: `"small"` / `"medium"` (default) / `"large"` /
  `"extra-large"`. Maps to `--font-sm` … `--font-xl` tokens.
- **`uppercase: true`** applies `text-transform: uppercase`.
- **`icon` prop** renders `<orio-icon>` inline before the text/slot. The
  wrapper is `display: flex; align-items: center; gap: 0.25rem` so the
  icon sits inline with the text.
- **`lineClamp` (number or string)** enables `-webkit-line-clamp` line
  truncation with ellipsis. Defaults to 1 line when the prop is present
  but unset.
- **Content sources**: default slot or `v-model:modelValue` string. Slot
  wins. v-model is bound so the component plays nicely with
  `<orio-form>` auto-bind by `name`.
- **`--view-text-color` CSS var** overrides the type's default color
  without changing the type prop. Useful for accent/error states from
  the consumer.
- **No `inheritAttrs: false`** — attrs flow to the wrapper `<div>`.

## Gotchas

- **The wrapper is a `<div>`, not a heading element.** Title type does
  not produce an `<h1>` / `<h2>` etc. For semantic headings, write
  `<h2><orio-view-text type="title">...</orio-view-text></h2>` or use a
  plain heading element.
- **`lineClamp` requires multi-line content** to show the ellipsis. A
  single-line value with `lineClamp: 2` simply renders as one line.
- **`white-space: pre-wrap`** is set globally on the wrapper —
  whitespace and newlines from the source are preserved.

## Quick reference

```vue
<template>
  <orio-view-text type="title" size="large">
    {{ $t("article.title") }}
  </orio-view-text>

  <orio-view-text type="subtitle" :line-clamp="3" icon="info">
    {{ description }}
  </orio-view-text>

  <orio-view-text type="italics" uppercase v-model="badgeLabel" />
</template>
```

## Related

- `<orio-view-dates>` — locale-aware date range display built on top.
- `<orio-empty-state>` — uses this internally for title and description.
- Public API reference: `docs/components/view/text.md` (if present).
