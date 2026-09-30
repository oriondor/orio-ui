<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { useMapStyle } from "../composables/useMapStyle";

export interface MapCoordinates {
  latitude: number;
  longitude: number;
}

export interface MapProps {
  coordinates: MapCoordinates;
  zoom?: number;
  markerIcon?: string;
  markerColor?: string;
  mapStyle?: string;
}

const props = withDefaults(defineProps<MapProps>(), {
  zoom: 14,
  markerIcon: "map-pin",
  markerColor: "var(--color-accent)",
  mapStyle: undefined,
});

defineSlots<{
  marker?: (props: { coordinates: MapCoordinates }) => unknown;
}>();

const { t } = useI18n();
const { styleUrl, attach } = useMapStyle(() => props.mapStyle);

const container = ref<HTMLElement>();
const markerElement = ref<HTMLElement>();
const map = shallowRef<MapLibreMap>();
const marker = shallowRef<Marker>();
let isUnmounted = false;

// MapLibre takes [longitude, latitude]
function toLngLat({ latitude, longitude }: MapCoordinates): [number, number] {
  return [longitude, latitude];
}

onMounted(async () => {
  try {
    const [maplibre] = await Promise.all([
      import("maplibre-gl"),
      import("maplibre-gl/dist/maplibre-gl.css"),
    ]);
    if (isUnmounted || !container.value || !markerElement.value) return;

    const center = toLngLat(props.coordinates);
    map.value = new maplibre.Map({
      container: container.value,
      style: styleUrl.value,
      center,
      zoom: props.zoom,
    });
    attach(map.value);
    marker.value = new maplibre.Marker({
      element: markerElement.value,
      anchor: "bottom",
    })
      .setLngLat(center)
      .addTo(map.value);
  } catch (error) {
    console.error("[orio-map] failed to load maplibre-gl", error);
  }
});

watch(
  () => [props.coordinates.latitude, props.coordinates.longitude],
  () => {
    const center = toLngLat(props.coordinates);
    marker.value?.setLngLat(center);
    map.value?.flyTo({ center });
  },
);

onBeforeUnmount(() => {
  isUnmounted = true;
  map.value?.remove();
});
</script>

<template>
  <div class="orio-map" role="region" :aria-label="t('map.label')">
    <div ref="container" class="map-canvas" />
    <div class="marker-holder">
      <div ref="markerElement" class="map-marker">
        <slot name="marker" :coordinates>
          <orio-icon
            :name="markerIcon"
            class="map-marker-icon"
            :style="{ color: markerColor }"
          />
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orio-map {
  position: relative;
  width: 100%;
  height: 20rem;
  overflow: hidden;
  border-radius: var(--border-radius-md);
  background: var(--color-surface);
}

.map-canvas {
  position: absolute;
  inset: 0;
}

/* Holds the marker until MapLibre moves it onto the map */
.marker-holder {
  display: none;
}

.map-marker {
  display: flex;
  cursor: default;
}

.map-marker-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 3px rgb(0 0 0 / 0.35));
}
</style>
