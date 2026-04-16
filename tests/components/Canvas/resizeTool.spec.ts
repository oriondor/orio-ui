import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { resizeTool } from "../../../src/runtime/components/Canvas/tools/resizeTool";
import type {
  CanvasNode,
  CanvasPointerEvent,
  CanvasTool,
  CanvasToolApi,
} from "../../../src/runtime/components/Canvas/types";

function makeApi(initial: CanvasNode[]): {
  api: CanvasToolApi;
  nodes: ReturnType<typeof ref<CanvasNode[]>>;
  cursors: (string | null)[];
} {
  const nodes = ref<CanvasNode[]>(initial);
  const cursors: (string | null)[] = [];
  const tools: CanvasTool[] = [];
  const api: CanvasToolApi = {
    options: { radius: 10, minSize: 8 },
    nodes,
    addNode: (n) => {
      const created = { id: "x", ...n } as CanvasNode;
      nodes.value = [...nodes.value, created];
      return created;
    },
    updateNode: (id, patch) => {
      const idx = nodes.value.findIndex((n) => n.id === id);
      if (idx === -1) return;
      const next = nodes.value.slice();
      const { id: _ignored, ...safe } = patch as Partial<CanvasNode>;
      next[idx] = { ...next[idx], ...safe } as CanvasNode;
      nodes.value = next;
    },
    removeNode: () => {},
    getNode: (id) => nodes.value.find((n) => n.id === id),
    clear: () => {
      nodes.value = [];
    },
    requestRender: () => {},
    stageEl: () => null,
    size: () => ({ width: 800, height: 500 }),
    undo: () => {},
    redo: () => {},
    canUndo: { value: false } as never,
    canRedo: { value: false } as never,
    getToolOptions: () => ({}) as never,
    getTools: () => tools,
    setCursor: (c) => {
      cursors.push(c);
    },
  };
  return { api, nodes, cursors };
}

function evt(x: number, y: number, buttons = 1): CanvasPointerEvent {
  return {
    x,
    y,
    clientX: x,
    clientY: y,
    buttons,
    originalEvent: {} as PointerEvent,
  };
}

describe("resizeTool", () => {
  it("selects a node with explicit width/height on click", () => {
    const node: CanvasNode = {
      id: "rect",
      type: "rect",
      x: 100,
      y: 100,
      width: 100,
      height: 80,
      data: {},
    };
    const { api } = makeApi([node]);
    // Tool must be in the tool list so findTopNode can find the node.
    (api.getTools() as CanvasTool[]).push({
      id: "rect",
      label: "rect",
    } as CanvasTool);
    const tool = resizeTool();

    tool.onPointerDown!(evt(150, 140), api);
    // Click inside the rect — should select it. Now click SE handle (200, 180).
    tool.onPointerDown!(evt(200, 180), api);
    tool.onPointerMove!(evt(260, 240), api);
    tool.onPointerUp!(evt(260, 240), api);

    const updated = api.getNode("rect")!;
    expect(updated.width).toBe(160);
    expect(updated.height).toBe(140);
    expect(updated.x).toBe(100);
    expect(updated.y).toBe(100);
  });

  it("scales draw-node points when SE handle is dragged", () => {
    const node: CanvasNode = {
      id: "stroke",
      type: "draw",
      x: 0,
      y: 0,
      data: {
        points: [
          { x: 100, y: 100 },
          { x: 200, y: 200 },
        ],
        size: 4,
        color: "#000",
        opacity: 1,
        brush: "pen",
      },
    };
    const { api } = makeApi([node]);
    (api.getTools() as CanvasTool[]).push({
      id: "draw",
      hitTest: (n, p, r) => {
        const pts = (n.data as { points: { x: number; y: number }[] }).points;
        return pts.some(
          (q) => (q.x - p.x) ** 2 + (q.y - p.y) ** 2 <= r * r,
        );
      },
    } as CanvasTool);
    const tool = resizeTool();

    // First click selects (clicking on a point of the stroke).
    tool.onPointerDown!(evt(100, 100), api);
    // Then click SE corner of bounds (with size 4 pad → bounds = 98..202).
    tool.onPointerDown!(evt(202, 202), api);
    tool.onPointerMove!(evt(252, 252), api);
    tool.onPointerUp!(evt(252, 252), api);

    const updated = api.getNode("stroke")!;
    const points = (updated.data as { points: { x: number; y: number }[] })
      .points;
    // Bounds were 98..202 (104px). New width 252-98 = 154. scale ≈ 1.48.
    // First original point (100,100) becomes 98 + (100-98)*1.48 ≈ 100.96.
    expect(points[0].x).toBeGreaterThan(100);
    expect(points[1].x).toBeGreaterThan(200);
    expect(points[1].y).toBeGreaterThan(200);
  });
});
