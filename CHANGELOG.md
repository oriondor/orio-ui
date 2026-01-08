# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.5](https://github.com/oriondor/orio-ui/compare/v1.0.4...v1.0.5) (2026-01-08)


### Bug Fixes

* changed scss for gradient style to css ([90e5297](https://github.com/oriondor/orio-ui/commit/90e529721d8847666df46cac051d6db325ad8fe5))

## [1.0.4](https://github.com/oriondor/orio-ui/compare/v1.0.3...v1.0.4) (2026-01-08)


### Bug Fixes

* fixed css was not imported, global styling issues, able to switch themes natively now and small issues with components ([433a796](https://github.com/oriondor/orio-ui/commit/433a796f51e8b0ea591af88c180af6dc2c49fccc))

## [1.0.3](https://github.com/oriondor/orio-ui/compare/v1.0.2...v1.0.3) (2026-01-07)


### Bug Fixes

* naturally prefix components ([4c2c669](https://github.com/oriondor/orio-ui/commit/4c2c669516db01fcab498adb6f7bbfaa8deabe06))

## [1.0.2](https://github.com/oriondor/orio-ui/compare/v1.0.1...v1.0.2) (2026-01-07)


### Bug Fixes

* fixed old layer syntax (extend) to modules ([ac617f7](https://github.com/oriondor/orio-ui/commit/ac617f7e5e5edce0f1cd25b961d6084463cc186c))

## [1.0.1](https://github.com/oriondor/orio-ui/compare/v1.0.0...v1.0.1) (2026-01-07)


### Bug Fixes

* one more missing thing for release to npm ([707cbc8](https://github.com/oriondor/orio-ui/commit/707cbc83e2283c4c5a4324a4baf340874ce215a8))
* release to npm ([1cdd23d](https://github.com/oriondor/orio-ui/commit/1cdd23d0cb4dcf6b92d4ac9755a96ca5067856e5))

## 1.0.0 (2026-01-07)


### Bug Fixes

* fixed the build step for nuxt ([46109bc](https://github.com/oriondor/orio-ui/commit/46109bc64f06161debadb38782cabcbad163f4a0))
* linter issues ([caace5a](https://github.com/oriondor/orio-ui/commit/caace5ab6190655b1fcf8c747300e22ed29fb472))
* missing .nuxt ([31ae930](https://github.com/oriondor/orio-ui/commit/31ae930812fd5e721758021a349264034b47a7a7))

## [0.1.0] - 2025-01-06

### Added

#### Components (18 total)

- **Button** - Primary, secondary, subdued variants with loading states
- **Input** - Text input with label support
- **Textarea** - Multi-line text input
- **CheckBox** - Custom checkbox with icon states
- **DatePicker** - Date selection with month/year picker
- **DateRangePicker** - Start/end date selection with "Present" option
- **Selector** - Generic dropdown selector supporting single and multi-select
- **Tag** - Styled tag/badge component
- **Icon** - Custom SVG icon system with 12 bundled icons
- **LoadingSpinner** - Animated loading indicator
- **Modal** - Animated modal with origin morphing effect
- **Popover** - Smart-positioned popover with fallback placement
- **EmptyState** - Empty state placeholder with icon and description
- **DashedContainer** - Dashed border container with icon
- **ControlElement** - Form control wrapper for consistent styling
- **Text** (View) - Typography component with multiple variants
- **Dates** (View) - Date range display formatter
- **Separator** (View) - Visual divider component

#### Composables (4 total)

- **useTheme** - Theme and color mode management with localStorage persistence
- **useModal** - Modal state management with animation origin tracking
- **useFuzzySearch** - Fuzzy search powered by Fuse.js
- **useApi** - Type-safe API request wrapper using ofetch

#### Theming System

- 5 built-in accent themes: Navy, Ocean, Sunset, Forest, Purple
- Light and dark mode support
- 3-layer CSS variable system for easy customization
- Automatic theme persistence to localStorage

#### Icon System

- Custom icon registry with 12 bundled SVG icons
- Tree-shakeable icon loading
- Support for custom icon sizes and colors
- Icons included: loading-loop, chevron-down, chevron-up, edit, check, plus, calendar, close, search, upload, download, delete

#### Testing

- 71 unit tests with Vitest
- Component tests for all 18 components
- Composable tests for all 4 composables
- Full test coverage for core functionality

#### Documentation

- VitePress documentation site
- Getting Started guide
- Theming guide
- Component API documentation
- Composable usage examples
- Interactive playground app

#### Developer Experience

- Full TypeScript support with exported types
- Nuxt Layer architecture for seamless integration
- Auto-import for all components and composables
- ESLint + Prettier configuration
- Development playground for testing

### Technical Details

- Built with Vue 3 Composition API
- Nuxt 3/4 compatible
- SSR-ready with proper client-side checks
- Tree-shakeable architecture
- Zero external icon dependencies
- Accessibility-focused components

### Dependencies

- @vueuse/core ^11.0.0
- @vueuse/integrations ^11.0.0
- fuse.js ^7.0.0
- nanoid ^5.0.0
- ofetch ^1.5.1

[0.1.0]: https://github.com/oriondor/orio-ui/releases/tag/v0.1.0
