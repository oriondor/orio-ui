# Textarea

Багаторядкове текстове поле з підтримкою підпису та розміщення.

## Живе демо

<script setup>
import { ref } from 'vue'

const bio = ref('')
const message = ref('Це повідомлення за замовчуванням.\nМене можна редагувати!')
const innerNotes = ref('')
const innerFeedback = ref('')
const horizontalComment = ref('')
</script>

### Вертикально (за замовчуванням)

<div class="demo-container">
  <div class="demo-grid">
    <orio-textarea
      v-model="bio"
      label="Біографія"
      placeholder="Розкажіть про себе..."
    />
    <orio-textarea
      v-model="message"
      label="Повідомлення"
      placeholder="Введіть повідомлення"
    />
  </div>
</div>

### Горизонтально

<div class="demo-container">
  <orio-textarea
    v-model="horizontalComment"
    label="Коментар"
    placeholder="Залиште коментар..."
    layout="horizontal"
  />
</div>

### Усередині (inner)

<div class="demo-container">
  <div class="demo-grid">
    <orio-textarea
      v-model="innerNotes"
      label="Нотатки"
      layout="inner"
    />
    <orio-textarea
      v-model="innerFeedback"
      label="Відгук"
      layout="inner"
    />
  </div>
</div>

## Використання

### Базове

```vue
<template>
  <orio-textarea
    v-model="description"
    label="Description"
    placeholder="Enter description..."
  />
</template>

<script setup>
const description = ref("");
</script>
```

### Горизонтальне розміщення

```vue
<orio-textarea
  v-model="comment"
  label="Comment"
  layout="horizontal"
/>
```

### Внутрішнє розміщення

```vue
<orio-textarea
  v-model="notes"
  label="Notes"
  layout="inner"
/>
```

## Пропси

| Проп         | Тип                                          | За замовчуванням | Опис                                  |
| ------------ | -------------------------------------------- | ---------------- | ------------------------------------- |
| `modelValue` | `string`                                     | `""`             | Значення поля (v-model)               |
| `layout`     | `"vertical" \| "horizontal" \| "inner"`   | `"vertical"`     | Позиція підпису відносно поля         |
| `label`      | `string`                                     | `undefined`      | Текст підпису                         |
| `placeholder`| `string`                                     | `undefined`      | Текст-заповнювач                      |

Усі стандартні HTML-атрибути textarea підтримуються через `v-bind="$attrs"`.

## Події

| Подія               | Дані     | Опис                                 |
| ------------------- | -------- | ------------------------------------ |
| `update:modelValue` | `string` | Генерується під час зміни значення   |

## Стилізація

```css
--color-bg           /* Textarea background */
--color-border       /* Border color */
--color-text         /* Text color */
--color-accent       /* Focus border color */
--color-accent-soft  /* Focus ring color */
--color-muted        /* Placeholder and inner label color */
```
