import { shallowReactive } from "vue";
import type { CanvasContext } from "./context";

export const canvasRegistry = shallowReactive(new Map<string, CanvasContext>());
