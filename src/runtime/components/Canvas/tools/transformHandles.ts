import type { CanvasNode, CanvasPoint } from "../types";
import { getNodeBounds, toLocalPoint } from "./hitTest";

export type ResizeHandle = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";

export type Handle = ResizeHandle | "rotate";

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HandleStyle {
  size: number;
  fill: string;
  stroke: string;
  lineWidth: number;
  rotateOffset: number;
}

const DEFAULT_STYLE: HandleStyle = {
  size: 10,
  fill: "transparent",
  stroke: "rgba(31, 122, 236, 1)",
  lineWidth: 1.5,
  rotateOffset: 28,
};

/** Alpha multiplier applied to the whole handle while hovered. */
const HOVER_ALPHA = 0.4;

/** Cursor for each resize handle (CSS values). */
export const HANDLE_CURSORS: Record<ResizeHandle, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
};

/** Map a resize handle through node rotation so cursors match the visual. */
export function cursorForHandle(handle: Handle, rotation = 0): string {
  if (handle === "rotate") return "grab";
  if (!rotation) return HANDLE_CURSORS[handle];
  // Snap rotation to nearest 45° for cursor selection.
  const order: ResizeHandle[] = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
  const idx = order.indexOf(handle);
  const step = Math.round((rotation * 4) / Math.PI);
  return HANDLE_CURSORS[order[(((idx + step) % 8) + 8) % 8]];
}

/** Resize handle anchor positions in node-local (un-rotated) space. */
export function getResizeHandles(b: Bounds): Record<ResizeHandle, CanvasPoint> {
  const cx = b.x + b.width / 2;
  const cy = b.y + b.height / 2;
  return {
    nw: { x: b.x, y: b.y },
    n: { x: cx, y: b.y },
    ne: { x: b.x + b.width, y: b.y },
    e: { x: b.x + b.width, y: cy },
    se: { x: b.x + b.width, y: b.y + b.height },
    s: { x: cx, y: b.y + b.height },
    sw: { x: b.x, y: b.y + b.height },
    w: { x: b.x, y: cy },
  };
}

/** Rotation handle anchor — sits above the top-center of the bounds. */
export function getRotationHandle(
  b: Bounds,
  offset = DEFAULT_STYLE.rotateOffset,
): CanvasPoint {
  return { x: b.x + b.width / 2, y: b.y - offset };
}

/**
 * Hit-test the handles of a (possibly rotated) node.
 *
 * @returns the matched handle name or `null` if the point is outside all handles.
 */
export function hitHandle(
  node: CanvasNode,
  point: CanvasPoint,
  opts: {
    style?: Partial<HandleStyle>;
    /** Restrict which handles can be hit (e.g. resize-only tools). */
    handles?: Handle[];
  } = {},
): Handle | null {
  const style = { ...DEFAULT_STYLE, ...opts.style };
  const allowed = new Set<Handle>(
    opts.handles ?? ["n", "s", "e", "w", "nw", "ne", "sw", "se", "rotate"],
  );
  const bounds = getNodeBounds(node);
  const local = toLocalPoint(node, point);
  const r = style.size / 2 + 2;

  if (allowed.has("rotate")) {
    const h = getRotationHandle(bounds, style.rotateOffset);
    if ((local.x - h.x) ** 2 + (local.y - h.y) ** 2 <= (r + 2) ** 2) {
      return "rotate";
    }
  }
  const resize = getResizeHandles(bounds);
  for (const key of Object.keys(resize) as ResizeHandle[]) {
    if (!allowed.has(key)) continue;
    const h = resize[key];
    if (Math.abs(local.x - h.x) <= r && Math.abs(local.y - h.y) <= r) {
      return key;
    }
  }
  return null;
}

/** Render resize handles on a node's bounding rect, applying rotation. */
export function renderResizeHandles(
  ctx: CanvasRenderingContext2D,
  node: CanvasNode,
  opts: {
    style?: Partial<HandleStyle>;
    handles?: ResizeHandle[];
    hovered?: ResizeHandle | null;
  } = {},
) {
  const style = { ...DEFAULT_STYLE, ...opts.style };
  const bounds = getNodeBounds(node);
  const all = getResizeHandles(bounds);
  const list = opts.handles ?? (Object.keys(all) as ResizeHandle[]);

  ctx.save();
  if (node.rotation) {
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate(node.rotation);
    ctx.translate(-cx, -cy);
  }
  ctx.fillStyle = style.fill;
  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = style.lineWidth;
  for (const key of list) {
    const p = all[key];
    const half = style.size / 2;
    const hovered = opts.hovered === key;
    if (hovered) {
      ctx.save();
      ctx.globalAlpha = HOVER_ALPHA;
    }
    ctx.beginPath();
    ctx.rect(p.x - half, p.y - half, style.size, style.size);
    ctx.fill();
    ctx.stroke();
    if (hovered) ctx.restore();
  }
  ctx.restore();
}

/** Render rotation handle (line + circle) above the node, applying rotation. */
export function renderRotationHandle(
  ctx: CanvasRenderingContext2D,
  node: CanvasNode,
  opts: { style?: Partial<HandleStyle>; hovered?: boolean } = {},
) {
  const style = { ...DEFAULT_STYLE, ...opts.style };
  const bounds = getNodeBounds(node);
  const top = { x: bounds.x + bounds.width / 2, y: bounds.y };
  const handle = getRotationHandle(bounds, style.rotateOffset);
  const r = style.size / 2 + 1;

  ctx.save();
  if (node.rotation) {
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate(node.rotation);
    ctx.translate(-cx, -cy);
  }
  ctx.strokeStyle = style.stroke;
  ctx.fillStyle = style.fill;
  ctx.lineWidth = style.lineWidth;
  if (opts.hovered) ctx.globalAlpha = HOVER_ALPHA;
  ctx.beginPath();
  ctx.moveTo(top.x, top.y);
  ctx.lineTo(handle.x, handle.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(handle.x, handle.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** Wrap a delta into (-π, π] so multi-turn drags don't jump at atan2's boundary. */
export function normalizeAngleDelta(delta: number): number {
  const TAU = Math.PI * 2;
  return ((((delta + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
}

/**
 * Compute a node's rotation given a pointer position. The rotation is the
 * angle from the node's bounds-center to `point`, with 0 meaning the
 * rotation handle pointing straight up.
 */
export function rotationFromPoint(
  node: CanvasNode,
  point: CanvasPoint,
): number {
  const b = getNodeBounds(node);
  const cx = b.x + b.width / 2;
  const cy = b.y + b.height / 2;
  // atan2(dy, dx) = 0 means handle on the +x axis. Our handle is at -y, so
  // shift by π/2.
  return Math.atan2(point.y - cy, point.x - cx) + Math.PI / 2;
}

export interface ResizeContext {
  /** Node snapshot taken at pointer-down. */
  original: CanvasNode;
  /** Bounds of `original`. */
  originalBounds: Bounds;
  /** Pointer in canvas-space at pointer-down (already in local coords). */
  startLocal: CanvasPoint;
}

/**
 * Compute a patch that resizes `ctx.original` so the dragged handle lines up
 * with the current pointer.
 *
 * - For width/height nodes: patches `x`, `y`, `width`, `height`.
 * - For draw nodes (with `data.points`): scales each point relative to the
 *   original bounds.
 * - For text nodes (with `data.fontSize`): uniform scale via `fontSize`,
 *   only on corner handles.
 */
export function computeResizePatch(
  handle: ResizeHandle,
  pointerLocal: CanvasPoint,
  ctx: ResizeContext,
  opts: { minSize?: number } = {},
): Partial<Omit<CanvasNode, "id">> | null {
  const minSize = opts.minSize ?? 8;
  const ob = ctx.originalBounds;

  // New bounds based on the handle being dragged.
  let nx = ob.x;
  let ny = ob.y;
  let nw = ob.width;
  let nh = ob.height;

  if (handle.includes("e")) nw = Math.max(minSize, pointerLocal.x - ob.x);
  if (handle.includes("s")) nh = Math.max(minSize, pointerLocal.y - ob.y);
  if (handle.includes("w")) {
    const right = ob.x + ob.width;
    nx = Math.min(pointerLocal.x, right - minSize);
    nw = right - nx;
  }
  if (handle.includes("n")) {
    const bottom = ob.y + ob.height;
    ny = Math.min(pointerLocal.y, bottom - minSize);
    nh = bottom - ny;
  }

  const data = ctx.original.data as Record<string, unknown> | undefined;

  // Width/height nodes — straight patch.
  if (ctx.original.width != null && ctx.original.height != null) {
    return { x: nx, y: ny, width: nw, height: nh };
  }

  // Draw nodes — scale points proportionally.
  if (Array.isArray(data?.points)) {
    const points = data.points as CanvasPoint[];
    // Guard against collapsed axes — a single-point stroke could have width
    // or height of 0, which would otherwise produce NaN/Infinity coordinates.
    const sx = ob.width === 0 ? 1 : nw / ob.width;
    const sy = ob.height === 0 ? 1 : nh / ob.height;
    return {
      x: ctx.original.x,
      y: ctx.original.y,
      data: {
        ...data,
        points: points.map((p) => ({
          x: nx + (p.x - ob.x) * sx,
          y: ny + (p.y - ob.y) * sy,
        })),
      },
    };
  }

  // Text nodes — uniform scale via fontSize, corner handles only.
  if (typeof data?.text === "string" && typeof data?.fontSize === "number") {
    if (!["nw", "ne", "sw", "se"].includes(handle)) return null;
    const sx = ob.width === 0 ? 1 : nw / ob.width;
    const sy = ob.height === 0 ? 1 : nh / ob.height;
    const scale = Math.max(sx, sy);
    const newFont = Math.max(minSize, (data.fontSize as number) * scale);
    return {
      x: nx,
      y: ny + (newFont - (data.fontSize as number)) / 2,
      data: { ...data, fontSize: newFont },
    };
  }

  return null;
}
