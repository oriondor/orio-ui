import type { Ref } from "vue";
import type { CanvasNode } from "../types";

export function useCanvasNodes(
  nodes: Ref<CanvasNode[]>,
  opts: { onMutate: () => void },
) {
  // defineModel emits `update:nodes` on write but the getter returns the
  // parent prop which hasn't re-rendered yet. Consecutive sync writes
  // (e.g. multiple addNode calls in setup) each read `[]` and overwrite
  // each other. Keep a local shadow so reads always reflect pending writes.
  let pending: CanvasNode[] | null = null;

  function read(): CanvasNode[] {
    return pending ?? nodes.value;
  }

  function write(value: CanvasNode[]) {
    pending = value;
    nodes.value = value;
    queueMicrotask(() => {
      pending = null;
    });
  }

  function _addNode(
    node: Omit<CanvasNode, "id"> & { id?: string },
  ): CanvasNode {
    const current = read();
    const maxZ = current.reduce((m, n) => Math.max(m, n.zIndex ?? 0), -1);
    const created: CanvasNode = {
      zIndex: maxZ + 1,
      ...node,
      id: node.id ?? crypto.randomUUID(),
    } as CanvasNode;
    write([...current, created]);
    return created;
  }

  function _updateNode(id: string, patch: Partial<Omit<CanvasNode, "id">>) {
    const current = read();
    const idx = current.findIndex((n) => n.id === id);
    if (idx === -1) return;
    const { id: _ignored, ...safePatch } = patch as Partial<CanvasNode>;
    const next = current.slice();
    next[idx] = { ...next[idx], ...safePatch } as CanvasNode;
    write(next);
  }

  function getNode(id: string) {
    return read().find((n) => n.id === id);
  }

  function _removeNode(id: string) {
    write(read().filter((n) => n.id !== id));
  }

  function _clear() {
    write(read().filter((n) => n.frozen));
  }

  function addNode(node: Omit<CanvasNode, "id"> & { id?: string }): CanvasNode {
    const created = _addNode(node);
    opts.onMutate();
    return created;
  }

  function updateNode(id: string, patch: Partial<Omit<CanvasNode, "id">>) {
    _updateNode(id, patch);
    opts.onMutate();
  }

  function removeNode(id: string) {
    _removeNode(id);
    opts.onMutate();
  }

  function clear() {
    _clear();
    opts.onMutate();
  }

  return { addNode, updateNode, getNode, removeNode, clear };
}
