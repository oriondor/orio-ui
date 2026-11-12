# Modal

Анімоване модальне вікно з ефектом перетворення з точки появи.

## Живе демо

<script setup>
import { ref } from 'vue'

const showModal = ref(false)
const modalOrigin = ref(null)
const showSheet = ref(false)
const showAuto = ref(false)

function openModal(event) {
  const rect = event.target.getBoundingClientRect()
  modalOrigin.value = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  }
  showModal.value = true
}
</script>

<div class="demo-container">
  <orio-button @click="openModal">
    Відкрити модальне вікно
  </orio-button>

  <orio-modal v-model:show="showModal" :origin="modalOrigin" title="Демо-вікно">
    <div style="width: 50rem">
      <p>Це вікно виростає з кнопки, яку ви натиснули!</p>
      <p>Клікніть поза ним або натисніть кнопку нижче, щоб закрити.</p>
      <p>Стилізуйте як заманеться</p>
      <br>
      <i>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      </i>
    </div>
    <template #footer>
      <orio-button variant="primary" @click="showModal = false">
        Закрити вікно
      </orio-button>
    </template>
  </orio-modal>
</div>

## Демо листа

<div class="demo-container">
  <orio-button @click="showSheet = true">
    Відкрити лист
  </orio-button>

  <orio-modal v-model:show="showSheet" :origin="null" presentation="sheet" drag-handle title="Лист">
    <p>Прикріплений до низу, виїжджає знизу, ігнорує origin.</p>
    <template #footer>
      <orio-button variant="primary" @click="showSheet = false">
        Закрити
      </orio-button>
    </template>
  </orio-modal>
</div>

## Демо авто

<div class="demo-container">
  <orio-button @click="showAuto = true">
    Open auto
  </orio-button>

  <orio-modal v-model:show="showAuto" :origin="null" presentation="auto" title="Auto">
    <p>Sheet under 640px, dialog above; fixed while open.</p>
    <template #footer>
      <orio-button variant="primary" @click="showAuto = false">
        Close
      </orio-button>
    </template>
  </orio-modal>
</div>

## Використання

### Базове модальне вікно (ручний стан)

Якщо `title` не передано — заголовок не малюється;

Ширину вікна задає ширина внутрішнього вмісту

```vue
<template>
  <orio-button @click="showModal = true"> Open </orio-button>

  <orio-modal v-model:show="showModal" :origin="null" title="Modal title">
    <p style="width: 50rem;">Your content here</p>
  </orio-modal>
</template>

<script setup>
const showModal = ref(false);
</script>
```

### Через композабл useModal (рекомендовано)

Композабл `useModal()` спрощує керування модальними вікнами й автоматично визначає точку початку анімації:

```vue
<template>
  <orio-button @click="openModal"> Open Modal </orio-button>

  <orio-modal v-bind="modalProps">
    <h2>Modal Title</h2>
    <p>Content here</p>
    <orio-button @click="modalProps.show = false">Close</orio-button>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal();
</script>
```

### Керування анімацією: з подією і без

Ключова різниця між `openModal()` і `openModal` — у тому, як обробляється подія кліку:

```vue
<template>
  <div class="demo-row">
    <!-- NO Animation - Calling with () without passing event -->
    <orio-button @click="openModal()"> Open Modal (No Animation) </orio-button>

    <!-- WITH Animation - Passing event automatically -->
    <orio-button @click="openModal"> Open Modal (With Animation) </orio-button>

    <!-- WITH Animation - Explicitly passing event -->
    <orio-button @click="openModal($event)">
      Open Modal (Explicit Event)
    </orio-button>
  </div>

  <orio-modal v-bind="modalProps">
    <h2>Modal Content</h2>
    <p>This modal may or may not animate based on how it was opened!</p>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal();
</script>
```

**Пояснення:**

- `@click="openModal()"` — функція викликається одразу, подія не передається → **проста поява**
- `@click="openModal"` — Vue автоматично передає подію кліку → **анімація перетворення з кнопки**
- `@click="openModal($event)"` — подія передається явно → **анімація перетворення з кнопки**

### Ручне відстеження точки появи (без useModal)

Якщо потрібно більше контролю, точку появи можна відстежувати вручну:

```vue
<template>
  <orio-button @click="openModal"> Open with Animation </orio-button>

  <orio-modal v-model:show="showModal" :origin="origin">
    <p>Morphs from button!</p>
  </orio-modal>
</template>

<script setup>
const showModal = ref(false);
const origin = ref(null);

function openModal(event) {
  const rect = event.target.getBoundingClientRect();
  origin.value = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
  showModal.value = true;
}
</script>
```

### Нижній лист

`presentation="sheet"` прикріплює вікно до нижнього краю на всю ширину із заокругленими верхніми кутами. Воно виїжджає знизу при відкритті й від’їжджає вниз при закритті (за `prefers-reduced-motion` відкривається й закривається миттєво) та ігнорує `origin`. Заголовок і футер залишаються на місці, прокручується вміст. Кнопки футера стоять в один ряд і переносяться з проміжком на вузьких екранах. `drag-handle` додає декоративну смужку (`aria-hidden`, без жестів).

```vue
<template>
  <orio-button @click="showSheet = true"> Open sheet </orio-button>

  <orio-modal
    v-model:show="showSheet"
    :origin="null"
    presentation="sheet"
    drag-handle
    title="Sheet"
  >
    <p>Docked to the bottom, slides up, ignores origin.</p>
    <template #footer>
      <orio-button variant="primary" @click="showSheet = false">
        Close
      </orio-button>
    </template>
  </orio-modal>
</template>

<script setup>
const showSheet = ref(false);
</script>
```

`presentation="auto"` обирає лист на ширині менше 640px (Tailwind `sm`), інакше звичайне вікно. Режим визначається під час відкриття й тримається до закриття: зміна розміру через 640px, поки вікно відкрите, його не перемикає.

```vue
<orio-button @click="showAuto = true">
  Open auto
</orio-button>

<orio-modal
  v-model:show="showAuto"
  :origin="null"
  presentation="auto"
  title="Auto"
>
  <p>Sheet under 640px, dialog above; fixed while open.</p>
  <template #footer>
    <orio-button variant="primary" @click="showAuto = false">
      Close
    </orio-button>
  </template>
</orio-modal>
```

### Стилізація

`class`, `style` та інші атрибути на `<orio-modal>` потрапляють на елемент `.modal`. Він має `data-presentation="sheet" | "dialog"` (визначений режим, ніколи `auto`), тож стилізувати за режимом можна без `:has()`. Токени нижче можна задати на `.modal` або на предку (наприклад, `:root`). У листі `env(safe-area-inset-bottom)` додає відступ до останнього блоку; значення з’являється лише з `viewport-fit=cover` у meta viewport сторінки.

```css
.modal[data-presentation="sheet"] {
  --modal-radius: 24px;
}
```

## Пропси

| Проп           | Тип                             | За замовчуванням                 | Опис                                                                                                |
| -------------- | ------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------- |
| `show`         | `Boolean`                       | -                                | Видимість вікна (v-model:show)                                                                      |
| `origin`       | `OriginRect \| null`            | `null`                           | Точка початку анімації                                                                              |
| `presentation` | `'dialog' \| 'sheet' \| 'auto'` | `'dialog'`                       | `dialog` по центру, `sheet` знизу, `auto` = лист при ширині менше 640px, визначається при відкритті |
| `dragHandle`   | `boolean`                       | `false`                          | Декоративна смужка на листі (`aria-hidden`, без жестів)                                             |
| `duration`     | `number`                        | `500` відкриття / `400` закриття | Тривалість анімації відкриття та закриття в мс. Ігнорується при зменшеному русі                     |

### CSS-токени

| Токен                     | За замовчуванням          | Опис                                              |
| ------------------------- | ------------------------- | ------------------------------------------------- |
| `--modal-min-inline-size` | `380px`                   | Мінімальна ширина вікна, не більше `100% - 2rem`  |
| `--modal-max-inline-size` | `90vw`                    | Максимальна ширина вікна, не більше `100% - 2rem` |
| `--modal-max-block-size`  | `90dvh`                   | Максимальна висота листа                          |
| `--modal-radius`          | `var(--border-radius-lg)` | Радіус кутів (вікно; верхні кути листа)           |

### Тип OriginRect

```typescript
interface OriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

## Події

| Подія         | Дані      | Опис                                 |
| ------------- | --------- | ------------------------------------ |
| `update:show` | `boolean` | Генерується, коли вікно закривається |

## Можливості

- Закриття кліком поза вікном або клавішею `Esc`
- `role="dialog"` з `aria-modal`, підписане через `title`
- Переводить фокус у вікно, тримає `Tab` всередині, повертає фокус на
  елемент, що мав його до відкриття
- Ефект розмиття фону
- Анімація перетворення з елемента-джерела
- Плавна поява, якщо точку появи не передано
- Зменшений рух (`prefers-reduced-motion`): без анімації, вікно відкривається й закривається миттєво
- Блокує прокрутку сторінки без зсуву макета: `<body>` отримує відступ на
  ширину смуги прокрутки

### Елементи з position: fixed

Відступ `<body>` не впливає на елементи з `position: fixed`, тож фіксована
шапка все ще зсувається, коли зникає смуга прокрутки. Поки модальне вікно
відкрите, ширина смуги прокрутки доступна на `<html>` як `--orio-scrollbar-gap`:

```css
.site-header {
  position: fixed;
  padding-right: var(--orio-scrollbar-gap, 0px);
}
```
