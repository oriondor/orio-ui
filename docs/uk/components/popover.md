# Popover

Поповер з розумним позиціюванням і автоматичним запасним розміщенням.

## Живе демо

<script setup>
import { ref } from 'vue'
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-popover position="bottom-left">
      <template #default="{ toggle }">
        <orio-button variant="secondary" @click="toggle()">
          Знизу ліворуч
        </orio-button>
      </template>
      <template #content="{ toggle }">
        <div class="demo-output" style="min-width: 200px;">
          <p>Вміст поповера тут!</p>
          <orio-button variant="subdued" @click="toggle(false)">Закрити</orio-button>
        </div>
      </template>
    </orio-popover>
  </div>
</div>

<div class="demo-container">
  <div class="demo-row">
    <orio-popover position="top-right">
      <template #default="{ toggle }">
        <orio-button variant="secondary" @click="toggle()">
          Згори праворуч
        </orio-button>
      </template>
      <template #content="{ toggle }">
        <div class="demo-output" style="min-width: 200px;">
          <p>Інша позиція!</p>
          <orio-button variant="subdued" @click="toggle(false)">Закрити</orio-button>
        </div>
      </template>
    </orio-popover>
  </div>
</div>

## Використання

```vue
<template>
  <orio-popover position="bottom-left">
    <template #default="{ toggle }">
      <orio-button @click="toggle()"> Show Popover </orio-button>
    </template>

    <template #content="{ toggle }">
      <div class="popover-content">
        <p>Your content here</p>
        <orio-button variant="secondary" @click="toggle(false)">Close</orio-button>
      </div>
    </template>
  </orio-popover>
</template>
```

## Пропси

| Проп       | Тип       | За замовчуванням | Опис                          |
| ---------- | --------- | ---------------- | ----------------------------- |
| `position` | `string`  | `'bottom-left'`  | Позиція поповера              |
| `offset`   | `number`  | `10`             | Відстань від тригера (px)     |
| `disabled` | `boolean` | `false`          | Вимкнути поповер              |

### Значення позиції

- Одинарні: `'top'`, `'bottom'`, `'left'`, `'right'`
- Комбіновані: `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`, `'left-top'`, `'left-bottom'`, `'right-top'`, `'right-bottom'`

## Слоти

| Слот      | Пропси       | Опис            |
| --------- | ------------ | --------------- |
| `default` | `{ toggle }` | Елемент-тригер  |
| `content` | `{ toggle }` | Вміст поповера  |

## Можливості

- Автоматичне визначення меж в'юпорту
- Запасне позиціювання, якщо вміст не вміщується
- Закриття кліком поза поповером
- Телепортується в body
- Обробляє події прокручування та зміни розміру
