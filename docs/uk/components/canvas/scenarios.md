# Сценарії Canvas

Проп `setup` дає змогу заповнити полотно початковим вмістом ще до того, як користувач
почне з ним працювати. Вважайте це сценарієм — наперед налаштованим початковим станом,
що може містити текстові підписи, фігури, напрямні чи вузли будь-якого типу.

## Живе демо — налаштування із зображенням

<script setup>
import { ref, shallowRef } from "vue";
import { drawTool } from "../../../../src/runtime/components/Canvas/tools/drawTool";
import { textTool } from "../../../../src/runtime/components/Canvas/tools/textTool";
import { eraseTool } from "../../../../src/runtime/components/Canvas/tools/eraseTool";
import { moveTool } from "../../../../src/runtime/components/Canvas/tools/moveTool";
import { transformTool } from "../../../../src/runtime/components/Canvas/tools/transformTool";
import { imageTool } from "../../../../src/runtime/components/Canvas/tools/imageTool";
import { undoTool } from "../../../../src/runtime/components/Canvas/tools/undoTool";
import { redoTool } from "../../../../src/runtime/components/Canvas/tools/redoTool";
import { clearTool } from "../../../../src/runtime/components/Canvas/tools/clearTool";
import { colorPickerTool } from "../../../../src/runtime/components/Canvas/tools/colorPickerTool";

const nodes = ref([]);
const tools = shallowRef([
  drawTool({ color: "#1f7aec", size: 4 }),
  textTool({ fontSize: 24, color: "#222" }),
  eraseTool({ radius: 12 }),
  moveTool(),
  transformTool(),
  imageTool(),
  colorPickerTool({ color: "#1f7aec", targets: ["draw", "text"] }),
  undoTool(),
  redoTool(),
  clearTool(),
]);

async function onSetup(api) {
  const { width: cw, height: ch } = api.size();
  const w = 200;
  const h = 200;

  const img = new Image();
  img.src = "/samples/ball.png";

  await new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject();
  });

  api.addNode({
    type: "image",
    x: (cw - w) / 2,
    y: (ch - h) / 2,
    width: w,
    height: h,
    frozen: true,
    data: {
      src: img.src,
      naturalHeight: img.naturalHeight,
      naturalWidth: img.naturalWidth,
    },
  });

  api.addNode({
    type: "text",
    x: 200,
    y: 20,
    frozen: true,
    data: {
      text: "Малюйте поверх зображення!",
      fontSize: 18,
      fontFamily: "system-ui, sans-serif",
      color: "#999",
      weight: "normal",
    },
  });
}
</script>

<div class="demo-container">
  <orio-canvas
    name="frozen-bg"
    v-model:nodes="nodes"
    :tools="tools"
    :setup="onSetup"
    :width="640"
    :height="360"
    background="#f7f8fa"
    style="border: 1px solid var(--vp-c-border); border-radius: 8px;"
  >
    <orio-canvas-toolbar canvas="frozen-bg" />
    <orio-canvas-stage />
  </orio-canvas>
  <p style="font-size: 0.875rem; opacity: 0.7;">
    Вузлів на полотні: {{ nodes.length }}
  </p>
</div>

> Зображення м'ячика завантажується під час асинхронного `setup` і центрується на полотні.
> І зображення, і текстовий підпис **заморожені** — вони слугують неінтерактивним
> фоном. Спробуйте малювати поверх них інструментом **Draw**.

## Базове використання

Передайте функцію в `setup`. Вона отримує повний `CanvasToolApi` і виконується один раз
під час монтування:

```vue
<script setup>
import { ref, shallowRef } from "vue";
import { drawTool, textTool, eraseTool, undoTool, redoTool } from "orio-ui/canvas";

const nodes = ref([]);
const tools = shallowRef([
  drawTool(),
  textTool(),
  eraseTool(),
  undoTool(),
  redoTool(),
]);

function onSetup(api) {
  api.addNode({
    type: "text",
    x: 100,
    y: 40,
    data: {
      text: "Welcome to the canvas!",
      fontSize: 24,
      fontFamily: "system-ui, sans-serif",
      color: "#333",
      weight: "bold",
    },
  });
}
</script>

<template>
  <orio-canvas name="editor" v-model:nodes="nodes" :tools="tools" :setup="onSetup">
    <orio-canvas-toolbar canvas="editor" />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

Вузли, додані під час налаштування, поводяться як будь-які інші — користувач може переміщувати, стирати
їх чи взаємодіяти з ними за допомогою зареєстрованих вами інструментів.

## Заморожені вузли

Задайте вузлу `frozen: true`, щоб захистити його від інструментів взаємодії. Гумка
його не видалить, інструмент переміщення не зможе його потягти, а інструмент підсвічування не
покаже його меж. Використовуйте для фонового вмісту, який користувач має бачити, але не
змінювати.

```ts
function onSetup(api) {
  // Frozen instruction label
  api.addNode({
    type: "text",
    x: 50,
    y: 30,
    frozen: true,
    data: {
      text: "Sign here ↓",
      fontSize: 18,
      fontFamily: "system-ui",
      color: "#888",
      weight: "normal",
    },
  });

  // Frozen guide line (draw node)
  api.addNode({
    type: "draw",
    x: 0,
    y: 0,
    frozen: true,
    data: {
      points: [
        { x: 50, y: 200 },
        { x: 550, y: 200 },
      ],
      color: "#ddd",
      size: 1,
      opacity: 1,
      brush: "pen",
    },
  });
}
```

## Будь-який тип вузла незалежно від інструментів

Панель інструментів визначає, що може робити **користувач**. Налаштування може додавати вузли будь-якого типу
незалежно від того, які інструменти зареєстровано. Наприклад, можна додати текстові вузли,
навіть якщо `textTool` немає в списку інструментів, — текст відрендериться, але користувач
не зможе створювати нові текстові вузли.

```ts
const tools = shallowRef([drawTool(), eraseTool()]);

function onSetup(api) {
  // Add a text label even though textTool isn't registered
  api.addNode({
    type: "text",
    x: 200,
    y: 20,
    frozen: true,
    data: {
      text: "Draw something below",
      fontSize: 20,
      fontFamily: "system-ui, sans-serif",
      color: "#666",
      weight: "normal",
    },
  });
}
```

## Асинхронне налаштування

`setup` може повертати проміс. Полотно чекає на його завершення, перш ніж
скинути базову точку історії, — тож усі асинхронні вузли є частиною початкового
стану й не вважаються діями, які можна скасувати.

```ts
async function onSetup(api) {
  const res = await fetch("/api/canvas-template");
  const template = await res.json();

  for (const node of template.nodes) {
    api.addNode(node);
  }
}
```

## Базова точка історії

Після завершення `setup` (синхронного чи асинхронного) базова точка історії скидається. Це
означає:

- Вузли, додані під час налаштування, — це «початковий стан»
- Перша дія користувача після налаштування — перший крок, який можна скасувати
- Скасування не видалить початкових вузлів

## Умовні сценарії

Оскільки `setup` — це звичайна функція, її можна зробити умовною:

```vue
<script setup>
import { ref, shallowRef } from "vue";
import { drawTool, textTool, undoTool, redoTool } from "orio-ui/canvas";

const props = defineProps<{
  mode: "blank" | "guided" | "template";
}>();

const nodes = ref([]);
const tools = shallowRef([drawTool(), textTool(), undoTool(), redoTool()]);

function onSetup(api) {
  if (props.mode === "guided") {
    api.addNode({
      type: "text",
      x: 100,
      y: 40,
      frozen: true,
      data: {
        text: "Follow the dotted line:",
        fontSize: 18,
        fontFamily: "system-ui",
        color: "#888",
        weight: "normal",
      },
    });
  }

  if (props.mode === "template") {
    // Pre-populate with editable content
    api.addNode({
      type: "text",
      x: 200,
      y: 100,
      data: {
        text: "Edit me",
        fontSize: 32,
        fontFamily: "system-ui",
        color: "#333",
        weight: "bold",
      },
    });
  }

  // "blank" mode — setup runs but adds nothing
}
</script>

<template>
  <orio-canvas name="editor" v-model:nodes="nodes" :tools="tools" :setup="onSetup">
    <orio-canvas-toolbar canvas="editor" />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

## Шари через zIndex

Керуйте порядком малювання через `zIndex` вузлів. Більші значення рендеряться згори.

```ts
function onSetup(api) {
  // Background rectangle (lowest layer)
  api.addNode({
    type: "rectangle",
    x: 50,
    y: 50,
    width: 300,
    height: 200,
    zIndex: 0,
    frozen: true,
    data: { fill: "#f0f0f0", stroke: "#ccc", strokeWidth: 1 },
  });

  // Foreground label (above the rectangle)
  api.addNode({
    type: "text",
    x: 100,
    y: 130,
    zIndex: 10,
    frozen: true,
    data: {
      text: "Draw inside this box",
      fontSize: 16,
      fontFamily: "system-ui",
      color: "#999",
      weight: "normal",
    },
  });
}
```

Користувач може змінювати порядок незаморожених вузлів інструментом переміщення клавішами
<kbd>[</kbd> / <kbd>]</kbd>.

## Відновлення збереженого стану

Поєднайте `setup` з `v-model:nodes`, щоб відновити раніше збережене полотно:

```vue
<script setup>
import { ref } from "vue";

const nodes = ref([]);

function onSetup(api) {
  const saved = localStorage.getItem("my-canvas");
  if (saved) {
    const restored = JSON.parse(saved);
    for (const node of restored) {
      api.addNode(node);
    }
  }
}
</script>

<template>
  <orio-canvas name="editor" v-model:nodes="nodes" :setup="onSetup">
    <orio-canvas-toolbar canvas="editor" />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

> **Порада:** оскільки `addNode` автоматично генерує id, відновлені вузли отримають нові id.
> Якщо потрібні стабільні id (наприклад, для спільного редагування), передайте оригінальний
> `id` в об'єкті вузла — `addNode` враховує явно задані id.

## Попереднє завантаження зображень

Під час налаштування можна додавати вузли зображень, передаючи `src` (будь-який URL або data URL)
разом із натуральними розмірами зображення. Рендерер `imageTool` автоматично декодує
й намалює їх.

```vue
<script setup>
import { ref, shallowRef } from "vue";
import {
  drawTool,
  eraseTool,
  moveTool,
  transformTool,
  imageTool,
  undoTool,
  redoTool,
} from "orio-ui/canvas";

const nodes = ref([]);
const tools = shallowRef([
  drawTool(),
  eraseTool(),
  moveTool(),
  transformTool(),
  imageTool(),
  undoTool(),
  redoTool(),
]);

/** Convert an HTMLImageElement to a data URL for inline decoding. */
function toDataUrl(img) {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  c.getContext("2d").drawImage(img, 0, 0);
  return c.toDataURL("image/png");
}

async function onSetup(api) {
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Failed to load image"));
    el.src = "/images/sample-background.png";
  });

  // Convert to data URL so the node is self-contained and
  // imageTool's render cache decodes it without a second fetch.
  const src = toDataUrl(img);

  const { width: cw, height: ch } = api.size();
  const maxSize = 300;
  const scale = Math.min(
    1,
    maxSize / Math.max(img.naturalWidth, img.naturalHeight),
  );
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;

  api.addNode({
    type: "image",
    x: (cw - w) / 2,
    y: (ch - h) / 2,
    width: w,
    height: h,
    frozen: true,
    data: {
      src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      alt: "Background image",
    },
  });
}
</script>

<template>
  <orio-canvas name="editor" v-model:nodes="nodes" :tools="tools" :setup="onSetup">
    <orio-canvas-toolbar canvas="editor" />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

Перетворення на data URL гарантує, що дані зображення вбудовані у вузол. Коли
кеш рендеру `imageTool` декодує його, дані вже на місці — другий мережевий
запит не потрібен.

> **Порада:** задайте `frozen: true`, якщо зображення має бути неінтерактивним
> фоном. Приберіть, якщо користувачі мають переміщувати, змінювати розмір чи видаляти зображення.

## Довідник API

Функція `setup` отримує той самий `CanvasToolApi`, що й інструменти. Найкорисніші
методи для сценаріїв:

| Метод                 | Опис                                               |
| --------------------- | -------------------------------------------------- |
| `api.addNode(node)`   | Додати вузол. Повертає створений вузол з id.       |
| `api.nodes`           | Прочитати поточні вузли (корисно для умовної логіки). |
| `api.size()`          | Отримати розміри полотна для центрування вмісту.   |
| `api.requestRender()` | Примусово перемалювати (у setup потрібно рідко).   |

Повний довідник `CanvasToolApi` — у [Розширенні Canvas](./extending.md).
