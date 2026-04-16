import { defineCanvasTool } from "../types";
import type { CanvasNode, CanvasPoint, CanvasToolApi } from "../types";
import {
  findTopNode,
  getNodeBounds,
  hitTestNode,
  renderHighlightRect,
  toLocalPoint,
} from "./hitTest";
import {
  computeResizePatch,
  cursorForHandle,
  hitHandle,
  normalizeAngleDelta,
  renderResizeHandles,
  renderRotationHandle,
  type Handle,
  type ResizeContext,
  type ResizeHandle,
} from "./transformHandles";
import TransformTooltip from "./tooltips/Transform.vue";

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
const ALL_HANDLES: Handle[] = [...RESIZE_HANDLES, "rotate"];

export interface TransformToolOptions extends Record<string, unknown> {
  /** Hit-test radius in CSS pixels for picking a node to select. */
  radius: number;
  /** Minimum side length when resizing. */
  minSize: number;
}

type Mode = "resize" | "rotate" | "move" | null;

export function transformTool(options: Partial<TransformToolOptions> = {}) {
  let selectedNodeId: string | null = null;
  let mode: Mode = null;
  let hoveredHandle: Handle | null = null;

  // Resize state
  let activeHandle: ResizeHandle | null = null;
  let dragCtx: ResizeContext | null = null;

  // Rotate state — see rotateTool for the per-frame accumulation rationale.
  let prevAngle = 0;
  let accumulatedRotation = 0;

  // Move state
  let lastX = 0;
  let lastY = 0;

  function reset() {
    mode = null;
    activeHandle = null;
    dragCtx = null;
  }

  function clearSelection(api: CanvasToolApi<TransformToolOptions>) {
    if (selectedNodeId) {
      selectedNodeId = null;
      hoveredHandle = null;
      api.setCursor(null);
      api.requestRender();
    }
  }

  return defineCanvasTool<never, TransformToolOptions>({
    id: "transform",
    label: "Transform",
    icon: "transform",
    cursor: "default",
    tooltip: TransformTooltip,
    defaultOptions: {
      radius: 10,
      minSize: 8,
      ...options,
    },
    onPointerDown(e, api) {
      // 1. If a node is already selected, dispatch on its handles / bounds.
      if (selectedNodeId) {
        const node = api.getNode(selectedNodeId);
        if (node) {
          const handle = hitHandle(node, e, { handles: ALL_HANDLES });
          const bounds = getNodeBounds(node);
          const center = {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2,
          };

          if (handle === "rotate") {
            mode = "rotate";
            accumulatedRotation = node.rotation ?? 0;
            prevAngle = Math.atan2(e.y - center.y, e.x - center.x);
            api.setCursor("none");
            return;
          }
          if (handle && handle !== "rotate") {
            mode = "resize";
            activeHandle = handle;
            // JSON clone — node.data may be a Vue reactive proxy which
            // structuredClone can't handle. All node data is JSON-serializable.
            dragCtx = {
              original: {
                ...node,
                data: JSON.parse(JSON.stringify(node.data)),
              } as CanvasNode,
              originalBounds: bounds,
              startLocal: toLocalPoint(node, e),
            };
            api.setCursor("none");
            return;
          }

          // No handle — if click landed on the selected node, start a move.
          const tools = api.getTools();
          const toolMap = new Map(tools.map((t) => [t.id, t]));
          if (hitTestNode(node, e, api.options.radius, toolMap)) {
            mode = "move";
            lastX = e.x;
            lastY = e.y;
            api.setCursor("grabbing");
            return;
          }
        }
      }

      // 2. Otherwise, try selecting whatever's under the pointer.
      const node = findTopNode(e, api, api.options.radius);
      selectedNodeId = node ? node.id : null;
      hoveredHandle = null;
      api.requestRender();
    },
    onPointerMove(e, api) {
      // ── Active drag ──────────────────────────────────────────────
      if (mode && selectedNodeId && e.buttons !== 0) {
        const node = api.getNode(selectedNodeId);
        if (!node) return;

        if (mode === "resize" && activeHandle && dragCtx) {
          const local = toLocalPoint(dragCtx.original, e);
          const patch = computeResizePatch(activeHandle, local, dragCtx, {
            minSize: api.options.minSize,
          });
          if (patch) api.updateNode(selectedNodeId, patch);
          api.setCursor("none");
          return;
        }

        if (mode === "rotate") {
          const b = getNodeBounds(node);
          const angle = Math.atan2(
            e.y - (b.y + b.height / 2),
            e.x - (b.x + b.width / 2),
          );
          accumulatedRotation += normalizeAngleDelta(angle - prevAngle);
          prevAngle = angle;
          api.updateNode(selectedNodeId, { rotation: accumulatedRotation });
          api.setCursor("none");
          return;
        }

        if (mode === "move") {
          const dx = e.x - lastX;
          const dy = e.y - lastY;
          lastX = e.x;
          lastY = e.y;
          const patch: Partial<CanvasNode> = {
            x: node.x + dx,
            y: node.y + dy,
          };
          if (Array.isArray((node.data as Record<string, unknown>)?.points)) {
            const data = node.data as { points: CanvasPoint[] };
            patch.data = {
              ...node.data,
              points: data.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
            };
          }
          api.updateNode(selectedNodeId, patch);
          api.setCursor("grabbing");
          return;
        }
      }

      // ── Hover feedback ───────────────────────────────────────────
      if (selectedNodeId) {
        const node = api.getNode(selectedNodeId);
        if (node) {
          const handle = hitHandle(node, e, { handles: ALL_HANDLES });
          if (handle !== hoveredHandle) {
            hoveredHandle = handle;
            api.requestRender();
          }
          if (handle) {
            api.setCursor(cursorForHandle(handle, node.rotation));
            return;
          }
          // No handle — show grab cursor when hovering inside the node.
          const tools = api.getTools();
          const toolMap = new Map(tools.map((t) => [t.id, t]));
          if (hitTestNode(node, e, api.options.radius, toolMap)) {
            api.setCursor("grab");
            return;
          }
        }
      }
      api.setCursor(null);
    },
    onPointerUp(_e, api) {
      reset();
      api.setCursor(null);
    },
    onDeactivate(api: CanvasToolApi<TransformToolOptions>) {
      reset();
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
        hovered:
          mode === "resize"
            ? activeHandle
            : hoveredHandle && hoveredHandle !== "rotate"
              ? (hoveredHandle as ResizeHandle)
              : null,
      });
      renderRotationHandle(ctx, node, {
        hovered: mode === "rotate" || hoveredHandle === "rotate",
      });
    },
  });
}
