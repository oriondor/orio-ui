# Badge

Універсальний значок, що працює і як окремий значок, і як обгортка, яка розміщує значок поверх будь-якого вмісту.

## Живе демо

<script setup>
import { ref } from 'vue'
const showBadge = ref(true)
</script>

### Окремі значки

<div class="demo-container">
  <div class="demo-row">
    <orio-badge>5</orio-badge>
    <orio-badge variant="danger">3</orio-badge>
    <orio-badge variant="alert">!</orio-badge>
    <orio-badge variant="grey">0</orio-badge>
  </div>
</div>

### Тип «пігулка»

<div class="demo-container">
  <div class="demo-row">
    <orio-badge pill>Нове</orio-badge>
    <orio-badge pill variant="danger">99+</orio-badge>
    <orio-badge pill variant="alert">Хіт</orio-badge>
    <orio-badge pill variant="grey">Бета</orio-badge>
  </div>
</div>

### З кнопками

<div class="demo-container">
  <div class="demo-row" style="gap: 2rem;">
    <orio-badge variant="danger">
      <template #wrapping>
        <orio-button>Сповіщення</orio-button>
      </template>
      3
    </orio-badge>
    <orio-badge variant="primary" pill>
      <template #wrapping>
        <orio-button variant="secondary">Повідомлення</orio-button>
      </template>
      12
    </orio-badge>
  </div>
</div>

### З NavButton (текст)

<div class="demo-container">
  <div class="demo-row" style="gap: 2rem;">
    <orio-badge variant="danger">
      <template #wrapping>
        <orio-nav-button icon="mail">Вхідні</orio-nav-button>
      </template>
      5
    </orio-badge>
    <orio-badge variant="primary">
      <template #wrapping>
        <orio-nav-button icon="message">Повідомлення</orio-nav-button>
      </template>
      12
    </orio-badge>
    <orio-badge variant="alert">
      <template #wrapping>
        <orio-nav-button icon="shopping-cart">Кошик</orio-nav-button>
      </template>
      3
    </orio-badge>
  </div>
</div>

### З NavButton (лише іконка)

<div class="demo-container">
  <div class="demo-row" style="gap: 2rem;">
    <orio-badge variant="danger">
      <template #wrapping>
        <orio-nav-button icon="bell" />
      </template>
      7
    </orio-badge>
    <orio-badge variant="primary" pill>
      <template #wrapping>
        <orio-nav-button icon="mail" />
      </template>
      99+
    </orio-badge>
    <orio-badge variant="alert">
      <template #wrapping>
        <orio-nav-button icon="shopping-cart" />
      </template>
      2
    </orio-badge>
    <orio-badge variant="grey">
      <template #wrapping>
        <orio-nav-button icon="heart" />
      </template>
      0
    </orio-badge>
  </div>
</div>

### З компонентом Icon

<div class="demo-container">
  <div class="demo-row" style="gap: 2rem;">
    <orio-badge variant="danger">
      <template #wrapping>
        <orio-icon name="mail" />
      </template>
    </orio-badge>
    <orio-badge variant="primary">
      <template #wrapping>
        <orio-icon name="bell" />
      </template>
      3
    </orio-badge>
    <orio-badge variant="alert">
      <template #wrapping>
        <orio-icon name="chat" />
      </template>
    </orio-badge>
  </div>
</div>

### Режим крапки

Якщо слот за замовчуванням порожній, значок рендериться маленькою крапкою — зручно для індикаторів стану.

<div class="demo-container">
  <div class="demo-row" style="gap: 2rem;">
    <orio-badge variant="danger">
      <template #wrapping>
        <orio-nav-button icon="bell" />
      </template>
    </orio-badge>
    <orio-badge variant="alert">
      <template #wrapping>
        <orio-nav-button icon="mail" />
      </template>
    </orio-badge>
    <orio-badge variant="primary">
      <template #wrapping>
        <orio-nav-button icon="user" />
      </template>
    </orio-badge>
    <orio-badge variant="grey">
      <template #wrapping>
        <orio-nav-button icon="settings" />
      </template>
    </orio-badge>
  </div>
</div>

### Прихований

Проп `hidden` приховує значок, не прибираючи обгорнутий вміст. Перемикайте його реактивно, щоб показувати чи ховати значок залежно від стану застосунку.

<div class="demo-container">
  <div class="demo-row" style="gap: 2rem; align-items: center;">
    <orio-badge variant="danger" :hidden="!showBadge">
      <template #wrapping>
        <orio-nav-button icon="bell" />
      </template>
      4
    </orio-badge>
    <orio-badge variant="primary" :hidden="!showBadge">Нове</orio-badge>
    <orio-switch-button v-model="showBadge">Показати значок</orio-switch-button>
  </div>
</div>

## Використання

### Окремий значок

```vue
<template>
  <orio-badge>5</orio-badge>
  <orio-badge variant="danger">Error</orio-badge>
  <orio-badge pill>New</orio-badge>
</template>
```

### З NavButton

```vue
<template>
  <!-- With text -->
  <orio-badge variant="danger">
    <template #wrapping>
      <orio-nav-button icon="mail">Inbox</orio-nav-button>
    </template>
    5
  </orio-badge>

  <!-- Icon only -->
  <orio-badge variant="primary">
    <template #wrapping>
      <orio-nav-button icon="bell" />
    </template>
    3
  </orio-badge>
</template>
```

### Режим крапки

```vue
<template>
  <orio-badge variant="danger">
    <template #wrapping>
      <orio-nav-button icon="bell" />
    </template>
  </orio-badge>
</template>
```

### Прихований

```vue
<template>
  <!-- Standalone badge -->
  <orio-badge :hidden="!hasUnread">New</orio-badge>

  <!-- Positioned badge — wrapping content still renders when hidden -->
  <orio-badge variant="danger" :hidden="!hasNotifications">
    <template #wrapping>
      <orio-nav-button icon="bell" />
    </template>
    4
  </orio-badge>
</template>
```

## Пропси

| Проп      | Тип                                          | За замовчуванням | Опис                                      |
| --------- | -------------------------------------------- | ---------------- | ----------------------------------------- |
| `variant` | `'danger' \| 'alert' \| 'primary' \| 'grey'` | `'primary'`      | Колірний варіант значка                   |
| `pill`    | `boolean`                                    | `false`          | Рендерить у формі пігулки (повністю заокруглений) |
| `hidden`  | `boolean`                                    | `false`          | Якщо true, значок не рендериться          |

## Слоти

| Слот       | Опис                                                    |
| ---------- | ------------------------------------------------------- |
| `default`  | Вміст значка. Якщо порожній, значок рендериться крапкою |
| `wrapping` | Вміст для обгортання. Значок розміщується над ним у правому верхньому куті |
