---
kind: component
category: Buttons & indicators
purpose: nav button, nav link, link-styled button, navigation item, sidebar item, menu link
short: bare nav-styled single `<a>` — `role="button"` without `to`, real href + router push with it — with `active` state and `aria-current="page"`
invariants: true
---

# NavButton — agent-only invariants

`<orio-nav-button>` is a transparent, text-styled button for navigation
menus and tab bars. It always renders one `<a>`: pass `to` and it gets a real
`href`; without `to` it is a `role="button"` anchor.

## Invariants

- **`active` prop is the "is this the current item" flag.** When true:
  - Text becomes accent color, font-weight 600.
  - `aria-current="page"` is set on the inner `<a>`.
  - `undefined` (not removed) otherwise — so it doesn't appear in the
    DOM at all when inactive.
- **`icon` prop OR `#icon` slot** — same pattern as `<orio-button>`.
- **Icon-only mode is auto-detected** (icon + no default slot) →
  `border-radius: 50%`, `aspect-ratio: 1`, `padding: var(--control-py)`.
- **No `variant` prop.** One look only — transparent background, text
  color, no border.
- **Always one `<a>`, never a `<button>`.** Without `href` it gets
  `role="button"`, `tabindex="0"` and native-button keys: Enter clicks on
  keydown, Space clicks once on keyup (held-Space repeats are swallowed, no
  page scroll). Both go through `element.click()`, so `click` emits.
- **`disabled`** sets `aria-disabled="true"`, drops the `href`, sets
  `tabindex="-1"` and blocks click; styled via `[aria-disabled="true"]`
  (0.5 opacity + `cursor: not-allowed`). No native `disabled` attribute.
- **Only emits `click`.** No mousedown/mouseup like `<orio-button>`.
- **`to` prop → link.** When set (and not `disabled`) the inner element is a
  plain `<a href>` (`utils/link.ts`), so crawlers, middle-click and "open in
  new tab" work. If a Vue router is installed, a plain left-click on an
  internal path calls `router.push` instead of reloading; modifier-clicks,
  external URLs, `tel:`/`mailto:` and `#hash` stay native. `active` still drives the class and
  `aria-current`; the component does not detect the current route itself.
  Enter on a link stays native (no `preventDefault`).
- **Focus ring**: `outline: 2px solid var(--color-accent)` with
  `outline-offset: 2px`. Keyboard-only via `:focus-visible`.

## Gotchas

- **Prefer `to` over `@click` + `router.push` for navigation.** A click
  handler gives no `href`, so prerender crawlers and SEO never see the
  route. Use `@click` only for non-navigation actions.
- **No Nuxt dependency.** Works in plain Vue/VitePress: without a router the
  anchor simply navigates.
- **Same `$attrs` duplication caveat as `<orio-button>`** — attrs may
  land on both the wrapper and the inner `<a>`.
- **Active state is purely visual + ARIA**; the component does not
  detect the current route. Compute `active` from `useRoute()` or your
  router state.
- **Never submits a form.** It is an anchor, so `type="submit"` does
  nothing. Use `<orio-button>` for form submission.
- **Font is inherited** from the parent (anchors don't get the UA button
  font).

## Quick reference

```vue
<!-- from docs/components/nav-button.md ("As a Link") -->
<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <nav>
    <orio-nav-button to="/menu" :active="route.path === '/menu'">Menu</orio-nav-button>
    <orio-nav-button to="/about" :active="route.path === '/about'">About</orio-nav-button>
  </nav>
</template>
```

## Related

- `<orio-button>` — primary actions; use that for CTAs.
- Public API reference: `docs/components/nav-button.md`.
