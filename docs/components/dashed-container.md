# DashedContainer

Dashed border container with icon and text, typically used for upload/add actions.

## Live Demo

<script setup>
import { ref } from 'vue'

function handleClick() {
  alert('Container clicked!')
}
</script>

<div class="demo-container">
  <div class="demo-grid">
    <orio-dashed-container
      icon="plus"
      text="Add Item"
      size="medium"
      @click="handleClick"
    />

    <orio-dashed-container
      icon="upload"
      text="Upload File"
      size="large"
      @click="handleClick"
    />

    <orio-dashed-container
      icon="calendar"
      text="Schedule Event"
      size="small"
      @click="handleClick"
    />
  </div>
</div>

## Usage

```vue
<template>
  <orio-dashed-container
    icon="plus"
    text="Add New"
    @click="handleAdd"
  />
</template>

<script setup>
function handleAdd() {
  console.log('Add clicked!')
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | `undefined` | Icon name |
| `text` | `string` | `undefined` | Text label |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Container size |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | - | Emitted on container click |

## Features

- Dashed border styling
- Hover effect with gradient
- Icon size adapts to container size
- Clickable with cursor pointer
