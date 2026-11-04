# Drag and drop

Two wrappers. Anything inside `<orio-draggable>` can be dragged; anything
inside `<orio-drop-zone>` accepts the drop. The draggable carries a `data`
value, the zone hands it to `@drop`, and your code decides what moves where.

Works with mouse, pen and touch. On touch the drag starts after a short hold,
so a quick swipe still scrolls the page.

## Live Demo

<script setup>
import { ref } from 'vue'

const columns = ref([
  { name: 'To do', tasks: ['Write specs', 'Pick a font'] },
  { name: 'Doing', tasks: ['Build the board'] },
  { name: 'Done', tasks: [] },
])

function moveTask({ task, from }, to) {
  if (from === to) return
  columns.value[from].tasks = columns.value[from].tasks.filter((item) => item !== task)
  columns.value[to].tasks.push(task)
}

const files = ref(['report.pdf', 'notes.txt', 'photo.jpg'])
const deleted = ref([])

function deleteFile(file) {
  files.value = files.value.filter((item) => item !== file)
  deleted.value.push(file)
}

function restoreFiles() {
  files.value.push(...deleted.value)
  deleted.value = []
}
</script>

### Move cards between columns

<div class="demo-container">
  <div class="demo-row" style="align-items: stretch;">
    <orio-drop-zone
      v-for="(column, columnIndex) in columns"
      :key="column.name"
      group="tasks"
      style="flex: 1; min-width: 140px;"
      @drop="(data) => moveTask(data, columnIndex)"
    >
      <template #default="{ isOver }">
        <div
          :style="{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            minHeight: '160px',
            padding: '0.75rem',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-md)',
            background: isOver ? 'var(--color-accent-soft)' : 'var(--color-surface)',
          }"
        >
          <orio-view-text type="subtitle">{{ column.name }}</orio-view-text>
          <orio-draggable
            v-for="task in column.tasks"
            :key="task"
            :data="{ task, from: columnIndex }"
            group="tasks"
          >
            <div style="display: flex; align-items: center; gap: 0.25rem;">
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
  </div>
</div>

### Drag to delete

`isDragging` is true in every zone that accepts the current drag, so the bin
can show itself only when it is useful.

<div class="demo-container">
  <div class="demo-row">
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
  </div>
  <div class="demo-row">
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
    <orio-button v-if="deleted.length" variant="subdued" @click="restoreFiles">
      Restore {{ deleted.length }}
    </orio-button>
  </div>
</div>

## Usage

```vue
<template>
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
</template>

<script setup>
const columns = ref([
  { name: "To do", tasks: ["Write specs", "Pick a font"] },
  { name: "Doing", tasks: ["Build the board"] },
  { name: "Done", tasks: [] },
]);

function moveTask({ task, from }, to) {
  if (from === to) return;
  columns.value[from].tasks = columns.value[from].tasks.filter(
    (item) => item !== task,
  );
  columns.value[to].tasks.push(task);
}
</script>
```

### Drag to delete

```vue
<template>
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
</template>
```

## Draggable

### Props

| Prop         | Type                    | Default       | Description                                                                               |
| ------------ | ----------------------- | ------------- | ----------------------------------------------------------------------------------------- |
| `data`       | `unknown`               | `undefined`   | Handed to the zone's `drop` event                                                         |
| `group`      | `string`                | `undefined`   | Only zones with the same group, or none, accept it                                        |
| `disabled`   | `boolean`               | `false`       | Cannot be dragged; clicks inside work as usual                                            |
| `activation` | `"auto" \| "longpress"` | `"auto"`      | `longpress`: every pointer holds first, with the long-press shrink and Safari force click |
| `delay`      | `number`                | `300` / `500` | Hold in ms: touch hold for `auto`, long press for `longpress`                             |

### Events

| Event        | Payload              | Description                                      |
| ------------ | -------------------- | ------------------------------------------------ |
| `drag-start` | `(data: unknown)`    | The drag began                                   |
| `drag-end`   | `(dropped: boolean)` | The drag ended; `true` when a zone took the drop |

### Slot props

| Prop         | Type      | Description                |
| ------------ | --------- | -------------------------- |
| `isDragging` | `boolean` | This item is being dragged |

## DropZone

### Props

| Prop       | Type      | Default     | Description                                             |
| ---------- | --------- | ----------- | ------------------------------------------------------- |
| `group`    | `string`  | `undefined` | Accept only draggables of this group; unset accepts all |
| `disabled` | `boolean` | `false`     | Accepts nothing                                         |

### Events

| Event  | Payload                                | Description                                      |
| ------ | -------------------------------------- | ------------------------------------------------ |
| `drop` | `(data: unknown, event: PointerEvent)` | An accepted draggable was released over the zone |

### Slot props

| Prop         | Type      | Description                                    |
| ------------ | --------- | ---------------------------------------------- |
| `isDragging` | `boolean` | A drag this zone accepts is under way anywhere |
| `isOver`     | `boolean` | That drag is over this zone right now          |

## Behavior

- **Mouse and pen**: the drag starts once the pointer moves 5px. A plain click
  still clicks.
- **Touch**: hold for 300ms without moving, then drag. Moving earlier scrolls
  the page instead; once the drag starts the page stops scrolling. `delay`
  changes the hold.
- **`activation="longpress"`**: mouse, pen and touch all hold first (500ms
  by default). The item shrinks while held, as in `<orio-long-press>`, and a
  Safari force click starts the drag at once.
- A copy of the item follows the pointer; the original stays in place at 40%
  opacity. The copy is moved to `<body>`, so styles that depend on its parent
  (`.column .card`) do not reach it.
- The zone under the pointer wins. With nested zones the innermost accepting
  one gets the drop; a zone of another group is skipped.
- The click that ends a drag is swallowed, so a dragged button does not also
  activate.
- `Escape` cancels a drag; `drag-end` reports `false`.
- Nothing moves on its own. Update your data in `@drop`.
- The zone draws a dashed accent outline while a drag is over it.

## Accessibility

Dragging has no keyboard equivalent. Give every drop action another path too,
like the move arrows and delete buttons in the demos above.
