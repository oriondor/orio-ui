# useToast

Сповіщення на основі черги. Одна спільна черга обслуговує весь застосунок, а модуль
монтує хост [`Toast`](/uk/components/toast), який її малює, — контейнер розміщувати
не потрібно.

## Живе демо

<script setup>
import { getCurrentInstance, onMounted } from 'vue'
import { useToast } from '../../../src/runtime/composables/useToast'
import { mountToastHost } from '../../../src/runtime/components/Toast/mount'

const { showToast, clearToasts, toasts } = useToast()

// These docs are not a Nuxt app, so the host is mounted by hand here.
const instance = getCurrentInstance()
onMounted(() => mountToastHost(instance.appContext))

function showSaved() {
  showToast({ message: 'Зміни збережено', variant: 'success' })
}

function showSticky() {
  showToast({
    title: "З'єднання втрачено",
    message: 'Повторна спроба у фоні.',
    variant: 'danger',
    timeout: 0,
  })
}

function showCountdown() {
  showToast({
    message: 'Стежте, як смуга зменшується. Наведіть, щоб зупинити.',
    variant: 'success',
    timeout: 8000,
    showTimeout: true,
  })
}

function showUndoable() {
  showToast({
    message: 'report-q3.pdf переміщено в кошик.',
    variant: 'alert',
    timeout: 0,
    actions: [
      { label: 'Скасувати', onClick: () => showToast({ message: 'Відновлено', variant: 'success' }) },
    ],
  })
}
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-button @click="showSaved()">Автозакриття</orio-button>
    <orio-button variant="secondary" @click="showSticky()">Закріплене</orio-button>
    <orio-button variant="secondary" @click="showUndoable()">Зі скасуванням</orio-button>
    <orio-button variant="secondary" @click="showCountdown()">Зі зворотним відліком</orio-button>
    <orio-button variant="subdued" @click="clearToasts()">Очистити все</orio-button>
  </div>
  <orio-view-text>У черзі: {{ toasts.length }}</orio-view-text>
</div>

## API

```typescript
const {
  toasts,
  showToast,
  closeToast,
  clearToasts,
  pauseToast,
  resumeToast,
  triggerAction,
  setToastDefaults,
} = useToast();
```

| Член               | Сигнатура                                       | Опис                                               |
| ------------------ | ----------------------------------------------- | -------------------------------------------------- |
| `toasts`           | `Ref<ToastItem[]>`                               | Жива черга, найстаріші першими                      |
| `showToast`        | `(options: ToastOptions) => string`              | Ставить сповіщення в чергу, повертає його id        |
| `closeToast`       | `(id: string) => void`                           | Прибирає одне сповіщення                            |
| `clearToasts`      | `() => void`                                     | Очищає чергу                                        |
| `pauseToast`       | `(id: string) => void`                           | Зупиняє відлік там, де він є                        |
| `resumeToast`      | `(id: string) => void`                           | Продовжує відлік решти часу                         |
| `triggerAction`    | `(toast, action) => Promise<void>`               | Виконує дію й застосовує її поведінку закриття      |
| `setToastDefaults` | `(overrides: Partial<ToastDefaults>) => void`    | Змінює значення за замовчуванням для наступних сповіщень |

### ToastOptions

| Опція      | Тип                                           | За замовчуванням | Опис                                         |
| ---------- | --------------------------------------------- | ---------------- | -------------------------------------------- |
| `message`  | `string`                                      | обов'язкова      | Основний текст                               |
| `title`    | `string`                                      | —                | Жирний рядок над повідомленням               |
| `variant`  | `"info" \| "success" \| "alert" \| "danger"`  | `"info"`         | Колірна група та терміновість                |
| `position` | `ToastPosition`                               | `"bottom-end"`   | До якого стека долучається                   |
| `target`   | `ToastTarget`                                 | в'юпорт          | Обмежити сповіщення межами елемента          |
| `timeout`  | `number`                                      | `5000`           | Мілісекунди до автозакриття; `0` — закріплене |
| `closable` | `boolean`                                     | `true`           | Рендерить кнопку закриття                    |
| `showTimeout` | `boolean`                                  | `false`          | Малює смугу, що показує залишок часу         |
| `actions`  | `ToastAction[]`                               | `[]`             | Кнопки з кінцевого боку                      |

`ToastPosition` — одне з `top-start`, `top-center`, `top-end`,
`bottom-start`, `bottom-center`, `bottom-end`.

`ToastTarget` — це `string | HTMLElement | Ref<HTMLElement | null | undefined>`,
тож ще не прив'язаний template ref — коректна ціль.

### ToastAction

| Поле       | Тип                                           | Опис                                           |
| ---------- | --------------------------------------------- | ---------------------------------------------- |
| `label`    | `string`                                      | Текст кнопки                                   |
| `variant`  | `"primary" \| "secondary" \| "subdued"`       | Варіант кнопки, за замовчуванням `"secondary"` |
| `icon`     | `string`                                      | Назва іконки, що передається в кнопку          |
| `keepOpen` | `boolean`                                     | Не закривати сповіщення після завершення обробника |
| `onClick`  | `({ close, toast }) => void \| Promise<void>` | Обробник; `close()` закриває достроково        |

## Базове використання

```vue
<script setup>
const { showToast } = useToast();

function save() {
  showToast({ message: "Changes saved", variant: "success" });
}
</script>
```

## Дії

Спершу виконується обробник, потім сповіщення закривається саме. Асинхронний обробник
тримає сповіщення на екрані, доки не завершиться, тож повільне скасування видно, поки воно працює.

```vue
<script setup>
const { showToast } = useToast();

function deleteFile(file) {
  showToast({
    message: "File deleted",
    timeout: 0,
    actions: [
      // closes once restore() resolves
      { label: "Undo", onClick: () => restore(file) },

      // stays open
      { label: "Details", keepOpen: true, onClick: ({ close }) => openModal() },
    ],
  });
}
</script>
```

Ставте сповіщення в чергу з обробників подій або `onMounted` — ніколи з тіла setup,
яке виконується й на сервері.

## Обмеження елементом

```vue
<script setup>
const panel = ref(null);
const { showToast } = useToast();

function notifyInPanel() {
  showToast({
    message: "Saved to this panel",
    target: panel,
    position: "top-end",
  });
}
</script>

<template>
  <section ref="panel">
    <orio-button @click="notifyInPanel">Notify</orio-button>
  </section>
</template>
```

Ціль зі `static` перемикається на `position: relative`, щоб її сповіщення прив'язувалися
до неї. Селектори (`"#sidebar"`) перетворюються на свій елемент, тож поводяться
так само, як передача цього елемента; селектор, що нічого не знаходить, повертається
до кута в'юпорту.

## Значення за замовчуванням

```typescript
setToastDefaults({
  variant: "info",
  position: "bottom-end",
  timeout: 5000,
  closable: true,
  showTimeout: false,
  limit: 5,
});
```

Смуга завмирає, щойно на її стек наводять курсор або фокус, бо зворотний відлік,
який вона малює, теж зупинено. Закріплені сповіщення (`timeout: 0`) смуги не мають.

`limit` рахується для кожного стека — однієї позиції на одній цілі, — тож переповнений кут
відкидає найстаріше сповіщення, не зачіпаючи інших кутів.
