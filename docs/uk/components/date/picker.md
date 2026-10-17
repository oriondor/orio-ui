# DatePicker

Вибір однієї дати на основі [`Calendar`](../calendar.md). Рендериться як кнопка-тригер, що відкриває поповер із календарем.

## Живе демо

<script setup>
import { ref } from 'vue'

const birthDate = ref('')
const startDate = ref('2024-01-15')
</script>

<div class="demo-container">
  <orio-date-picker v-model="birthDate" label="Дата народження" />
  <orio-date-picker v-model="startDate" label="Дата початку" />
</div>

<div class="demo-output">
  <strong>Вибрані дати:</strong><br>
  Народження: {{ birthDate || '(не вибрано)' }}<br>
  Початок: {{ startDate }}
</div>

## Використання

```vue
<template>
  <orio-date-picker v-model="birthDate" label="Birth Date" />
</template>

<script setup>
const birthDate = ref(null);
</script>
```

## Пропси

Успадковує всі `ControlProps` (`label`, `size`, `layout`, `error`, ...).

| Проп          | Тип                                            | За замовчуванням | Опис                                                   |
| ------------- | ---------------------------------------------- | ---------------- | ------------------------------------------------------ |
| `placeholder` | `string`                                       | рядок i18n       | Текст тригера, коли нічого не вибрано                  |
| `min`         | `string \| null`                               | `null`           | Нижня межа у форматі ISO `YYYY-MM-DD`                  |
| `max`         | `string \| null`                               | `null`           | Верхня межа у форматі ISO `YYYY-MM-DD`                 |
| `markers`     | `CalendarMarker[]`                             | `[]`             | Підсвічені діапазони — передаються в Calendar          |
| `getMarker`   | `(iso) => CalendarMarker \| null`              | —                | Колбек маркера для кожного дня                         |
| `isDisabled`  | `(iso) => boolean`                             | —                | Додатковий предикат вимкнення, поєднується з `min` / `max` |

Тип `CalendarMarker` і правила його застосування описано в [Calendar](../calendar.md).

## v-model

`string | null` — рядок дати у форматі ISO `YYYY-MM-DD`.

## Події

| Подія               | Дані             | Опис                          |
| ------------------- | ---------------- | ----------------------------- |
| `update:modelValue` | `string \| null` | Генерується під час зміни дати |
