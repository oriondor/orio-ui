# Theming

Orio UI uses a layered CSS variable system for flexible theming with light/dark mode support.

## Quick Theme Change

Use the `useTheme` composable to switch themes:

```vue
<script setup>
const { theme, setTheme, mode, setMode } = useTheme()

// Change accent theme
setTheme('navy')  // navy | teal | forest | wine | royal | normal | inverse

// Change color mode
setMode('light')   // light | dark (default)
</script>
```

## How It Works

Theme preferences are stored in **cookies** (`orio-theme` and `orio-mode`) for SSR compatibility. The composable sets `data-theme` and `data-mode` attributes on the `<html>` element, which CSS uses to apply the correct variables.

## CSS Variable System

### Layer 1: Base Variables (`:root`)

These define the foundation and are always available:

```css
/* Background & Surface */
--color-bg          /* Page background */
--color-surface     /* Elevated surfaces (cards, modals) */

/* Text */
--color-text        /* Primary text */
--color-muted       /* Secondary/muted text */

/* Border */
--color-border      /* Default border color */

/* Accent family */
--color-accent          /* Primary accent color */
--color-accent-ink      /* Text on accent backgrounds */
--color-accent-soft     /* Subtle accent background */
--color-accent-soft-darker
--color-accent-border   /* Accent-tinted border */
--color-accent-hover    /* Accent hover state */
--color-accent-active   /* Accent active/pressed state */

/* Semantic colors */
--color-danger          /* Error/destructive actions */
--color-danger-ink
--color-danger-soft
--color-danger-border

--color-alert           /* Warnings */
--color-alert-ink
--color-alert-soft
--color-alert-border

--color-success         /* Success states */
--color-success-ink
--color-success-soft
--color-success-border

--color-info            /* Informational */
--color-info-ink
--color-info-soft
--color-info-border
```

### Layer 2: Mode Variables (`data-mode`)

Controls light/dark appearance. Set via `data-mode="light|dark"` on `<html>`:

```css
[data-mode="light"] {
  --color-bg: #ffffff;
  --color-surface: #f7f8fa;
  --color-text: #0e1116;
  --color-muted: #626a78;
  --color-border: #bfbfc2;
}

[data-mode="dark"] {
  --color-bg: #0e1116;
  --color-surface: #1a1d23;
  --color-text: #ffffff;
  --color-muted: #a2a9b6;
  --color-border: #2e333d;

  /* Dark mode also adjusts accent derivatives */
  --color-accent-soft-base: color-mix(in srgb, var(--color-accent) 12%, #0e1116);
  --color-accent-hover: color-mix(in srgb, var(--color-accent) 30%, white 70%);
  /* ... */
}
```

### Layer 3: Accent Themes (`data-theme`)

Controls the accent color. Set via `data-theme="themename"` on `<html>`:

```css
[data-theme="navy"] {
  --color-accent: hsl(219, 45%, 56%);
}

[data-theme="teal"] {
  --color-accent: hsl(174, 65%, 44%);
}

[data-theme="forest"] {
  --color-accent: hsl(153, 35%, 53%);
}

[data-theme="wine"] {
  --color-accent: hsl(350, 55%, 34%);
}

[data-theme="royal"] {
  --color-accent: hsl(230, 60%, 40%);
}

[data-theme="normal"] {
  --color-accent: #ced1d5;
  --color-accent-ink: #2a2a2b;
}

[data-theme="inverse"] {
  /* Flips to black/white based on mode */
}
```

## Built-in Themes

| Theme | Color | Description |
|-------|-------|-------------|
| **navy** (default) | `hsl(219, 45%, 56%)` | Professional blue |
| **teal** | `hsl(174, 65%, 44%)` | Fresh cyan-green |
| **forest** | `hsl(153, 35%, 53%)` | Natural green |
| **wine** | `hsl(350, 55%, 34%)` | Deep burgundy |
| **royal** | `hsl(230, 60%, 40%)` | Rich purple-blue |
| **normal** | `#ced1d5` | Neutral gray |
| **inverse** | black/white | High contrast, adapts to mode |

## Creating Custom Themes

### Method 1: Add a New Accent Theme

Create a CSS file with your theme:

```css
/* assets/css/my-themes.css */

[data-theme="coral"] {
  --color-accent: hsl(16, 100%, 66%);
}

[data-theme="lavender"] {
  --color-accent: hsl(270, 60%, 70%);
}
```

Import in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['orio-ui'],
  css: ['~/assets/css/my-themes.css']
})
```

Use it:

```vue
<script setup>
const { setTheme } = useTheme()
setTheme('coral')
</script>
```

### Method 2: Override Accent Derivatives

For full control, override the derived accent variables:

```css
[data-theme="brand"] {
  --color-accent: #ff6b00;
  --color-accent-ink: #ffffff;
  --color-accent-soft: color-mix(in srgb, var(--color-accent) 15%, #e3e3e3);
  --color-accent-border: color-mix(in srgb, var(--color-accent) 40%, #fde68a);
  --color-accent-hover: color-mix(in srgb, var(--color-accent) 85%, black 15%);
  --color-accent-active: color-mix(in srgb, var(--color-accent), black 60%);
}

/* Dark mode overrides for your theme */
[data-theme="brand"][data-mode="dark"] {
  --color-accent-soft: color-mix(in srgb, var(--color-accent) 12%, #0e1116);
  --color-accent-border: color-mix(in srgb, var(--color-accent) 40%, #0e1116);
  --color-accent-hover: color-mix(in srgb, var(--color-accent) 30%, white 70%);
}
```

### Method 3: Override Base Colors

To change the overall look beyond accents:

```css
/* Custom dark background */
[data-mode="dark"] {
  --color-bg: #1a1a2e;
  --color-surface: #16213e;
}

/* Custom light background */
[data-mode="light"] {
  --color-bg: #fafafa;
  --color-surface: #ffffff;
}
```

## Variable Inheritance

The system uses `color-mix()` to automatically derive related colors from `--color-accent`:

```css
/* These are computed automatically when you set --color-accent */
--color-accent-soft: color-mix(in srgb, var(--color-accent) 15%, #e3e3e3);
--color-accent-border: color-mix(in srgb, var(--color-accent) 40%, #c7d2fe);
--color-accent-hover: color-mix(in srgb, var(--color-accent) 85%, black 15%);
--color-accent-active: color-mix(in srgb, var(--color-accent), black 60%);
```

This means for most custom themes, you only need to set `--color-accent` and the rest will be derived.

## Persistence

Theme preferences are stored in **cookies**:
- `orio-theme` - Accent theme name
- `orio-mode` - Light/dark mode

Cookies are used instead of localStorage for SSR compatibility - the server can read cookies and render the correct theme on first load, preventing flash of incorrect theme.

## Complete Variable Reference

See [`src/runtime/assets/css/colors.css`](https://github.com/oriondor/orio-ui/blob/main/src/runtime/assets/css/colors.css) for the complete implementation.
