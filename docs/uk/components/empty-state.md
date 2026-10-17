# EmptyState

Заглушка порожнього стану з іконкою та описом.

## Живе демо

<script setup>
import { ref } from 'vue'
</script>

<div class="demo-container">
  <div class="demo-grid">
    <orio-empty-state
      icon="search"
      title="Нічого не знайдено"
      description="Спробуйте змінити критерії пошуку"
      size="small"
    />
  </div>
</div>
<div class="demo-container">
  <div class="demo-grid">
    <orio-empty-state
      icon="calendar"
      title="Немає запланованих подій"
      description="Створіть першу подію, щоб почати"
      size="medium"
    />
  </div>
</div>
<div class="demo-container">
  <div class="demo-grid">
    <orio-empty-state
      icon="edit"
      title="Немає документів"
      description="Завантажте або створіть новий документ"
      size="large"
    >
      <orio-button variant="primary" icon="plus">
        Створити документ
      </orio-button>
    </orio-empty-state>
  </div>
</div>

## Використання

```vue
<template>
  <orio-empty-state
    icon="search"
    title="No results found"
    description="Try adjusting your search criteria"
    size="small"
  />
  <orio-empty-state
    icon="calendar"
    title="No events scheduled"
    description="Create your first event to get started"
    size="medium"
  />
  <orio-empty-state
    icon="edit"
    title="No documents"
    description="Upload or create a new document"
    size="large"
  >
    <orio-button variant="primary" icon="plus"> Create Document </orio-button>
  </orio-empty-state>
</template>
```

## Пропси

| Проп          | Тип                              | За замовчуванням | Опис             |
| ------------- | -------------------------------- | ---------------- | ---------------- |
| `icon`        | `string`                         | `undefined`      | Назва іконки     |
| `title`       | `string`                         | -                | Основний заголовок |
| `description` | `string`                         | `undefined`      | Текст опису      |
| `size`        | `'small' \| 'medium' \| 'large'` | `'medium'`       | Розмір компонента |

## Слоти

| Слот      | Опис                                  |
| --------- | ------------------------------------- |
| `default` | Кнопки дій або додатковий вміст       |
