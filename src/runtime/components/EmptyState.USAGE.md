---
kind: component
category: Buttons & indicators
purpose: empty state, no-results placeholder, blank slate, empty list
short: centered empty-list placeholder with optional icon, title, description, and action slot
invariants: true
---

# EmptyState — agent-only invariants

`<orio-empty-state>` is a centered placeholder for empty lists, no-search-
results screens, and similar blank slates.

## Invariants

- **`title` is required.** Renders as `<orio-view-text type="title">` —
  size scales with the empty-state `size` (large → medium title, others →
  small title).
- **`description` is optional**, max-width `30ch`. Wraps after that.
- **`icon` is optional.** Rendered as `<orio-icon>` above the title with
  reduced opacity (`0.5`). Icon size scales with `size`:
  `small` → 2rem, `medium` → 3rem, `large` → 4rem.
- **Default slot is rendered after the description** — typically a CTA
  button.
- **Always vertically stacked, centered, text-centered.** No prop to
  switch to horizontal.
- **`size`**: `"small"` / `"medium"` (default) / `"large"`. Affects
  padding, gap, and icon size — not title color or weight.

## Gotchas

- **`title` and `description` are plain strings.** Pass i18n keys
  through `$t()` from the parent; no `#title` / `#description` slot.
  For inline `<strong>` or links inside copy, build a custom empty
  state from view primitives.
- **Slot CTA spacing**: the default slot inherits the column gap
  (`0.25` / `0.5` / `1rem` per size). Buttons sit tight against the
  description — add margin if you need separation.
- **Used internally by `<orio-selector>` as the `no-options` default.**
  When overriding via the `#no-options` slot, keep the layout similar
  for visual consistency.

## Quick reference

```vue
<template>
  <orio-empty-state
    icon="inbox"
    :title="$t('inbox.empty.title')"
    :description="$t('inbox.empty.description')"
    size="large"
  >
    <orio-button @click="createMessage">
      {{ $t("inbox.empty.compose") }}
    </orio-button>
  </orio-empty-state>
</template>
```

## Related

- `<orio-view-text>` — used internally for title/description.
- `<orio-banner>` — for inline notice strips instead of full-block
  empty states.
- Public API reference: `docs/components/empty-state.md`.
