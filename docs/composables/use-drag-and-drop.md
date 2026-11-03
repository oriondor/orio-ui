# useDragAndDrop

`useDragSource` and `useDropTarget` power `<orio-draggable>` and
`<orio-drop-zone>`. Use them directly when the wrapper `<div>` gets in the way,
for example to make a table row draggable.

## Live Demo

<script setup>
import { ref } from 'vue'
import { useDragSource, useDropTarget } from '../../src/runtime/composables/useDragAndDrop'

const source = ref(null)
const target = ref(null)
const drops = ref(0)

const { isDragging: isSourceDragging } = useDragSource(source, { data: 'note' })
const { isDragging, isOver } = useDropTarget(target, {
  onDrop: () => drops.value++,
})
</script>

<div class="demo-container">
  <div class="demo-row">
    <div
      ref="source"
      :style="{
        padding: '0.5rem 1rem',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-md)',
        cursor: 'grab',
        userSelect: 'none',
        opacity: isSourceDragging ? 0.4 : 1,
      }"
    >
      <orio-view-text>Drag me</orio-view-text>
    </div>
    <div
      ref="target"
      :style="{
        padding: '2rem',
        border: '1px dashed',
        borderColor: isOver ? 'var(--color-accent)' : 'var(--color-border)',
        borderRadius: 'var(--border-radius-md)',
        opacity: isDragging ? 1 : 0.6,
      }"
    >
      <orio-view-text>Drops: {{ drops }}</orio-view-text>
    </div>
  </div>
</div>

## Usage

```ts
const source = ref<HTMLElement | null>(null);
const target = ref<HTMLElement | null>(null);

const { isDragging } = useDragSource(source, {
  data: () => row.id,
  group: "rows",
  onEnd: (dropped) => console.log(dropped),
});

const { isOver } = useDropTarget(target, {
  group: "rows",
  onDrop: (data, event) => moveRow(data),
});
```

## API

### `useDragSource(target, options)`

| Option     | Type                         | Description                                          |
| ---------- | ---------------------------- | ---------------------------------------------------- |
| `data`     | `MaybeRefOrGetter<unknown>`  | Value handed to the target's `onDrop`                |
| `group`    | `MaybeRefOrGetter<string>`   | Only targets with the same group, or none, accept it |
| `disabled` | `MaybeRefOrGetter<boolean>`  | Cannot be dragged                                    |
| `onStart`  | `(data: unknown) => void`    | The drag began                                       |
| `onEnd`    | `(dropped: boolean) => void` | The drag ended                                       |

Returns `{ isDragging }`.

### `useDropTarget(target, options)`

| Option     | Type                                           | Description                               |
| ---------- | ---------------------------------------------- | ----------------------------------------- |
| `group`    | `MaybeRefOrGetter<string>`                     | Accept only this group; unset accepts all |
| `disabled` | `MaybeRefOrGetter<boolean>`                    | Accepts nothing                           |
| `onDrop`   | `(data: unknown, event: PointerEvent) => void` | An accepted drag was released here        |

Returns `{ isDragging, isOver }`: a matching drag is under way anywhere, and
it is over this target.

The source leaves styling to you. Unlike `<orio-draggable>`, it does not set
`user-select: none` or `cursor: grab`.
