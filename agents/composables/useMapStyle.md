---
kind: composable
category: Composables
purpose: map style, map theming, dark mode map, accent-tinted map, maplibre style url
short: picks the OpenFreeMap style for light/dark mode and tints water/roads with the accent on an attached MapLibre map
invariants: true
---

# useMapStyle — agent-only invariants

Styling brain of `<orio-map>`. Use `<orio-map>` instead of calling this
directly unless you create your own MapLibre map.

## Invariants

- **Signature**: `useMapStyle(customStyle: MaybeRefOrGetter<string | undefined>)`
  → `{ styleUrl, attach }`.
- **`styleUrl`** is `customStyle` when set, otherwise
  `MAP_STYLE_URLS.light` (`positron`) or `MAP_STYLE_URLS.dark` (`dark`)
  from `data-mode` on `<html>`.
- **`attach(map)`** hands over a created MapLibre map. From then on the
  composable calls `map.setStyle(url, { diff: false })` when `styleUrl`
  changes and re-tints on every `style.load` and `data-theme` change.
  Watchers live in the calling component's setup scope, so call
  `useMapStyle` synchronously in setup and `attach` later (e.g. after an
  async import).
- **Tint rules** (`utils/map-tint.ts` `TINT_RULES`): layer ids matching
  `^water` → 25% accent, `^highway_(major|motorway)_(inner|subtle)$` → 15%.
  Mixes from the style's original colours, so repeated tints never
  compound. Expression-valued paints are skipped.
- **A custom style disables the tint.**

## Gotchas

- **Colours resolve through a hidden probe element** (`getComputedStyle`),
  so `--color-accent` in any CSS syntax works — but only in a real
  browser. jsdom does not resolve `var()`; tests stub `getComputedStyle`.

## Quick reference

```ts
// from src/runtime/components/Map.vue
const { styleUrl, attach } = useMapStyle(() => props.mapStyle);

onMounted(async () => {
  const maplibre = await import("maplibre-gl");
  const map = new maplibre.Map({ container, style: styleUrl.value });
  attach(map);
});
```
