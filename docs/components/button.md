# Button

Versatile button component with loading states, icons, and multiple variants.

## Live Demo

<script setup>
import { ref } from 'vue'

const isLoading = ref(false)

function simulateLoading() {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
}

function handleClick() {
  alert('Button clicked!')
}
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-button variant="primary" @click="handleClick">Primary</orio-button>
    <orio-button variant="secondary" @click="handleClick">Secondary</orio-button>
    <orio-button variant="subdued" @click="handleClick">Subdued</orio-button>
  </div>
</div>

## With Icons

<div class="demo-container">
  <div class="demo-row">
    <orio-button icon="edit" @click="handleClick">Edit</orio-button>
    <orio-button icon="plus" @click="handleClick">Add</orio-button>
    <orio-button icon="check" variant="secondary">Done</orio-button>
    <orio-button icon="calendar" variant="subdued" />
  </div>
</div>

## States

<div class="demo-container">
  <div class="demo-row">
    <orio-button :loading="isLoading" @click="simulateLoading">
      {{ isLoading ? 'Loading...' : 'Click to Load' }}
    </orio-button>
    <orio-button :disabled="true">Disabled</orio-button>
  </div>
</div>

## Usage

### Basic

```vue
<template>
  <orio-button @click="handleClick">
    Click Me
  </orio-button>
</template>

<script setup>
function handleClick() {
  console.log('Clicked!')
}
</script>
```

### Button Variants

```vue
<orio-button variant="primary">Primary</orio-button>
<orio-button variant="secondary">Secondary</orio-button>
<orio-button variant="subdued">Subdued</orio-button>
```

### With Icons

```vue
<!-- Icon before text -->
<orio-button icon="edit">Edit</orio-button>

<!-- Icon only (automatically rounds to circle) -->
<orio-button icon="plus" />
```

### Loading State

```vue
<template>
  <orio-button :loading="isLoading" @click="save">
    Save Changes
  </orio-button>
</template>

<script setup>
const isLoading = ref(false)

async function save() {
  isLoading.value = true
  await api.save()
  isLoading.value = false
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'subdued'` | `'primary'` | Button visual style |
| `icon` | `string` | `undefined` | Icon name from icon registry |
| `loading` | `boolean` | `false` | Shows loading spinner, prevents clicks |
| `disabled` | `boolean` | `false` | Disables button interaction |

**Note:** The native HTML `type` attribute (e.g., `type="submit"`) can be used normally via `v-bind` and will be passed through to the underlying `<button>` element.

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `PointerEvent` | Emitted on button click (when not loading/disabled) |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | - | Button text content |
| `icon` | - | Custom icon content |

## Styling

The button uses these CSS variables:

```css
--color-accent       /* Primary button background */
--color-accent-ink   /* Text color on primary */
--color-accent-hover /* Hover state */
--color-accent-border
```
