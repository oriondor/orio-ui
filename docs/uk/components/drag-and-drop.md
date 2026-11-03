# Drag and drop

Дві обгортки. Усе всередині `<orio-draggable>` можна перетягувати; усе
всередині `<orio-drop-zone>` приймає скидання. Draggable несе значення `data`,
зона передає його в `@drop`, а що куди переміщати — вирішує ваш код.

Працює з мишею, пером і дотиком. На сенсорному екрані перетягування
починається після короткого утримання, тож швидкий свайп і далі гортає сторінку.

## Живе демо

<script setup>
import { ref } from 'vue'

const columns = ref([
  { name: 'Зробити', tasks: ['Написати специфікацію', 'Обрати шрифт'] },
  { name: 'В роботі', tasks: ['Зібрати дошку'] },
  { name: 'Готово', tasks: [] },
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

### Переміщення карток між колонками

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
            <orio-tag :text="task" />
          </orio-draggable>
        </div>
      </template>
    </orio-drop-zone>
  </div>
</div>

### Перетягніть, щоб видалити

`isDragging` істинний у кожній зоні, що приймає поточне перетягування, тож
кошик може з'являтися лише тоді, коли він потрібен.

<div class="demo-container">
  <div class="demo-row">
    <orio-draggable v-for="file in files" :key="file" :data="file" group="files">
      <orio-button variant="secondary" icon="file">{{ file }}</orio-button>
    </orio-draggable>
  </div>
  <div class="demo-row">
    <orio-drop-zone group="files" @drop="deleteFile">
      <template #default="{ isDragging, isOver }">
        <orio-button
          :variant="isOver ? 'primary' : 'subdued'"
          icon="delete"
          :style="{ opacity: isDragging ? 1 : 0.4 }"
        >
          Скиньте сюди, щоб видалити
        </orio-button>
      </template>
    </orio-drop-zone>
    <orio-button v-if="deleted.length" variant="subdued" @click="restoreFiles">
      Відновити {{ deleted.length }}
    </orio-button>
  </div>
</div>

## Використання

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
          <orio-tag :text="task" />
        </orio-draggable>
      </div>
    </template>
  </orio-drop-zone>
</template>

<script setup>
const columns = ref([
  { name: "Зробити", tasks: ["Написати специфікацію", "Обрати шрифт"] },
  { name: "В роботі", tasks: ["Зібрати дошку"] },
  { name: "Готово", tasks: [] },
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

### Перетягніть, щоб видалити

```vue
<template>
  <orio-draggable v-for="file in files" :key="file" :data="file" group="files">
    <orio-button variant="secondary" icon="file">{{ file }}</orio-button>
  </orio-draggable>

  <orio-drop-zone group="files" @drop="deleteFile">
    <template #default="{ isDragging, isOver }">
      <orio-button
        :variant="isOver ? 'primary' : 'subdued'"
        icon="delete"
        :style="{ opacity: isDragging ? 1 : 0.4 }"
      >
        Скиньте сюди, щоб видалити
      </orio-button>
    </template>
  </orio-drop-zone>
</template>
```

## Draggable

### Пропси

| Проп       | Тип       | Типово      | Опис                                                        |
| ---------- | --------- | ----------- | ----------------------------------------------------------- |
| `data`     | `unknown` | `undefined` | Передається в подію `drop` зони                             |
| `group`    | `string`  | `undefined` | Приймають лише зони з тією ж групою або без групи           |
| `disabled` | `boolean` | `false`     | Перетягувати не можна; кліки всередині працюють як звичайно |

### Події

| Подія        | Аргументи            | Опис                                                  |
| ------------ | -------------------- | ----------------------------------------------------- |
| `drag-start` | `(data: unknown)`    | Перетягування почалося                                |
| `drag-end`   | `(dropped: boolean)` | Перетягування завершилося; `true`, якщо зона прийняла |

### Пропси слота

| Проп         | Тип       | Опис                      |
| ------------ | --------- | ------------------------- |
| `isDragging` | `boolean` | Цей елемент зараз тягнуть |

## DropZone

### Пропси

| Проп       | Тип       | Типово      | Опис                                              |
| ---------- | --------- | ----------- | ------------------------------------------------- |
| `group`    | `string`  | `undefined` | Приймати лише draggable цієї групи; без неї — усі |
| `disabled` | `boolean` | `false`     | Нічого не приймає                                 |

### Події

| Подія  | Аргументи                              | Опис                                     |
| ------ | -------------------------------------- | ---------------------------------------- |
| `drop` | `(data: unknown, event: PointerEvent)` | Прийнятий draggable відпустили над зоною |

### Пропси слота

| Проп         | Тип       | Опис                                           |
| ------------ | --------- | ---------------------------------------------- |
| `isDragging` | `boolean` | Десь триває перетягування, яке ця зона приймає |
| `isOver`     | `boolean` | Це перетягування зараз над зоною               |

## Поведінка

- **Миша й перо**: перетягування починається після зсуву на 5px. Звичайний
  клік лишається кліком.
- **Дотик**: утримуйте 300 мс, не рухаючись, потім тягніть. Рух раніше гортає
  сторінку; щойно перетягування почалося, сторінка перестає гортатися.
- За вказівником рухається копія елемента; оригінал лишається на місці з
  прозорістю 40%. Копія переноситься в `<body>`, тож стилі, що залежать від
  батька (`.column .card`), до неї не доходять.
- Перемагає зона під вказівником. Із вкладених зон скидання отримує найглибша,
  що приймає; зону іншої групи пропущено.
- Клік, яким завершується перетягування, поглинається, тож перетягнута кнопка
  не спрацьовує.
- `Escape` скасовує перетягування; `drag-end` повідомляє `false`.
- Самі по собі дані не переміщуються. Оновлюйте їх у `@drop`.
- Поки над зоною тягнуть елемент, вона малює пунктирну обвідку кольору акценту.

## Доступність

Перетягування не має клавіатурного відповідника. Дайте кожній дії скидання
інший шлях (меню, кнопку «Перемістити»).
