import { computed, shallowRef, type Ref } from "vue";
import type { CanvasNode } from "../types";

function deepClone(arr: CanvasNode[]): CanvasNode[] {
  return JSON.parse(JSON.stringify(arr));
}

export function useCanvasHistory(
  nodes: Ref<CanvasNode[]>,
  opts: { maxHistory: () => number; requestRender: () => void },
) {
  const undoStack = shallowRef<CanvasNode[][]>([]);
  const redoStack = shallowRef<CanvasNode[][]>([]);

  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);

  let committed: CanvasNode[] = deepClone(nodes.value);
  let pointerDown = false;

  function commit() {
    const current = deepClone(nodes.value);
    if (JSON.stringify(committed) === JSON.stringify(current)) return;
    const next = [...undoStack.value, committed];
    if (next.length > opts.maxHistory()) next.shift();
    undoStack.value = next;
    if (redoStack.value.length > 0) redoStack.value = [];
    committed = current;
  }

  function beginAction() {
    pointerDown = true;
  }

  function endAction() {
    pointerDown = false;
    commit();
  }

  function undo() {
    if (!canUndo.value) return;
    const stack = [...undoStack.value];
    const prev = stack.pop()!;
    undoStack.value = stack;
    redoStack.value = [...redoStack.value, committed];
    committed = prev;
    nodes.value = deepClone(prev);
    opts.requestRender();
  }

  function redo() {
    if (!canRedo.value) return;
    const stack = [...redoStack.value];
    const next = stack.pop()!;
    redoStack.value = stack;
    undoStack.value = [...undoStack.value, committed];
    committed = next;
    nodes.value = deepClone(next);
    opts.requestRender();
  }

  /** Auto-commit wrapper — commits immediately unless inside a pointer action. */
  function autoCommit() {
    if (!pointerDown) commit();
  }

  /** Reset committed baseline to current nodes (used after setup). */
  function resetBaseline() {
    committed = deepClone(nodes.value);
  }

  function onKeyDown(e: KeyboardEvent) {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod || e.key.toLowerCase() !== "z") return;
    e.preventDefault();
    if (e.shiftKey) {
      redo();
    } else {
      undo();
    }
  }

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    commit,
    autoCommit,
    beginAction,
    endAction,
    resetBaseline,
    onKeyDown,
  };
}
