# ModeSwitcher

Preconfigured [`Selector`](./selector.md) that toggles the light/dark color mode through [`useTheme`](../composables/use-theme.md). Selecting an option mutates `data-mode` on `<html>` and persists to the `orio-mode` cookie. Option labels come from vue-i18n (`modeSwitcher.light` / `modeSwitcher.dark`), so they follow the active locale.

## Live Demo

<div class="demo-container">
  <orio-mode-switcher />
</div>

## Usage

```vue
<template>
  <orio-mode-switcher />
</template>
```

Modes are fixed to the exported `MODES` constant (`light`, `dark`). To customize the visible labels, override the `modeSwitcher.light` / `modeSwitcher.dark` keys in your i18n messages.

## Behavior

- **Mutates `useTheme().mode` on selection.** The side effect is the API — there is no `v-model`.
- Falls back to the default mode (`dark`), then the first option, if the current mode is not in the list.
- Normalizes an invalid stored mode on mount — the fallback is written back, so the trigger, the cookie and `data-mode` stay in sync.
- Persists to the `orio-mode` cookie for SSR-safe first paint.
- Requires both a `useTheme` context and a vue-i18n context.

## Types

```typescript
interface ModeOption {
  code: string; // "light" | "dark"
  label: string; // localized display label
}
```

## Related

- [`ThemeSwitcher`](./theme-switcher.md) — the accent-theme counterpart.
- [`useTheme`](../composables/use-theme.md) — the underlying accessor.
- [Theming](../theming.md) — how modes map to CSS variables.
