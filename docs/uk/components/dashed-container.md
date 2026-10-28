# DashedContainer

Контейнер із пунктирною рамкою, іконкою та текстом; зазвичай використовується для дій «завантажити» чи «додати».

## Живе демо

<script setup>
import { ref } from 'vue'

function handleClick() {
  alert('Натиснуто на контейнер!')
}
</script>

<div class="demo-container">
  <div class="demo-grid">
    <orio-dashed-container
      icon="plus"
      text="Додати елемент"
      size="small"
      @click="handleClick"
    />
  </div>
</div>

<div class="demo-container">
  <div class="demo-grid">
    <orio-dashed-container
      icon="upload"
      text="Завантажити файл"
      size="medium"
      @click="handleClick"
    />
  </div>
</div>

<div class="demo-container">
  <div class="demo-grid">
    <orio-dashed-container
      icon="calendar"
      text="Запланувати подію"
      size="large"
      @click="handleClick"
    />
  </div>
</div>

## Використання

```vue
<template>
  <orio-dashed-container
    icon="plus"
    text="Add Item"
    size="medium"
    @click="handleClick"
  />
  <orio-dashed-container
    icon="upload"
    text="Upload File"
    size="large"
    @click="handleClick"
  />
  <orio-dashed-container
    icon="calendar"
    text="Schedule Event"
    size="small"
    @click="handleClick"
  />
</template>

<script setup>
function handleClick() {
  alert("Container clicked!");
}
</script>
```

## Пропси

| Проп   | Тип                              | За замовчуванням | Опис              |
| ------ | -------------------------------- | ---------------- | ----------------- |
| `icon` | `string`                         | `undefined`      | Назва іконки      |
| `text` | `string`                         | `undefined`      | Текстовий підпис  |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'`       | Розмір контейнера |

## Події

| Подія   | Дані    | Опис                                  |
| ------- | ------- | ------------------------------------- |
| `click` | -       | Генерується під час кліку на контейнер |

## Можливості

- Нативна `<button>`: клавіатура та кільце фокусу з коробки
- Пунктирна рамка стає акцентною під час наведення, з м'яким акцентним тлом
- Іконка в круглому акцентному «чипі»; розмір іконки залежить від `size`
- Відгук на натискання; враховує `prefers-reduced-motion`
