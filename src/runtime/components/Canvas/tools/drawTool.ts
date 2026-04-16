import { defineCanvasTool } from "../types";
import type { CanvasPoint } from "../types";
import DrawTooltip from "./tooltips/Draw.vue";

export interface DrawToolOptions extends Record<string, unknown> {
  color: string;
  size: number;
  opacity: number;
  /** Reserved for future brushes (eraser, marker, airbrush...). */
  brush: "pen" | "marker";
}

export interface DrawNodeData {
  points: CanvasPoint[];
  color: string;
  size: number;
  opacity: number;
  brush: DrawToolOptions["brush"];
}

export function drawTool(options: Partial<DrawToolOptions> = {}) {
  // Per-instance interaction state — each drawTool() call owns its own
  // "currently drawing" id so multiple canvases on one page don't conflict.
  let activeStrokeId: string | null = null;

  return defineCanvasTool<DrawNodeData, DrawToolOptions>({
    id: "draw",
    label: "Draw",
    icon: "pencil",
    cursor: "crosshair",
    tooltip: DrawTooltip,
    defaultOptions: {
      color: "#111111",
      size: 4,
      opacity: 1,
      brush: "pen",
      ...options,
    },
    onPointerDown(e, api) {
      const node = api.addNode({
        type: "draw",
        x: 0,
        y: 0,
        data: {
          points: [{ x: e.x, y: e.y }],
          color: api.options.color,
          size: api.options.size,
          opacity: api.options.opacity,
          brush: api.options.brush,
        },
      });
      activeStrokeId = node.id;
    },
    onPointerMove(e, api) {
      if (!activeStrokeId || e.buttons === 0) return;
      const node = api.getNode(activeStrokeId);
      if (!node) return;
      (node.data as DrawNodeData).points.push({ x: e.x, y: e.y });
      api.requestRender();
    },
    onPointerUp(_e, api) {
      if (!activeStrokeId) return;
      // Finalize: replace the node so the nodes array reference changes,
      // which lets the history system capture the completed stroke.
      const node = api.getNode(activeStrokeId);
      if (node) {
        api.updateNode(activeStrokeId, {
          data: { ...(node.data as DrawNodeData) },
        });
      }
      activeStrokeId = null;
    },
    hitTest(node, point, radius) {
      const { points, size } = node.data;
      const r = radius + size / 2;
      return points.some(
        (p) => (p.x - point.x) ** 2 + (p.y - point.y) ** 2 <= r * r,
      );
    },
    render(ctx, node) {
      const { points, color, size, opacity, brush } = node.data;
      if (points.length === 0) return;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (brush === "marker") {
        ctx.globalCompositeOperation = "multiply";
      }
      ctx.beginPath();
      if (points.length === 1) {
        // Single tap — draw a dot.
        const [p] = points;
        ctx.arc(p.x, p.y, Math.max(size / 2, 0.5), 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
        return;
      }
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const p = points[i];
        const next = points[i + 1];
        const mx = (p.x + next.x) / 2;
        const my = (p.y + next.y) / 2;
        ctx.quadraticCurveTo(p.x, p.y, mx, my);
      }
      const last = points[points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
      ctx.restore();
    },
  });
}
