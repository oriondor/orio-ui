# Modal

Анімоване модальне вікно з ефектом перетворення з точки появи.

## Живе демо

<script setup>
import { ref } from 'vue'

const showModal = ref(false)
const modalOrigin = ref(null)

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

## Пропси

| Проп     | Тип                  | За замовчуванням | Опис                   |
| -------- | -------------------- | ------- | ------------------------------- |
| `show`   | `Boolean`            | -       | Видимість вікна (v-model:show)  |
| `origin` | `OriginRect \| null` | `null`  | Точка початку анімації          |

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

| Подія         | Дані      | Опис                      |
| ------------- | --------- | ------------------------- |
| `update:show` | `boolean` | Генерується, коли вікно закривається |

## Можливості

- Закриття кліком поза вікном
- Ефект розмиття фону
- Анімація перетворення з елемента-джерела
- Плавна поява, якщо точку появи не передано
