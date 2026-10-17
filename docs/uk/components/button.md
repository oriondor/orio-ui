# Button

Універсальна кнопка зі станами завантаження, іконками та кількома варіантами.

## Живе демо

<script setup>
import { ref } from 'vue'

const isLoading = ref(false)

function simulateLoading() {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
}

function handleClick() {
  alert('Кнопку натиснуто!')
}
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-button variant="primary" @click="handleClick">Primary</orio-button>
    <orio-button variant="secondary" @click="handleClick">Secondary</orio-button>
    <orio-button variant="subdued" @click="handleClick">Subdued</orio-button>
  </div>
</div>

## З іконками

<div class="demo-container">
  <div class="demo-row">
    <orio-button icon="edit" @click="handleClick">Редагувати</orio-button>
    <orio-button icon="plus" @click="handleClick">Додати</orio-button>
    <orio-button icon="check" variant="secondary">Готово</orio-button>
    <orio-button icon="calendar" variant="subdued" />
  </div>
</div>

## Стани

<div class="demo-container">
  <div class="demo-row">
    <orio-button :loading="isLoading" @click="simulateLoading">
      {{ isLoading ? 'Завантаження...' : 'Натисніть, щоб завантажити' }}
    </orio-button>
    <orio-button :disabled="true">Вимкнена</orio-button>
  </div>
</div>

## Як посилання {#as-a-link}

Передайте `to`, і кнопка відрендериться як справжнє `<a href>`, тож працюють пошукові роботи,
клік середньою кнопкою та «відкрити в новій вкладці». Внутрішні шляхи навігуються через Vue router,
якщо його встановлено (у Nuxt — завжди), без перезавантаження сторінки. Зовнішні URL, `tel:` / `mailto:`
і `#hash`-посилання обробляє браузер. Поки `disabled` або `loading`, рендериться
`<button>`.

<div class="demo-container">
  <div class="demo-row">
    <orio-button to="#as-a-link">Внутрішнє посилання</orio-button>
    <orio-button to="mailto:hello@example.com" variant="secondary">Напишіть нам</orio-button>
    <orio-button to="#as-a-link" disabled>Вимкнене посилання</orio-button>
  </div>
</div>

```vue
<template>
  <orio-button to="/reserve">Book a table</orio-button>
  <orio-button to="tel:+31165564090" variant="secondary">Call us</orio-button>
</template>
```

## Використання

### Базове

```vue
<template>
  <orio-button @click="handleClick">
    Click Me
  </orio-button>
</template>

<script setup>
function handleClick() {
  console.log('Clicked!')
}
</script>
```

### Варіанти кнопки

```vue
<orio-button variant="primary">Primary</orio-button>
<orio-button variant="secondary">Secondary</orio-button>
<orio-button variant="subdued">Subdued</orio-button>
```

### З іконками

```vue
<!-- Icon before text -->
<orio-button icon="edit">Edit</orio-button>

<!-- Icon only (automatically rounds to circle) -->
<orio-button icon="plus" />
```

### Стан завантаження

```vue
<template>
  <orio-button :loading="isLoading" @click="save">
    Save Changes
  </orio-button>
</template>

<script setup>
const isLoading = ref(false)

async function save() {
  isLoading.value = true
  await api.save()
  isLoading.value = false
}
</script>
```

## Пропси

| Проп | Тип | За замовчуванням | Опис |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'subdued'` | `'primary'` | Візуальний стиль кнопки |
| `icon` | `string` | `undefined` | Назва іконки з реєстру іконок |
| `loading` | `boolean` | `false` | Показує індикатор завантаження, блокує кліки |
| `disabled` | `boolean` | `false` | Вимикає взаємодію з кнопкою |
| `to` | `RouteLocationRaw` | `undefined` | Рендерити як справжнє `<a href>` (навігація роутером для внутрішніх шляхів); ігнорується, поки `disabled`/`loading` |

**Примітка:** нативний HTML-атрибут `type` (наприклад, `type="submit"`) можна використовувати як зазвичай через `v-bind` — він передається на внутрішній елемент `<button>`.

## Події

| Подія | Дані | Опис |
|-------|---------|-------------|
| `click` | `PointerEvent` | Генерується під час кліку (коли не loading/disabled) |

## Слоти

| Слот | Пропси | Опис |
|------|-------|-------------|
| `default` | - | Текстовий вміст кнопки |
| `icon` | - | Власний вміст іконки |

## Стилізація

Кнопка використовує такі CSS-змінні:

```css
--color-accent       /* Primary button background */
--color-accent-ink   /* Text color on primary */
--color-accent-hover /* Hover state */
--color-accent-border
```
