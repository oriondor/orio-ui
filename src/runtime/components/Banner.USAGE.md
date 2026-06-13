---
kind: component
category: Buttons & indicators
purpose: banner, page-level notice, alert strip, inline notification, info bar
short: page-level notice strip with danger/alert/success/info variants; default slot for content
invariants: true
---

# Banner — agent-only invariants

`<orio-banner>` is a plain styled `<div>` for page-level notices. No icon,
no close button, no auto-dismiss — bring your own.

## Invariants

- **`variant`**: `"info"` (default), `"success"`, `"alert"`, `"danger"`.
  Each maps to a soft-background + matching border color from the
  project's color tokens.
- **Default slot is the entire body.** Text, links, action buttons —
  whatever fits the layout.
- **Padding (`0.75rem 1rem`) and border-radius (`--border-radius-sm`)
  are fixed.** No size variants.

## Gotchas

- **No semantic role / ARIA live region.** The `<div>` has no
  `role="alert"` or `role="status"`. For screen-reader-announced
  notices, add `role="alert"` (urgent) or `role="status"` (polite) via
  `$attrs`.
- **No close button.** Pair with `v-if` on the consumer side for
  dismissable banners.
- **No icon prop.** Render `<orio-icon>` inside the slot if needed —
  the banner does not auto-prepend a variant-matching glyph.

## Quick reference

```vue
<template>
  <orio-banner variant="alert" role="alert" v-if="paymentFailed">
    <strong>{{ $t("billing.failed.title") }}</strong>
    <orio-button variant="subdued" @click="retry">
      {{ $t("billing.failed.retry") }}
    </orio-button>
  </orio-banner>
</template>
```

## Related

- `<orio-empty-state>` — for empty-list placeholders.
- `<orio-tooltip>` — for transient hover hints.
- Public API reference: `docs/components/banner.md`.
