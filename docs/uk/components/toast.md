# Toast

Спливне сповіщення з варіантами, діями та автозакриттям. Сповіщення створюються
зі скрипту через [`useToast`](/uk/composables/use-toast), тож розмітку розміщувати
не потрібно — модуль сам монтує хост сповіщень.

## Живе демо

<script setup>
import { getCurrentInstance, onMounted, ref } from 'vue'
import { useToast } from '../../../src/runtime/composables/useToast'
import { mountToastHost } from '../../../src/runtime/components/Toast/mount'

const { showToast, clearToasts } = useToast()

// These docs are not a Nuxt app, so the host is mounted by hand here.
// In a Nuxt project the module's plugin does this for you.
const instance = getCurrentInstance()
onMounted(() => mountToastHost(instance.appContext))

const variants = ['info', 'success', 'alert', 'danger']
const positions = [
  'top-start', 'top-center', 'top-end',
  'bottom-start', 'bottom-center', 'bottom-end',
]

const panel = ref(null)
const dismissed = ref(false)

function showVariant(variant) {
  showToast({
    title: variant === 'danger' ? 'Не вдалося завантажити' : undefined,
    message: `Це сповіщення типу ${variant}.`,
    variant,
  })
}

function showAtPosition(position) {
  showToast({ message: `Прив'язано: ${position}`, position })
}

function showWithActions() {
  showToast({
    title: 'Файл видалено',
    message: 'report-q3.pdf переміщено в кошик.',
    variant: 'alert',
    timeout: 0,
    actions: [
      { label: 'Скасувати', onClick: () => showToast({ message: 'Відновлено', variant: 'success' }) },
      { label: 'Деталі', variant: 'subdued', keepOpen: true, onClick: () => {} },
    ],
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

function showInPanel() {
  showToast({ message: 'Обмежено панеллю', target: panel, position: 'top-end' })
}
</script>

### Варіанти

<div class="demo-container">
  <div class="demo-row">
    <orio-button v-for="variant in variants" :key="variant" :variant="variant === 'danger' ? 'secondary' : 'primary'" @click="showVariant(variant)">
      {{ variant }}
    </orio-button>
  </div>
</div>

### Позиції

<div class="demo-container">
  <div class="demo-row" style="flex-wrap: wrap">
    <orio-button v-for="position in positions" :key="position" variant="secondary" @click="showAtPosition(position)">
      {{ position }}
    </orio-button>
  </div>
</div>

### Дії

Обробники виконуються, після чого сповіщення закривається саме. Передайте `keepOpen`, щоб залишити його,
або викличте `close()` з обробника, щоб закрити достроково. Наведення на стек призупиняє
всі зворотні відліки в ньому.

<div class="demo-container">
  <div class="demo-row">
    <orio-button @click="showWithActions()">Видалити файл</orio-button>
    <orio-button variant="subdued" @click="clearToasts()">Очистити все</orio-button>
  </div>
</div>

### Видимий таймаут

`showTimeout` малює смугу вздовж нижнього краю, що зменшується рівно за
`timeout` сповіщення. Наведення чи фокус на стеку заморожує смугу разом зі
зворотним відліком, який вона показує. Закріплене сповіщення (`timeout: 0`) смуги не має —
відлічувати нічого.

<div class="demo-container">
  <div class="demo-row">
    <orio-button @click="showCountdown()">Показати з відліком</orio-button>
  </div>
</div>

### Обмеження елементом

Передайте `target`, щоб тримати сповіщення в межах однієї області, а не в куті в'юпорту.

<div class="demo-container">
  <div ref="panel" style="min-height: 9rem; padding: 1rem; border: 1px dashed var(--color-border); border-radius: var(--border-radius-md)">
    <orio-view-text>Ця панель має власний стек сповіщень.</orio-view-text>
    <br>
    <orio-button variant="secondary" @click="showInPanel()">Сповістити в панелі</orio-button>
  </div>
</div>

## Використання

### Базове

```vue
<script setup>
const { showToast } = useToast();

function save() {
  showToast({ message: "Changes saved", variant: "success" });
}
</script>
```

### З діями

```vue
<script setup>
const { showToast } = useToast();

function deleteFile(file) {
  trash(file);

  showToast({
    title: "File deleted",
    message: `${file.name} moved to trash.`,
    variant: "alert",
    timeout: 0,
    actions: [{ label: "Undo", onClick: () => restore(file) }],
  });
}
</script>
```

### Окремий компонент

`<orio-toast>` працює й самостійно — на сторінці, у списку чи у власному
контейнері, — коли потрібне статичне повідомлення, а не сповіщення з черги. Він генерує події,
а не діє сам, тож закрити його можете лише ви. Слот `actions` — найпростіший спосіб
під'єднати кнопки тут; проп `actions` очікує обробники у форматі для черги.

<div class="demo-container">
  <orio-toast
    v-if="!dismissed"
    title="Сховище майже заповнене"
    message="Ви використали 92% свого тарифу."
    variant="alert"
    @close="dismissed = true"
  >
    <template #actions>
      <orio-button @click="showToast({ message: 'Відкриваємо оплату', variant: 'info' })">
        Покращити
      </orio-button>
    </template>
  </orio-toast>
  <orio-button v-else variant="subdued" @click="dismissed = false">Повернути</orio-button>
</div>

```vue
<template>
  <orio-toast
    v-if="!dismissed"
    title="Storage almost full"
    message="You have used 92% of your plan."
    variant="alert"
    @close="dismissed = true"
  >
    <template #actions>
      <orio-button @click="goToBilling">Upgrade</orio-button>
    </template>
  </orio-toast>
</template>
```

## Пропси

| Проп          | Тип                                          | За замовчуванням | Опис                                             |
| ------------- | -------------------------------------------- | ---------------- | ------------------------------------------------ |
| `message`     | `string`                                     | `""`             | Основний текст; ігнорується, якщо використано слот за замовчуванням |
| `title`       | `string`                                     | —                | Жирний рядок над повідомленням                   |
| `variant`     | `"info" \| "success" \| "alert" \| "danger"` | `"info"`         | Колірна група та терміновість для скрінрідерів   |
| `closable`    | `boolean`                                    | `true`           | Рендерить кнопку закриття                        |
| `timeout`     | `number`                                     | `0`              | Тривалість смуги відліку в мс                    |
| `showTimeout` | `boolean`                                    | `false`          | Малює смугу відліку; потребує `timeout > 0`      |
| `paused`      | `boolean`                                    | `false`          | Заморожує смугу відліку                          |
| `actions`     | `ToastAction[]`                              | `[]`             | Кнопки з кінцевого боку                          |

## Події

| Подія    | Дані          | Опис                              |
| -------- | ------------- | --------------------------------- |
| `close`  | —             | Натиснуто кнопку закриття         |
| `action` | `ToastAction` | Натиснуто одну з кнопок дій       |

## Слоти

| Слот      | Пропси               | Опис                                 |
| --------- | -------------------- | ------------------------------------ |
| `default` | —                    | Замінює текст повідомлення           |
| `actions` | `{ actions, close }` | Замінює кнопки дій                   |

## Доступність

- Сповіщення `danger` рендеряться з `role="alert"`, усі інші варіанти — з `role="status"`.
- Підпис кнопки закриття береться з i18n (`toast.close`).
- Наведення чи фокус на стеку призупиняє його відліки, тож користувачам клавіатури
  не доводиться змагатися з таймаутом.
