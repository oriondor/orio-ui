import { defineCanvasTool } from "../types";
import type { CanvasToolApi } from "../types";
import { findTopNode, renderHighlightRect } from "./hitTest";
import HighlightTooltip from "./tooltips/Highlight.vue";

export interface HighlightToolOptions extends Record<string, unknown> {
  /** Hit-test radius in CSS pixels. */
  radius: number;
  /** Highlight stroke color. */
  strokeColor: string;
  /** Highlight fill color (transparent). */
  fillColor: string;
  /** Highlight stroke width. */
  lineWidth: number;
}

export function highlightTool(options: Partial<HighlightToolOptions> = {}) {
  let highlightedNodeId: string | null = null;

  return defineCanvasTool<never, HighlightToolOptions>({
    id: "highlight",
    label: "Highlight",
    icon: "highlight",
    cursor: "default",
    tooltip: HighlightTooltip,
    defaultOptions: {
      radius: 10,
      strokeColor: "rgba(31, 122, 236, 0.8)",
      fillColor: "rgba(31, 122, 236, 0.08)",
      lineWidth: 2,
      ...options,
    },
    onPointerMove(e, api) {
      const node = findTopNode(e, api, api.options.radius);
      const newId = node?.id ?? null;
      if (newId !== highlightedNodeId) {
        highlightedNodeId = newId;
        api.requestRender();
      }
    },
    onPointerDown(e, api) {
      const node = findTopNode(e, api, api.options.radius);
      highlightedNodeId = node?.id ?? null;
    },
    onDeactivate(api: CanvasToolApi<HighlightToolOptions>) {
      if (highlightedNodeId) {
        highlightedNodeId = null;
        api.requestRender();
      }
    },
    renderOverlay(ctx, api) {
      if (!highlightedNodeId) return;
      const node = api.getNode(highlightedNodeId);
      if (!node) {
        highlightedNodeId = null;
        return;
      }
      renderHighlightRect(ctx, node, {
        strokeColor: api.options.strokeColor,
        fillColor: api.options.fillColor,
        lineWidth: api.options.lineWidth,
      });
    },
  });
}
