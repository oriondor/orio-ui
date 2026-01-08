# Getting Started

## Installation

Install Orio UI in your Nuxt 3 project:

```bash
npm install orio-ui
```

## Setup

Add Orio UI to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['orio-ui']
})
```

That's it! All components and composables are now auto-imported.

## Usage

### Using Components

Components are auto-imported with the `orio-` prefix:

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

### Using Composables

Composables are also auto-imported:

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

## TypeScript Support

Orio UI is fully typed. Import types when needed:

```typescript
import type { TextTypes, TagStyle } from 'orio-ui/composables'
import type { OriginRect, ModalProps } from 'orio-ui/composables'
```

## Next Steps

- [Learn about theming](/theming)
- [Explore components](/components/button)
- [Try composables](/composables/use-theme)
