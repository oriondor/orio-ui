import { defineCanvasTool } from "../types";
import type { CanvasNode, CanvasToolApi } from "../types";
import {
  findTopNode,
  getNodeBounds,
  renderHighlightRect,
  toLocalPoint,
} from "./hitTest";
import {
  computeResizePatch,
  cursorForHandle,
  hitHandle,
  renderResizeHandles,
  type ResizeContext,
  type ResizeHandle,
} from "./transformHandles";
import ResizeTooltip from "./tooltips/Resize.vue";

const RESIZE_HANDLES: ResizeHandle[] = [
  "n",
  "s",
  "e",
  "w",
  "nw",
  "ne",
  "sw",
  "se",
];

export interface ResizeToolOptions extends Record<string, unknown> {
  /** Hit-test radius in CSS pixels for picking a node to select. */
  radius: number;
  /** Minimum side length when resizing. */
  minSize: number;
}

export function resizeTool(options: Partial<ResizeToolOptions> = {}) {
  let selectedNodeId: string | null = null;
  let activeHandle: ResizeHandle | null = null;
  let dragCtx: ResizeContext | null = null;
  let hoveredHandle: ResizeHandle | null = null;

  function clearSelection(api: CanvasToolApi<ResizeToolOptions>) {
    if (selectedNodeId) {
      selectedNodeId = null;
      hoveredHandle = null;
      api.setCursor(null);
      api.requestRender();
    }
  }

  return defineCanvasTool<never, ResizeToolOptions>({
    id: "resize",
    label: "Resize",
    icon: "resize",
    cursor: "default",
    tooltip: ResizeTooltip,
    defaultOptions: {
      radius: 10,
      minSize: 8,
      ...options,
    },
    onPointerDown(e, api) {
      if (selectedNodeId) {
        const node = api.getNode(selectedNodeId);
        if (node) {
          const handle = hitHandle(node, e, { handles: RESIZE_HANDLES });
          if (handle && handle !== "rotate") {
            activeHandle = handle;
            // JSON clone — node.data may be a Vue reactive proxy which
            // structuredClone can't handle. All node data is JSON-serializable.
            dragCtx = {
              original: {
                ...node,
                data: JSON.parse(JSON.stringify(node.data)),
              } as CanvasNode,
              originalBounds: getNodeBounds(node),
              startLocal: toLocalPoint(node, e),
            };
            api.setCursor("none");
            return;
          }
        }
      }
      const node = findTopNode(e, api, api.options.radius);
      selectedNodeId = node ? node.id : null;
      hoveredHandle = null;
      api.requestRender();
    },
    onPointerMove(e, api) {
      if (activeHandle && dragCtx && selectedNodeId && e.buttons !== 0) {
        const node = api.getNode(selectedNodeId);
        if (!node) return;
        const local = toLocalPoint(dragCtx.original, e);
        const patch = computeResizePatch(activeHandle, local, dragCtx, {
          minSize: api.options.minSize,
        });
        if (patch) api.updateNode(selectedNodeId, patch);
        api.setCursor("none");
        return;
      }

      if (selectedNodeId) {
        const node = api.getNode(selectedNodeId);
        if (node) {
          const handle = hitHandle(node, e, { handles: RESIZE_HANDLES });
          const next = handle && handle !== "rotate" ? handle : null;
          if (next !== hoveredHandle) {
            hoveredHandle = next;
            api.requestRender();
          }
          api.setCursor(next ? cursorForHandle(next, node.rotation) : null);
          return;
        }
      }
      api.setCursor(null);
    },
    onPointerUp(_e, api) {
      activeHandle = null;
      dragCtx = null;
      api.setCursor(null);
    },
    onDeactivate(api: CanvasToolApi<ResizeToolOptions>) {
      activeHandle = null;
      dragCtx = null;
      api.setCursor(null);
      clearSelection(api);
    },
    onKeyDown(e, api) {
      if (e.key === "Escape" && selectedNodeId) {
        clearSelection(api);
        e.preventDefault();
      }
    },
    renderOverlay(ctx, api) {
      if (!selectedNodeId) return;
      const node = api.getNode(selectedNodeId);
      if (!node) {
        selectedNodeId = null;
        return;
      }
      renderHighlightRect(ctx, node);
      renderResizeHandles(ctx, node, {
        handles: RESIZE_HANDLES,
        hovered: activeHandle ?? hoveredHandle,
      });
    },
  });
}
