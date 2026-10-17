# Input

Текстове поле з підписом, слотами для іконок і підтримкою розміщення.

## Живе демо

<script setup>
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const password = ref('')
const search = ref('')
const innerName = ref('')
const innerEmail = ref('')
const innerSearch = ref('')
const innerPassword = ref('')
const innerWebsite = ref('')
const horizontalCity = ref('')
const horizontalZip = ref('')
</script>

### Вертикально (за замовчуванням)

<div class="demo-container">
  <div class="demo-grid">
    <orio-input
      v-model="name"
      placeholder="Введіть ім'я"
      label="Ім'я"
    >
      <template #before>
        <orio-icon name="user" />
      </template>
    </orio-input>
    <orio-input
      v-model="email"
      type="email"
      placeholder="you@example.com"
      label="Email"
    />
    <orio-input
      v-model="password"
      type="password"
      placeholder="••••••••"
      label="Пароль"
    />
  </div>
</div>

### З іконками

<div class="demo-container">
  <div class="demo-grid">
    <orio-input
      v-model="search"
      placeholder="Пошук..."
    >
      <template #before>
        <orio-icon name="search" />
      </template>
    </orio-input>
    <orio-input
      v-model="email"
      type="email"
      placeholder="you@example.com"
      label="Email"
    >
      <template #after>
        <orio-icon name="mail" />
      </template>
    </orio-input>
    <orio-input
      v-model="password"
      type="password"
      placeholder="••••••••"
      label="Пароль"
    >
      <template #before>
        <orio-icon name="lock" />
      </template>
      <template #after>
        <orio-icon name="eye" />
      </template>
    </orio-input>
  </div>
</div>

### Горизонтально

<div class="demo-container">
  <div class="demo-grid">
    <orio-input
      v-model="horizontalCity"
      placeholder="Місто"
      label="Місто"
      layout="horizontal"
    />
    <orio-input
      v-model="horizontalZip"
      placeholder="Поштовий індекс"
      label="Індекс"
      layout="horizontal"
    />
  </div>
</div>

### Усередині (inner)

<div class="demo-container">
  <div class="demo-grid">
    <orio-input
      v-model="innerName"
      label="Повне ім'я"
      layout="inner"
    />
    <orio-input
      v-model="innerEmail"
      type="email"
      label="Адреса email"
      layout="inner"
    />
  </div>
</div>

### Усередині з іконками

<div class="demo-container">
  <div class="demo-grid">
    <orio-input
      v-model="innerSearch"
      label="Пошук"
      layout="inner"
    >
      <template #before>
        <orio-icon name="search" />
      </template>
    </orio-input>
    <orio-input
      v-model="innerPassword"
      type="password"
      label="Пароль"
      layout="inner"
    >
      <template #before>
        <orio-icon name="lock" />
      </template>
      <template #after>
        <orio-icon name="eye" />
      </template>
    </orio-input>
    <orio-input
      v-model="innerWebsite"
      type="url"
      label="Вебсайт"
      layout="inner"
    >
      <template #after>
        <orio-icon name="external-link" />
      </template>
    </orio-input>
  </div>
</div>

## Використання

### Базове

```vue
<template>
  <orio-input v-model="name" placeholder="Enter your name" />
</template>

<script setup>
const name = ref("");
</script>
```

### З підписом

```vue
<orio-input
  v-model="email"
  label="Email Address"
  type="email"
  placeholder="you@example.com"
/>
```

### З іконками

```vue
<orio-input v-model="search" placeholder="Search...">
  <template #before>
    <orio-icon name="search" />
  </template>
</orio-input>

<orio-input v-model="password" type="password" label="Password">
  <template #before>
    <orio-icon name="lock" />
  </template>
  <template #after>
    <orio-icon name="eye" />
  </template>
</orio-input>
```

### Горизонтальне розміщення

```vue
<orio-input v-model="city" label="City" layout="horizontal" />
```

### Внутрішнє розміщення

```vue
<orio-input v-model="name" label="Full Name" layout="inner" />
```

### Різні типи

```vue
<orio-input v-model="text" type="text" label="Text" />
<orio-input v-model="email" type="email" label="Email" />
<orio-input v-model="password" type="password" label="Password" />
<orio-input v-model="number" type="number" label="Age" />
<orio-input v-model="url" type="url" label="Website" />
```

## Пропси

| Проп          | Тип                                     | За замовчуванням | Опис                             |
| ------------- | --------------------------------------- | ---------------- | -------------------------------- |
| `modelValue`  | `string`                                | `""`             | Значення поля (v-model)          |
| `layout`      | `"vertical" \| "horizontal" \| "inner"` | `"vertical"`     | Позиція підпису відносно поля    |
| `label`       | `string`                                | `undefined`      | Текст підпису                    |
| `placeholder` | `string`                                | `undefined`      | Текст-заповнювач                 |
| `type`        | `string`                                | `"text"`         | HTML-тип поля                    |

Усі стандартні HTML-атрибути input підтримуються через `v-bind="$attrs"`.

## Слоти

| Слот     | Опис                                         |
| -------- | -------------------------------------------- |
| `before` | Вміст перед полем (наприклад, іконка)        |
| `after`  | Вміст після поля (наприклад, іконка)         |

## Події

| Подія               | Дані     | Опис                                    |
| ------------------- | -------- | --------------------------------------- |
| `update:modelValue` | `string` | Генерується під час зміни значення поля |

## Стилізація

```css
--color-bg           /* Input background */
--color-border       /* Border color */
--color-text         /* Text color */
--color-accent       /* Focus border color */
--color-accent-soft  /* Focus ring color */
--color-muted        /* Placeholder and inner label color */
```
