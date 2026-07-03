# Orio UI

A delightful, lightweight component library for Nuxt 3+ applications. Built with TypeScript, fully tested, and designed for modern web development.

[![npm version](https://img.shields.io/npm/v/orio-ui.svg)](https://www.npmjs.com/package/orio-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Demo](https://img.shields.io/badge/Demo-Live-blue.svg)](https://orio-ui.vercel.app/)

## ⚡ AI agents

```bash
npx orio-ui agents
```

One command wires your AI coding agent (Claude Code, Cursor, Copilot, …) to
orio-ui's shipped, version-pinned agent docs. Details in
[AI Agent Onboarding](#ai-agent-onboarding).

## Features

✨ **59 Components** - Beautiful, accessible components ready to use
🎨 **Themeable** - 5 built-in accent themes with light/dark mode support
🚀 **Auto-imported** - Works seamlessly with Nuxt's auto-import system
📦 **Tree-shakeable** - Only bundle what you use
🎯 **TypeScript** - Fully typed for great developer experience
🧪 **Tested** - 38 test suites for reliability
📱 **Responsive** - Mobile-first design approach
♿ **Accessible** - ARIA-compliant components
🌐 **i18n** - Built-in vue-i18n support with English defaults

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

### Components (59)

#### Form Controls

- **Input** - Text input with label support
- **Textarea** - Multi-line text input
- **NumberInput** - Numeric input with increment/decrement (horizontal & vertical variants)
- **CheckBox** - Custom checkbox with icon states
- **SwitchButton** - Toggle switch component
- **DatePicker** - Date selection with month/year options
- **DateRangePicker** - Start and end date selection
- **Selector** - Generic dropdown selector (single/multi-select)
- **TaggableSelector** - Selector with taggable input
- **CheckboxGroup** - Group of checkboxes with shared model
- **RadioButton** - Radio button component
- **Tag** - Styled tag/badge component
- **Badge** - Status badge with variants
- **ListItem** - Selectable list item

#### Interactive

- **Button** - Primary, secondary, subdued variants with loading/icon support
- **NavButton** - Navigation button component
- **Form** - Form wrapper with validation support
- **Modal** - Animated modal with origin morphing
- **Popover** - Positioned popover with smart placement
- **Tooltip** - Hover tooltip component
- **Banner** - Notification banner component

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

### Composables (15)

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

## AI Agent Onboarding

Orio UI ships a routing index and per-component invariants/gotchas files
designed for AI coding agents (Claude Code, Cursor, Copilot, etc.) so they can
discover and integrate components without re-reading the whole codebase. The
files are version-pinned to your installed `orio-ui` — upgrade the package and
the agent sees the new API automatically.

### What ships inside `node_modules/orio-ui/dist/`

- `agents/ROUTING.md` — full routing index (every component and composable,
  grouped by category, with a one-line purpose).
- `agents/component-worker.md` — optional subagent definition. Picks the right
  component for a vague request, reads its `USAGE.md`, then implements the
  integration in your app.
- `agents/component-finder.md` — optional read-only subagent. Locates a
  component for a vague request and returns paths without writing code.
- `agents/snippet.md` — the CLAUDE.md snippet appended by `npx orio-ui agents`.
- `runtime/components/<Name>.USAGE.md` and
  `runtime/composables/<name>.USAGE.md` — per-component invariants, gotchas,
  and a quick-reference snippet, sitting next to the compiled source.

### Wire it into your project

Run once in your project root:

```bash
npx orio-ui agents
```

It appends the snippet below to your `CLAUDE.md`, creating the file if missing
(no-op when already wired). Or paste it yourself — into `CLAUDE.md`,
`AGENTS.md`, `.cursorrules`, or any agent instruction file your tooling reads:

<!-- snippet:start -->
```md
## orio-ui

orio-ui ships agent-ready docs inside the package itself. Before answering
anything about orio-ui components/composables, read
`node_modules/orio-ui/dist/agents/ROUTING.md` — it routes to per-component
USAGE.md files and optional subagents. Don't explore the package source blindly.
```
<!-- snippet:end -->

### Optional: install the subagents

If your AI tooling supports subagents (e.g. Claude Code's `.claude/agents/`),
copy the shipped definitions in once and forget about them:

```bash
mkdir -p .claude/agents
cp node_modules/orio-ui/dist/agents/component-worker.md .claude/agents/
cp node_modules/orio-ui/dist/agents/component-finder.md .claude/agents/
```

After that, requests like *"add a date range picker to the booking form"* or
*"where is the toast component?"* are routed automatically to the right
subagent, which already knows the orio-ui routing table and reads the matching
`USAGE.md` before writing code.

> **Re-copy after `orio-ui` upgrades** so the routing table in the subagent
> definition tracks the installed version. (Pin this to your project's
> `postinstall` script if you want it automated.)

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
│   │   ├── components/   # 59 Vue components
│   │   ├── composables/  # 15 composables
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
