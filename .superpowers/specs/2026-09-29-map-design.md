# Map — design

Date: 2026-09-29
Status: draft, awaiting review

## Goal

A map component that shows a single point from coordinates, with a
customizable pin (icon, colour, or fully custom slot content). The map is
pannable and zoomable (wheel, drag, pinch). Zero setup for consumers: no
API key, no registration, no extra install step.

The API must be able to grow into multiple points later without breaking.

## Provider research

| Option | Cost / limits | Customisation | Key |
|---|---|---|---|
| **MapLibre GL + OpenFreeMap** | free, no view/request limits | vector style JSON, runtime paint overrides | no |
| MapLibre + MapTiler | 5k sessions/month free, then paused | strong editor | yes |
| MapLibre + Stadia | 200k credits/month free | good presets | yes |
| Protomaps (PMTiles) | free, self-hosted | full | no (own infra) |
| Leaflet + OSM raster | free, OSM tile usage policy limits | none (raster) | no |

**Chosen: MapLibre GL JS + OpenFreeMap.** Available OpenFreeMap styles
(verified 200): `liberty`, `bright`, `positron`, `dark`, `fiord`.
Any MapLibre-compatible style URL can be passed via `mapStyle`, so switching
to MapTiler/Stadia/self-hosted later is a prop change.

## Public API

### Component: `<orio-map>`

File: `src/runtime/components/Map.vue`

```vue
<orio-map
  :coordinates="{ latitude: 50.45, longitude: 30.52 }"
  :zoom="14"
  marker-icon="map-pin"
  marker-color="var(--color-danger)"
>
  <template #marker="{ coordinates }">…any content…</template>
</orio-map>
```

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `coordinates` | `MapCoordinates` | required | on change: marker moves, map `flyTo` the point |
| `zoom` | `number` | `14` | initial zoom only; user owns zoom afterwards |
| `markerIcon` | `string` | `"map-pin"` | icon registry name |
| `markerColor` | `string` | `"var(--color-accent)"` | any CSS colour or token |
| `mapStyle` | `string` | `undefined` | style URL; when set, disables auto theming and accent tint |

### Slots

- `#marker` — replaces the whole pin. Slot props: `{ coordinates }`.

### Exported types

```ts
export interface MapCoordinates {
  latitude: number;
  longitude: number;
}
export interface MapProps { … }
```

Future growth: a `points: MapPoint[]` prop can be added next to
`coordinates`; `#marker` would then receive `{ point }`. Not built now.

### Sizing

`width: 100%`, `height: 20rem` by default; consumer overrides via CSS
(`height` on the root). Background `var(--color-surface)` while loading.

### Interaction

MapLibre defaults, all on: wheel zoom, drag pan, touch pinch/pan,
double-click zoom, keyboard (arrows, +/-). No cooperative gestures.
No zoom buttons.

## Internals

### Loading

- `maplibre-gl` added to `dependencies`.
- `import("maplibre-gl")` and `import("maplibre-gl/dist/maplibre-gl.css")`
  inside `onMounted` — code-split, client only. SSR renders only the
  container `<div>`.
- Import failure: `console.error` once; container stays blank with surface
  background.

### `useMapStyle` composable

File: `src/runtime/composables/useMapStyle.ts`

Responsibilities:

1. **Style URL** — computed from `useTheme().mode`:
   light → `https://tiles.openfreemap.org/styles/positron`,
   dark → `https://tiles.openfreemap.org/styles/dark`.
   If `mapStyle` is set, returns it verbatim.
2. **Accent tint** — after every `style.load`, when `mapStyle` is not set:
   - resolve `--color-accent` by setting it as `color` on a hidden probe
     element and reading `getComputedStyle(probe).color` → `rgb(...)`
     (handles `hsl(258 85% 62%)` space syntax that MapLibre's parser may
     not accept);
   - read each target layer's current paint colour, mix in the accent
     in JS (linear RGB lerp), `setPaintProperty`:
     - water / waterway fill & line colours — 25% accent;
     - major road line colours — 15% accent;
   - layers missing from the style are skipped silently (style-agnostic).
     Target layer ids are resolved at runtime by prefix matching
     (`water`, `waterway`, `highway_major`, `highway_motorway`, …), confirmed
     against the positron and dark style JSON during implementation.
   - only literal colour values are mixed; expression-valued paints are
     skipped.
3. Exposes a callback-style API (per composable-encapsulation convention):
   `attach(map)` wires `style.load` + theme watchers; the component does not
   touch style internals.

### Reactivity

| Change | Effect |
|---|---|
| `coordinates` | `marker.setLngLat` + `map.flyTo({ center })` |
| mode | `map.setStyle(nextUrl)`; tint re-applied on `style.load` |
| theme (accent) | tint re-applied without style reload |
| `mapStyle` | `map.setStyle(mapStyle ?? autoUrl)` |
| unmount | `map.remove()` |

MapLibre expects `[longitude, latitude]` — conversion lives in one helper.

### Marker

Vue renders the pin inside a ref'd element in the component template
(`#marker` slot, or `<orio-icon :name="markerIcon">` coloured with
`markerColor`). That element is passed to
`new Marker({ element, anchor: "bottom" })`, so slot content stays reactive.

### Accessibility & i18n

Root gets `role="region"` and `aria-label` from vue-i18n key `map.label`
(en: "Map", uk: "Мапа"). MapLibre's attribution control stays (required by
OpenFreeMap / OSM licence).

## Testing

Vitest, `maplibre-gl` mocked (jsdom has no WebGL):

- initialises with `center` `[longitude, latitude]`, `zoom`, auto style URL;
- creates marker at coordinates with the ref'd element;
- `coordinates` change → `setLngLat` + `flyTo`;
- mode change → `setStyle` with the other URL;
- custom `mapStyle` → used verbatim, no `setPaintProperty` calls;
- tint: `setPaintProperty` called for present water/road layers only,
  mixed colour correct;
- `#marker` slot content rendered inside marker element;
- unmount → `remove`.

## Docs

- `docs/components/map.md` — live demo (source of truth for examples).
- `agents/components/Map.md` — agent doc with frontmatter; regenerate
  routing via `scripts/generate-routing.mjs`.
- vue-i18n keys in `en.json` / `uk.json`.

## Out of scope

Multiple points, popups, geocoding/search, routing, zoom buttons,
cooperative gestures, draggable marker.
