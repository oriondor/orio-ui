import type { Component, ComputedRef, Ref } from "vue";
import type { IconName } from "../../utils/icon-registry";

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface CanvasNode<TData = unknown> {
  id: string;
  /** Matches the id of the tool that owns (renders) this node. */
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  /** When true, future interaction tools should skip this node. */
  frozen?: boolean;
  zIndex?: number;
  data: TData;
}

export interface CanvasPointerEvent {
  /** Canvas-space x (origin is the top-left of the stage). */
  x: number;
  /** Canvas-space y. */
  y: number;
  /** Viewport-space x — useful for positioning HTML overlays. */
  clientX: number;
  /** Viewport-space y. */
  clientY: number;
  /** Pressed buttons bitmask from the underlying PointerEvent. */
  buttons: number;
  originalEvent: PointerEvent;
}

export interface CanvasToolApi<
  TOptions extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Reactive, mutable options bag for this tool. */
  options: TOptions;
  /** All current nodes — treat as read-only; use helpers to mutate. */
  nodes: Ref<CanvasNode[]>;
  addNode: (node: Omit<CanvasNode, "id"> & { id?: string }) => CanvasNode;
  updateNode: (id: string, patch: Partial<Omit<CanvasNode, "id">>) => void;
  removeNode: (id: string) => void;
  getNode: (id: string) => CanvasNode | undefined;
  clear: () => void;
  /** Schedule a redraw on the next animation frame. */
  requestRender: () => void;
  /** The stage's root element — mount overlay DOM here. */
  stageEl: () => HTMLElement | null;
  /** Current canvas size in CSS pixels. */
  size: () => { width: number; height: number };
  /** Undo the last action. */
  undo: () => void;
  /** Redo the last undone action. */
  redo: () => void;
  /** Whether there's anything to undo. */
  canUndo: ComputedRef<boolean>;
  /** Whether there's anything to redo. */
  canRedo: ComputedRef<boolean>;
  /** Read/write another tool's reactive options. */
  getToolOptions: <T extends Record<string, unknown>>(id: string) => T;
  /** All registered tools — useful for hit-testing across tool types. */
  getTools: () => CanvasTool[];
}

/**
 * Tool kind determines how the toolbar renders the tool:
 * - `"interaction"` (default) — activates on click, receives pointer events on the stage.
 * - `"action"` — fires `action()` on click, never becomes the active tool.
 * - `"widget"` — renders a custom `toolbar` component instead of a button.
 */
export type CanvasToolKind = "interaction" | "action" | "widget";

export interface CanvasTool<
  TNodeData = unknown,
  TOptions extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Stable id — also used as `node.type` for nodes produced by this tool. */
  id: string;
  label?: string;
  /** Icon name from the Orio icon registry. */
  icon?: IconName | (string & {});
  /** CSS cursor applied to the stage while this tool is active. */
  cursor?: string;
  tooltip?: Component;
  /**
   * Tool kind. Defaults to `"interaction"`.
   * - `"interaction"` — standard pointer tool (draw, text, etc.)
   * - `"action"` — one-shot action (undo, redo, clear)
   * - `"widget"` — renders a custom component in the toolbar
   */
  kind?: CanvasToolKind;
  /** For action tools: callback fired when the button is clicked. */
  action?: (api: CanvasToolApi<TOptions>) => void;
  /** For action tools: reactive disabled state. */
  disabled?: (api: CanvasToolApi<TOptions>) => boolean;
  /** For widget tools: Vue component rendered in the toolbar instead of a button. */
  toolbar?: Component;
  defaultOptions?: TOptions;
  onPointerDown?: (e: CanvasPointerEvent, api: CanvasToolApi<TOptions>) => void;
  onPointerMove?: (e: CanvasPointerEvent, api: CanvasToolApi<TOptions>) => void;
  onPointerUp?: (e: CanvasPointerEvent, api: CanvasToolApi<TOptions>) => void;
  onActivate?: (api: CanvasToolApi<TOptions>) => void;
  onDeactivate?: (api: CanvasToolApi<TOptions>) => void;
  onKeyDown?: (e: KeyboardEvent, api: CanvasToolApi<TOptions>) => void;
  render?: (ctx: CanvasRenderingContext2D, node: CanvasNode<TNodeData>) => void;
  /** Draw overlay graphics after all nodes have been rendered. */
  renderOverlay?: (
    ctx: CanvasRenderingContext2D,
    api: CanvasToolApi<TOptions>,
  ) => void;
  /**
   * Hit-test a node against a point. Used by the erase tool (and future
   * selection tools) to determine if a pointer intersects this node.
   * Return `true` if the node is "hit".
   *
   * @param node    The node to test.
   * @param point   The pointer position in canvas-space.
   * @param radius  The eraser/selection radius in CSS pixels.
   */
  hitTest?: (
    node: CanvasNode<TNodeData>,
    point: CanvasPoint,
    radius: number,
  ) => boolean;
}

/** Author-facing helper that preserves generics on a tool definition. */
export function defineCanvasTool<
  TNodeData = unknown,
  TOptions extends Record<string, unknown> = Record<string, unknown>,
>(tool: CanvasTool<TNodeData, TOptions>): CanvasTool<TNodeData, TOptions> {
  return tool;
}
