# useTheme

Composable for managing theme and color mode preferences.

## Basic Usage

```vue
<script setup>
const { theme, mode, setTheme, setMode } = useTheme()
</script>
```

## Changing Themes

```vue
<template>
  <div>
    <h2>Choose Theme</h2>
    <button @click="setTheme('navy')">Navy</button>
    <button @click="setTheme('teal')">Teal</button>
    <button @click="setTheme('forest')">Forest</button>
    <button @click="setTheme('wine')">Wine</button>
    <button @click="setTheme('royal')">Royal</button>

    <p>Current theme: {{ theme }}</p>
  </div>
</template>

<script setup>
const { theme, setTheme } = useTheme()
</script>
```

## Changing Color Mode

```vue
<template>
  <button @click="toggleMode">
    {{ mode === 'dark' ? '☀️ Light' : '🌙 Dark' }}
  </button>
</template>

<script setup>
const { mode, setMode } = useTheme()

function toggleMode() {
  setMode(mode.value === 'dark' ? 'light' : 'dark')
}
</script>
```

## Return Values

| Property | Type | Description |
|----------|------|-------------|
| `theme` | `Ref<string>` | Current accent theme name |
| `mode` | `Ref<string>` | Current color mode (`'light'` or `'dark'`) |
| `setTheme` | `(name: string) => void` | Function to change accent theme |
| `setMode` | `(mode: string) => void` | Function to change color mode |

## Built-in Themes

The library includes five built-in themes that you can use out of the box:

### Navy
Deep blue professional theme

### Teal
Fresh cyan/turquoise theme

### Forest
Natural green theme

### Wine
Rich burgundy/red theme

### Royal
Vibrant blue theme

## Persistence

Theme preferences are automatically saved to `localStorage`:
- `orio-theme` - Stores accent theme
- `orio-mode` - Stores color mode

Preferences are restored on page load.

## SSR Compatibility

The composable handles SSR gracefully:
- localStorage operations only run on client
- DOM updates are wrapped in `typeof document !== 'undefined'` checks
- Theme is applied on mount

## Examples

### Theme Switcher Component

```vue
<template>
  <div class="theme-switcher">
    <select v-model="currentTheme" @change="handleThemeChange">
      <option value="navy">Navy</option>
      <option value="teal">Teal</option>
      <option value="forest">Forest</option>
      <option value="wine">Wine</option>
      <option value="royal">Royal</option>
    </select>

    <button @click="toggleDarkMode">
      {{ isDark ? 'Light Mode' : 'Dark Mode' }}
    </button>
  </div>
</template>

<script setup>
const { theme, mode, setTheme, setMode } = useTheme()

const currentTheme = computed({
  get: () => theme.value,
  set: (val) => setTheme(val)
})

const isDark = computed(() => mode.value === 'dark')

function handleThemeChange() {
  // Theme already updated via v-model
  console.log('Theme changed to:', theme.value)
}

function toggleDarkMode() {
  setMode(isDark.value ? 'light' : 'dark')
}
</script>
```

### Settings Page

```vue
<template>
  <div class="settings">
    <h2>Appearance Settings</h2>

    <div class="setting-group">
      <label>Color Theme</label>
      <div class="theme-options">
        <button
          v-for="t in themes"
          :key="t.value"
          :class="{ active: theme === t.value }"
          @click="setTheme(t.value)"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <div class="setting-group">
      <label>Mode</label>
      <div class="mode-toggle">
        <button
          :class="{ active: mode === 'light' }"
          @click="setMode('light')"
        >
          ☀️ Light
        </button>
        <button
          :class="{ active: mode === 'dark' }"
          @click="setMode('dark')"
        >
          🌙 Dark
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { theme, mode, setTheme, setMode } = useTheme()

const themes = [
  { label: 'Navy', value: 'navy' },
  { label: 'Teal', value: 'teal' },
  { label: 'Forest', value: 'forest' },
  { label: 'Wine', value: 'wine' },
  { label: 'Royal', value: 'royal' },
]
</script>
```

## Custom Themes

The theming system is fully customizable. You can override existing themes or create entirely new ones by defining CSS variables in your own stylesheets.

### Understanding Theme Variables

Themes control the accent colors used throughout the UI. The main variables you can customize are:

```css
:root[data-theme="your-theme"] {
  --color-accent: /* Main accent color */
  --color-accent-soft: /* Light background tint */
  --color-accent-border: /* Border color */
}
```

The `--color-accent-ink`, `--color-accent-hover`, and `--color-accent-active` are automatically derived using `color-mix()`.

### Creating a New Theme

Define your theme in your app's CSS:

```css
/* In your main CSS file or a separate theme file */
:root[data-theme="sunset"] {
  --color-accent: hsl(16 90% 48%);
  --color-accent-soft: hsl(16 100% 96%);
  --color-accent-border: hsl(16 85% 80%);
}

:root[data-theme="ocean"] {
  --color-accent: hsl(199 89% 48%);
  --color-accent-soft: hsl(199 100% 96%);
  --color-accent-border: hsl(199 75% 80%);
}

:root[data-theme="lavender"] {
  --color-accent: hsl(267 65% 58%);
  --color-accent-soft: hsl(267 100% 97%);
  --color-accent-border: hsl(267 50% 85%);
}
```

Then use them in your app:

```vue
<script setup>
const { setTheme } = useTheme()

// Use your custom theme
setTheme('sunset')
</script>
```

### Overriding Built-in Themes

You can completely override any built-in theme by redefining its variables:

```css
/* Override the "navy" theme with your brand colors */
:root[data-theme="navy"] {
  --color-accent: #0066cc; /* Your brand blue */
  --color-accent-soft: #e6f2ff;
  --color-accent-border: #99ccff;
}
```

### Complete Custom Theme Example

Here's a full example with multiple custom themes:

```css
/* bright-pink.css */
:root[data-theme="bright-pink"] {
  --color-accent: hsl(328 100% 54%);
  --color-accent-soft: hsl(328 100% 97%);
  --color-accent-border: hsl(328 73% 84%);
}

:root[data-theme="mint"] {
  --color-accent: hsl(162 63% 41%);
  --color-accent-soft: hsl(162 60% 96%);
  --color-accent-border: hsl(162 40% 80%);
}

:root[data-theme="amber"] {
  --color-accent: hsl(38 92% 50%);
  --color-accent-soft: hsl(38 100% 96%);
  --color-accent-border: hsl(38 100% 82%);
}
```

```vue
<template>
  <div>
    <button @click="setTheme('bright-pink')">Bright Pink</button>
    <button @click="setTheme('mint')">Mint</button>
    <button @click="setTheme('amber')">Amber</button>
  </div>
</template>

<script setup>
const { setTheme } = useTheme()
</script>
```

### Dark Mode Considerations

Custom themes automatically work with dark mode. The library handles dark mode adjustments using the `data-mode` attribute. You only need to define the base accent colors.

If you want to customize how your theme looks in dark mode specifically:

```css
:root[data-mode="dark"][data-theme="sunset"] {
  /* Optional: override specific values for dark mode */
  --color-accent-soft: hsl(16 30% 15%);
  --color-accent-border: hsl(16 40% 25%);
}
```

### Tips for Creating Themes

1. **Use HSL values** for easier color manipulation
2. **Keep sufficient contrast** between accent and soft/border variants
3. **Test in both light and dark modes** to ensure readability
4. **Soft variants** should be very light (90-97% lightness in HSL for light mode)
5. **Border variants** should be between soft and accent in intensity (75-85% lightness)
