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
      <orio-button type="primary" icon="plus">
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
    title="No results"
    description="Try a different search term"
  />
</template>
```

### With Action Button

```vue
<orio-empty-state
  icon="plus"
  title="No items"
  description="Get started by creating your first item"
>
  <orio-button @click="createItem">
    Create Item
  </orio-button>
</orio-empty-state>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | `undefined` | Icon name |
| `title` | `string` | - | Main title text |
| `description` | `string` | `undefined` | Description text |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Component size |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Action buttons or additional content |
