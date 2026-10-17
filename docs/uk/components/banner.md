# Banner

Кольоровий контейнер для показу важливих повідомлень, сповіщень чи виносок.

## Живе демо

<script setup>
import { ref } from 'vue'
</script>

### Варіанти

<div class="demo-container">
  <div class="demo-column">
    <orio-banner variant="info">
      Це інформаційний банер із корисними відомостями.
    </orio-banner>
    <orio-banner variant="success">
      Успіх! Зміни збережено.
    </orio-banner>
    <orio-banner variant="alert">
      Увага: цю дію неможливо скасувати.
    </orio-banner>
    <orio-banner variant="danger">
      Помилка: щось пішло не так.
    </orio-banner>
  </div>
</div>

### Із власним вмістом

<div class="demo-container">
  <div class="demo-column">
    <orio-banner variant="info">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <orio-icon name="info" size="20" />
        <span>У банер можна вкласти будь-який вміст.</span>
      </div>
    </orio-banner>
    <orio-banner variant="success">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span>Файл успішно завантажено.</span>
        <orio-button size="small">Переглянути файл</orio-button>
      </div>
    </orio-banner>
  </div>
</div>

## Використання

### Базове

```vue
<template>
  <orio-banner variant="info">
    This is an informational message.
  </orio-banner>
</template>
```

### З іконкою та кнопкою

```vue
<template>
  <orio-banner variant="success">
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <orio-icon name="check" size="20" />
      <span>Operation completed successfully!</span>
    </div>
  </orio-banner>
</template>
```

## Пропси

| Проп      | Тип                                             | За замовчуванням | Опис                  |
| --------- | ----------------------------------------------- | ---------------- | --------------------- |
| `variant` | `'danger' \| 'alert' \| 'success' \| 'info'`    | `'info'`         | Колірний варіант банера |

## Слоти

| Слот      | Опис                                         |
| --------- | -------------------------------------------- |
| `default` | Вміст банера — будь-яка коректна розмітка    |
