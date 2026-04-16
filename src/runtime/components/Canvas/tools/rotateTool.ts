import { defineCanvasTool } from "../types";
import type { CanvasToolApi } from "../types";
import { findTopNode, getNodeBounds, renderHighlightRect } from "./hitTest";
import {
  cursorForHandle,
  hitHandle,
  normalizeAngleDelta,
  renderRotationHandle,
} from "./transformHandles";
import RotateTooltip from "./tooltips/Rotate.vue";

export interface RotateToolOptions extends Record<string, unknown> {
  /** Hit-test radius in CSS pixels for picking a node to select. */
  radius: number;
}

export function rotateTool(options: Partial<RotateToolOptions> = {}) {
  let selectedNodeId: string | null = null;
  /** Atan2 angle from the bounds center to the pointer at the previous frame. */
  let prevAngle = 0;
  /** Accumulated rotation tracked across frames (lets the user spin past ±π). */
  let accumulatedRotation = 0;
  let dragging = false;

  function clearSelection(api: CanvasToolApi<RotateToolOptions>) {
    if (selectedNodeId) {
      selectedNodeId = null;
      api.setCursor(null);
      api.requestRender();
    }
  }

  return defineCanvasTool<never, RotateToolOptions>({
    id: "rotate",
    label: "Rotate",
    icon: "rotate",
    cursor: "default",
    tooltip: RotateTooltip,
    defaultOptions: {
      radius: 10,
      ...options,
    },
    onPointerDown(e, api) {
      // If a node is selected, check whether we hit its rotation handle first.
      if (selectedNodeId) {
        const node = api.getNode(selectedNodeId);
        if (node) {
          const handle = hitHandle(node, e, { handles: ["rotate"] });
          if (handle === "rotate") {
            const b = getNodeBounds(node);
            dragging = true;
            accumulatedRotation = node.rotation ?? 0;
            prevAngle = Math.atan2(
              e.y - (b.y + b.height / 2),
              e.x - (b.x + b.width / 2),
            );
            api.setCursor("none");
            return;
          }
        }
      }
      // Otherwise, try selecting a node under the pointer.
      const node = findTopNode(e, api, api.options.radius);
      selectedNodeId = node ? node.id : null;
      api.requestRender();
    },
    onPointerMove(e, api) {
      if (dragging && selectedNodeId && e.buttons !== 0) {
        const node = api.getNode(selectedNodeId);
        if (!node) return;
        const b = getNodeBounds(node);
        const angle = Math.atan2(
          e.y - (b.y + b.height / 2),
          e.x - (b.x + b.width / 2),
        );
        // Accumulate per-frame deltas so dragging across atan2's ±π wrap
        // doesn't snap. Per-frame deltas are tiny enough to normalize cleanly.
        accumulatedRotation += normalizeAngleDelta(angle - prevAngle);
        prevAngle = angle;
        api.updateNode(selectedNodeId, { rotation: accumulatedRotation });
        api.setCursor("none");
        return;
      }

      // Hover feedback over the rotation handle.
      if (selectedNodeId) {
        const node = api.getNode(selectedNodeId);
        if (node) {
          const handle = hitHandle(node, e, { handles: ["rotate"] });
          api.setCursor(handle ? cursorForHandle(handle, node.rotation) : null);
          return;
        }
      }
      api.setCursor(null);
    },
    onPointerUp(_e, api) {
      dragging = false;
      api.setCursor(null);
    },
    onDeactivate(api: CanvasToolApi<RotateToolOptions>) {
      dragging = false;
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
      renderRotationHandle(ctx, node);
    },
  });
}
