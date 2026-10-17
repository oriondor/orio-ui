# View Dates

Показує відформатовані діапазони дат: окремі дати, діапазони та позначку «Present» (дотепер).

## Живе демо

<script setup>
import { ref } from 'vue'

const singleDate = { startDate: '2024-03-15' }
const dateRange = { startDate: '2022-01-01', endDate: '2024-06-30' }
const currentRange = { startDate: '2023-05-01', endDate: null }
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-view-dates :dates="singleDate" />
  </div>
  <div class="demo-row">
    <orio-view-dates :dates="dateRange" />
  </div>
  <div class="demo-row">
    <orio-view-dates :dates="currentRange" />
  </div>
</div>

## Використання

### Окрема дата

```vue
<template>
  <orio-view-dates :dates="{ startDate: '2024-03-15' }" />
</template>
```

### Діапазон дат

```vue
<template>
  <orio-view-dates :dates="{ startDate: '2022-01-01', endDate: '2024-06-30' }" />
</template>
```

### Поточний (з «Present»)

Передайте `null` в `endDate`, щоб показати «Present»:

```vue
<template>
  <orio-view-dates :dates="{ startDate: '2023-05-01', endDate: null }" />
</template>
```

### Формат «місяць/рік»

Проп `month` показує лише місяць і рік:

```vue
<template>
  <orio-view-dates :dates="dates" month />
</template>
```

## Пропси

| Проп | Тип | За замовчуванням | Опис |
|------|------|---------|-------------|
| `dates` | `ResumeDate` | обов'язковий | Об'єкт дати зі startDate і необов'язковим endDate |
| `month` | `boolean` | `false` | Показувати лише місяць/рік замість повної дати |
| `size` | `'small' \| 'medium' \| 'large'` | `'small'` | Розмір тексту |
| `type` | `'text' \| 'title' \| 'subtitle' \| 'italics'` | `'italics'` | Стиль тексту |

## Типи

```ts
interface ResumeDate {
  startDate: string;
  endDate?: string | null; // undefined = single date, null = "Present"
}
```

## Примітки

- Використовує `Intl.DateTimeFormat` для локалізованого форматування (en-US)
- Коли `endDate` дорівнює `undefined`, показується лише дата початку
- Коли `endDate` дорівнює `null`, показується «Present»
- Всередині використовує `orio-view-text` для узгодженої типографіки
