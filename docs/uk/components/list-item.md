# List Item

Гнучкий елемент списку з необов'язковими крайовими слотами start/end, підтримкою вибору та іконок. Ідеально підходить для списків опцій, меню та груп елементів з вибором.

## Живе демо

<script setup>
import { ref } from 'vue'

const selected1 = ref(false)
const selected2 = ref(false)
const selected3 = ref(false)
</script>

### Простий елемент

<div class="demo-container">
  <orio-list-item>
    Панель керування
  </orio-list-item>
</div>

### З іконкою на початку

<div class="demo-container">
  <orio-list-item>
    <template #start>
      <orio-icon name="mail" />
    </template>
    Вхідні
  </orio-list-item>
</div>

### З іконкою в кінці

<div class="demo-container">
  <orio-list-item>
    Налаштування
    <template #end>
      <orio-icon name="chevron-right" />
    </template>
  </orio-list-item>
</div>

### З іконками з обох боків

<div class="demo-container">
  <orio-list-item>
    <template #start>
      <orio-icon name="credit-card" />
    </template>
    Способи оплати
    <template #end>
      <orio-icon name="external-link" />
    </template>
  </orio-list-item>
</div>

### З вибором

<div class="demo-container">
  <orio-list-item selectable v-model:selected="selected1">
    <template #end>
      <orio-icon name="mail" />
    </template>
    Сповіщення електронною поштою
  </orio-list-item>
  <orio-list-item selectable v-model:selected="selected2">
    <template #end>
      <orio-icon name="chat" />
    </template>
    Сповіщення в чаті
  </orio-list-item>
  <orio-list-item selectable v-model:selected="selected3">
    <template #end>
      <orio-icon name="phone" />
    </template>
    Сповіщення телефоном
  </orio-list-item>

  <div class="demo-output">
    <strong>Вибрано:</strong>
    Пошта: {{ selected1 }},
    Чат: {{ selected2 }},
    Телефон: {{ selected3 }}
  </div>
</div>

### З вибором і власним слотом start

Коли `selectable` дорівнює true, слот start за замовчуванням показує чекбокс. Його можна перевизначити:

<div class="demo-container">
  <orio-list-item selectable v-model:selected="selected1">
    <template #start>
      <orio-icon name="image" />
    </template>
    Власна іконка на початку (перемикання працює)
  </orio-list-item>
</div>

## Використання

### Базове

```vue
<orio-list-item>
  Simple text item
</orio-list-item>
```

### З іконкою на початку

```vue
<orio-list-item>
  <template #start>
    <orio-icon name="mail" />
  </template>
  Inbox
</orio-list-item>
```

### З іконкою в кінці

```vue
<orio-list-item>
  Settings
  <template #end>
    <orio-icon name="chevron-right" />
  </template>
</orio-list-item>
```

### З іконками з обох боків

```vue
<orio-list-item>
  <template #start>
    <orio-icon name="credit-card" />
  </template>
  Payment Methods
  <template #end>
    <orio-icon name="external-link" />
  </template>
</orio-list-item>
```

### З вибором через v-model

```vue
<script setup>
const selected = ref(false);
</script>

<template>
  <orio-list-item selectable v-model:selected="selected">
    Toggle me
  </orio-list-item>
</template>
```

## Пропси

| Проп         | Тип       | За замовчуванням | Опис                                                                               |
| ------------ | --------- | ---------------- | ---------------------------------------------------------------------------------- |
| `selectable` | `boolean` | `false`          | Вмикає перемикання кліком і за замовчуванням показує чекбокс у слоті start         |

## Модель

| Модель     | Тип       | Опис                                                             |
| ---------- | --------- | ---------------------------------------------------------------- |
| `selected` | `boolean` | Двобічне зв'язування стану вибору. Використовуйте `v-model:selected` |

## Слоти

| Слот      | Опис                                                                                       |
| --------- | ------------------------------------------------------------------------------------------ |
| `default` | Основний вміст елемента списку                                                             |
| `start`   | Лівий край — показується, якщо переданий або коли `selectable` дорівнює true (за замовчуванням чекбокс) |
| `end`     | Правий край — рендериться лише якщо переданий                                              |

## Стилізація

```css
--color-accent         /* Selected item background */
--color-accent-soft-darker  /* Selected item text color */
--color-surface        /* Hover background (non-selected) */
```
