# Modal

Animated modal with origin morphing effect.

## Live Demo

<script setup>
import { ref } from 'vue'

const showModal = ref(false)
const modalOrigin = ref(null)

function openModal(event) {
  const rect = event.target.getBoundingClientRect()
  modalOrigin.value = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  }
  showModal.value = true
}
</script>

<div class="demo-container">
  <orio-button @click="openModal">
    Open Modal
  </orio-button>

  <orio-modal v-model:show="showModal" :origin="modalOrigin">
    <h2>Modal Title</h2>
    <p>This modal morphs from the button you clicked!</p>
    <p>Click outside or press the button below to close.</p>
    <orio-button type="primary" @click="showModal = false">
      Close Modal
    </orio-button>
  </orio-modal>
</div>

## Usage

### Basic Modal

```vue
<template>
  <orio-button @click="showModal = true">
    Open
  </orio-button>

  <orio-modal v-model:show="showModal" :origin="null">
    <h2>Modal Content</h2>
    <p>Your content here</p>
  </orio-modal>
</template>

<script setup>
const showModal = ref(false)
</script>
```

### With Animation Origin

```vue
<template>
  <orio-button @click="openModal">
    Open with Animation
  </orio-button>

  <orio-modal v-model:show="showModal" :origin="origin">
    <p>Morphs from button!</p>
  </orio-modal>
</template>

<script setup>
const showModal = ref(false)
const origin = ref(null)

function openModal(event) {
  const rect = event.target.getBoundingClientRect()
  origin.value = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  }
  showModal.value = true
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | `Boolean` | - | Modal visibility (v-model:show) |
| `origin` | `OriginRect \| null` | `null` | Animation origin point |

### OriginRect Type

```typescript
interface OriginRect {
  x: number
  y: number
  width: number
  height: number
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:show` | `boolean` | Emitted when modal closes |

## Features

- Click outside to close
- Backdrop blur effect
- Morphing animation from origin element
- Smooth fade-in when no origin provided
