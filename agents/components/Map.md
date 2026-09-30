---
kind: component
category: Media & misc
purpose: map, location, coordinates, pin, marker, venue address, geo point
short: pannable/zoomable MapLibre map showing one point with a customizable pin; free OpenFreeMap tiles, themed to mode and accent
invariants: true
---

# Map — agent-only invariants

`<orio-map>` renders a MapLibre GL map with OpenFreeMap vector tiles and a
single pin at `coordinates`. No API key, no consumer setup.

## Invariants

- **`coordinates` is `{ latitude, longitude }`** (exported `MapCoordinates`
  from `Map.vue`). MapLibre's `[longitude, latitude]` order is converted
  internally — never pass an array.
- **Changing `coordinates` moves the pin and `flyTo`s the map.** The watch
  is on the two numbers, so passing a fresh object with the same values
  does nothing.
- **`zoom` is initial only.** Changing it after mount has no effect; the
  user owns zoom.
- **Client only, lazy.** `maplibre-gl` JS + CSS are `import()`ed in
  `onMounted`. SSR renders the empty container (surface background).
- **Auto style follows `data-mode` on `<html>`**: light → `positron`,
  dark → `dark`. Observed with a MutationObserver, so it works with
  `useTheme`, `<orio-mode-switcher>` or any code that sets the attribute.
- **Accent tint**: on every `style.load` and on `data-theme` change, water
  layers get 25% and major/motorway road layers 15% of `--color-accent`
  (logic in `useMapStyle` + `utils/map-tint.ts`). Only literal-colour
  paints are tinted; expression paints are skipped.
- **`mapStyle` disables both** auto style and tint — the URL is used
  verbatim.
- **Pin**: default is `<orio-icon :name="markerIcon">` coloured with
  `markerColor` (default `var(--color-accent)`), anchored at its bottom
  centre. `#marker` slot replaces it entirely and receives
  `{ coordinates }`; slot content stays reactive (Vue owns the element,
  MapLibre only positions it).
- **Interaction is always on**: wheel zoom, drag pan, pinch, double-click,
  keyboard. The wheel does not scroll the page while over the map.

## Gotchas

- **Height is `20rem` by default.** Override with a class or
  `style="height: …"` on `<orio-map>`; the map fills the root.
- **Custom `#marker` content is anchored at its bottom centre** — design
  pins whose tip is at the bottom edge.
- **Attribution control stays** — required by the OpenStreetMap licence.
- **Single point only.** No `points` array, popups, geocoding or routing.

## Quick reference

```vue
<!-- from docs/components/map.md -->
<template>
  <orio-map :coordinates="places.kyiv" />

  <orio-map
    :coordinates="places.paris"
    marker-icon="star"
    marker-color="var(--color-danger)"
  />

  <orio-map :coordinates="places.tokyo">
    <template #marker>
      <orio-tag variant="accent" text="Tokyo Tower" />
    </template>
  </orio-map>
</template>
```

## Related

- `useTheme` / `<orio-mode-switcher>` / `<orio-theme-switcher>` — drive the
  map's style and tint.
- `<orio-icon>` — default pin renderer.
- Public API reference: `docs/components/map.md`.
