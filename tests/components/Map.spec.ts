import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { nextTick } from "vue";
import { i18n } from "../../src/runtime/i18n";
import OrioMap from "../../src/runtime/components/Map.vue";
import { MAP_STYLE_URLS } from "../../src/runtime/composables/useMapStyle";

const maplibreMock = vi.hoisted(() => {
  const instances: { map?: any; marker?: any } = {};

  const layers = [
    {
      id: "water",
      type: "fill",
      paint: { "fill-color": "rgb(100, 100, 100)" },
    },
    {
      id: "highway_major_inner",
      type: "line",
      paint: { "line-color": "rgb(200, 200, 200)" },
    },
    {
      id: "highway_motorway_inner",
      type: "line",
      paint: { "line-color": ["interpolate", ["linear"], ["zoom"], 5, "#000"] },
    },
    { id: "building", type: "fill", paint: { "fill-color": "rgb(0, 0, 0)" } },
  ];

  class MockMap {
    options: any;
    handlers: Record<string, (() => void)[]> = {};
    setStyle = vi.fn();
    flyTo = vi.fn();
    remove = vi.fn();
    setPaintProperty = vi.fn();
    constructor(options: any) {
      this.options = options;
      instances.map = this;
    }
    on(event: string, handler: () => void) {
      (this.handlers[event] ??= []).push(handler);
      return this;
    }
    emit(event: string) {
      this.handlers[event]?.forEach((handler) => handler());
    }
    getStyle() {
      return { layers };
    }
    getLayer(layerId: string) {
      return layers.find((layer) => layer.id === layerId);
    }
    getPaintProperty(layerId: string, property: string) {
      return (this.getLayer(layerId)?.paint as any)?.[property];
    }
  }

  class MockMarker {
    options: any;
    setLngLat = vi.fn(() => this);
    addTo = vi.fn(() => this);
    constructor(options: any) {
      this.options = options;
      instances.marker = this;
    }
  }

  return { instances, MockMap, MockMarker };
});

vi.mock("maplibre-gl", () => ({
  Map: maplibreMock.MockMap,
  Marker: maplibreMock.MockMarker,
}));
vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));

const coordinates = { latitude: 50.45, longitude: 30.52 };

async function mountMap(options: Record<string, any> = {}) {
  const wrapper = mount(OrioMap, {
    props: { coordinates, ...options.props },
    slots: options.slots,
    global: { plugins: [i18n] },
    attachTo: document.body,
  });
  // First mount waits on the real dynamic import of the mocked module
  await vi.waitFor(() => expect(maplibreMock.instances.map).toBeDefined());
  return wrapper;
}

describe("Map", () => {
  beforeEach(() => {
    maplibreMock.instances.map = undefined;
    maplibreMock.instances.marker = undefined;
    document.documentElement.setAttribute("data-mode", "dark");
    document.documentElement.setAttribute("data-theme", "violet");
    // jsdom does not resolve var() in computed styles, so stand in for the accent
    const realGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation((element) =>
      (element as HTMLElement).style.color === "var(--color-accent)"
        ? ({ color: "rgb(255, 0, 0)" } as CSSStyleDeclaration)
        : realGetComputedStyle(element),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("initialises with center, zoom and the auto style for the mode", async () => {
    const wrapper = await mountMap({ props: { zoom: 10 } });
    const { map } = maplibreMock.instances;

    expect(map.options.center).toEqual([30.52, 50.45]);
    expect(map.options.zoom).toBe(10);
    expect(map.options.style).toBe(MAP_STYLE_URLS.dark);
    expect(wrapper.attributes("role")).toBe("region");
    expect(wrapper.attributes("aria-label")).toBe("Map");
  });

  it("places the marker element at the coordinates", async () => {
    await mountMap();
    const { map, marker } = maplibreMock.instances;

    expect(marker.options.anchor).toBe("bottom");
    expect(marker.options.element.classList).toContain("map-marker");
    expect(marker.setLngLat).toHaveBeenCalledWith([30.52, 50.45]);
    expect(marker.addTo).toHaveBeenCalledWith(map);
  });

  it("moves the marker and flies to new coordinates", async () => {
    const wrapper = await mountMap();
    const { map, marker } = maplibreMock.instances;

    await wrapper.setProps({
      coordinates: { latitude: 48.85, longitude: 2.35 },
    });

    expect(marker.setLngLat).toHaveBeenLastCalledWith([2.35, 48.85]);
    expect(map.flyTo).toHaveBeenCalledWith({ center: [2.35, 48.85] });
  });

  it("swaps the style when the mode changes", async () => {
    await mountMap();
    const { map } = maplibreMock.instances;

    document.documentElement.setAttribute("data-mode", "light");
    await flushPromises();
    await nextTick();

    expect(map.setStyle).toHaveBeenCalledWith(MAP_STYLE_URLS.light, {
      diff: false,
    });
  });

  it("tints only literal-colour water and road layers with the accent", async () => {
    await mountMap();
    const { map } = maplibreMock.instances;

    map.emit("style.load");

    expect(map.setPaintProperty).toHaveBeenCalledTimes(2);
    // water: 25% towards red
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      "water",
      "fill-color",
      "rgba(139, 75, 75, 1)",
    );
    // major road: 15% towards red
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      "highway_major_inner",
      "line-color",
      "rgba(208, 170, 170, 1)",
    );
  });

  it("uses a custom mapStyle verbatim and skips the tint", async () => {
    await mountMap({ props: { mapStyle: "https://example.com/style.json" } });
    const { map } = maplibreMock.instances;

    map.emit("style.load");

    expect(map.options.style).toBe("https://example.com/style.json");
    expect(map.setPaintProperty).not.toHaveBeenCalled();
  });

  it("renders the default icon with the marker colour", async () => {
    const wrapper = await mountMap({
      props: { markerIcon: "star", markerColor: "rgb(0, 128, 0)" },
    });
    const icon = wrapper.find(".map-marker-icon");

    expect(icon.exists()).toBe(true);
    expect(icon.attributes("style")).toContain("color: rgb(0, 128, 0)");
  });

  it("renders the #marker slot inside the marker element", async () => {
    await mountMap({
      slots: {
        marker: `<template #marker="{ coordinates }">
          <span class="custom-pin">{{ coordinates.latitude }}</span>
        </template>`,
      },
    });
    const { marker } = maplibreMock.instances;
    const customPin = marker.options.element.querySelector(".custom-pin");

    expect(customPin?.textContent).toBe("50.45");
  });

  it("removes the map on unmount", async () => {
    const wrapper = await mountMap();
    const { map } = maplibreMock.instances;

    wrapper.unmount();

    expect(map.remove).toHaveBeenCalled();
  });
});
