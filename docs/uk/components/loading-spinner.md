# LoadingSpinner

Анімований індикатор завантаження.

## Живе демо

<script setup>
import { ref } from 'vue'
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-loading-spinner />
  </div>
</div>

## Використання

```vue
<template>
  <orio-loading-spinner v-if="isLoading" />
</template>

<script setup>
const isLoading = ref(true);
</script>
```

### У кнопках

Індикатор завантаження автоматично використовується в кнопках:

```vue
<orio-button :loading="isLoading">
  Save
</orio-button>
```

## Пропси

Немає — використовує стандартний розмір і колір іконки.

## Примітки

- Успадковує колір від батьківського елемента
- Всередині використовує іконку `loading-loop`
- Обертання анімоване через CSS
