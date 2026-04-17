import type {
  CanvasNode,
  CanvasPoint,
  CanvasTool,
  CanvasToolApi,
} from "../types";

export function defaultHitTest(
  node: CanvasNode,
  point: CanvasPoint,
  radius: number,
): boolean {
  if (node.width != null && node.height != null) {
    return (
      point.x + radius >= node.x &&
      point.x - radius <= node.x + node.width &&
      point.y + radius >= node.y &&
      point.y - radius <= node.y + node.height
    );
  }
  const dx = point.x - node.x;
  const dy = point.y - node.y;
  return dx * dx + dy * dy <= radius * radius;
}

/** Transform a canvas-space point into the node's pre-rotation local space. */
export function toLocalPoint(
  node: CanvasNode,
  point: CanvasPoint,
): CanvasPoint {
  if (!node.rotation) return point;
  const b = getNodeBounds(node);
  const cx = b.x + b.width / 2;
  const cy = b.y + b.height / 2;
  const cos = Math.cos(-node.rotation);
  const sin = Math.sin(-node.rotation);
  const dx = point.x - cx;
  const dy = point.y - cy;
  return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
}

export function hitTestNode(
  node: CanvasNode,
  point: CanvasPoint,
  radius: number,
  toolMap: Map<string, CanvasTool>,
): boolean {
  const local = toLocalPoint(node, point);
  const ownerTool = toolMap.get(node.type);
  return ownerTool?.hitTest
    ? ownerTool.hitTest(node, local, radius)
    : defaultHitTest(node, local, radius);
}

export function findTopNode(
  point: CanvasPoint,
  api: CanvasToolApi,
  radius: number,
): CanvasNode | undefined {
  const tools = api.getTools();
  const toolMap = new Map<string, CanvasTool>(tools.map((t) => [t.id, t]));

  let best: CanvasNode | undefined;
  for (const node of api.nodes.value) {
    if (node.frozen) continue;
    if (!hitTestNode(node, point, radius, toolMap)) continue;
    if (!best || (node.zIndex ?? 0) >= (best.zIndex ?? 0)) {
      best = node;
    }
  }
  return best;
}

/** Compute an axis-aligned bounding box for a node. */
export function getNodeBounds(node: CanvasNode): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  // Nodes with explicit dimensions.
  if (node.width != null && node.height != null) {
    return { x: node.x, y: node.y, width: node.width, height: node.height };
  }

  // Draw nodes — compute from points.
  const data = node.data as Record<string, unknown>;
  if (Array.isArray(data?.points) && data.points.length > 0) {
    const points = data.points as CanvasPoint[];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    const pad = ((data.size as number) ?? 4) / 2;
    return {
      x: minX - pad,
      y: minY - pad,
      width: maxX - minX + pad * 2,
      height: maxY - minY + pad * 2,
    };
  }

  // Text nodes — approximate.
  if (typeof data?.text === "string" && typeof data?.fontSize === "number") {
    const fontSize = data.fontSize as number;
    const text = data.text as string;
    const estimatedWidth = text.length * fontSize * 0.6;
    return {
      x: node.x,
      y: node.y - fontSize / 2,
      width: estimatedWidth,
      height: fontSize,
    };
  }

  // Fallback — small rect around origin.
  return { x: node.x - 10, y: node.y - 10, width: 20, height: 20 };
}

export interface HighlightStyle {
  strokeColor: string;
  fillColor: string;
  lineWidth: number;
}

const DEFAULT_HIGHLIGHT: HighlightStyle = {
  strokeColor: "rgba(31, 122, 236, 0.8)",
  fillColor: "rgba(31, 122, 236, 0.08)",
  lineWidth: 2,
};

/** Draw a dashed bounding-rect highlight around a node. */
export function renderHighlightRect(
  ctx: CanvasRenderingContext2D,
  node: CanvasNode,
  style: Partial<HighlightStyle> = {},
): void {
  const { strokeColor, fillColor, lineWidth } = {
    ...DEFAULT_HIGHLIGHT,
    ...style,
  };
  const bounds = getNodeBounds(node);
  const pad = 6;

  ctx.save();
  if (node.rotation) {
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate(node.rotation);
    ctx.translate(-cx, -cy);
  }
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([6, 3]);
  ctx.beginPath();
  ctx.roundRect(
    bounds.x - pad,
    bounds.y - pad,
    bounds.width + pad * 2,
    bounds.height + pad * 2,
    4,
  );
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
