# Theming

Orio UI uses a 3-layer CSS variable system for flexible theming.

## Quick Theme Change

Use the `useTheme` composable to switch themes:

```vue
<script setup>
const { theme, setTheme, mode, setMode } = useTheme()

// Change accent theme
setTheme('ocean')  // navy | ocean | sunset | forest | purple

// Change color mode
setMode('light')   // light | dark
</script>
```

## CSS Variable System

### Layer 1: Semantic Variables

Used throughout components:

```css
--color-bg          /* Background color */
--color-surface     /* Elevated surfaces */
--color-text        /* Primary text */
--color-text-secondary
--color-text-tertiary
--color-border
--color-muted
--color-accent      /* Primary accent color */
--color-accent-hover
--color-accent-soft
--color-accent-ink  /* Text on accent backgrounds */
--color-accent-border
```

### Layer 2: Light & Dark Modes

Controlled via `data-mode="light|dark"` on `<html>`:

```css
[data-mode="light"] {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  /* ... */
}

[data-mode="dark"] {
  --color-bg: #0a0a0a;
  --color-text: #f5f5f5;
  /* ... */
}
```

### Layer 3: Accent Themes

Controlled via `data-theme="navy|ocean|sunset|forest|purple"` on `<html>`:

```css
[data-theme="navy"] {
  --accent-base: #3b82f6;
}

[data-theme="ocean"] {
  --accent-base: #06b6d4;
}

[data-theme="sunset"] {
  --accent-base: #f97316;
}

[data-theme="forest"] {
  --accent-base: #10b981;
}

[data-theme="purple"] {
  --accent-base: #a855f7;
}
```

## Custom Themes

### Method 1: Override CSS Variables

Create a custom CSS file:

```css
/* assets/css/custom-theme.css */
:root {
  --color-accent: #ff6b6b;
  --color-bg: #fafafa;
}

[data-mode="dark"] {
  --color-bg: #1a1a1a;
}
```

Import in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['orio-ui'],
  css: ['~/assets/css/custom-theme.css']
})
```

### Method 2: Add New Accent Themes

```css
/* Add a new "sunset-pink" theme */
[data-theme="sunset-pink"] {
  --accent-base: #ff6b9d;
  --accent-hover: #ff5a8c;
  --accent-soft: #ffe5ee;
}
```

Use it:

```vue
<script setup>
const { setTheme } = useTheme()
setTheme('sunset-pink')
</script>
```

## Built-in Themes

### Navy (Default)
Blue corporate theme - `#3b82f6`

### Ocean
Cyan fresh theme - `#06b6d4`

### Sunset
Orange warm theme - `#f97316`

### Forest
Green natural theme - `#10b981`

### Purple
Purple creative theme - `#a855f7`

## Animation Variables

Orio UI includes motion design tokens:

```css
--transition-fast: 0.15s
--transition-base: 0.25s
--transition-slow: 0.35s
--ease-in-out: cubic-bezier(0.2, 0.8, 0.2, 1)
```

## Complete Variable Reference

See `src/runtime/assets/css/colors.css` for the complete list of all CSS variables.

## Persistence

Theme preferences are automatically saved to localStorage:
- `orio-theme` - Accent theme name
- `orio-mode` - Light/dark mode

These are restored on page load via `useTheme()`.
