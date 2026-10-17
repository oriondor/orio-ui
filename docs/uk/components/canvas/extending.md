# Розширення Canvas

`<orio-canvas>` навмисно має тонке ядро. Примітиви малювання, пензлі,
виділення, робота із зображеннями, експорт — усе це написано як **інструменти**, що
підключаються до того самого реєстру, що й вбудовані `drawTool()` і `textTool()`.

Якщо ви працювали з [tiptap](https://tiptap.dev), ментальна модель та сама:
редактор (тут — полотно) володіє станом і диспетчеризацією; розширення (тут —
інструменти) реєструють обробники й рендер.

## Що таке інструмент?

Інструмент — це простий об'єкт, що описує:

1. **Ідентичність** — `id`, `label`, необов'язкові `icon`, `cursor` і `tooltip`.
2. **Поведінку вказівника** — `onPointerDown`, `onPointerMove`, `onPointerUp`.
3. **Поведінку клавіатури** — `onKeyDown` для власних гарячих клавіш інструмента.
4. **Рендер** — функцію `render(ctx, node)`, що викликається для кожного вузла, чий
   `type` збігається з `id` інструмента, і необов'язкову `renderOverlay(ctx, api)`
   для тимчасової графіки (підсвічування під час наведення, маркери виділення тощо).
5. **Опції інструмента** — реактивний набір налаштувань (колір, розмір, шрифт, ...),
   що живе в контексті полотна.

```ts
import { defineCanvasTool } from "orio-ui/canvas";

export const noopTool = defineCanvasTool({
  id: "noop",
  label: "Do nothing",
  icon: "pencil",
  cursor: "default",
  onPointerDown(e, api) { /* ... */ },
  render(ctx, node) { /* ... */ },
});
```

`defineCanvasTool` — це просто типізована передача: її задача — зберегти
дженерик-параметри, щоб ваш `render(ctx, node)` отримав правильно типізований `node.data`.

## Інтерфейс інструмента

Повний список властивостей, які можна задати в об'єкті інструмента:

| Властивість       | Тип                                        | Опис                                                       |
| ----------------- | ------------------------------------------ | ---------------------------------------------------------- |
| `id`              | `string`                                   | Стабільний id. Також використовується як `node.type` для вузлів, які створює інструмент. |
| `label`           | `string?`                                  | Зрозуміла назва для панелі інструментів.                   |
| `icon`            | `IconName \| string?`                      | Іконка з реєстру іконок Orio.                              |
| `cursor`          | `string?`                                  | CSS-курсор, поки інструмент активний.                      |
| `tooltip`         | `Component?`                               | Vue-компонент, що рендериться в підказці панелі під час наведення. |
| `kind`            | `"interaction" \| "action" \| "widget"?`   | Поведінка на панелі. За замовчуванням `"interaction"`.     |
| `defaultOptions`  | `TOptions?`                                | Початкові значення реактивного набору опцій.               |
| `onPointerDown`   | `(e, api) => void`                         | Викликається під час натискання вказівника (лише інструменти взаємодії). |
| `onPointerMove`   | `(e, api) => void`                         | Викликається під час руху вказівника (лише інструменти взаємодії). |
| `onPointerUp`     | `(e, api) => void`                         | Викликається під час відпускання вказівника (лише інструменти взаємодії). |
| `onKeyDown`       | `(e: KeyboardEvent, api) => void`          | Викликається під час натискання клавіші, поки інструмент активний. |
| `onActivate`      | `(api) => void`                            | Викликається, коли користувач перемикається на цей інструмент. |
| `onDeactivate`    | `(api) => void`                            | Викликається, коли користувач перемикається на інший.      |
| `render`          | `(ctx, node) => void`                      | Намалювати вузол, що належить цьому інструменту.           |
| `renderOverlay`   | `(ctx, api) => void`                       | Намалювати тимчасову графіку поверх після рендеру всіх вузлів. |
| `hitTest`         | `(node, point, radius) => boolean`         | Власне визначення влучання для стирання/переміщення/підсвічування. |
| `action`          | `(api) => void`                            | Для інструментів дій: колбек під час кліку.                |
| `disabled`        | `(api) => boolean`                         | Для інструментів дій: реактивний стан вимкнення.           |
| `toolbar`         | `Component?`                               | Для інструментів-віджетів: Vue-компонент, що рендериться на панелі. |

## API інструмента

Кожен обробник вказівника й хук життєвого циклу отримує об'єкт `CanvasToolApi`:

```ts
interface CanvasToolApi<TOptions> {
  options: TOptions;                      // reactive, mutable
  nodes: Ref<CanvasNode[]>;               // read-only — use helpers below
  addNode(node): CanvasNode;
  updateNode(id, patch): void;
  removeNode(id): void;
  getNode(id): CanvasNode | undefined;
  clear(): void;
  requestRender(): void;                  // schedule a redraw next frame
  stageEl(): HTMLElement | null;          // mount overlays here
  size(): { width, height };              // current CSS-pixel size
  undo(): void;
  redo(): void;
  canUndo: ComputedRef<boolean>;
  canRedo: ComputedRef<boolean>;
  getToolOptions<T>(id: string): T;       // read/write another tool's options
  getTools(): CanvasTool[];               // all registered tools
}
```

Кілька практичних правил:

- **Змінювати `node.data` на місці можна**, якщо після цього викликати
  `api.requestRender()`. Так робить вільне перо `drawTool`, щоб не
  виділяти новий масив на кожен рух вказівника.
- **Для даних, які треба зберігати**, використовуйте `addNode` / `updateNode`. Заміна
  масиву запускає оновлення `v-model:nodes`.
- **`stageEl()` — ваша точка входу для HTML-оверлеїв**: текстових редакторів, обрізання
  зображень, маркерів трансформації. Stage має `position: relative`, тож абсолютне
  позиціювання в координатах полотна «просто працює».
- **`api.options` реактивний.** Панель налаштувань може прив'язати `v-model` прямо до
  нього через `getToolOptions(toolId)`.

## Створення власного інструмента: прямокутник

Ось повний інструмент, що дає змогу малювати заповнений прямокутник перетягуванням.

```ts
// tools/rectangleTool.ts
import { defineCanvasTool } from "orio-ui/canvas";

interface RectOptions extends Record<string, unknown> {
  fill: string;
  stroke: string;
  strokeWidth: number;
}

interface RectData {
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export function rectangleTool(options: Partial<RectOptions> = {}) {
  let activeId: string | null = null;
  let startX = 0;
  let startY = 0;

  return defineCanvasTool<RectData, RectOptions>({
    id: "rectangle",
    label: "Rectangle",
    icon: "box",
    cursor: "crosshair",
    defaultOptions: {
      fill: "#ffe066",
      stroke: "#222",
      strokeWidth: 2,
      ...options,
    },
    onPointerDown(e, api) {
      startX = e.x;
      startY = e.y;
      const node = api.addNode({
        type: "rectangle",
        x: e.x,
        y: e.y,
        width: 0,
        height: 0,
        data: {
          fill: api.options.fill,
          stroke: api.options.stroke,
          strokeWidth: api.options.strokeWidth,
        },
      });
      activeId = node.id;
    },
    onPointerMove(e, api) {
      if (!activeId || e.buttons === 0) return;
      api.updateNode(activeId, {
        x: Math.min(startX, e.x),
        y: Math.min(startY, e.y),
        width: Math.abs(e.x - startX),
        height: Math.abs(e.y - startY),
      });
    },
    onPointerUp(_, api) {
      // If the user just clicked without dragging, drop the empty node.
      if (activeId) {
        const node = api.getNode(activeId);
        if (node && (!node.width || !node.height)) {
          api.removeNode(activeId);
        }
      }
      activeId = null;
    },
    render(ctx, node) {
      const { fill, stroke, strokeWidth } = node.data;
      ctx.save();
      ctx.fillStyle = fill;
      ctx.fillRect(node.x, node.y, node.width ?? 0, node.height ?? 0);
      if (strokeWidth > 0) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.strokeRect(node.x, node.y, node.width ?? 0, node.height ?? 0);
      }
      ctx.restore();
    },
  });
}
```

Потім додайте його до списку інструментів:

```vue
<script setup>
import { drawTool, textTool } from "orio-ui/canvas";
import { rectangleTool } from "./tools/rectangleTool";
import { shallowRef } from "vue";

const tools = shallowRef([
  drawTool(),
  textTool(),
  rectangleTool({ fill: "#cdeac0" }),
]);
</script>

<template>
  <orio-canvas name="editor" :tools="tools">
    <orio-canvas-toolbar canvas="editor" />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

Стандартна панель підхопить його автоматично — з id, підписом, іконкою та всім іншим.

## Рендер оверлеїв

Використовуйте `renderOverlay` для тимчасової графіки, яка не зберігається як вузли, —
підсвічування під час наведення, рамок виділення, напрямних, ліній прилипання тощо. Він виконується раз
на кадр після малювання всіх вузлів і лише для **активного** інструмента.

```ts
defineCanvasTool({
  id: "my-tool",
  renderOverlay(ctx, api) {
    // Draw a crosshair at (100, 100)
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(90, 100);
    ctx.lineTo(110, 100);
    ctx.moveTo(100, 90);
    ctx.lineTo(100, 110);
    ctx.stroke();
    ctx.restore();
  },
});
```

Вбудовані `moveTool`, `eraseTool` і `highlightTool` використовують
`renderOverlay`, щоб показувати обмежувальні прямокутники під час наведення.

## Гарячі клавіші

Інструменти можуть обробляти події клавіатури через `onKeyDown`. Він спрацьовує, поки інструмент
активний і stage у фокусі. Якщо інструмент викликає `e.preventDefault()`,
подія не дійде до стандартного обробника скасування/повтору.

```ts
defineCanvasTool({
  id: "my-tool",
  onKeyDown(e, api) {
    if (e.key === "Delete") {
      // Remove selected node, etc.
      e.preventDefault();
    }
  },
});
```

Вбудований `moveTool` використовує це для зміни порядку шарів клавішами <kbd>[</kbd> / <kbd>]</kbd>.

## Власне визначення влучання

Коли інструментам стирання, переміщення чи підсвічування треба визначити, чи перетинає
вказівник вузол, вони викликають метод `hitTest` інструмента-власника. Якщо інструмент
його не визначає, використовується стандартна перевірка обмежувального прямокутника.

```ts
defineCanvasTool<MyNodeData>({
  id: "my-tool",
  hitTest(node, point, radius) {
    // Custom proximity check for circular nodes
    const dx = point.x - node.x;
    const dy = point.y - node.y;
    const nodeRadius = node.data.radius ?? 20;
    return dx * dx + dy * dy <= (nodeRadius + radius) ** 2;
  },
});
```

## Власні панелі й кнопки інструментів

Стандартного `<orio-canvas-toolbar>` достатньо для прототипування. Для продакшну
зазвичай потрібен власний інтерфейс. Є три рівні перевизначення.

### Рівень 1 — замінити вміст кнопки інструмента

Використайте слот за замовчуванням `<orio-canvas-tool-button>`:

```vue
<orio-canvas-toolbar canvas="editor" v-slot="{ tools }">
  <orio-canvas-tool-button
    v-for="tool in tools"
    :key="tool.id"
    :tool="tool"
    v-slot="{ isActive, activate }"
  >
    <my-fancy-button :active="isActive" @click="activate">
      {{ tool.label }}
    </my-fancy-button>
  </orio-canvas-tool-button>
</orio-canvas-toolbar>
```

### Рівень 2 — замінити макет панелі

Використайте слот за замовчуванням `<orio-canvas-toolbar>`, щоб рендерити що завгодно
навколо списку інструментів:

```vue
<orio-canvas-toolbar canvas="editor" v-slot="{ tools, activeToolId, setActiveTool }">
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
```

### Рівень 3 — написати власний компонент панелі

Будь-де всередині батьківського `<orio-canvas>` можна викликати `useCanvasContext()`
і побудувати будь-який інтерфейс:

```vue
<!-- MyToolPanel.vue -->
<script setup lang="ts">
import { useCanvasContext } from "orio-ui/canvas";

const ctx = useCanvasContext();
</script>

<template>
  <aside class="tool-panel">
    <orio-button
      v-for="tool in ctx.tools.value"
      :key="tool.id"
      appearance="minimal"
      :variant="ctx.activeToolId.value === tool.id ? 'primary' : 'subdued'"
      :aria-pressed="ctx.activeToolId.value === tool.id"
      @click="ctx.setActiveTool(tool.id)"
    >
      {{ tool.label }}
    </orio-button>
  </aside>
</template>
```

```vue
<orio-canvas name="editor" v-slot>
  <my-tool-panel />
  <orio-canvas-stage />
</orio-canvas>
```

## Відокремлення панелі

`<orio-canvas>` вимагає проп `name`. Будь-який `<orio-canvas-toolbar>` з
відповідним `canvas="<name>"` прив'язується до нього — де б він не був у застосунку.

```vue
<template>
  <header class="app-header">
    <orio-canvas-toolbar canvas="editor" />
  </header>

  <main>
    <orio-canvas name="editor" :tools="tools">
      <orio-canvas-stage />
    </orio-canvas>
  </main>
</template>
```

Панель знаходить полотно через реактивний реєстр на рівні модуля, а не
через `provide`/`inject`, — тож це працює між сусідніми піддеревами, у модальних вікнах,
телепортованих шапках, будь-де на сторінці. Порядок монтування не важливий: панель,
змонтована раніше за полотно, нічого не рендерить, доки полотно не зареєструється, а потім
автоматично наздоганяє.

Кілька полотен на одній сторінці потребують унікальних `name`. Повторна назва
виводить попередження в режимі розробки, а панель прив'яжеться до полотна, змонтованого
останнім.

## Читання й запис опцій інструмента

Кожен інструмент має реактивний набір опцій за своїм id. Його можна читати й змінювати
ззовні інструмента — так панелі налаштувань лишаються синхронними.

```vue
<script setup>
import { ref, watchEffect } from "vue";

const canvasRef = ref();
const brushSize = ref(8);

watchEffect(() => {
  const opts = canvasRef.value?.getToolOptions("draw");
  if (opts) opts.size = brushSize.value;
});
</script>

<template>
  <orio-canvas name="editor" ref="canvasRef">
    <orio-canvas-toolbar canvas="editor" />
    <orio-canvas-stage />
  </orio-canvas>
  <input v-model.number="brushSize" type="range" min="1" max="40" />
</template>
```

До тих самих опцій можна дістатися й з обробника вказівника іншого інструмента —
наприклад, «піпетка», що записує в `draw.color`.

## Власні підказки

Кожен інструмент може мати властивість `tooltip` — Vue-компонент, що рендериться всередині
підказки панелі під час наведення. Показуйте в ній опис, гарячі клавіші
чи будь-який стилізований вміст.

```vue
<!-- tooltips/MyToolTip.vue -->
<template>
  <div class="tool-tip">
    <orio-view-text type="title" size="medium">My Tool</orio-view-text>
    <orio-view-text type="subtitle" size="small">
      Does something cool.
    </orio-view-text>
    <orio-view-key-binds bind="`Shift` + click for precision" />
  </div>
</template>

<style scoped>
.tool-tip {
  --view-text-color: white;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 200px;
  white-space: normal;
}
</style>
```

```ts
import { defineCanvasTool } from "orio-ui/canvas";
import MyToolTip from "./tooltips/MyToolTip.vue";

export function myTool() {
  return defineCanvasTool({
    id: "my-tool",
    label: "My Tool",
    icon: "pencil",
    tooltip: MyToolTip,
    // ...
  });
}
```

Якщо `tooltip` не задано, панель показує `label`
інструмента. Усі вбудовані інструменти мають власні компоненти підказок з
описом і відповідними гарячими клавішами.

## Власні типи вузлів

Центрального реєстру типів вузлів немає — `node.type` це просто рядок,
що збігається з `id` якогось інструмента. Під час рендеру stage просить кожен інструмент
«намалюй свої вузли», а невідомі типи вузлів мовчки пропускаються.

Це означає:

- Збережений документ можна відновити ще до реєстрації всіх інструментів; вузли,
  чиї інструменти ще не завантажені, просто невидимі, доки ті не з'являться.
- Два інструменти можуть рендерити один тип вузла, якщо потрібен інструмент «лише рендер»
  у парі з інструментом «лише взаємодія». Просто дайте їм однаковий `id` — але
  для обробників вказівника переможе друга реєстрація.

## Монтування HTML-оверлеїв

Деяким інструментам потрібен справжній DOM-елемент поверх полотна — текстовим редакторам,
обрізанню зображень, маркерам трансформації. `api.stageEl()` повертає кореневий
`<div>` stage з `position: relative`. Додавайте дочірні елементи з абсолютним
позиціюванням і координатами полотна:

```ts
onPointerDown(e, api) {
  const stage = api.stageEl();
  if (!stage) return;
  const handle = document.createElement("div");
  handle.style.position = "absolute";
  handle.style.left = `${e.x}px`;
  handle.style.top = `${e.y}px`;
  handle.style.transform = "translate(-50%, -50%)";
  stage.appendChild(handle);
  // ...remember to remove it on commit/cancel
}
```

Саме так робить вбудований `textTool` — у його вихідному коді є повний
робочий патерн (фіксація під час втрати фокусу, скасування через Escape, позиція відносно
точки кліку).

## Життєвий цикл

```ts
defineCanvasTool({
  id: "demo",
  onActivate(api) {
    // Called when the user switches to this tool.
  },
  onDeactivate(api) {
    // Called when the user switches away — clean up overlays, listeners, etc.
  },
});
```

Використовуйте їх, щоб прибрати DOM, доданий у `stageEl()`, скасувати завантаження,
скинути стан наведення тощо.

## Поради

- **Кожна фабрика інструмента має володіти власним станом у замиканні.** Саме тому
  `drawTool()` — функція, а не об'єкт-синглтон: два полотна на
  одній сторінці отримують власний id «поточного малювання», не заважаючи одне одному.
- **Працюйте в просторі полотна.** Події вказівника надходять з `x`/`y`, уже
  переведеними в систему координат полотна. Коли згодом з'явиться масштабування/панорамування,
  інструменти, що працюють у просторі полотна, і далі працюватимуть без змін.
- **Не блокуйте головний потік у `render`.** Він виконується на кожному кадрі,
  поки користувач малює. Кешуйте все затратне в `data` вузла.
- **Не змінюйте `nodes` напряму.** Використовуйте `addNode` / `updateNode` /
  `removeNode`, щоб посилання на масив змінювалося й спрацьовував `v-model:nodes`.
- **Зберігайте те, що потрібно для рендеру.** Знімки активного набору опцій
  (колір, шрифт, ...) мають лежати в `data` вузла, а не в опціях інструмента, —
  інакше зміна налаштувань інструмента заднім числом змінила б вигляд попередніх вузлів.
- **Використовуйте `renderOverlay` для тимчасової графіки.** Не створюйте й не видаляйте вузли
  для підсвічування чи напрямних — для цього є прохід оверлею.
- **Прибирайте за собою в `onDeactivate`.** Скидайте стан наведення, видаляйте DOM-оверлеї та
  викликайте `requestRender()`, щоб стерти графіку оверлею.
