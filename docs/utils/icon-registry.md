# Icon Registry

Central registry for all bundled SVG icons used in the Icon component.

## Overview

The icon registry provides a collection of commonly used SVG icons bundled with Orio UI. All icons are stored as inline SVG strings for optimal performance and flexibility.

## Available Icons (12 Total)

### Loading & Status
- **loading-loop** - Animated loading spinner with smooth rotation

### Navigation
- **chevron-down** - Dropdown chevron pointing down
- **chevron-up** - Dropdown chevron pointing up

### Actions
- **edit** - Edit/pencil icon for modification actions
- **check** - Checkmark for confirmation and success states
- **plus** - Plus/add icon for creation actions
- **close** - Close/X icon for dismissing or canceling
- **search** - Search/magnifying glass icon
- **upload** - Upload arrow icon
- **download** - Download arrow icon
- **delete** - Delete/trash icon for removal actions

### Other
- **calendar** - Calendar icon for date-related features

## Usage

The icon registry is used internally by the `OrioIcon` component:

```vue
<template>
  <orio-icon name="edit" />
  <orio-icon name="check" color="green" />
  <orio-icon name="loading-loop" size="32" />
</template>
```

## Accessing the Registry

If you need direct access to the registry:

```typescript
import { iconRegistry, type IconName } from '0re0-ui/runtime/utils/icon-registry'

// Get an icon SVG string
const editSvg = iconRegistry['edit']

// Get all icon names
const allIcons: IconName[] = Object.keys(iconRegistry)
```

## Registry Structure

The registry is a simple key-value object:

```typescript
export const iconRegistry: Record<string, string> = {
  'loading-loop': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>`,
  'chevron-down': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>`,
  'edit': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>`,
  // ... more icons
}

export type IconName = keyof typeof iconRegistry
```

## TypeScript Support

The `IconName` type provides autocomplete for all available icons:

```typescript
import type { IconName } from '0re0-ui/runtime/utils/icon-registry'

const iconName: IconName = 'edit' // ✓ Valid
const invalid: IconName = 'invalid' // ✗ Type error
```

## Adding Custom Icons

To add custom icons to your project, you can extend the registry or use the Icon component's ability to accept any icon name:

### Method 1: Extend the Registry

```typescript
// ~/utils/custom-icons.ts
import { iconRegistry } from '0re0-ui/runtime/utils/icon-registry'

// Add your custom icons
iconRegistry['custom-heart'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>`

iconRegistry['custom-star'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
</svg>`
```

Then import this file in your app:

```typescript
// app.vue or plugin
import '~/utils/custom-icons'
```

### Method 2: Using External Icon Libraries

You can use the Icon component with external icon libraries by setting the icon SVG at runtime:

```vue
<script setup>
import { iconRegistry } from '0re0-ui/runtime/utils/icon-registry'

// Add icons from icones.js.org or other sources
iconRegistry['mdi-home'] = `<svg>...</svg>`
</script>

<template>
  <orio-icon name="mdi-home" />
</template>
```

## Icon Sources

The bundled icons are sourced from:
- [Material Design Icons](https://materialdesignicons.com/)
- [Line MD](https://icon-sets.iconify.design/line-md/)
- [Material Symbols](https://fonts.google.com/icons)

For additional icons, check out [icones.js.org](https://icones.js.org/) - a comprehensive icon explorer.

## Performance Notes

- Icons are bundled as inline SVG strings for zero network requests
- SVGs are rendered directly in the DOM with `v-html`
- Icons use `currentColor` by default, inheriting text color
- No icon font files to load
- Supports all modern SVG features (animations, gradients, etc.)

## Examples

### Creating an Icon Picker

```vue
<script setup>
import { iconRegistry, type IconName } from '0re0-ui/runtime/utils/icon-registry'

const allIcons = Object.keys(iconRegistry) as IconName[]
const selectedIcon = ref<IconName>('edit')
</script>

<template>
  <div class="icon-picker">
    <button
      v-for="iconName in allIcons"
      :key="iconName"
      :class="{ selected: selectedIcon === iconName }"
      @click="selectedIcon = iconName"
    >
      <orio-icon :name="iconName" size="24" />
      <span>{{ iconName }}</span>
    </button>
  </div>

  <div>
    Selected: <orio-icon :name="selectedIcon" size="48" />
  </div>
</template>

<style scoped>
.icon-picker {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.icon-picker button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.icon-picker button.selected {
  background: var(--accent-soft);
  border-color: var(--accent-base);
}
</style>
```

### Displaying All Available Icons

```vue
<script setup>
import { iconRegistry } from '0re0-ui/runtime/utils/icon-registry'

const icons = Object.keys(iconRegistry)
</script>

<template>
  <div class="icon-gallery">
    <div v-for="name in icons" :key="name" class="icon-item">
      <orio-icon :name="name" size="32" />
      <code>{{ name }}</code>
    </div>
  </div>
</template>
```

## See Also

- [Icon Component](/components/icon)
- [icones.js.org](https://icones.js.org/) - Icon explorer
