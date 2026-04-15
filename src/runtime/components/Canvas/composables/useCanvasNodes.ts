import type { Ref } from "vue";
import type { CanvasNode } from "../types";

export function useCanvasNodes(
  nodes: Ref<CanvasNode[]>,
  opts: { onMutate: () => void },
) {
  function _addNode(
    node: Omit<CanvasNode, "id"> & { id?: string },
  ): CanvasNode {
    const maxZ = nodes.value.reduce((m, n) => Math.max(m, n.zIndex ?? 0), -1);
    const created: CanvasNode = {
      zIndex: maxZ + 1,
      ...node,
      id: node.id ?? crypto.randomUUID(),
    } as CanvasNode;
    nodes.value = [...nodes.value, created];
    return created;
  }

  function _updateNode(id: string, patch: Partial<Omit<CanvasNode, "id">>) {
    const idx = nodes.value.findIndex((n) => n.id === id);
    if (idx === -1) return;
    const { id: _ignored, ...safePatch } = patch as Partial<CanvasNode>;
    const next = nodes.value.slice();
    next[idx] = { ...next[idx], ...safePatch } as CanvasNode;
    nodes.value = next;
  }

  function getNode(id: string) {
    return nodes.value.find((n) => n.id === id);
  }

  function _removeNode(id: string) {
    nodes.value = nodes.value.filter((n) => n.id !== id);
  }

  function _clear() {
    nodes.value = [];
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
