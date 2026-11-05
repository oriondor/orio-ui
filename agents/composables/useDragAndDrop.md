---
kind: composable
category: Composables
purpose: drag and drop on any element, drag source, drop target, pointer-based dnd with touch support
short: `useDragSource` + `useDropTarget` — pointer-based drag and drop with touch hold, ghost copy and group filtering; powers Draggable / DropZone
invariants: true
---

# useDragAndDrop — agent-only invariants

File exports two composables (not `useDraggable` / `useDropZone`, which
VueUse already owns):

- `useDragSource(target, { data, group, disabled, delay, activation,
onStart, onEnd })` → `{ isDragging, start }`
- `useDropTarget(target, { group, disabled, onDrop })` →
  `{ isDragging, isOver }`

Prefer `<orio-draggable>` / `<orio-drop-zone>`; their agent docs list the
behavior rules.

## Invariants

- **Must run in a setup / effect scope** — listeners use
  `useEventListener`; a live drag ends on scope dispose.
- **Module-level shared state:** one `activeDrag`, one `hoveredZone`, and a
  `Map` of registered targets. Sources and targets find each other through
  it, not provide/inject, so they can live anywhere in the tree.
- **Options accept refs or getters.** `data` and `group` are read at drag
  start; target `group` / `disabled` are read on every move.
- **Element listeners attach after the mount flush** (VueUse watches the
  ref) — tests must `await nextTick()` after mounting.
- **`activation: "manual"`** — pointerdown only records the press; no
  movement threshold or touch timer. `start()` begins the drag at the press
  position; no-op without a press, while any drag is active, or when
  disabled. On release the zone is re-read at the release point.
  `Draggable activation="longpress"` drives it from `useLongPress`.
- **`isDragging` is cast to `Readonly<Ref<boolean>>`** — bare
  `readonly(ref)` emits as `ReadonlyMap<K, V>` in the built `.d.ts`
  (same cast in `useLongPress`).
- **Pointer events, not HTML5 drag** — native drag is unreliable on touch
  and its ghost cannot be styled. `dragstart` inside a source is prevented.
