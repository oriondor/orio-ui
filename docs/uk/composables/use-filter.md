# useFilter

Композабл для визначення іменованої групи фільтрів, стан якої можна читати й змінювати з будь-якого компонента на сторінці — вибір у шапці, панель у бічній колонці, будь-де.

**Ментальна модель:**

- **Група** має `id` і містить один або кілька **фільтрів**.
- Кожен фільтр надає сумісний з `v-model` **набір прив'язок** — `v-bind="filters.<name>"` на будь-який компонент.
- Хелпери (`clear`, `isActive`, `value`) лежать у `filters.$.<name>`.
- Реактивний список `$active` живить інтерфейси на кшталт «вибрані чипи з можливістю зняти».
- `{ url: true }` ліниво підключає [useUrlSync](./use-url-sync.md) — залежність завантажується лише тоді, коли прапорець увімкнено.

## Живе демо

<script setup>
import { useFilter } from '../../../src/runtime/composables/useFilter'

const filters = useFilter('demo-appointments-uk', {
  category:  { value: null },
  status:    { value: [] },
})

const categories = [
  { id: 'consultation', name: 'Консультація' },
  { id: 'checkup',      name: 'Огляд' },
  { id: 'follow-up',    name: 'Повторний візит' },
]

const statuses = [
  { value: 'confirmed',  label: 'Підтверджено' },
  { value: 'pending',    label: 'Очікує' },
  { value: 'cancelled',  label: 'Скасовано' },
]

// Retrieved by id elsewhere — same instance
const remoteHandle = useFilter('demo-appointments-uk')
</script>

### Елементи вибору — будь-де

<div class="demo-container">
  <div class="demo-row" style="gap: 1rem; flex-wrap: wrap;">
    <orio-selector
      v-bind="filters.category"
      :options="categories"
      label="Категорія"
      placeholder="Будь-яка категорія"
      style="min-width: 220px;"
      option-name="name"
    />
    <orio-checkbox-group
      v-bind="filters.status"
      :options="statuses"
      label="Статус"
      layout="horizontal"
    />
  </div>
</div>

### Панель фільтрів — читає `$active`, викликає `clear` для кожного чипа

<div class="demo-container">
  <div class="demo-row" style="align-items: center; gap: 0.5rem; flex-wrap: wrap;">
    <span v-if="!remoteHandle.$active.value.length" style="color: var(--vp-c-text-2)">
      Нічого не вибрано.
    </span>
    <orio-button
      v-for="f in remoteHandle.$active.value"
      :key="f.name"
      @click="f.clear"
    >
      <strong>{{ f.name }}:</strong>
      <span>{{ Array.isArray(f.value) ? f.value.join(', ') : f.value }}</span>
      <template #icon-right>
        <orio-icon name="close" />
      </template>
    </orio-button>
    <orio-button
      v-if="remoteHandle.$active.value.length"
      variant="secondary"
      @click="remoteHandle.$clearAll"
    >
      Очистити все
    </orio-button>
  </div>
</div>

<div class="demo-container">
  <p style="margin: 0; color: var(--vp-c-text-2); font-size: 0.875rem;">
    Прапорець <code>{ url: true }</code> тут навмисно вимкнено — його залежність від
    <code>useRoute</code> з Nuxt має значення лише тоді, коли він увімкнений. У Nuxt-застосунку передайте його
    третім аргументом, і URL оновлюватиметься реактивно.
  </p>
</div>

<style scoped>
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.6rem;
  border-radius: var(--border-radius-lg, 999px);
  background: var(--color-surface, #f4f4f5);
  border: 1px solid var(--color-border, #e4e4e7);
  font-size: 0.875rem;
  cursor: pointer;
  font: inherit;
}
.filter-chip:hover {
  background: var(--color-surface-hover, #e4e4e7);
}
</style>

## Визначення групи

```ts
const filters = useFilter("appointments", {
  category: { value: null },
  status: { value: [] as string[] },
  dateRange: { value: { from: null, to: null } },
});
```

### Віддзеркалення стану в URL

Передайте `{ url: true }` третім аргументом:

```ts
const filters = useFilter("appointments", config, { url: true });
```

`useUrlSync` імпортується динамічно лише тоді, коли цей прапорець увімкнено, — тож `useFilter` працює поза Nuxt (тести, Storybook, демо у VitePress), доки `url` вимкнено. Назви фільтрів стають ключами URL верхнього рівня; уникайте однакових назв у кількох групах із синхронізацією URL на одній сторінці.

## Отримання тієї самої групи

Викличте `useFilter(id)` без конфігурації — будь-де в застосунку:

```ts
const filters = useFilter("appointments");
```

Якщо групу ще не визначено, буде викинуто помилку. Визначайте її до монтування споживачів (наприклад, на рівні батьківського компонента чи лейауту).

## Прив'язка до компонентів

Кожен фільтр — сумісний з `v-model` набір; розгорніть його на будь-який компонент, що підтримує `v-model`:

```vue
<orio-selector v-bind="filters.category" :options="categories" />
<orio-checkbox-group v-bind="filters.status" :options="statuses" />
<orio-date-range-picker v-bind="filters.dateRange" />
```

Дані застосунку (опції, підписи тощо) передаються в компонент як зазвичай — вони **не** є частиною конфігурації фільтра.

## Побудова панелі фільтрів

Ітеруйте `$active` — обчислюваний список усіх фільтрів, поточне значення яких відрізняється від початкового:

```vue
<template>
  <button v-for="f in filters.$active.value" :key="f.name" @click="f.clear">
    {{ f.name }}: {{ f.value }} &times;
  </button>

  <orio-button v-if="filters.$active.value.length" @click="filters.$clearAll">
    Clear all
  </orio-button>
</template>
```

## Довідник API

### `useFilter(id, config?, options?)`

| Аргумент  | Тип                         | Опис                                                                                          |
| --------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| `id`      | `string`                    | Стабільний ідентифікатор групи.                                                               |
| `config`  | `Record<string, { value }>` | Відповідність «назва фільтра → початкове значення». Обов'язкова під час першого виклику для цього id. |
| `options` | `{ url?: boolean }`         | `url: true` ліниво завантажує `useUrlSync` і віддзеркалює `$state` у query-параметри URL. За замовчуванням вимкнено. |

Повертає `FilterGroup`.

### Структура `FilterGroup`

```ts
filters.<name>              // { modelValue, 'onUpdate:modelValue' } — spread with v-bind
filters.$.<name>            // { value, initial, isActive, clear }
filters.$active             // ComputedRef<{ name, value, clear }[]>
filters.$clearAll()         // reset every filter to its initial value
filters.$state              // Ref<Record<string, unknown>> — raw reactive state
```

### `disposeFilter(id)`

Видаляє групу з реєстру. Використовуйте в SPA, де групи фільтрів прив'язані до сторінки:

```ts
import { disposeFilter } from "orio-ui";
onBeforeUnmount(() => disposeFilter("appointments"));
```

## Застереження

- **Спершу визначте, потім використовуйте.** Виклик `useFilter(id)` без конфігурації викидає помилку, якщо id невідомий. Визначайте групу на рівні, що виконується раніше за будь-якого споживача.
- **Без автоочищення.** Групи живуть увесь час роботи застосунку. Викликайте `disposeFilter(id)` вручну, коли прив'язуєте їх до маршруту.
- **Синхронізація з URL потребує Nuxt.** `{ url: true }` залежить від `useUrlSync`, який використовує `#imports` з Nuxt для безпечного з погляду SSR попереднього заповнення. Залежність завантажується ліниво, тож із вимкненим прапорцем `useFilter` можна використовувати й поза Nuxt.

## Див. також

- [useUrlSync](./use-url-sync.md) — базова серіалізація в URL (підключається через `{ url: true }`).
