# Orio UI

A delightful, lightweight component library for Nuxt 3+ applications. Built with TypeScript, fully tested, and designed for modern web development.

[![npm version](https://img.shields.io/npm/v/orio-ui.svg)](https://www.npmjs.com/package/orio-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Demo](https://img.shields.io/badge/Demo-Live-blue.svg)](https://orio-ui.vercel.app/)

## Features

✨ **26 Components** - Beautiful, accessible components ready to use
🎨 **Themeable** - 5 built-in accent themes with light/dark mode support
🚀 **Auto-imported** - Works seamlessly with Nuxt's auto-import system
📦 **Tree-shakeable** - Only bundle what you use
🎯 **TypeScript** - Fully typed for great developer experience
🧪 **Tested** - 240+ unit tests for reliability
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
  modules: ["orio-ui"],
});
```

That's it! All components and composables are now auto-imported.

### Usage

```vue
<template>
  <div>
    <orio-button variant="primary" @click="handleClick"> Click Me </orio-button>

    <orio-input v-model="email" label="Email" placeholder="you@example.com" />

    <orio-view-text type="title" size="large">
      Welcome to Orio UI
    </orio-view-text>
  </div>
</template>

<script setup>
const email = ref("");

// Composables are auto-imported too!
const { theme, setTheme } = useTheme();

function handleClick() {
  setTheme("teal");
}
</script>
```

## What's Included

### Components (26)

#### Form Controls

- **Input** - Text input with label support
- **Textarea** - Multi-line text input
- **NumberInput** - Numeric input with increment/decrement (horizontal & vertical variants)
- **CheckBox** - Custom checkbox with icon states
- **SwitchButton** - Toggle switch component
- **DatePicker** - Date selection with month/year options
- **DateRangePicker** - Start and end date selection
- **Selector** - Generic dropdown selector (single/multi-select)
- **Tag** - Styled tag/badge component
- **Badge** - Status badge with variants

#### Interactive

- **Button** - Primary, secondary, subdued variants with loading/icon support
- **NavButton** - Navigation button component
- **Modal** - Animated modal with origin morphing
- **Popover** - Positioned popover with smart placement
- **Tooltip** - Hover tooltip component

#### Display

- **Icon** - SVG icon system with 97 bundled icons
- **LoadingSpinner** - Animated loading indicator
- **EmptyState** - Empty state placeholder
- **DashedContainer** - Dashed border container with icon
- **ControlElement** - Form control wrapper
- **AnimatedContainer** - Flex container with fade-in animation and optional sound

#### View

- **Text** - Typography component with variants
- **Dates** - Date range display formatter
- **Separator** - Visual divider

#### Gallery

- **Carousel** - Image carousel component

#### Upload

- **Upload** - File upload component

### Composables (8)

- **useTheme** - Theme and color mode management
- **useModal** - Modal state with animation origin tracking
- **useFuzzySearch** - Fuzzy search powered by Fuse.js
- **useApi** - Type-safe API request wrapper
- **useValidation** - Form validation with error handling
- **useDecimalFormatter** - Number formatting utilities
- **usePressAndHold** - Press and hold interaction handler
- **useSound** - Audio playback with CDN-hosted sounds

### Theming

Built-in themes:

- **Navy** (default) - Professional blue
- **Teal** - Fresh cyan-green
- **Forest** - Natural green
- **Wine** - Deep burgundy
- **Royal** - Rich purple-blue
- **Normal** - Neutral gray
- **Inverse** - High contrast (adapts to mode)

All themes support light and dark modes. Fully customizable via CSS variables.

```vue
<script setup>
const { setTheme, setMode } = useTheme();

setTheme("ocean");
setMode("dark");
</script>
```

## Documentation

**[Live Demo & Documentation](https://orio-ui.vercel.app/)**

- [Getting Started Guide](https://orio-ui.vercel.app/getting-started)
- [Theming Guide](https://orio-ui.vercel.app/theming)
- [Component Documentation](https://orio-ui.vercel.app/components/button)
- [Composable Documentation](https://orio-ui.vercel.app/composables/use-theme)
- [Utils Documentation](https://orio-ui.vercel.app/utils/icon-registry)

## Development

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/oriondor/orio-ui.git
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
├── src/
│   ├── runtime/
│   │   ├── components/   # 26 Vue components
│   │   ├── composables/  # 8 composables
│   │   ├── assets/css/   # Theme CSS files
│   │   └── utils/        # Icon registry
│   └── module.ts         # Nuxt Module definition
├── tests/                # Vitest unit tests
├── docs/                 # VitePress documentation
└── build.config.ts       # Module build configuration
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
import type { TextTypes, TagStyle } from "orio-ui/composables";
import type { OriginRect, ModalProps } from "orio-ui/composables";
import type { IconName } from "orio-ui/composables";
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

MIT © [oriondor](https://github.com/oriondor)

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
