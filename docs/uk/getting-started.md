# Початок роботи

## Встановлення

Встановіть Orio UI у свій проєкт на Nuxt 3:

```bash
npm install orio-ui
```

## Налаштування

Додайте Orio UI до `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['orio-ui']
})
```

От і все! Усі компоненти та композабли тепер імпортуються автоматично.

## Використання

### Компоненти

Компоненти імпортуються автоматично з префіксом `orio-`:

```vue
<template>
  <div>
    <orio-button variant="primary" @click="save">
      Save Changes
    </orio-button>

    <orio-input
      v-model="email"
      placeholder="Enter your email"
      label="Email Address"
    />

    <orio-view-text type="title" size="large">
      Welcome to Orio UI
    </orio-view-text>
  </div>
</template>

<script setup>
const email = ref('')

function save() {
  console.log('Saving...', email.value)
}
</script>
```

### Композабли

Композабли також імпортуються автоматично:

```vue
<script setup>
// Theme management
const { theme, setTheme, mode, setMode } = useTheme()

// Modal with animation
const { modalProps, openModal } = useModal()

// Fuzzy search
const items = ['Apple', 'Banana', 'Cherry']
const search = ref('')
const results = useFuzzySearch(items, search)

// API requests
const data = await useApi('/api/users')
</script>
```

## Підтримка TypeScript

Orio UI повністю типізована. За потреби імпортуйте типи:

```typescript
import type { TextTypes, TagStyle } from 'orio-ui/composables'
import type { OriginRect, ModalProps } from 'orio-ui/composables'
```

## Що далі

- [Дізнатися про теми](/uk/theming)
- [Переглянути компоненти](/uk/components/button)
- [Спробувати композабли](/uk/composables/use-theme)
