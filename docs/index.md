# Orio UI

A delightful, lightweight component library for Nuxt 3 applications.

## Features

✨ **18 Components** - Beautiful, accessible components ready to use
🎨 **Themeable** - 5 built-in accent themes with light/dark mode support
🚀 **Auto-imported** - Works seamlessly with Nuxt's auto-import system
📦 **Tree-shakeable** - Only bundle what you use
🎯 **TypeScript** - Fully typed for great DX
🧪 **Tested** - 71+ unit tests for reliability

## Quick Start

```bash
npm install orio-ui
```

Add to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['orio-ui']
})
```

Start using components:

```vue
<template>
  <orio-button type="primary" @click="handleClick">
    Click Me
  </orio-button>
</template>
```

## What's Included

### Components
- Form controls: Input, Textarea, CheckBox, DatePicker, DateRangePicker, Selector
- Interactive: Button, Modal, Popover
- Display: Icon, LoadingSpinner, EmptyState, Tag, DashedContainer
- View: Text, Dates, Separator

### Composables
- `useTheme` - Theme and color mode management
- `useModal` - Modal state with animation origin tracking
- `useFuzzySearch` - Fuzzy search with Fuse.js
- `useApi` - Type-safe API requests

### Theming
Built-in themes: Navy (default), Ocean, Sunset, Forest, Purple
Modes: Light & Dark

All customizable via CSS variables.

## Next Steps

- [Installation & Setup](/getting-started)
- [Theming Guide](/theming)
- [Browse Components](/components/button)
- [Explore Composables](/composables/use-theme)
