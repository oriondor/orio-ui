# Calendar

Чистий UI-примітив, що рендерить сітку одного місяця. Не зберігає стану вибору — батьківський компонент передає візуальні пропси (`selected`, `markers`) і слухає події `select` / `dayEnter`.

Використовується всередині [`DatePicker`](./date/picker.md) і [`DateRangePicker`](./date/range-picker.md). Використовуйте його напряму лише тоді, коли потрібен власний сценарій вибору.

## Живе демо

<script setup>
import { ref } from 'vue'

const anchor = ref('2026-07-01')
const picked = ref(null)

const annotated = ref('2026-07-14')
const annotatedAnchor = ref('2026-07-01')
const markers = [
  { variant: 'success', start: '2026-07-03', end: '2026-07-07' },
  { variant: 'alert', start: '2026-07-12', end: '2026-07-14' },
  { variant: 'danger', start: '2026-07-20', end: '2026-07-20' },
]
const isDisabled = (iso) => {
  const day = new Date(iso).getDay()
  return day === 0 || day === 6
}
</script>

<div class="demo-container">
  <orio-calendar
    v-model:anchor="anchor"
    :selected="picked"
    @select="picked = $event"
  />
  <div class="demo-output">Вибрано: {{ picked ?? '(нічого)' }}</div>
</div>

### Маркери + вимкнені вихідні

<div class="demo-container">
  <orio-calendar
    v-model:anchor="annotatedAnchor"
    :selected="annotated"
    :markers="markers"
    :is-disabled="isDisabled"
    @select="annotated = $event"
  />
</div>

## Використання

```vue
<script setup>
import { ref } from "vue";

const anchor = ref("2026-07-01");
const picked = ref(null);

const markers = [
  { variant: "success", start: "2026-07-03", end: "2026-07-07" },
  { variant: "alert", start: "2026-07-12", end: "2026-07-14" },
  { variant: "danger", start: "2026-07-20", end: "2026-07-20" },
];

const isDisabled = (iso) => {
  const day = new Date(iso).getDay();
  return day === 0 || day === 6; // disable weekends
};
</script>

<template>
  <orio-calendar
    v-model:anchor="anchor"
    :selected="picked"
    :markers="markers"
    :is-disabled="isDisabled"
    @select="picked = $event"
  />
</template>
```

## Пропси

| Проп           | Тип                               | За замовчуванням | Опис                                                  |
| -------------- | --------------------------------- | ---------------- | ----------------------------------------------------- |
| `selected`     | `string \| null`                  | `null`           | ISO-дата, підсвічена як активний вибір                |
| `markers`      | `CalendarMarker[]`                | `[]`             | Декларативні діапазони для підсвічування              |
| `getMarker`    | `(iso) => CalendarMarker \| null` | —                | Колбек для кожного дня; якщо не null, перекриває `markers` |
| `isDisabled`   | `(iso) => boolean`                | —                | Предикат; дні, для яких він повертає `true`, неклікабельні |
| `weekStartsOn` | `0 \| 1`                          | `1`              | `0` = неділя, `1` = понеділок                         |

## Типи

```typescript
type MarkerVariant = "accent" | "success" | "alert" | "danger" | "muted";

interface CalendarMarker {
  variant: MarkerVariant;
  start: string; // inclusive ISO YYYY-MM-DD
  end: string; // inclusive — equal to start for single-day
}
```

## Визначення маркера

Для кожного дня:

1. Якщо `getMarker(iso)` повертає маркер, перемагає він.
2. Інакше — **останній** відповідний маркер у масиві `markers` (за перетину перемагає останній).
3. Активна дата `selected` рендериться як заповнений акцентний значок **поверх** будь-якого маркера.
4. `isDisabled(iso) === true` робить клітинку неклікабельною та приглушеною.

Багатоденні маркери рендеряться суцільною смугою — зовнішні кути заокруглюють лише клітинки `start` і `end` маркера.

## v-model

| Модель   | Тип              | Опис                                  |
| -------- | ---------------- | ------------------------------------- |
| `anchor` | `string \| null` | ISO-дата, що визначає видимий місяць  |

## Події

| Подія           | Дані     | Опис                                          |
| --------------- | -------- | --------------------------------------------- |
| `select`        | `string` | Генерується під час кліку на невимкнений день |
| `dayEnter`      | `string` | Генерується під час наведення на день (для попереднього перегляду діапазону) |
| `update:anchor` | `string` | Генерується, коли користувач гортає місяці    |

Усі дати — рядки у форматі ISO `YYYY-MM-DD`.
