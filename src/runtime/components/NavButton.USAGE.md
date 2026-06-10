---
kind: component
category: Buttons & indicators
purpose: nav button, link-styled button, navigation item, sidebar item
short: bare nav-styled button with `active` state and `aria-current="page"` for the current route
invariants: true
---

# NavButton — agent-only invariants

`<orio-nav-button>` is a transparent, text-styled button for navigation
menus and tab bars. It is not a `<router-link>` — wrap it or wire
navigation in the `click` handler yourself.

## Invariants

- **`active` prop is the "is this the current item" flag.** When true:
  - Text becomes accent color, font-weight 600.
  - `aria-current="page"` is set on the inner `<button>`.
  - `undefined` (not removed) otherwise — so it doesn't appear in the
    DOM at all when inactive.
- **`icon` prop OR `#icon` slot** — same pattern as `<orio-button>`.
- **Icon-only mode is auto-detected** (icon + no default slot) →
  `border-radius: 50%`, `aspect-ratio: 1`, `padding: var(--control-py)`.
- **No `variant` prop.** One look only — transparent background, text
  color, no border.
- **`disabled` blocks click** and applies 0.5 opacity + `cursor:
  not-allowed`.
- **Only emits `click`.** No mousedown/mouseup like `<orio-button>`.
- **Focus ring**: `outline: 2px solid var(--color-accent)` with
  `outline-offset: 2px`. Keyboard-only via `:focus-visible`.

## Gotchas

- **Not a router link.** No `to`, no `href`. Wire navigation in
  `@click`. If a real anchor is needed for a11y / right-click-to-open,
  fall back to your router's link component.
- **Same `$attrs` duplication caveat as `<orio-button>`** — attrs may
  land on both the wrapper and the inner `<button>`.
- **Active state is purely visual + ARIA**; the component does not
  detect the current route. Compute `active` from `useRoute()` or your
  router state.
- **`type` defaults to `submit`** (native default). Pass `type="button"`
  if mounted inside a form to avoid accidental submits.

## Quick reference

```vue
<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
</script>

<template>
  <nav>
    <orio-nav-button
      icon="home"
      :active="route.path === '/'"
      @click="router.push('/')"
    >
      {{ $t("nav.home") }}
    </orio-nav-button>

    <orio-nav-button
      icon="settings"
      :active="route.path === '/settings'"
      @click="router.push('/settings')"
    >
      {{ $t("nav.settings") }}
    </orio-nav-button>
  </nav>
</template>
```

## Related

- `<orio-button>` — primary actions; use that for CTAs.
- Public API reference: `docs/components/nav-button.md`.
