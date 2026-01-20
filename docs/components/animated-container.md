# AnimatedContainer

A flex container that animates its children with a fade-in-up effect on mount.

## Live Demo

<script setup>
import { ref } from 'vue'
const key = ref(0)
const replay = () => key.value++
</script>

<style>
.demo-item {
  padding: 1rem 2rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  transition: border-color 0.2s ease;
}
.demo-item:hover {
  border-color: var(--vp-c-brand);
}
</style>

<orio-button size="small" @click="replay">Replay Animation</orio-button>

### Horizontal (Row)

<div class="demo-container">
  <orio-animated-container :key="key">
    <div class="demo-item">Item 1</div>
    <div class="demo-item">Item 2</div>
    <div class="demo-item">Item 3</div>
  </orio-animated-container>
</div>

### Vertical (Column) (and with sound on hover)

<div class="demo-container">
  <orio-animated-container :key="key" direction="column" v-slot="{ play }">
    <div class="demo-item" @mouseenter="play">Item 1</div>
    <div class="demo-item">Item 2 (no sound)</div>
    <div class="demo-item" @mouseenter="play">Item 3</div>
  </orio-animated-container>
</div>

## Usage

### Horizontal Layout (Default)

```vue
<template>
  <orio-animated-container>
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </orio-animated-container>
</template>
```

### Vertical Layout

```vue
<template>
  <orio-animated-container direction="column">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </orio-animated-container>
</template>
```

### With Hover Sound

```vue
<template>
  <orio-animated-container v-slot="{ play }">
    <div @mouseenter="play">Item 1</div>
    <div @mouseenter="play">Item 2</div>
    <div @mouseenter="play">Item 3</div>
  </orio-animated-container>
</template>
```

## Props

| Prop        | Type                  | Default | Description                       |
| ----------- | --------------------- | ------- | --------------------------------- |
| `direction` | `"row"` \| `"column"` | `"row"` | Layout direction of the container |

## Slots

| Slot      | Props                | Description            |
| --------- | -------------------- | ---------------------- |
| `default` | `{ play: Function }` | Content to be animated |

## Notes

- All direct children animate with a fade-in-up effect (0.5s ease-out)
- Children translate from 30px below their final position
- Container uses `flex-wrap: wrap` for responsive layouts
- Default gap between items is `1rem`
