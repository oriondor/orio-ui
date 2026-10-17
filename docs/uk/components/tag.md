# Tag

Стилізований компонент тегу/мітки.

## Живе демо

<script setup>
import { ref } from 'vue'
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

## Пропси

| Проп      | Тип                        | За замовчуванням | Опис             |
| --------- | -------------------------- | ---------------- | ---------------- |
| `text`    | `string`                   | -                | Текст тегу       |
| `variant` | `'neutral' \| 'accent'`    | `'neutral'`      | Візуальний стиль тегу |
