import { defineCanvasTool } from "../types";
import type { CanvasNode, CanvasPoint, CanvasToolApi } from "../types";
import { findTopNode, renderHighlightRect } from "./hitTest";
import MoveTooltip from "./tooltips/Move.vue";

export interface MoveToolOptions extends Record<string, unknown> {
  /** Hit-test radius in CSS pixels. */
  radius: number;
}

export function moveTool(options: Partial<MoveToolOptions> = {}) {
  let activeNodeId: string | null = null;
  let hoveredNodeId: string | null = null;
  let lastX = 0;
  let lastY = 0;

  return defineCanvasTool<never, MoveToolOptions>({
    id: "move",
    label: "Move",
    icon: "move",
    cursor: "grab",
    tooltip: MoveTooltip,
    defaultOptions: {
      radius: 10,
      ...options,
    },
    onPointerDown(e, api) {
      const node = findTopNode(e, api, api.options.radius);
      if (!node) return;
      activeNodeId = node.id;
      hoveredNodeId = node.id;
      lastX = e.x;
      lastY = e.y;
    },
    onPointerMove(e, api) {
      if (activeNodeId && e.buttons !== 0) {
        const node = api.getNode(activeNodeId);
        if (!node) return;
        const dx = e.x - lastX;
        const dy = e.y - lastY;
        lastX = e.x;
        lastY = e.y;

        const patch: Partial<CanvasNode> = {
          x: node.x + dx,
          y: node.y + dy,
        };

        // For draw nodes, shift all points too.
        if (Array.isArray((node.data as Record<string, unknown>)?.points)) {
          const data = node.data as { points: CanvasPoint[] };
          patch.data = {
            ...node.data,
            points: data.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
          };
        }

        api.updateNode(activeNodeId, patch);
        return;
      }

      // Not dragging — update hover highlight.
      const node = findTopNode(e, api, api.options.radius);
      const newId = node?.id ?? null;
      if (newId !== hoveredNodeId) {
        hoveredNodeId = newId;
        api.requestRender();
      }
    },
    onPointerUp() {
      activeNodeId = null;
    },
    onDeactivate(api: CanvasToolApi<MoveToolOptions>) {
      if (hoveredNodeId) {
        hoveredNodeId = null;
        api.requestRender();
      }
    },
    onKeyDown(e, api) {
      const targetId = activeNodeId ?? hoveredNodeId;
      if (!targetId) return;
      if (e.key !== "[" && e.key !== "]") return;

      const node = api.getNode(targetId);
      if (!node) return;

      const nodes = api.nodes.value;
      const zIndices = nodes.map((n) => n.zIndex ?? 0);
      const currentZ = node.zIndex ?? 0;

      if (e.key === "]") {
        const maxZ = Math.max(...zIndices);
        if (currentZ < maxZ) {
          api.updateNode(targetId, { zIndex: maxZ + 1 });
        }
      } else {
        const minZ = Math.min(...zIndices);
        if (currentZ > minZ) {
          api.updateNode(targetId, { zIndex: minZ - 1 });
        }
      }
    },
    renderOverlay(ctx, api) {
      const id = activeNodeId ?? hoveredNodeId;
      if (!id) return;
      const node = api.getNode(id);
      if (!node) return;
      renderHighlightRect(ctx, node);
    },
  });
}
