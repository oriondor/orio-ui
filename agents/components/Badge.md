---
kind: component
category: Buttons & indicators
purpose: badge, small status pill, notification dot, count indicator, corner badge
short: small status pill or dot indicator; optionally positioned in the top-right corner of a wrapped element
invariants: true
---

# Badge — agent-only invariants

`<orio-badge>` renders one of two shapes:
- A standalone inline status pill / dot.
- A **positioned** badge anchored to the top-right corner of an element
  passed via the `#wrapping` slot (typical notification-on-icon pattern).

## Invariants

- **`#wrapping` slot toggles positioning mode.** When provided, the badge
  is rendered absolutely at `top: 15%; right: 15%; transform: translate(50%, -50%)`
  on top of the wrapped element. Without `#wrapping`, the badge is plain
  inline.
- **Default slot determines dot vs text mode.** Empty default slot → dot
  badge (0.5rem circle, no padding). Any content → text/number badge.
- **`variant`**: `"primary"` (default), `"danger"`, `"alert"`, `"grey"`.
  Maps to accent / danger / alert / surface color tokens.
- **`pill` prop**: switches the border-radius to pill shape; ignored when
  in dot mode.
- **`hidden` prop**: gates the badge render via `v-if`. The wrapped slot
  still renders when in wrapping mode — only the indicator hides.
- **No `count` prop.** Use the default slot for the number: `<orio-badge>3</orio-badge>`.

## Gotchas

- **No automatic "99+" cap.** Long content (e.g. `1234`) renders fully,
  pushing the corner badge wider. Cap in the consumer.
- **Positioned badge offsets are percentages of the wrapping element.**
  Tiny wrapped icons may have the badge clip outside the wrapper. The
  wrapper is `position: relative; display: inline-flex` — `overflow: visible`
  is implicit, but parent overflow may clip it.
- **No interactive behavior.** Click does not bubble specially; it's a
  `<span>`. For removable chips, use `<orio-tag>` instead.

## Quick reference — corner badge on an icon

```vue
<template>
  <orio-badge variant="danger">
    <template #wrapping>
      <orio-button icon="bell" variant="subdued" />
    </template>
    {{ unreadCount }}
  </orio-badge>

  <orio-badge variant="alert" :hidden="!hasUpdates">
    <template #wrapping>
      <orio-icon name="refresh" />
    </template>
  </orio-badge>
</template>
```

## Quick reference — inline status pill

```vue
<template>
  <orio-badge variant="grey" pill>{{ $t("status.draft") }}</orio-badge>
  <orio-badge variant="primary">{{ $t("status.live") }}</orio-badge>
</template>
```

## Related

- `<orio-tag>` — chip with text and optional `id` / variant for filters
  and selections.
- Public API reference: `docs/components/badge.md`.
