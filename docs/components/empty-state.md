# EmptyState

Empty state placeholder with icon and description.

## Live Demo

<script setup>
import { ref } from 'vue'
</script>

<div class="demo-container">
  <div class="demo-grid">
    <orio-empty-state
      icon="search"
      title="No results found"
      description="Try adjusting your search criteria"
      size="small"
    />
  </div>
</div>
<div class="demo-container">
  <div class="demo-grid">
    <orio-empty-state
      icon="calendar"
      title="No events scheduled"
      description="Create your first event to get started"
      size="medium"
    />
  </div>
</div>
<div class="demo-container">
  <div class="demo-grid">
    <orio-empty-state
      icon="edit"
      title="No documents"
      description="Upload or create a new document"
      size="large"
    >
      <orio-button variant="primary" icon="plus">
        Create Document
      </orio-button>
    </orio-empty-state>
  </div>
</div>

## Usage

```vue
<template>
  <orio-empty-state
    icon="search"
    title="No results found"
    description="Try adjusting your search criteria"
    size="small"
  />
  <orio-empty-state
    icon="calendar"
    title="No events scheduled"
    description="Create your first event to get started"
    size="medium"
  />
  <orio-empty-state
    icon="edit"
    title="No documents"
    description="Upload or create a new document"
    size="large"
  >
    <orio-button variant="primary" icon="plus"> Create Document </orio-button>
  </orio-empty-state>
</template>
```

## Props

| Prop          | Type                             | Default     | Description      |
| ------------- | -------------------------------- | ----------- | ---------------- |
| `icon`        | `string`                         | `undefined` | Icon name        |
| `title`       | `string`                         | -           | Main title text  |
| `description` | `string`                         | `undefined` | Description text |
| `size`        | `'small' \| 'medium' \| 'large'` | `'medium'`  | Component size   |

## Slots

| Slot      | Description                          |
| --------- | ------------------------------------ |
| `default` | Action buttons or additional content |
