---
kind: component
category: Layout & containers
purpose: drag and drop, draggable item, drag source, kanban card, drag to reorder between lists, drag to delete
short: wrapper that makes any child draggable with mouse, pen or touch and carries a `data` value to `<orio-drop-zone>`
invariants: true
---

# Draggable — agent-only invariants

`<orio-draggable :data group>` wraps anything (default slot, slot prop
`isDragging`). Behavior lives in `useDragSource` (`useDragAndDrop.ts`);
pair it with `<orio-drop-zone>`. Public docs: `docs/components/drag-and-drop.md`.

## Invariants

- **Nothing moves by itself.** The drop zone emits `drop(data, event)`;
  the consumer updates its own arrays. `data` is read when the drag starts.
- **Start rules:** mouse/pen after 5px of movement; touch after a 300ms
  still hold (moving ≥10px first = a scroll, the drag never starts). Left
  button / primary pointer only; Ctrl+click ignored.
- **Touch scroll is blocked only during a drag** — a window-level
  non-passive `touchmove` calls `preventDefault` while `isDragging`.
- **Ghost:** `cloneNode(true)` of the wrapper, `position: fixed` in
  `<body>`, `pointer-events: none`, moved with `transform`. Parent-dependent
  CSS (`.column .card`) does not reach it; scoped and `:root` styles do.
  The original gets `.dragging` (opacity 0.4).
- **The click after a drag is swallowed** (window capture listener, disarmed
  by the next pointerdown) so a wrapped button does not also fire. Armed on
  release and on Escape (button still down), not on pointercancel; clicks
  with `detail === 0` (keyboard, assistive tech) always pass.
- **Escape / pointercancel / `disabled` turning true** end the drag;
  `drag-end` reports `false`.
- **One drag at a time page-wide** (module-level state). Nested draggables:
  the innermost claims the press.
- **Wrapper is `display: inline-flex`**, `user-select: none`,
  `-webkit-touch-callout: none`, `cursor: grab`. Native `dragstart` inside
  (images, links) is prevented. `<html>` gets `cursor: grabbing` during a drag.

## Gotchas

- Not keyboard-accessible by design. Offer another path to the action.
- `group` must match the zone's `group`; a zone without `group` takes all.
- Text inside a draggable cannot be selected.

## Props / events

- Props: `data (undefined)`, `group (undefined)`, `disabled (false)`.
- Events: `drag-start(data)`, `drag-end(dropped: boolean)`.

## Quick reference

```vue
<!-- from docs/components/drag-and-drop.md -->
<template v-for="file in files" :key="file">
  <orio-draggable :data="file" group="files">
    <orio-button variant="secondary" icon="file">{{ file }}</orio-button>
  </orio-draggable>
  <orio-button
    icon="delete"
    variant="subdued"
    :aria-label="`Delete ${file}`"
    @click="deleteFile(file)"
  />
</template>

<orio-drop-zone group="files" @drop="deleteFile">
  <template #default="{ isDragging, isOver }">
    <orio-button
      :variant="isOver ? 'primary' : 'subdued'"
      icon="delete"
      :style="{ opacity: isDragging ? 1 : 0.4 }"
    >
      Drop here to delete
    </orio-button>
  </template>
</orio-drop-zone>
```
