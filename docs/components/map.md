# Map

Pannable, zoomable map that shows a single point. Tiles come from
[OpenFreeMap](https://openfreemap.org) — free, no API key, no setup. The map
follows light/dark mode and tints water and major roads with the current
accent colour.

## Live Demo

<script setup>
import { ref } from 'vue'

const places = {
  kyiv: { latitude: 50.4501, longitude: 30.5234 },
  paris: { latitude: 48.8584, longitude: 2.2945 },
  tokyo: { latitude: 35.6586, longitude: 139.7454 },
}
const place = ref('kyiv')
</script>

<div class="demo-container">
  <orio-map :coordinates="places.kyiv" />
</div>

### Moving the point

<div class="demo-container">
  <div class="demo-row">
    <orio-button variant="secondary" @click="place = 'kyiv'">Kyiv</orio-button>
    <orio-button variant="secondary" @click="place = 'paris'">Paris</orio-button>
    <orio-button variant="secondary" @click="place = 'tokyo'">Tokyo</orio-button>
  </div>
  <orio-map :coordinates="places[place]" :zoom="12" />
</div>

### Custom pin

<div class="demo-container">
  <orio-map
    :coordinates="places.paris"
    marker-icon="star"
    marker-color="var(--color-danger)"
  />
</div>

<div class="demo-container">
  <orio-map :coordinates="places.tokyo">
    <template #marker>
      <orio-tag variant="accent" text="Tokyo Tower" />
    </template>
  </orio-map>
</div>

## Usage

```vue
<script setup>
import { ref } from "vue";

const places = {
  kyiv: { latitude: 50.4501, longitude: 30.5234 },
  paris: { latitude: 48.8584, longitude: 2.2945 },
  tokyo: { latitude: 35.6586, longitude: 139.7454 },
};
const place = ref("kyiv");
</script>

<template>
  <orio-map :coordinates="places.kyiv" />

  <orio-button variant="secondary" @click="place = 'paris'">Paris</orio-button>
  <orio-map :coordinates="places[place]" :zoom="12" />

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

## Props

| Prop          | Type             | Default                 | Description                                                                               |
| ------------- | ---------------- | ----------------------- | ----------------------------------------------------------------------------------------- |
| `coordinates` | `MapCoordinates` | -                       | `{ latitude, longitude }` of the point. Changing it moves the pin and flies the map there |
| `zoom`        | `number`         | `14`                    | Initial zoom level; the user controls zoom afterwards                                     |
| `markerIcon`  | `string`         | `'map-pin'`             | Icon name for the default pin                                                             |
| `markerColor` | `string`         | `'var(--color-accent)'` | Any CSS colour or token for the default pin                                               |
| `mapStyle`    | `string`         | auto                    | MapLibre style URL. Disables automatic light/dark style and accent tint                   |

## Slots

| Slot     | Props             | Description                    |
| -------- | ----------------- | ------------------------------ |
| `marker` | `{ coordinates }` | Replaces the whole pin element |

## Sizing

The map is `100%` wide and `20rem` tall. Override with a class or
`style="height: 30rem"` on the component.

## Other tile providers

`mapStyle` accepts any MapLibre-compatible style URL, e.g. other OpenFreeMap
styles (`https://tiles.openfreemap.org/styles/liberty`, `bright`, `fiord`),
MapTiler, Stadia Maps, or a self-hosted style.
