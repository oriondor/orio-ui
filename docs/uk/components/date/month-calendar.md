# MonthCalendar

Чистий UI-примітив, що рендерить рік як сітку місяців 3×4. «Помісячний» родич [`Calendar`](../calendar.md) — не зберігає стану вибору; батьківський компонент передає візуальні пропси (`selected`, `markers`) і слухає `select` / `monthEnter`.

Кожна ISO-дата прив'язується до **першого числа свого місяця**, тож `selected`, `markers` і значення події `select` вирівнюються на `YYYY-MM-01`. Шеврони гортають видимий рік; стрілки клавіатури переміщують фокус по сітці й на краях гортають роки.

## Живе демо

<script setup>
import { ref } from 'vue'

const anchor = ref('2026-01-01')
const picked = ref(null)

const annotatedAnchor = ref('2026-01-01')
const annotated = ref('2026-05-01')
const markers = [
  { variant: 'success', start: '2026-02-01', end: '2026-04-01' },
  { variant: 'alert', start: '2026-07-01', end: '2026-08-01' },
  { variant: 'danger', start: '2026-11-01', end: '2026-11-01' },
]
// disable months before today
const isDisabled = (iso) => new Date(iso) < new Date('2026-03-01')
</script>

<div class="demo-container">
  <orio-date-month-calendar
    v-model:anchor="anchor"
    :selected="picked"
    @select="picked = $event"
  />
  <div class="demo-output">Вибрано: {{ picked ?? '(нічого)' }}</div>
</div>

### Маркери + вимкнені місяці

<div class="demo-container">
  <orio-date-month-calendar
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

const anchor = ref("2026-01-01");
const picked = ref(null);

const markers = [
  { variant: "success", start: "2026-02-01", end: "2026-04-01" },
  { variant: "alert", start: "2026-07-01", end: "2026-08-01" },
  { variant: "danger", start: "2026-11-01", end: "2026-11-01" },
];

const isDisabled = (iso) => new Date(iso) < new Date("2026-03-01");
</script>

<template>
  <orio-date-month-calendar
    v-model:anchor="anchor"
    :selected="picked"
    :markers="markers"
    :is-disabled="isDisabled"
    @select="picked = $event"
  />
</template>
```

## Пропси

| Проп         | Тип                               | За замовчуванням | Опис                                                   |
| ------------ | --------------------------------- | ---------------- | ------------------------------------------------------ |
| `selected`   | `string \| null`                  | `null`           | ISO-дата, підсвічена як активний вибір (прив'язана до місяця) |
| `markers`    | `CalendarMarker[]`                | `[]`             | Декларативні діапазони для підсвічування               |
| `getMarker`  | `(iso) => CalendarMarker \| null` | —                | Колбек для кожного місяця; якщо не null, перекриває `markers` |
| `isDisabled` | `(iso) => boolean`                | —                | Предикат; місяці, для яких він повертає `true`, неклікабельні |

Колбеки маркера й вимкнення отримують ISO-рядок першого числа місяця (`YYYY-MM-01`).

## Типи

```typescript
// re-used from Calendar
type MarkerVariant = "accent" | "success" | "alert" | "danger" | "muted";

interface CalendarMarker {
  variant: MarkerVariant;
  start: string; // inclusive ISO YYYY-MM-DD (pinned to month for comparison)
  end: string; // inclusive — equal to start for a single month
}

// exported from MonthCalendar.vue
interface MonthCalendarProps {
  selected?: string | null;
  markers?: CalendarMarker[];
  getMarker?: (iso: string) => CalendarMarker | null;
  isDisabled?: (iso: string) => boolean;
}
```

## Визначення маркера

Для кожного місяця:

1. Якщо `getMarker(iso)` повертає маркер, перемагає він.
2. Інакше — **останній** відповідний маркер у масиві `markers` (за перетину перемагає останній).
3. Активний місяць `selected` рендериться як заповнений акцентний значок **поверх** будь-якого маркера.
4. `isDisabled(iso) === true` робить клітинку неклікабельною та приглушеною.

Багатомісячні маркери рендеряться суцільною смугою — зовнішні кути заокруглюють лише клітинки `start` і `end` маркера.

## v-model

| Модель   | Тип              | Опис                                 |
| -------- | ---------------- | ------------------------------------ |
| `anchor` | `string \| null` | ISO-дата, що визначає видимий рік    |

## Події

| Подія           | Дані     | Опис                                                  |
| --------------- | -------- | ----------------------------------------------------- |
| `select`        | `string` | ISO першого числа натиснутого місяця                  |
| `monthEnter`    | `string` | Генерується під час наведення на місяць (для попереднього перегляду діапазону) |
| `update:anchor` | `string` | Генерується, коли користувач переходить на інший рік  |

Усі дати — рядки у форматі ISO `YYYY-MM-DD`, нормалізовані до першого числа місяця.

## Клавіатура

| Клавіша            | Дія                                                |
| ------------------ | -------------------------------------------------- |
| Стрілки            | Переміщення фокусу в сітці; на краях — перехід на сусідній рік |
| `PageUp` / `PageDown` | На рік назад / вперед                           |
| `Enter` / `Space`  | Вибрати місяць у фокусі                            |

Вимкнені місяці пропускаються під час навігації стрілками.
