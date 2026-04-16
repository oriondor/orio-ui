import { inject, type ComputedRef, type InjectionKey, type Ref } from "vue";
import type { CanvasNode, CanvasTool, CanvasToolApi } from "./types";

export interface CanvasContext {
  tools: Ref<CanvasTool[]>;
  activeToolId: Ref<string | null>;
  setActiveTool: (id: string | null) => void;
  nodes: Ref<CanvasNode[]>;
  addNode: CanvasToolApi["addNode"];
  updateNode: CanvasToolApi["updateNode"];
  removeNode: CanvasToolApi["removeNode"];
  getNode: CanvasToolApi["getNode"];
  clear: CanvasToolApi["clear"];
  requestRender: () => void;
  /** Stage installs its render function through this. */
  installRenderer: (fn: () => void) => void;
  getToolOptions: <T extends Record<string, unknown>>(id: string) => T;
  getToolApi: <T extends Record<string, unknown>>(
    id: string,
  ) => CanvasToolApi<T>;
  stageEl: Ref<HTMLElement | null>;
  size: Ref<{ width: number; height: number }>;
  /** Reactive cursor override. `null` falls back to the active tool's cursor. */
  cursorOverride: Ref<string | null>;
  setCursor: (cursor: string | null) => void;
  undo: () => void;
  redo: () => void;
  canUndo: ComputedRef<boolean>;
  canRedo: ComputedRef<boolean>;
  /** Mark the start of a user interaction (pointer down). */
  beginAction: () => void;
  /** Mark the end of a user interaction (pointer up) — records one undo step. */
  endAction: () => void;
  /** Keyboard handler for undo/redo shortcuts. Attach to the stage element. */
  onKeyDown: (e: KeyboardEvent) => void;
}

export const CANVAS_CONTEXT: InjectionKey<CanvasContext> = Symbol("OrioCanvas");

export function useCanvasContext(): CanvasContext {
  const ctx = inject(CANVAS_CONTEXT);
  if (!ctx) {
    throw new Error(
      "useCanvasContext() must be used inside <orio-canvas>. " +
        "Did you forget to wrap the component?",
    );
  }
  return ctx;
}
