# LoadingSpinner

Animated loading indicator.

## Live Demo

<script setup>
import { ref } from 'vue'
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-loading-spinner />
  </div>

  <p style="text-align: center; color: var(--vp-c-text-2);">
    Animated loading spinner
  </p>
</div>

## Usage

```vue
<template>
  <div v-if="isLoading">
    <orio-loading-spinner />
  </div>
</template>

<script setup>
const isLoading = ref(true)
</script>
```

### In Buttons

The loading spinner is automatically used in buttons:

```vue
<orio-button :loading="isLoading">
  Save
</orio-button>
```

## Props

None - uses default icon size and color.

## Notes

- Inherits color from parent element
- Uses the `loading-loop` icon internally
- Animated rotation via CSS
