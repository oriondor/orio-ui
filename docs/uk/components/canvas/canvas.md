# Canvas

Розширюваний майданчик у дусі tiptap, побудований на одному HTML-елементі `<canvas>`.
Ядро володіє поверхнею, сховищем вузлів, циклом рендеру й диспетчеризацією вказівника —
усе інше (інструменти, панелі, типи вузлів, елементи інтерфейсу) реєструєте ви.

**За замовчуванням інструментів немає.** Ви явно вказуєте кожен інструмент, який
має бути на полотні, — малювання, текст, скасування, повтор, очищення, вибір кольору чи власні
інструменти. Як створювати власні інструменти, див. у [Розширенні Canvas](./extending.md).

## Живе демо

<script setup>
import { ref, shallowRef } from "vue";
import { drawTool } from "../../../../src/runtime/components/Canvas/tools/drawTool";
import { textTool } from "../../../../src/runtime/components/Canvas/tools/textTool";
import { eraseTool } from "../../../../src/runtime/components/Canvas/tools/eraseTool";
import { undoTool } from "../../../../src/runtime/components/Canvas/tools/undoTool";
import { redoTool } from "../../../../src/runtime/components/Canvas/tools/redoTool";
import { clearTool } from "../../../../src/runtime/components/Canvas/tools/clearTool";
import { colorPickerTool } from "../../../../src/runtime/components/Canvas/tools/colorPickerTool";
import { moveTool } from "../../../../src/runtime/components/Canvas/tools/moveTool";
import { highlightTool } from "../../../../src/runtime/components/Canvas/tools/highlightTool";
import { rotateTool } from "../../../../src/runtime/components/Canvas/tools/rotateTool";
import { resizeTool } from "../../../../src/runtime/components/Canvas/tools/resizeTool";
import { transformTool } from "../../../../src/runtime/components/Canvas/tools/transformTool";
import { imageTool } from "../../../../src/runtime/components/Canvas/tools/imageTool";
import { exportTool } from "../../../../src/runtime/components/Canvas/tools/exportTool";

const tools = shallowRef([
  drawTool({ color: "#1f7aec", size: 5 }),
  textTool({ fontSize: 28, color: "#222" }),
  eraseTool({ radius: 12 }),
  moveTool(),
  rotateTool(),
  resizeTool(),
  transformTool(),
  highlightTool(),
  imageTool(),
  colorPickerTool({ color: "#1f7aec", targets: ["draw", "text"] }),
  undoTool(),
  redoTool(),
  clearTool(),
  exportTool({ filename: "canvas-demo" }),
]);

const nodes = ref([]);

function onSetup(api) {
  api.addNode({
    type: "text",
    x: 220,
    y: 30,
    frozen: true,
    data: {
      text: "Малюйте тут! (цей текст заморожено)",
      fontSize: 20,
      fontFamily: "system-ui, sans-serif",
      color: "#999",
      weight: "normal",
    },
  });
}
</script>

<div class="demo-container">
  <orio-canvas
    name="demo"
    v-model:nodes="nodes"
    :tools="tools"
    :setup="onSetup"
    :width="640"
    :height="360"
    background="#f7f8fa"
    style="border: 1px solid var(--vp-c-border); border-radius: 8px;"
  >
    <orio-canvas-toolbar canvas="demo" />
    <orio-canvas-stage />
  </orio-canvas>
  <p style="font-size: 0.875rem; opacity: 0.7;">
    Вузлів на полотні: {{ nodes.length }}
  </p>
</div>

> Оберіть інструмент **Draw** і тягніть, щоб малювати, або **Text** і клікніть
> будь-де, щоб додати текст. <kbd>Enter</kbd> підтверджує, <kbd>Esc</kbd>
> скасовує. <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Z</kbd> — скасування дії. Спробуйте **Transform**
> — клікніть вузол, щоб виділити його, а потім тягніть кути для зміни розміру, верхнє коло для
> обертання або сам вузол для переміщення.

## Швидкий старт

```vue
<script setup>
import { ref, shallowRef } from "vue";
import {
  drawTool,
  textTool,
  eraseTool,
  moveTool,
  undoTool,
  redoTool,
  clearTool,
} from "orio-ui/canvas";

const nodes = ref([]);
const tools = shallowRef([
  drawTool(),
  textTool(),
  eraseTool(),
  moveTool(),
  undoTool(),
  redoTool(),
  clearTool(),
]);
</script>

<template>
  <orio-canvas
    name="editor"
    v-model:nodes="nodes"
    :tools="tools"
    :width="800"
    :height="500"
  >
    <orio-canvas-toolbar canvas="editor" />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

Ви явно перелічуєте кожен інструмент — без них полотно нічого не робить.

## Пропси

| Проп          | Тип               | За замовчуванням            | Опис                                                     |
| ------------- | ----------------- | --------------------------- | -------------------------------------------------------- |
| `tools`       | `CanvasTool[]`    | `[]`                        | Інструменти, доступні на полотні. За замовчуванням порожньо. |
| `width`       | `number`          | `800`                       | Ширина поверхні малювання в CSS-пікселях.                |
| `height`      | `number`          | `500`                       | Висота поверхні малювання в CSS-пікселях.                |
| `defaultTool` | `string`          | id першого інструмента взаємодії | id інструмента, активного на початку.                    |
| `background`  | `string`          | `"transparent"`             | CSS-фон обгортки.                                        |
| `maxHistory`  | `number`          | `50`                        | Максимальна кількість кроків скасування.                 |
| `setup`       | `(api) => void \| Promise<void>` | —              | Викликається один раз під час монтування, щоб додати початкові вузли. |

## Модель

| Модель    | Тип            | Опис                                                   |
| --------- | -------------- | ------------------------------------------------------ |
| `nodes`   | `CanvasNode[]` | Список вузлів для збереження. Використовуйте `v-model:nodes` для двобічного зв'язку. |

## Слот за замовчуванням

Слот за замовчуванням дає змогу замінити весь макет (позицію панелі інструментів, додаткові
елементи тощо). Якщо вміст слоту не передано, полотно автоматично рендерить
`<Toolbar />` і `<Stage />`.

Викликайте `useCanvasContext()` у будь-якому дочірньому компоненті, щоб отримати повний API
полотна.

```vue
<orio-canvas name="editor" :width="600" :height="400">
  <header style="display: flex; justify-content: space-between;">
    <orio-canvas-toolbar canvas="editor" />
  </header>
  <orio-canvas-stage />
</orio-canvas>
```

## Підкомпоненти

`<orio-canvas>` складається з кількох невеликих SFC, які можна компонувати
вручну в слоті за замовчуванням:

- **`<orio-canvas-toolbar>`** — рендерить по одному `<orio-canvas-tool-button>` на
  інструмент. Слот надає `{ tools, activeToolId, setActiveTool }`.
- **`<orio-canvas-stage>`** — власне елемент `<canvas>` з диспетчеризацією
  вказівника, обробкою клавіатури та рендером з урахуванням DPR.
- **`<orio-canvas-tool-button>`** — кнопка одного інструмента, обгорнута в
  `<orio-tooltip>`. Для інструментів взаємодії/дій рендерить `<orio-button>`
  з `appearance="minimal"`. Інструменти-віджети рендерять свій компонент `toolbar`
  напряму. Слот за замовчуванням надає `{ tool, isActive, activate }`.

`<orio-canvas-stage>` і `<orio-canvas-tool-button>` викликають `useCanvasContext()`
всередині, тож працюють лише всередині батьківського `<orio-canvas>`.

`<orio-canvas-toolbar>` знаходить своє полотно через проп `canvas`, який має
збігатися з `name` елемента `<orio-canvas>`, змонтованого будь-де в застосунку — у шапці,
бічній панелі, модальному вікні, на зовсім іншому маршруті. Панель **не** мусить бути
нащадком полотна.

### Поведінка ToolButton

- **Інструменти взаємодії** — клік активує інструмент. Кнопка має
  `variant="primary"`, коли активна, інакше — `variant="subdued"`.
- **Інструменти дій** — клік викликає `tool.action(api)`. Кнопка вимкнена, коли
  `tool.disabled(api)` повертає true.
- **Інструменти-віджети** — рендерять `<component :is="tool.toolbar" :tool="tool" />`
  замість кнопки.
- **Підказки** — кожна кнопка обгорнута в `<orio-tooltip>`. Якщо інструмент має
  компонент `tooltip`, він рендериться в слоті `#content`. Інакше показується
  `label` інструмента. Підказка автоматично ховається під час кліку й знову з'являється, коли
  курсор іде з кнопки.

### Перевизначення кнопок панелі

```vue
<orio-canvas name="editor" v-slot>
  <orio-canvas-toolbar
    canvas="editor"
    v-slot="{ tools, activeToolId, setActiveTool }"
  >
    <orio-button
      v-for="tool in tools"
      :key="tool.id"
      appearance="minimal"
      :variant="tool.id === activeToolId ? 'primary' : 'subdued'"
      @click="setActiveTool(tool.id)"
    >
      <orio-icon v-if="tool.icon" :name="tool.icon" />
      {{ tool.label }}
    </orio-button>
  </orio-canvas-toolbar>
  <orio-canvas-stage />
</orio-canvas>
```

### Перевизначення вмісту підказки

```vue
<orio-canvas-tool-button :tool="myTool">
  <template #tooltip>
    <orio-view-text type="title" size="medium">Custom tip</orio-view-text>
  </template>
</orio-canvas-tool-button>
```

## Початкове налаштування (сценарії)

Проп `setup` заповнює полотно початковим вмістом — текстовими підписами,
фігурами, фоновими малюнками тощо. Вузли, додані під час налаштування, можуть мати `frozen: true`,
щоб заблокувати їх від взаємодії з користувачем (гумка, переміщення й підсвічування
пропускають заморожені вузли).

Панель інструментів визначає, що може робити **користувач**. Налаштування може додавати вузли будь-якого типу
незалежно від того, які інструменти зареєстровано.

```vue
<script setup>
import { drawTool, eraseTool } from "orio-ui/canvas";
import { shallowRef } from "vue";

const tools = shallowRef([drawTool(), eraseTool()]);

function onSetup(api) {
  // Add a frozen label the user can't erase or move
  api.addNode({
    type: "text",
    x: 100,
    y: 40,
    frozen: true,
    data: {
      text: "Sign here ↓",
      fontSize: 18,
      fontFamily: "system-ui",
      color: "#888",
      weight: "normal",
    },
  });
}
</script>

<template>
  <orio-canvas name="editor" :tools="tools" :setup="onSetup">
    <orio-canvas-toolbar canvas="editor" />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

`setup` також приймає асинхронну функцію — корисно, якщо треба завантажити зображення чи
отримати початкові дані перед додаванням вузлів. Після завершення налаштування базова точка
історії скидається, тож початкові вузли не вважаються дією, яку можна скасувати.

Більше патернів — умовні сценарії, асинхронне завантаження, шари, відновлення
збереженого стану — у [Сценаріях Canvas](./scenarios.md).

## Робота з вузлами

Вузли — це прості об'єкти, які можна серіалізувати, зберігати й відновлювати:

```ts
interface CanvasNode<TData = unknown> {
  id: string;
  type: string;        // matches the tool that owns this node
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  frozen?: boolean;
  zIndex?: number;
  data: TData;         // tool-specific payload (stroke points, text content, ...)
}
```

### Збереження й завантаження

```vue
<script setup>
import { ref, watch } from "vue";

const nodes = ref([]);

// Restore from localStorage
const saved = localStorage.getItem("my-canvas");
if (saved) {
  try {
    nodes.value = JSON.parse(saved);
  } catch {
    // Ignore malformed data — start with an empty canvas.
  }
}

watch(nodes, (next) => {
  localStorage.setItem("my-canvas", JSON.stringify(next));
}, { deep: true });
</script>

<template>
  <orio-canvas name="editor" v-model:nodes="nodes">
    <orio-canvas-toolbar canvas="editor" />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

### Заморожування вузлів

`frozen: true` не дає інструментам взаємодії впливати на вузол. Гумка
пропускає заморожені вузли, інструмент переміщення не може їх захопити, а інструмент підсвічування
не показує їхніх меж. Використовуйте для фонових підписів, водяних знаків чи
шаблонного вмісту, який користувач не має змінювати.

## Вбудовані інструменти

Кожен інструмент — це фабрична функція, яку ви імпортуєте й викликаєте. Є три види:

- **Інструменти взаємодії** (`drawTool`, `textTool`, `eraseTool`, `moveTool`, `rotateTool`, `resizeTool`, `transformTool`, `highlightTool`) — стають активним інструментом і отримують події вказівника. Гумка й переміщення підсвічують ціль під час наведення; rotate/resize/transform працюють за моделлю «клікни, щоб виділити» й малюють маркери навколо виділеного вузла. `transformTool` поєднує переміщення, зміну розміру й обертання в одному диспетчері.
- **Інструменти дій** (`undoTool`, `redoTool`, `clearTool`, `imageTool`, `exportTool`) — спрацьовують на клік і ніколи не стають активними. Їх можна вимикати. `imageTool` відкриває вибір файлу (PNG, JPEG, WebP, GIF, SVG, AVIF, BMP) і додає файл як вузол `image`. `exportTool` завантажує полотно як PNG, JPEG або WebP.
- **Інструменти-віджети** (`colorPickerTool`) — рендерять на панелі власний компонент замість кнопки.

Усі вбудовані інструменти постачаються з компонентами підказок (на основі `orio-view-text` і
`orio-view-key-binds`), що під час наведення показують опис і гарячі клавіші.

### Підключення інструментів

Імпортуйте потрібні фабрики й передайте їх масивом у `shallowRef`:

```ts
import {
  drawTool,
  textTool,
  eraseTool,
  moveTool,
  rotateTool,
  resizeTool,
  transformTool,
  highlightTool,
  imageTool,
  exportTool,
  colorPickerTool,
  undoTool,
  redoTool,
  clearTool,
} from "orio-ui/canvas";

const tools = shallowRef([
  // Interaction tools — order determines toolbar button order
  drawTool({ color: "#1f7aec", size: 5 }),
  textTool({ fontSize: 28, color: "#222" }),
  eraseTool({ radius: 12 }),
  moveTool(),
  rotateTool(),
  resizeTool(),
  transformTool(),
  highlightTool(),

  // Widget tools
  colorPickerTool({ color: "#1f7aec", targets: ["draw", "text"] }),

  // Action tools
  imageTool(),
  exportTool({ format: "png", filename: "my-canvas" }),
  undoTool(),
  redoTool(),
  clearTool(),
]);
```

Кожна фабрика приймає необов'язковий об'єкт опцій, що перевизначає значення інструмента
за замовчуванням. Передавайте лише те, що хочете змінити, — решта має розумні значення за замовчуванням.

### `drawTool(options?)`

Вільне перо зі згладжуванням. Рендерить вузол `draw` з масивом точок.

| Опція     | Тип                   | За замовчуванням |
| --------- | --------------------- | ----------- |
| `color`   | `string`              | `"#111111"` |
| `size`    | `number`              | `4`         |
| `opacity` | `number` (0–1)        | `1`         |
| `brush`   | `"pen" \| "marker"`   | `"pen"`     |

### `textTool(options?)`

Клікніть будь-де, щоб додати текст. Відкриває вбудоване поле `<input>` поверх
місця кліку; <kbd>Enter</kbd> підтверджує, <kbd>Esc</kbd> скасовує.

| Опція        | Тип                                  | За замовчуванням      |
| ------------ | ------------------------------------ | --------------------- |
| `fontSize`   | `number`                             | `24`                  |
| `fontFamily` | `string`                             | `"system-ui, sans-serif"` |
| `color`      | `string`                             | `"#111111"`           |
| `weight`     | `"normal" \| "bold" \| number`       | `"normal"`            |

### `eraseTool(options?)`

Інструмент взаємодії. Проведіть над вузлами, щоб стерти їх. Під час наведення підсвічує цільовий вузол
червоним через `renderOverlay`. Враховує `frozen` — заморожені вузли ніколи не
стираються. Для точного визначення використовує метод `hitTest` кожного інструмента; якщо його немає,
використовує обмежувальний прямокутник.

| Option   | Type     | Default |
| -------- | -------- | ------- |
| `radius` | `number` | `10`    |

### `moveTool(options?)`

Інструмент взаємодії. Клікніть і тягніть, щоб переміщувати вузли. Захоплює найвищий незаморожений
вузол під вказівником. Під час наведення підсвічує цільовий вузол через `renderOverlay`.
Вузли малювання переміщує, зсуваючи всі точки.

Натисніть <kbd>]</kbd>, щоб перемістити вузол під курсором чи той, що перетягується, вперед, або <kbd>[</kbd>,
щоб відправити його назад (змінює `zIndex`). Використовує `onKeyDown` — потребує фокусу на stage.

| Option   | Type     | Default |
| -------- | -------- | ------- |
| `radius` | `number` | `10`    |

### `highlightTool(options?)`

Інструмент взаємодії. Наведіть на вузли, щоб побачити пунктирний обмежувальний прямокутник через
`renderOverlay`. Корисно для перевірки позицій вузлів. Пропускає заморожені вузли.
Знімає підсвічування в `onDeactivate`.

| Опція         | Тип      | За замовчуванням               |
| ------------- | -------- | ------------------------------ |
| `radius`      | `number` | `10`                           |
| `strokeColor` | `string` | `"rgba(31, 122, 236, 0.8)"`   |
| `fillColor`   | `string` | `"rgba(31, 122, 236, 0.08)"`  |
| `lineWidth`   | `number` | `2`                            |

### `undoTool()`

Інструмент дії. Викликає `api.undo()`. Вимкнений, коли `api.canUndo` дорівнює false.

### `redoTool()`

Інструмент дії. Викликає `api.redo()`. Вимкнений, коли `api.canRedo` дорівнює false.

### `clearTool()`

Інструмент дії. Викликає `api.clear()`. Вимкнений, коли всі вузли заморожені (або вузлів немає). Заморожені вузли зберігаються.

### `colorPickerTool(options?)`

Інструмент-віджет. Рендерить на панелі нативний `<input>` кольору через властивість-компонент
`toolbar`. Синхронізує вибраний колір з опцією `color`
зазначених цільових інструментів через `api.getToolOptions()`.

| Опція     | Тип        | За замовчуванням |
| --------- | ---------- | ----------- |
| `color`   | `string`   | `"#111111"` |
| `targets` | `string[]` | `[]`        |

```ts
colorPickerTool({ color: "#1f7aec", targets: ["draw", "text"] })
```

### Види інструментів

Створюючи власний інструмент, задайте `kind` в об'єкті інструмента:

```ts
defineCanvasTool({
  id: "my-action",
  label: "Do thing",
  kind: "action",
  action(api) { /* fired on click */ },
  disabled(api) { return false; },
});
```

| Вид             | Поведінка на панелі                           | Отримує події вказівника? |
| --------------- | --------------------------------------------- | ------------------------ |
| `"interaction"` | Перемикає активність через `orio-button` (за замовчуванням) | Так |
| `"action"`      | Викликає `action()` під час кліку через `orio-button` | Ні |
| `"widget"`      | Рендерить компонент `toolbar` напряму         | Ні                       |

#### Власні шрифти

Текстові вузли рендеряться в `<canvas>` через `ctx.fillText`, тож підходить будь-який шрифт,
відомий браузеру. Щоб зареєструвати власний шрифт під час виконання, використовуйте
[`FontFace` API](https://developer.mozilla.org/en-US/docs/Web/API/FontFace):

```ts
const font = new FontFace("Caveat", "url(/fonts/Caveat.woff2)");
await font.load();
document.fonts.add(font);
```

Потім передайте `fontFamily: "Caveat"` у `textTool({ ... })`. Щойно шрифт
додано, наступний `requestRender()` малюватиме ним. Вебшрифти, підключені через
`@font-face` у ваших стилях, теж працюють — лише переконайтеся, що вони завантажилися
до малювання.

## Програмне керування

`<orio-canvas>` відкриває свій API через `defineExpose`, тож template ref дає
вам усе, що мають інструменти:

```vue
<script setup>
import { ref } from "vue";

const canvasRef = ref();

function addLabel() {
  canvasRef.value?.addNode({
    type: "text",
    x: 100,
    y: 100,
    data: {
      text: "Hello",
      fontSize: 32,
      fontFamily: "system-ui",
      color: "#0070f3",
      weight: "bold",
    },
  });
}
</script>

<template>
  <orio-canvas name="editor" ref="canvasRef">
    <orio-canvas-toolbar canvas="editor" />
    <orio-canvas-stage />
  </orio-canvas>
  <orio-button @click="addLabel">Add label</orio-button>
</template>
```

### Відкритий API

| Метод / властивість  | Тип                           | Опис                                       |
| -------------------- | ----------------------------- | ------------------------------------------ |
| `addNode(node)`      | `(node) => CanvasNode`        | Додати вузол на полотно.                   |
| `updateNode(id, patch)` | `(id, patch) => void`      | Оновити вузол за id.                       |
| `removeNode(id)`     | `(id) => void`                | Видалити вузол за id.                      |
| `getNode(id)`        | `(id) => CanvasNode \| undefined` | Знайти вузол за id.                   |
| `clear()`            | `() => void`                  | Видалити всі вузли.                        |
| `nodes`              | `Ref<CanvasNode[]>`           | Реактивний список вузлів.                  |
| `getToolOptions(id)` | `(id) => T`                   | Читати/змінювати реактивні опції інструмента. |
| `activeTool`         | `ComputedRef<CanvasTool \| null>` | Поточний активний інструмент (computed). |
| `setActiveTool(id)`  | `(id: string \| null) => void` | Перемкнути активний інструмент. Викликає `onDeactivate`/`onActivate`. |
| `undo()`             | `() => void`                  | Скасувати останню дію.                     |
| `redo()`             | `() => void`                  | Повторити останню скасовану дію.           |
| `canUndo`            | `ComputedRef<boolean>`        | Чи є що скасовувати.                       |
| `canRedo`            | `ComputedRef<boolean>`        | Чи є що повторювати.                       |

## Скасування / повтор

Вбудовано. Знімки створюються автоматично щоразу, коли змінюється масив вузлів
(додавання, оновлення, видалення, очищення). Дії вказівником (штрихи, перетягування)
групуються в один крок скасування через `beginAction()` / `endAction()` —
знімок робиться, коли вказівник відпущено.

**Клавіатура:** <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Cmd</kbd>+<kbd>Z</kbd> —
скасувати, <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> /
<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> — повторити. Stage має бути
у фокусі (він фокусується автоматично під час натискання вказівника). Обробник `onKeyDown`
активного інструмента виконується першим — якщо він викликає `e.preventDefault()`, комбінація
скасування/повтору не спрацює.

**Програмно:**

```vue
<script setup>
import { ref } from "vue";

const canvasRef = ref();
</script>

<template>
  <orio-canvas name="editor" ref="canvasRef" :max-history="100">
    <orio-canvas-toolbar canvas="editor" />
    <orio-canvas-stage />
  </orio-canvas>

  <orio-button :disabled="!canvasRef?.canUndo" @click="canvasRef?.undo()">
    Undo
  </orio-button>
  <orio-button :disabled="!canvasRef?.canRedo" @click="canvasRef?.redo()">
    Redo
  </orio-button>
</template>
```

**Через інструменти (рекомендовано):**

Просто додайте `undoTool()` і `redoTool()` до списку інструментів — вони рендеряться як
кнопки панелі з автоматичним станом вимкнення й підказками з гарячими клавішами.

Історія обмежена `maxHistory` записами (за замовчуванням 50). Нова дія
після скасування очищає стек повтору — як у будь-якому редакторі.

## Внутрішня архітектура

Компонент полотна побудований із трьох композаблів, кожен з яких відповідає за окрему
задачу. Вони внутрішні для компонента — ви взаємодієте з ними через
пропси, `v-model` і відкритий API.

### `useCanvasHistory`

Керує скасуванням/повтором через знімки стану. Для глибокого клонування використовує
`JSON.parse(JSON.stringify())`.

| Повертає        | Тип                      | Опис                                             |
| --------------- | ------------------------ | ------------------------------------------------ |
| `undo()`        | `() => void`             | Дістати останній знімок і відновити його.         |
| `redo()`        | `() => void`             | Повторно застосувати останній скасований знімок.  |
| `canUndo`       | `ComputedRef<boolean>`   | Чи є записи в стеку скасування.                   |
| `canRedo`       | `ComputedRef<boolean>`   | Чи є записи в стеку повтору.                      |
| `autoCommit()`  | `() => void`             | Зафіксувати, якщо не триває дія вказівником.      |
| `beginAction()` | `() => void`             | Позначити початок перетягування (групує фіксації). |
| `endAction()`   | `() => void`             | Позначити кінець перетягування (фіксує один раз). |
| `resetBaseline()` | `() => void`           | Зробити поточний стан базовим (після налаштування). |
| `onKeyDown(e)`  | `(e: KeyboardEvent) => void` | Обробляє <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>. |

### `useCanvasNodes`

CRUD-операції зі списком вузлів. Кожна зміна викликає колбек `onMutate`,
який запускає `autoCommit` у композаблі історії. Id вузлів генеруються
через `crypto.randomUUID()`. Нові вузли за замовчуванням отримують `zIndex: nodes.value.length`.

| Повертає          | Тип                                            | Опис                           |
| ----------------- | ---------------------------------------------- | ------------------------------ |
| `addNode(node)`   | `(node: Omit<CanvasNode, "id">) => CanvasNode` | Створити вузол з автоматично згенерованим id. |
| `updateNode(id, patch)` | `(id: string, patch: Partial<CanvasNode>) => void` | Злити патч із вузлом. |
| `getNode(id)`     | `(id: string) => CanvasNode \| undefined`      | Знайти вузол за id.            |
| `removeNode(id)`  | `(id: string) => void`                         | Видалити вузол за id.          |
| `clear()`         | `() => void`                                   | Видалити всі вузли.            |

### `useCanvasSetup`

Виконує колбек пропа `setup` один раз в `onMounted`. Підтримує як синхронні, так і асинхронні
функції. Після завершення викликає `resetBaseline()`, тож початкові
вузли не вважаються дією, яку можна скасувати.

### `useCanvasContext`

Надає повний стан полотна будь-якому компоненту-нащадку через
`provide` / `inject` з Vue. Ключ ін'єкції — `Symbol("OrioCanvas")`. Викидає помилку,
якщо викликано поза батьківським `<orio-canvas>`.

```ts
import { useCanvasContext } from "orio-ui/canvas";

const ctx = useCanvasContext();
// ctx.nodes, ctx.activeToolId, ctx.setActiveTool, ctx.getToolApi, ...
```

| Властивість       | Тип                               | Опис                                   |
| ----------------- | --------------------------------- | -------------------------------------- |
| `tools`           | `Ref<CanvasTool[]>`               | Усі зареєстровані інструменти (обчислюються з пропсів). |
| `activeToolId`    | `Ref<string \| null>`             | id поточного активного інструмента.    |
| `setActiveTool`   | `(id: string \| null) => void`    | Перемкнути активний інструмент.        |
| `nodes`           | `Ref<CanvasNode[]>`               | Реактивний список вузлів (`defineModel`). |
| `addNode`         | `(node) => CanvasNode`            | Додати вузол.                          |
| `updateNode`      | `(id, patch) => void`             | Оновити вузол.                         |
| `removeNode`      | `(id) => void`                    | Видалити вузол.                        |
| `getNode`         | `(id) => CanvasNode \| undefined` | Знайти вузол.                          |
| `clear`           | `() => void`                      | Видалити всі вузли.                    |
| `requestRender`   | `() => void`                      | Запланувати перемальовування через `requestAnimationFrame`. |
| `installRenderer` | `(fn: () => void) => void`        | Сюди stage встановлює свою функцію рендеру. |
| `getToolOptions`  | `(id) => T`                       | Читати/змінювати реактивні опції інструмента. |
| `getToolApi`      | `(id) => CanvasToolApi<T>`        | Повний API інструмента для заданого id (кешується за id). |
| `stageEl`         | `Ref<HTMLElement \| null>`        | Кореневий DOM-елемент stage.           |
| `size`            | `Ref<{ width, height }>`          | Розмір полотна в CSS-пікселях (обчислюється з пропсів). |
| `undo`            | `() => void`                      | Скасувати.                             |
| `redo`            | `() => void`                      | Повторити.                             |
| `canUndo`         | `ComputedRef<boolean>`            | Чи доступне скасування.                |
| `canRedo`         | `ComputedRef<boolean>`            | Чи доступний повтор.                   |
| `beginAction`     | `() => void`                      | Почати групу дій вказівником.          |
| `endAction`       | `() => void`                      | Завершити групу дій вказівником.       |
| `onKeyDown`       | `(e: KeyboardEvent) => void`      | Передає подію спершу в `onKeyDown` активного інструмента, потім в обробник скасування/повтору історії. |

## Плани

Те, чого явно **немає** у v1, але до чого архітектура готова:

- **Масштабування й панорамування** — трансформація в'юпорту; інструменти вже працюють у просторі полотна.

Якщо це потрібно вже зараз, напишіть це як інструмент — див.
[Розширення Canvas](./extending.md).
