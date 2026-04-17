import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { imageTool } from "../../../src/runtime/components/Canvas/tools/imageTool";
import { exportTool } from "../../../src/runtime/components/Canvas/tools/exportTool";
import type {
  CanvasNode,
  CanvasTool,
  CanvasToolApi,
} from "../../../src/runtime/components/Canvas/types";

// jsdom doesn't implement Canvas2D — stub the bits the export tool touches.
const fakeCtx = {
  scale: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  drawImage: vi.fn(),
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 0,
} as unknown as CanvasRenderingContext2D;

beforeEach(() => {
  vi.clearAllMocks();
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => fakeCtx,
  ) as unknown as HTMLCanvasElement["getContext"];
  HTMLCanvasElement.prototype.toBlob = vi.fn();
});

function makeApi(initial: CanvasNode[] = [], extraOpts: Record<string, unknown> = {}): {
  api: CanvasToolApi;
} {
  const nodes = ref<CanvasNode[]>(initial);
  const tools: CanvasTool[] = [];
  const api: CanvasToolApi = {
    options: { format: "png", quality: 0.9, filename: "test", scale: 1, ...extraOpts },
    nodes,
    addNode: (n) => {
      const created = { id: `n${nodes.value.length}`, ...n } as CanvasNode;
      nodes.value = [...nodes.value, created];
      return created;
    },
    updateNode: () => {},
    removeNode: () => {},
    getNode: (id) => nodes.value.find((n) => n.id === id),
    clear: () => {
      nodes.value = [];
    },
    requestRender: () => {},
    stageEl: () => null,
    size: () => ({ width: 200, height: 100 }),
    undo: () => {},
    redo: () => {},
    canUndo: { value: false } as never,
    canRedo: { value: false } as never,
    getToolOptions: () => ({}) as never,
    getTools: () => tools,
    setCursor: () => {},
  };
  return { api };
}

describe("imageTool", () => {
  it("registers as an action tool with image type", () => {
    const tool = imageTool();
    expect(tool.kind).toBe("action");
    expect(tool.id).toBe("image");
    expect(tool.render).toBeTypeOf("function");
    expect(tool.action).toBeTypeOf("function");
  });

  it("draws a placeholder when image is not yet loaded", () => {
    const tool = imageTool();
    const node: CanvasNode = {
      id: "img",
      type: "image",
      x: 10,
      y: 20,
      width: 80,
      height: 60,
      data: {
        src: "data:image/png;base64,iVBORw0KGgoNOTREALPIXELS",
        naturalWidth: 100,
        naturalHeight: 100,
      },
    };
    tool.render!(fakeCtx, node);
    expect(fakeCtx.fillRect).toHaveBeenCalledWith(10, 20, 80, 60);
    expect(fakeCtx.strokeRect).toHaveBeenCalledWith(10, 20, 80, 60);
    expect(fakeCtx.drawImage).not.toHaveBeenCalled();
  });
});

describe("exportTool", () => {
  it("disables when there are no nodes", () => {
    const tool = exportTool();
    const { api } = makeApi([]);
    expect(tool.disabled!(api)).toBe(true);
  });

  it("enables when at least one node exists", () => {
    const tool = exportTool();
    const { api } = makeApi([
      {
        id: "r",
        type: "rect",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        data: {},
      },
    ]);
    expect(tool.disabled!(api)).toBe(false);
  });

  it("invokes toBlob when action runs", () => {
    const tool = exportTool();
    const { api } = makeApi([
      {
        id: "r",
        type: "rect",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        data: {},
      },
    ]);
    // Stub a renderer for the "rect" type so the export loop has work to do.
    (api.getTools() as CanvasTool[]).push({
      id: "rect",
      render: (c, n) => {
        c.fillRect(n.x, n.y, n.width!, n.height!);
      },
    } as CanvasTool);

    tool.action!(api);
    const blob = HTMLCanvasElement.prototype.toBlob as unknown as ReturnType<typeof vi.fn>;
    expect(blob).toHaveBeenCalledOnce();
    expect(blob.mock.calls[0]?.[1]).toBe("image/png");
  });

  it("uses jpeg mime when format is jpeg", () => {
    const tool = exportTool({ format: "jpeg" });
    const { api } = makeApi(
      [
        {
          id: "r",
          type: "rect",
          x: 0,
          y: 0,
          width: 10,
          height: 10,
          data: {},
        },
      ],
      { format: "jpeg", quality: 0.8, filename: "x", scale: 1 },
    );
    (api.getTools() as CanvasTool[]).push({
      id: "rect",
      render: () => {},
    } as CanvasTool);

    tool.action!(api);
    const blob = HTMLCanvasElement.prototype.toBlob as unknown as ReturnType<typeof vi.fn>;
    expect(blob.mock.calls[0]?.[1]).toBe("image/jpeg");
    expect(blob.mock.calls[0]?.[2]).toBe(0.8);
  });

  it("applies rotation transforms when node has rotation", () => {
    const tool = exportTool();
    const rotation = Math.PI / 2;
    const { api } = makeApi([
      {
        id: "r",
        type: "rect",
        x: 10,
        y: 20,
        width: 40,
        height: 30,
        rotation,
        data: {},
      },
    ]);
    (api.getTools() as CanvasTool[]).push({
      id: "rect",
      render: (c, n) => {
        c.fillRect(n.x, n.y, n.width!, n.height!);
      },
    } as CanvasTool);

    tool.action!(api);

    // Rotation path: save → translate(cx, cy) → rotate → translate(-cx, -cy) → render → restore
    expect(fakeCtx.save).toHaveBeenCalled();
    expect(fakeCtx.translate).toHaveBeenCalledWith(30, 35); // cx = 10+40/2, cy = 20+30/2
    expect(fakeCtx.rotate).toHaveBeenCalledWith(rotation);
    expect(fakeCtx.translate).toHaveBeenCalledWith(-30, -35);
    expect(fakeCtx.fillRect).toHaveBeenCalledWith(10, 20, 40, 30);
    expect(fakeCtx.restore).toHaveBeenCalled();
  });
});
