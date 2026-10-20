# Slider

Повзунок для одного значення на основі нативного `<input type="range">`, обгорнутий у `ControlElement`.

## Живе демо

<script setup>
import { ref } from 'vue'

const area = ref(60)
const volume = ref(40)
const opacity = ref(0.5)
const sizes = ['xs', 'sm', 'md', 'lg', 'xl']
</script>

### Базове

<div class="demo-container">
  <orio-slider v-model="volume" label="Гучність" />
</div>

<div class="demo-output">
  <strong>Значення:</strong> {{ volume }}
</div>

### Показ значення

<div class="demo-container">
  <orio-slider v-model="area" label="Площа" :min="20" :max="200" :step="5">
    <template #after>
      <orio-view-text>{{ area }} м²</orio-view-text>
    </template>
  </orio-slider>
</div>

### Дробовий крок

<div class="demo-container">
  <orio-slider v-model="opacity" label="Прозорість" :min="0" :max="1" :step="0.1">
    <template #after>
      <orio-view-text>{{ opacity }}</orio-view-text>
    </template>
  </orio-slider>
</div>

### Розміри

<div class="demo-container">
  <orio-slider v-for="size in sizes" :key="size" v-model="volume" :size :label="size" />
</div>

### Горизонтальне розташування, вимкнений стан, помилка

<div class="demo-container">
  <orio-slider v-model="volume" label="Горизонтально" layout="horizontal" />
  <orio-slider v-model="volume" label="Вимкнено" disabled />
  <orio-slider v-model="volume" label="З помилкою" error="Занадто гучно" />
</div>

## Використання

```vue
<template>
  <orio-slider v-model="area" label="Площа" :min="20" :max="200" :step="5">
    <template #after>
      <orio-view-text>{{ area }} м²</orio-view-text>
    </template>
  </orio-slider>
</template>

<script setup>
import { ref } from 'vue'

const area = ref(60)
</script>
```

## Пропси

Розширює `ControlProps` (`label`, `error`, `size`, `layout`, `disabled`, `required`, `name`, …) — див. [ControlElement](./control-element.md).

| Проп | Тип | За замовчуванням | Опис |
|------|-----|------------------|------|
| `modelValue` | `number` | `0` | Поточне значення (v-model) |
| `min` | `number` | `0` | Найменше значення |
| `max` | `number` | `100` | Найбільше значення |
| `step` | `number` | `1` | Крок; значення прив'язуються до нього |

## Події

| Подія | Дані | Опис |
|-------|------|------|
| `update:modelValue` | `number` | Під час перетягування або зміни з клавіатури; обмежене `min`–`max` і прив'язане до `step` |

## Слоти

| Слот | Опис |
|------|------|
| `before` | Вміст перед доріжкою |
| `after` | Вміст після доріжки (наприклад, значення) |

## Підтримка клавіатури

Нативна поведінка range: **стрілки** — крок, **Page Up/Down** — стрибок, **Home/End** — до `min`/`max`.

## Стилізація

```css
--color-accent          /* Заповнена доріжка, обвідка повзунка, фокус */
--color-accent-hover    /* Диск повзунка */
--color-border          /* Незаповнена доріжка */
--color-bg              /* Кільце повзунка */
--control-slider-thumb  /* Діаметр повзунка, залежить від size */
--control-slider-track  /* Висота доріжки, залежить від size */
```
