# CheckBox

Власний компонент чекбокса зі станами-іконками.

## Живе демо

<script setup>
import { ref } from 'vue'

const agreed = ref(false)
const newsletter = ref(true)
const notifications = ref(false)
</script>

<div class="demo-container">
  <div class="demo-grid">
    <orio-check-box v-model="agreed">
      Я погоджуюся з умовами використання
    </orio-check-box>
  </div>
</div>
<div class="demo-container">
  <div class="demo-grid">
    <orio-check-box v-model="newsletter" checked-icon="loading-loop">
      Підписатися на розсилку (іконка завантаження, коли позначено)
    </orio-check-box> 
  </div>
</div>
<div class="demo-container">
  <div class="demo-grid">
    <orio-check-box v-model="notifications" unchecked-icon="plus">
      Увімкнути сповіщення (іконка «плюс», коли не позначено)
    </orio-check-box>
  </div>
</div>

<div class="demo-output">
  <strong>Вибір:</strong><br>
  Умови: {{ agreed ? '✓ Погоджено' : '✗ Не погоджено' }}<br>
  Розсилка: {{ newsletter ? '✓ Підписано' : '✗ Не підписано' }}<br>
  Сповіщення: {{ notifications ? '✓ Увімкнено' : '✗ Вимкнено' }}
</div>

## Використання

```vue
<template>
  <orio-check-box v-model="accepted"> I accept the terms </orio-check-box>
</template>

<script setup>
const accepted = ref(false);
</script>
```

## Пропси

| Проп            | Тип       | За замовчуванням | Опис                                     |
| --------------- | --------- | ---------------- | ---------------------------------------- |
| `modelValue`    | `boolean` | -                | Стан чекбокса (v-model)                  |
| `checkedIcon`   | `string`  | `undefined`      | Назва іконки для позначеного стану       |
| `uncheckedIcon` | `string`  | `undefined`      | Назва іконки для непозначеного стану     |

## Події

| Подія               | Дані      | Опис                                    |
| ------------------- | --------- | --------------------------------------- |
| `update:modelValue` | `boolean` | Генерується під час зміни стану чекбокса |

## Слоти

| Слот      | Пропси                 | Опис                                   |
| --------- | ---------------------- | -------------------------------------- |
| `default` | -                      | Текст/вміст підпису                    |
| `icon`    | `{ checked: boolean }` | Власний вміст іконки для стану позначки |
