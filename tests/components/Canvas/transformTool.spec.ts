import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { transformTool } from "../../../src/runtime/components/Canvas/tools/transformTool";
import type {
  CanvasNode,
  CanvasPointerEvent,
  CanvasTool,
  CanvasToolApi,
} from "../../../src/runtime/components/Canvas/types";

function makeApi(initial: CanvasNode[]): {
  api: CanvasToolApi;
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
  return { api, cursors };
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

function rect(): CanvasNode {
  return {
    id: "rect",
    type: "rect",
    x: 100,
    y: 100,
    width: 100,
    height: 80,
    data: {},
  };
}

describe("transformTool", () => {
  it("selects a node on click inside its bounds", () => {
    const { api } = makeApi([rect()]);
    (api.getTools() as CanvasTool[]).push({
      id: "rect",
      label: "rect",
    } as CanvasTool);
    const tool = transformTool();

    tool.onPointerDown!(evt(150, 140), api);
    // Drag to confirm — should NOT move (no second click means selected only).
    tool.onPointerUp!(evt(150, 140), api);
    const n = api.getNode("rect")!;
    expect(n.x).toBe(100);
    expect(n.y).toBe(100);
  });

  it("dragging body moves the node", () => {
    const { api, cursors } = makeApi([rect()]);
    (api.getTools() as CanvasTool[]).push({
      id: "rect",
      label: "rect",
    } as CanvasTool);
    const tool = transformTool();

    tool.onPointerDown!(evt(150, 140), api); // select
    tool.onPointerDown!(evt(150, 140), api); // start move
    tool.onPointerMove!(evt(170, 160), api);
    tool.onPointerUp!(evt(170, 160), api);

    const n = api.getNode("rect")!;
    expect(n.x).toBe(120);
    expect(n.y).toBe(120);
    expect(cursors).toContain("grabbing");
  });

  it("dragging SE handle resizes the node", () => {
    const { api } = makeApi([rect()]);
    (api.getTools() as CanvasTool[]).push({
      id: "rect",
      label: "rect",
    } as CanvasTool);
    const tool = transformTool();

    tool.onPointerDown!(evt(150, 140), api); // select
    tool.onPointerDown!(evt(200, 180), api); // grab SE corner
    tool.onPointerMove!(evt(260, 240), api);
    tool.onPointerUp!(evt(260, 240), api);

    const n = api.getNode("rect")!;
    expect(n.width).toBe(160);
    expect(n.height).toBe(140);
    expect(n.x).toBe(100);
    expect(n.y).toBe(100);
  });

  it("dragging the rotation handle rotates the node", () => {
    const { api } = makeApi([rect()]);
    (api.getTools() as CanvasTool[]).push({
      id: "rect",
      label: "rect",
    } as CanvasTool);
    const tool = transformTool();

    // Bounds center = (150, 140). Rotation handle is 28px above top center
    // → (150, 100 - 28) = (150, 72).
    tool.onPointerDown!(evt(150, 140), api); // select
    tool.onPointerDown!(evt(150, 72), api); // grab rotation handle
    // Move to the right of center → angle changes from -π/2 toward 0.
    tool.onPointerMove!(evt(250, 140), api);
    tool.onPointerUp!(evt(250, 140), api);

    const n = api.getNode("rect")!;
    expect(n.rotation).toBeGreaterThan(0);
    expect(n.rotation).toBeLessThan(Math.PI);
  });

  it("rotation accumulates smoothly across the atan2 ±π wrap", () => {
    const { api } = makeApi([rect()]);
    (api.getTools() as CanvasTool[]).push({
      id: "rect",
      label: "rect",
    } as CanvasTool);
    const tool = transformTool();

    // Center = (150, 140). Sweep visually counter-clockwise (in canvas y-down
    // coords this means atan2 decreases): top → above-left → below-left →
    // bottom. The above-left → below-left step crosses atan2's ±π boundary
    // (above-left ≈ -π + ε, below-left ≈ +π - ε). Total visual rotation: -π.
    tool.onPointerDown!(evt(150, 140), api); // select
    tool.onPointerDown!(evt(150, 72), api); // grab rotation handle (-π/2)
    tool.onPointerMove!(evt(90, 130), api); // above-left, atan2 ≈ -2.97
    tool.onPointerMove!(evt(90, 150), api); // below-left, atan2 ≈ +2.97 (wrap)
    tool.onPointerMove!(evt(150, 208), api); // below center, atan2 ≈ +π/2
    tool.onPointerUp!(evt(150, 208), api);

    const n = api.getNode("rect")!;
    // Per-frame accumulation should give ≈ -π. The pre-fix bug (raw delta
    // from dragStart) would snap to ≈ +π or some intermediate value because
    // the +π/-π wrap inverts sign mid-sweep.
    expect(Math.abs(n.rotation! - -Math.PI)).toBeLessThan(0.2);
  });

  it("Esc deselects", () => {
    const { api } = makeApi([rect()]);
    (api.getTools() as CanvasTool[]).push({
      id: "rect",
      label: "rect",
    } as CanvasTool);
    const tool = transformTool();

    tool.onPointerDown!(evt(150, 140), api);
    const ev = { key: "Escape", preventDefault: () => {} } as KeyboardEvent;
    tool.onKeyDown!(ev, api);
    // After deselect, clicking outside should not select anything either.
    tool.onPointerDown!(evt(500, 500), api);
    // Now move — should not move the rect.
    tool.onPointerMove!(evt(520, 520), api);
    const n = api.getNode("rect")!;
    expect(n.x).toBe(100);
    expect(n.y).toBe(100);
  });
});
