# Orio UI

A delightful, lightweight component library for Nuxt 3 applications. Built with TypeScript, fully tested, and designed for modern web development.

[![npm version](https://img.shields.io/npm/v/orio-ui.svg)](https://www.npmjs.com/package/orio-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✨ **18 Components** - Beautiful, accessible components ready to use
🎨 **Themeable** - 5 built-in accent themes with light/dark mode support
🚀 **Auto-imported** - Works seamlessly with Nuxt's auto-import system
📦 **Tree-shakeable** - Only bundle what you use
🎯 **TypeScript** - Fully typed for great developer experience
🧪 **Tested** - 71+ unit tests for reliability
📱 **Responsive** - Mobile-first design approach
♿ **Accessible** - ARIA-compliant components

## Quick Start

### Installation

```bash
npm install orio-ui
```

### Setup

Add Orio UI to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  extends: ['orio-ui']
})
```

That's it! All components and composables are now auto-imported.

### Usage

```vue
<template>
  <div>
    <orio-button type="primary" @click="handleClick">
      Click Me
    </orio-button>

    <orio-input
      v-model="email"
      label="Email"
      placeholder="you@example.com"
    />

    <orio-view-text type="title" size="large">
      Welcome to Orio UI
    </orio-view-text>
  </div>
</template>

<script setup>
const email = ref('')

// Composables are auto-imported too!
const { theme, setTheme } = useTheme()

function handleClick() {
  setTheme('ocean')
}
</script>
```

## What's Included

### Components (18)

#### Form Controls
- **Input** - Text input with label support
- **Textarea** - Multi-line text input
- **CheckBox** - Custom checkbox with icon states
- **DatePicker** - Date selection with month/year options
- **DateRangePicker** - Start and end date selection
- **Selector** - Generic dropdown selector (single/multi-select)
- **Tag** - Styled tag/badge component

#### Interactive
- **Button** - Primary, secondary, subdued variants with loading/icon support
- **Modal** - Animated modal with origin morphing
- **Popover** - Positioned popover with smart placement

#### Display
- **Icon** - SVG icon system with 12 bundled icons
- **LoadingSpinner** - Animated loading indicator
- **EmptyState** - Empty state placeholder
- **DashedContainer** - Dashed border container with icon
- **ControlElement** - Form control wrapper

#### View
- **Text** - Typography component with variants
- **Dates** - Date range display formatter
- **Separator** - Visual divider

### Composables (4)

- **useTheme** - Theme and color mode management
- **useModal** - Modal state with animation origin tracking
- **useFuzzySearch** - Fuzzy search powered by Fuse.js
- **useApi** - Type-safe API request wrapper

### Theming

Built-in themes:
- **Navy** (default) - Professional blue
- **Ocean** - Fresh cyan
- **Sunset** - Warm orange
- **Forest** - Natural green
- **Purple** - Creative purple

All themes support light and dark modes. Fully customizable via CSS variables.

```vue
<script setup>
const { setTheme, setMode } = useTheme()

setTheme('ocean')
setMode('dark')
</script>
```

## Documentation

Full documentation:

- [Getting Started Guide](./docs/getting-started.md)
- [Theming Guide](./docs/theming.md)
- [Component Documentation](./docs/components/)
- [Composable Documentation](./docs/composables/)
- [Utils Documentation](./docs/utils/)

## Development

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/vladooo/orio-ui.git
cd orio-ui

# Install dependencies
npm install

# Run documentation site
npm run dev

# Run tests
npm test

# Build library
npm run build

# Run documentation
npm run docs:dev
```

### Project Structure

```
orio-ui/
├── src/runtime/
│   ├── components/       # 18 Vue components
│   ├── composables/      # 4 composables
│   ├── assets/css/       # Theme CSS files
│   └── utils/            # Icon registry
├── tests/                # Vitest unit tests
├── docs/                 # VitePress documentation
└── nuxt.config.ts        # Nuxt Layer configuration
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests once
npm run test:unit

# Watch mode
npm run test:watch
```

## TypeScript Support

Orio UI is written in TypeScript and provides full type definitions:

```typescript
import type { TextTypes, TagStyle } from 'orio-ui/composables'
import type { OriginRect, ModalProps } from 'orio-ui/composables'
import type { IconName } from 'orio-ui/composables'
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [vladooo](https://github.com/vladooo)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## Credits

Built with:
- [Nuxt 3](https://nuxt.com/) - Vue framework
- [VueUse](https://vueuse.org/) - Vue composables collection
- [Fuse.js](https://fusejs.io/) - Fuzzy search library
- [VitePress](https://vitepress.dev/) - Documentation
- [Vitest](https://vitest.dev/) - Testing framework

---

**Made with ❤️ for the Nuxt community**
