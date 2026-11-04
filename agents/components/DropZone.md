---
kind: component
category: Layout & containers
purpose: drop zone, drop target, accept dragged items, kanban column, trash bin, drag and drop
short: wrapper that accepts `<orio-draggable>` drops and emits `drop(data, event)`; slot exposes `isDragging` / `isOver`
invariants: true
---

# DropZone — agent-only invariants

`<orio-drop-zone group @drop>` wraps anything (default slot, slot props
`isDragging`, `isOver`). Behavior lives in `useDropTarget`
(`useDragAndDrop.ts`). Not for files — use `<orio-upload>` for those.

## Invariants

- **`drop(data, event: PointerEvent)`** fires only on release over the zone
  with an accepted drag; `accepts` is rechecked at release, so a zone that
  turned `disabled` mid-drag gets nothing. The consumer moves the data.
- **Accepts** when not `disabled` and (`group` unset or equal to the
  draggable's `group`).
- **Hit test is `elementFromPoint`** walked up through ancestors: the
  innermost accepting zone wins; a non-accepting inner zone is skipped in
  favor of an accepting outer one.
- **`isDragging`** is true in every accepting zone while any matching drag
  runs anywhere; **`isOver`** only in the zone under the pointer.
- **Classes:** `.drag-active` (isDragging), `.drag-over` (isOver). The
  wrapper is a plain block `<div>`; `.drag-over` draws a 2px dashed
  `--color-accent` outline, offset 2px.

## Gotchas

- The hit area is the wrapper's box — give it size (`min-height`, flex)
  or an empty column cannot be hit.
- Dropping back on the zone the item came from still emits `drop`; ignore
  it in the handler (`if (from === to) return`).

## Props / events

- Props: `group (undefined)`, `disabled (false)`.
- Events: `drop(data, event)`.

## Quick reference

```vue
<!-- from docs/components/drag-and-drop.md -->
<orio-drop-zone
  v-for="(column, columnIndex) in columns"
  :key="column.name"
  group="tasks"
  @drop="(data) => moveTask(data, columnIndex)"
>
  <template #default="{ isOver }">
    <div class="column" :class="{ highlighted: isOver }">
      <orio-view-text type="subtitle">{{ column.name }}</orio-view-text>
      <orio-draggable
        v-for="task in column.tasks"
        :key="task"
        :data="{ task, from: columnIndex }"
        group="tasks"
      >
        <div class="card">
          <orio-button
            v-if="columnIndex > 0"
            icon="chevron-left"
            variant="subdued"
            :aria-label="`Move ${task} to ${columns[columnIndex - 1].name}`"
            @click="moveTask({ task, from: columnIndex }, columnIndex - 1)"
          />
          <orio-tag :text="task" />
          <orio-button
            v-if="columnIndex < columns.length - 1"
            icon="chevron-right"
            variant="subdued"
            :aria-label="`Move ${task} to ${columns[columnIndex + 1].name}`"
            @click="moveTask({ task, from: columnIndex }, columnIndex + 1)"
          />
        </div>
      </orio-draggable>
    </div>
  </template>
</orio-drop-zone>
```
