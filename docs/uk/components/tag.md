# Tag

Стилізований компонент тегу/мітки.

## Живе демо

<script setup>
import { nextTick, ref } from 'vue'
const removableTags = ref(['Vue', 'Nuxt', 'Vite'])
const removableRow = ref(null)
async function removeTag(tag) {
  const index = removableTags.value.indexOf(tag)
  removableTags.value = removableTags.value.filter((item) => item !== tag)
  await nextTick()
  const buttons = removableRow.value.querySelectorAll('button')
  ;(buttons[index] ?? buttons[index - 1])?.focus()
}
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-tag text="Звичайний тег" />
    <orio-tag text="Акцентний тег" variant="accent" />
    <orio-tag text="Нейтральний тег" variant="neutral" />
  </div>

  <div class="demo-row" style="margin-top: 1rem;">
    <orio-tag text="React" />
    <orio-tag text="Vue" />
    <orio-tag text="Angular" />
    <orio-tag text="Svelte" />
  </div>
</div>

## Використання

```vue
<template>
  <div>
    <orio-tag text="JavaScript" />
    <orio-tag text="Featured" variant="accent" />
  </div>
</template>
```

## Видалення

`removable` додає нативну кнопку видалення з перекладеним підписом
(`Видалити {text}`). Кнопка видає `remove`; її click та клавіші Enter/Space не
доходять до батьківського тригера; Tab і Escape проходять далі.

<div class="demo-container">
  <div ref="removableRow" class="demo-row">
    <orio-tag v-for="tag in removableTags" :key="tag" :text="tag" removable @remove="removeTag(tag)" />
  </div>
</div>

```vue
<template>
<div ref="removableRow" class="demo-row">
  <orio-tag v-for="tag in removableTags" :key="tag" :text="tag" removable @remove="removeTag(tag)" />
</div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
const removableTags = ref(['Vue', 'Nuxt', 'Vite'])
const removableRow = ref(null)
async function removeTag(tag) {
  const index = removableTags.value.indexOf(tag)
  removableTags.value = removableTags.value.filter((item) => item !== tag)
  await nextTick()
  const buttons = removableRow.value.querySelectorAll('button')
  ;(buttons[index] ?? buttons[index - 1])?.focus()
}
</script>
```

## Пропси

| Проп      | Тип                        | За замовчуванням | Опис             |
| --------- | -------------------------- | ---------------- | ---------------- |
| `text`    | `string`                   | -                | Текст тегу       |
| `variant` | `'neutral' \| 'accent'`    | `'neutral'`      | Візуальний стиль тегу |
| `removable` | `boolean`              | `false`          | Показати кнопку видалення |

## Події

| Подія    | Payload | Опис                                  |
| -------- | ------- | ------------------------------------- |
| `remove` | -       | Натиснуто кнопку видалення            |
