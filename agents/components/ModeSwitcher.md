---
kind: component
category: Media & misc
purpose: dark mode toggle, light dark switcher, color scheme picker
short: preconfigured Selector that mutates useTheme's light/dark mode with translated labels
invariants: true
---

# ModeSwitcher — agent-only invariants

`<orio-mode-switcher>` is a thin wrapper over `<orio-selector>` that reads
and writes `useTheme().mode`. Pair with `<orio-theme-switcher>` for the
accent theme.

## Invariants

- **Mutates `useTheme().mode` on selection** via `setMode`, which also
  rewrites `data-mode` on `<html>`. No model is exposed — the side effect
  is the API.
- **No props.** The option list is fixed to the exported `MODES` constant
  (`["light", "dark"]`); there is no way to extend or reorder it.
- **Labels come from i18n** — keys `modeSwitcher.light` / `modeSwitcher.dark`.
  Override those messages to relabel; the `code` values stay `light`/`dark`.
- **`ModeOption` shape** (exported): `{ code: string; label: string }`.
- **Selector wiring**: `field: "code"`, `optionName: "label"`.
- **Selected option falls back** to `THEME_DEFAULTS.mode` (`dark`), then the
  first option, when the stored mode is not in `MODES`.
- **An invalid stored mode is normalized on mount** — the fallback is
  written back through `setMode`, so the trigger, the `orio-mode` cookie and
  `data-mode` always agree. Nothing runs on mount when the mode is valid.
- **Persists to the `orio-mode` cookie** (path `/`) for an SSR-safe first
  paint.

## Gotchas

- **Requires both a `useTheme` and a vue-i18n context.** Missing i18n
  throws; missing cookies makes it a no-op picker.
- **Mount-time normalization is a cookie write.** In tests, clear
  `orio-mode` between cases or a bogus value from one case leaks into the
  next. `useTheme`'s own `onMounted(setHtmlAttrs)` runs first, so
  `data-mode` briefly holds the bogus value within the same tick.
- **Not a switch.** It renders a Selector (listbox in a popover), not a
  toggle — build your own from `useTheme` if you want a two-state button.

## Quick reference

```vue
<template>
  <orio-mode-switcher />
</template>
```

## Related

- `<orio-theme-switcher>` — the accent-theme counterpart.
- `useTheme` — the composable both wrap.
- Public API reference: `docs/components/mode-switcher.md`.
