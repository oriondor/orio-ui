# ThemeSwitcher

Preconfigured [`Selector`](./selector.md) that reads and writes the active accent theme through [`useTheme`](../composables/use-theme.md). Selecting an option mutates `data-theme` on `<html>` and persists to the `orio-theme` cookie — no model to wire up.

## Live Demo

Pick a theme — the accent color of this page updates live.

<div class="demo-container">
  <orio-theme-switcher />
</div>

## Usage

```vue
<template>
  <orio-theme-switcher />
</template>
```

By default it lists every theme in the exported `THEMES` constant (`navy`, `teal`, `forest`, `wine`, `royal`). Pass `themes` to restrict or extend the list — the strings are used verbatim as `data-theme` values, so any theme you register in CSS is valid:

```vue
<template>
  <orio-theme-switcher :themes="['navy', 'teal', 'brand']" />
</template>
```

See [Theming](../theming.md) for how to define custom `data-theme` accents.

## Props

| Prop     | Type       | Default              | Description                                    |
| -------- | ---------- | -------------------- | ---------------------------------------------- |
| `themes` | `string[]` | `[...THEMES]`        | Theme names to offer; used as `data-theme` values |

## Behavior

- **Mutates `useTheme().theme` on selection.** The side effect is the API — there is no `v-model`.
- Persists to the `orio-theme` cookie for SSR-safe first paint.
- Requires a `useTheme` context (available anywhere inside an Orio UI app).

## Related

- [`ModeSwitcher`](./mode-switcher.md) — the light/dark counterpart.
- [`useTheme`](../composables/use-theme.md) — the underlying accessor.
- [`Selector`](./selector.md) — the component under the hood.
