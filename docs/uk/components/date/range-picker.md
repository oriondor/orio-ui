# DateRangePicker

Вибір діапазону дат на основі [`Calendar`](../calendar.md). Рендерить тригер, що відкриває поповер із двома календарями, кожен з яких гортається незалежно — місяць і рік з кожного боку обирайте вільно.

## Живе демо

<script setup>
import { ref } from 'vue'

const employmentDates = ref({
  start: '2020-01-01',
  end: '2024-12-31'
})

const projectDates = ref({
  start: null,
  end: null
})
</script>

<div class="demo-container">
  <orio-date-range-picker v-model="employmentDates" label="Період роботи" />
</div>

<div class="demo-container">
  <orio-date-range-picker v-model="projectDates" label="Терміни проєкту" />
</div>

<div class="demo-output">
  <strong>Робота:</strong> {{ employmentDates.start }} → {{ employmentDates.end }}<br>
  <strong>Проєкт:</strong> {{ projectDates.start }} → {{ projectDates.end }}
</div>

## Використання

```vue
<script setup>
import { ref } from "vue";
const dates = ref({ start: null, end: null });
</script>

<template>
  <orio-date-range-picker v-model="dates" label="Project Window" />
</template>
```

## Поведінка вибору

- Перший клік встановлює `start` і очищає `end`.
- Другий клік встановлює `end`. Якщо вибрана дата раніша за `start`, вони міняються місцями.
- Третій клік (коли діапазон уже повний) починає новий діапазон.
- Наведення після першого кліку показує попередній перегляд діапазону в обох календарях.

## Пропси

Успадковує всі `ControlProps` (`label`, `size`, `layout`, `error`, ...).

| Проп          | Тип                                           | За замовчуванням | Опис                                                                                     |
| ------------- | --------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------- |
| `placeholder` | `string`                                      | рядок i18n       | Текст тригера, коли нічого не вибрано                                                    |
| `min`         | `string \| null`                              | `null`           | Нижня межа у форматі ISO `YYYY-MM-DD`                                                    |
| `max`         | `string \| null`                              | `null`           | Верхня межа у форматі ISO `YYYY-MM-DD`                                                   |
| `markers`     | `CalendarMarker[]`                            | `[]`             | Підсвічені діапазони — передаються в обидва календарі                                    |
| `getMarker`   | `(iso) => CalendarMarker \| null`             | —                | Колбек маркера для кожного дня. Під час вибору його перекриває попередній перегляд діапазону |
| `isDisabled`  | `(iso) => boolean`                            | —                | Додатковий предикат вимкнення, поєднується з `min` / `max`                               |

Тип `CalendarMarker` і правила його застосування описано в [Calendar](../calendar.md).

## v-model

`DateRange` — `{ start: string | null, end: string | null }` з рядками дат у форматі ISO.

```typescript
interface DateRange {
  start: string | null;
  end: string | null;
}
```

## Події

| Подія               | Дані        | Опис                               |
| ------------------- | ----------- | ---------------------------------- |
| `update:modelValue` | `DateRange` | Генерується під час зміни діапазону |
