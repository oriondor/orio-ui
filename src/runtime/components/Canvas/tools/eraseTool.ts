import { defineCanvasTool } from "../types";
import type { CanvasPoint, CanvasToolApi } from "../types";
import { findTopNode, renderHighlightRect } from "./hitTest";
import EraseTooltip from "./tooltips/Erase.vue";

export interface EraseToolOptions extends Record<string, unknown> {
  /** Eraser radius in CSS pixels. */
  radius: number;
}

export function eraseTool(options: Partial<EraseToolOptions> = {}) {
  let erasing = false;
  let hoveredNodeId: string | null = null;

  function eraseAt(point: CanvasPoint, api: CanvasToolApi<EraseToolOptions>) {
    const node = findTopNode(point, api, api.options.radius);
    if (node) {
      hoveredNodeId = null;
      api.removeNode(node.id);
    }
  }

  return defineCanvasTool<never, EraseToolOptions>({
    id: "erase",
    label: "Eraser",
    icon: "eraser",
    cursor: "crosshair",
    tooltip: EraseTooltip,
    defaultOptions: {
      radius: 10,
      ...options,
    },
    onPointerDown(e, api) {
      erasing = true;
      eraseAt(e, api);
    },
    onPointerMove(e, api) {
      if (erasing && e.buttons !== 0) {
        eraseAt(e, api);
        return;
      }

      // Not erasing — update hover highlight.
      const node = findTopNode(e, api, api.options.radius);
      const newId = node?.id ?? null;
      if (newId !== hoveredNodeId) {
        hoveredNodeId = newId;
        api.requestRender();
      }
    },
    onPointerUp() {
      erasing = false;
    },
    onDeactivate(api: CanvasToolApi<EraseToolOptions>) {
      if (hoveredNodeId) {
        hoveredNodeId = null;
        api.requestRender();
      }
    },
    renderOverlay(ctx, api) {
      if (!hoveredNodeId) return;
      const node = api.getNode(hoveredNodeId);
      if (!node) {
        hoveredNodeId = null;
        return;
      }
      renderHighlightRect(ctx, node, {
        strokeColor: "rgba(220, 53, 69, 0.8)",
        fillColor: "rgba(220, 53, 69, 0.08)",
      });
    },
  });
}
