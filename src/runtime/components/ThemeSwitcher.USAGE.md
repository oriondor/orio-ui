---
kind: component
category: Media & misc
purpose: theme switcher, accent picker, brand color toggle
short: preconfigured Selector that mutates useTheme's accent theme; defaults to the five bundled themes
invariants: true
---

# ThemeSwitcher — agent-only invariants

`<orio-theme-switcher>` is a thin wrapper over `<orio-selector>` that reads
and writes `useTheme().theme`. Drop it into a toolbar to give users an accent
picker; pair with `<orio-mode-switcher>` for light/dark.

## Invariants

- **Mutates `useTheme().theme` on selection** via `setTheme`, which also
  rewrites `data-theme` on `<html>`. No model is exposed — the side effect
  is the API. There is no `update:modelValue` to listen to.
- **Options are plain strings.** `themes` defaults to `[...THEMES]` =
  `["navy", "teal", "forest", "wine", "royal"]`. Pass the prop to ship a
  different set (e.g. add `"normal"` / `"inverse"` or your own accents) —
  the value is written to the cookie verbatim, so it must match a theme
  your CSS defines.
- **No i18n.** Theme names render raw, unlike `<orio-mode-switcher>` which
  translates its labels. Wrap the Selector yourself if you need localized
  or prettified names.
- **Persists to the `orio-theme` cookie** (path `/`) through `useTheme`, so
  the choice survives reloads and SSR's first paint.
- **No label / ControlProps passthrough.** The component renders a bare
  Selector; `label`, `error`, `size` are not forwarded.

## Gotchas

- **An unknown stored theme is shown as-is.** Unlike ModeSwitcher, no
  normalization happens: a cookie holding `banana` leaves the trigger
  showing `banana` and `data-theme="banana"` until the user picks again.
  Validate the cookie yourself if untrusted writers touch it.
- **Requires a `useTheme` context** (`@vueuse/integrations/useCookies`
  under the hood) — it will not work in a bare `mount()` without cookies
  available. Tests should stub `orio-selector` and reset the cookie
  between cases.

## Quick reference

```vue
<template>
  <orio-theme-switcher />

  <!-- custom accent set -->
  <orio-theme-switcher :themes="['navy', 'inverse', 'sunset']" />
</template>
```

## Related

- `<orio-mode-switcher>` — the light/dark counterpart.
- `useTheme` — the composable both wrap; use it directly for custom UI.
- `THEMES` / `MODES` — exported constants for building your own pickers.
- Public API reference: `docs/components/theme-switcher.md`.
