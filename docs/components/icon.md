# Icon

SVG icon component with bundled icons.

## Live Demo

<script setup>
import { ref } from 'vue'
</script>

<div class="demo-container">
  <h3>All Available Icons</h3>
  <div class="demo-row">
    <orio-icon name="loading-loop" />
    <orio-icon name="chevron-down" />
    <orio-icon name="chevron-up" />
    <orio-icon name="edit" />
    <orio-icon name="check" />
    <orio-icon name="plus" />
    <orio-icon name="calendar" />
    <orio-icon name="close" />
    <orio-icon name="search" />
    <orio-icon name="upload" />
    <orio-icon name="download" />
    <orio-icon name="delete" />
  </div>

  <h3>Custom Sizes</h3>
  <div class="demo-row">
    <orio-icon name="edit" size="16" />
    <orio-icon name="edit" size="24" />
    <orio-icon name="edit" size="32" />
    <orio-icon name="edit" size="48" />
  </div>

  <h3>Custom Colors</h3>
  <div class="demo-row">
    <orio-icon name="check" color="green" />
    <orio-icon name="close" color="red" />
    <orio-icon name="edit" color="blue" />
  </div>
</div>

## Usage

```vue
<template>
  <orio-icon name="edit" />
  <orio-icon name="check" size="32" color="green" />
</template>
```

## Available Icons

### Loading & Status
- `loading-loop` - Animated loading spinner

### Navigation
- `chevron-down` - Dropdown chevron pointing down
- `chevron-up` - Dropdown chevron pointing up

### Actions
- `edit` - Edit/pencil icon
- `check` - Checkmark
- `plus` - Plus/add icon
- `close` - Close/X icon
- `search` - Search/magnifying glass
- `upload` - Upload arrow icon
- `download` - Download arrow icon
- `delete` - Delete/trash icon

### Other
- `calendar` - Calendar icon

See the [Icon Registry](/utils/icon-registry) for more details on adding custom icons.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `IconName \| string` | - | Icon name from registry |
| `size` | `string \| number` | `'1em'` | Icon size (px or em) |
| `color` | `string` | `'currentColor'` | Icon color (CSS color) |
