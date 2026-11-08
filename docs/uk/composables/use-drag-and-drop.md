# useDragAndDrop

`useDragSource` і `useDropTarget` працюють під капотом `<orio-draggable>` і
`<orio-drop-zone>`. Використовуйте їх напряму, коли обгортка `<div>` заважає,
наприклад щоб зробити перетягуваним рядок таблиці.

## Живе демо

<script setup>
import { ref } from 'vue'
import { useDragSource, useDropTarget } from '../../../src/runtime/composables/useDragAndDrop'

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
      <orio-view-text>Перетягни мене</orio-view-text>
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
      <orio-view-text>Скинуто: {{ drops }}</orio-view-text>
    </div>
  </div>
</div>

## Використання

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

| Опція        | Тип                                    | Опис                                                                    |
| ------------ | -------------------------------------- | ----------------------------------------------------------------------- |
| `data`       | `MaybeRefOrGetter<unknown>`            | Значення, що потрапляє в `onDrop` цілі                                  |
| `group`      | `MaybeRefOrGetter<string>`             | Приймають лише цілі з тією ж групою або без групи                       |
| `disabled`   | `MaybeRefOrGetter<boolean>`            | Перетягувати не можна                                                   |
| `delay`      | `MaybeRefOrGetter<number>`             | Утримання дотиком у мс до початку; типово `300`                         |
| `activation` | `MaybeRefOrGetter<"auto" \| "manual">` | `manual`: натискання лише готує джерело; викличте `start()`, щоб почати |
| `onStart`    | `(data: unknown) => void`              | Перетягування почалося                                                  |
| `onEnd`      | `(dropped: boolean) => void`           | Перетягування завершилося                                               |

Повертає `{ isDragging, start }`. `start()` починає перетягування для
поточного натискання вказівником (наприклад, з `onTrigger` у `useLongPress`);
без нього або для натискання клавіатурою нічого не робить. Із `useLongPress`
передайте `keyboard: false`, щоб утримання Space не спрацьовувало без
перетягування.

### `useDropTarget(target, options)`

| Опція      | Тип                                            | Опис                                  |
| ---------- | ---------------------------------------------- | ------------------------------------- |
| `group`    | `MaybeRefOrGetter<string>`                     | Приймати лише цю групу; без неї — усе |
| `disabled` | `MaybeRefOrGetter<boolean>`                    | Нічого не приймає                     |
| `onDrop`   | `(data: unknown, event: PointerEvent) => void` | Прийняте перетягування відпущено тут  |

Повертає `{ isDragging, isOver }`: відповідне перетягування триває десь на
сторінці, і воно зараз над цією ціллю.

Джерело не задає стилів. На відміну від `<orio-draggable>`, воно не ставить
`user-select: none` чи `cursor: grab`.
