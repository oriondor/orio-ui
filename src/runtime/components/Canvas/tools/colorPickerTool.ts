import { defineCanvasTool } from "../types";
import ColorPickerWidget from "./ColorPickerWidget.vue";

export interface ColorPickerToolOptions extends Record<string, unknown> {
  color: string;
  /** Tool ids whose `color` option should be synced. */
  targets: string[];
}

export function colorPickerTool(options: Partial<ColorPickerToolOptions> = {}) {
  return defineCanvasTool<never, ColorPickerToolOptions>({
    id: "color-picker",
    label: "Color",
    kind: "widget",
    toolbar: ColorPickerWidget,
    defaultOptions: {
      color: "#111111",
      targets: [],
      ...options,
    },
  });
}
