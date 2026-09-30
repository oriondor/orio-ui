import {
  computed,
  ref,
  shallowRef,
  watch,
  toValue,
  type MaybeRefOrGetter,
} from "vue";
import { useMutationObserver } from "@vueuse/core";
import type { Map as MapLibreMap } from "maplibre-gl";
import { THEME_DEFAULTS } from "../constants/theme";
import {
  PAINT_COLOR_PROPERTY,
  mixColors,
  resolveCssColor,
  tintWeightFor,
} from "../utils/map-tint";

export const MAP_STYLE_URLS = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
} as const;

function readRootAttribute(name: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  return document.documentElement.getAttribute(name) || fallback;
}

/**
 * Picks the OpenFreeMap style for the current light/dark mode and tints
 * water and major roads with the accent colour. A custom style URL turns
 * both off.
 */
export function useMapStyle(customStyle: MaybeRefOrGetter<string | undefined>) {
  const mode = ref(readRootAttribute("data-mode", THEME_DEFAULTS.mode));
  const theme = ref(readRootAttribute("data-theme", THEME_DEFAULTS.theme));

  if (typeof document !== "undefined") {
    useMutationObserver(
      document.documentElement,
      () => {
        mode.value = readRootAttribute("data-mode", THEME_DEFAULTS.mode);
        theme.value = readRootAttribute("data-theme", THEME_DEFAULTS.theme);
      },
      { attributes: true, attributeFilter: ["data-mode", "data-theme"] },
    );
  }

  const isAutoStyle = computed(() => !toValue(customStyle));

  const styleUrl = computed(
    () =>
      toValue(customStyle) ??
      (mode.value === "light" ? MAP_STYLE_URLS.light : MAP_STYLE_URLS.dark),
  );

  const attachedMap = shallowRef<MapLibreMap>();
  // Untinted paint colours of the loaded style, so re-tints never compound
  const originalColors = new Map<string, string>();

  function captureOriginalColors(map: MapLibreMap) {
    originalColors.clear();
    map.getStyle().layers.forEach((layer) => {
      const property = PAINT_COLOR_PROPERTY[layer.type];
      if (!property || tintWeightFor(layer.id) === undefined) return;
      const color = map.getPaintProperty(layer.id, property);
      // Expressions (zoom interpolations etc.) are left alone
      if (typeof color === "string") originalColors.set(layer.id, color);
    });
  }

  function applyTint() {
    const map = attachedMap.value;
    if (!map || !isAutoStyle.value) return;
    const accent = resolveCssColor("var(--color-accent)");
    if (!accent) return;
    originalColors.forEach((color, layerId) => {
      const base = resolveCssColor(color);
      const weight = tintWeightFor(layerId);
      const layerType = map.getLayer(layerId)?.type;
      const property = layerType && PAINT_COLOR_PROPERTY[layerType];
      if (!base || weight === undefined || !property) return;
      map.setPaintProperty(layerId, property, mixColors(base, accent, weight));
    });
  }

  watch(styleUrl, (url) => attachedMap.value?.setStyle(url, { diff: false }));
  watch(theme, applyTint);

  /** Hands the created map over; the composable owns its styling from here. */
  function attach(map: MapLibreMap) {
    attachedMap.value = map;
    map.on("style.load", () => {
      captureOriginalColors(map);
      applyTint();
    });
  }

  return { styleUrl, attach };
}
