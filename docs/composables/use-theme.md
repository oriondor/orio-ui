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
    <button @click="setTheme('ocean')">Ocean</button>
    <button @click="setTheme('sunset')">Sunset</button>
    <button @click="setTheme('forest')">Forest</button>
    <button @click="setTheme('purple')">Purple</button>

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

### Navy (Default)
Professional blue theme

### Ocean
Fresh cyan theme

### Sunset
Warm orange theme

### Forest
Natural green theme

### Purple
Creative purple theme

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
      <option value="ocean">Ocean</option>
      <option value="sunset">Sunset</option>
      <option value="forest">Forest</option>
      <option value="purple">Purple</option>
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
  { label: 'Ocean', value: 'ocean' },
  { label: 'Sunset', value: 'sunset' },
  { label: 'Forest', value: 'forest' },
  { label: 'Purple', value: 'purple' },
]
</script>
```

## Custom Themes

To add custom themes, define CSS variables:

```css
[data-theme="my-custom"] {
  --accent-base: #ff6b6b;
  --accent-hover: #ff5252;
  --accent-soft: #ffe5e5;
}
```

Then use it:

```vue
<script setup>
const { setTheme } = useTheme()
setTheme('my-custom')
</script>
```

See the [Theming Guide](/theming) for more details.
