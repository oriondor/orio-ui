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

### Basic Modal (Manual State)

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

### Using useModal Composable (Recommended)

The `useModal()` composable simplifies modal management and automatically handles animation origins:

```vue
<template>
  <orio-button @click="openModal">
    Open Modal
  </orio-button>

  <orio-modal v-bind="modalProps">
    <h2>Modal Title</h2>
    <p>Content here</p>
    <orio-button @click="modalProps.show = false">Close</orio-button>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal()
</script>
```

### Animation Control: With vs Without Event

The key difference between `openModal()` and `openModal` is how the click event is handled:

```vue
<template>
  <div class="demo-row">
    <!-- NO Animation - Calling with () without passing event -->
    <orio-button @click="openModal()">
      Open Modal (No Animation)
    </orio-button>

    <!-- WITH Animation - Passing event automatically -->
    <orio-button @click="openModal">
      Open Modal (With Animation)
    </orio-button>

    <!-- WITH Animation - Explicitly passing event -->
    <orio-button @click="openModal($event)">
      Open Modal (Explicit Event)
    </orio-button>
  </div>

  <orio-modal v-bind="modalProps">
    <h2>Modal Content</h2>
    <p>This modal may or may not animate based on how it was opened!</p>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal()
</script>
```

**Explanation:**
- `@click="openModal()"` - Calls the function immediately, no event is passed → **Simple fade-in**
- `@click="openModal"` - Vue passes the click event automatically → **Morphing animation from button**
- `@click="openModal($event)"` - Explicitly passes the event → **Morphing animation from button**

### Manual Origin Tracking (Without useModal)

If you need more control, you can manually track the origin:

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
