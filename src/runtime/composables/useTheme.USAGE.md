---
kind: composable
category: Composables
purpose: theme tokens, light/dark, theme switcher, color theme
short: cookie-backed theme and mode (light/dark) accessor that writes `data-theme` and `data-mode` on `<html>`
invariants: true
---

# useTheme — agent-only invariants

Returns `{ theme, setTheme, mode, setMode }`. State lives in cookies
(`COOKIE_NAMES.theme`, `COOKIE_NAMES.mode`) and is mirrored to
`data-theme` / `data-mode` attributes on the document element so CSS
selectors like `[data-theme="dark"]` work.

## Invariants

- **Backed by `useCookies` from `@vueuse/integrations`.** Cookies are
  set at path `/`. SSR-friendly because `useCookies` reads request
  cookies during render.
- **Defaults come from `constants/theme.ts`** — `THEME_DEFAULTS.theme`
  and `THEME_DEFAULTS.mode`. Override the defaults there, not at the
  call site.
- **`theme` and `mode` are computed refs** with `get` / `set`. Writing
  to them updates the cookie immediately. The `data-*` attributes on
  `<html>` only refresh when you call `setTheme` / `setMode`, not on
  raw assignment.
- **`onMounted(setHtmlAttrs)`** runs once per call site to apply
  cookies to the document on the client.
- **SSR-safe**: `setHtmlAttrs` early-returns when `document` is
  undefined.

## Gotchas

- **Raw `theme.value = "dark"` writes the cookie but doesn't touch
  `<html>` attrs.** Always go through `setTheme` / `setMode` if you
  need the DOM to update in the same call.
- **Multiple `useTheme()` consumers don't share an in-memory state** —
  the cookie is the source of truth. Reactivity across components
  requires reading the same cookie via `useCookies` again.
- **Cookies are set at `path: "/"`.** If your app lives under a
  sub-path, this still works but cookies are global to the domain. For
  finer scoping, fork the composable.
- **No system / OS preference detection.** No `prefers-color-scheme`
  fallback. Wire that in the consumer if needed.
- **`onMounted` per call** means N components → N attribute writes per
  navigation. Cheap, but not idempotent at a single point.

## Quick reference

```ts
import { useTheme } from "../composables/useTheme";

const { theme, setTheme, mode, setMode } = useTheme();

// Switch theme
setTheme("ocean");
setMode("dark");

// Read current
console.log(theme.value, mode.value);
```

```vue
<template>
  <orio-button @click="setMode(mode === 'dark' ? 'light' : 'dark')">
    {{ mode === "dark" ? "☀" : "🌙" }}
  </orio-button>
</template>
```

## Related

- `<orio-locale-switcher>` — sibling switch for vue-i18n locale.
- `constants/theme.ts` — defaults and cookie names live here.
- Public API reference: `docs/composables/use-theme.md`.
