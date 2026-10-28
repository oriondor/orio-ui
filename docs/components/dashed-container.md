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
      size="small"
      @click="handleClick"
    />
  </div>
</div>

<div class="demo-container">
  <div class="demo-grid">
    <orio-dashed-container
      icon="upload"
      text="Upload File"
      size="medium"
      @click="handleClick"
    />
  </div>
</div>

<div class="demo-container">
  <div class="demo-grid">
    <orio-dashed-container
      icon="calendar"
      text="Schedule Event"
      size="large"
      @click="handleClick"
    />
  </div>
</div>

## Usage

```vue
<template>
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
</template>

<script setup>
function handleClick() {
  alert("Container clicked!");
}
</script>
```

## Props

| Prop   | Type                             | Default     | Description    |
| ------ | -------------------------------- | ----------- | -------------- |
| `icon` | `string`                         | `undefined` | Icon name      |
| `text` | `string`                         | `undefined` | Text label     |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'`  | Container size |

## Events

| Event   | Payload | Description                |
| ------- | ------- | -------------------------- |
| `click` | -       | Emitted on container click |

## Features

- Native `<button>`: keyboard and focus-visible ring out of the box
- Dashed border that turns accent on hover, with a soft accent wash
- Icon in a round accent chip; icon size adapts to `size`
- Press feedback; respects `prefers-reduced-motion`
