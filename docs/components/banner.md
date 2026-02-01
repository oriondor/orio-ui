# Banner

A colored container component for displaying important messages, notifications, or callouts.

## Live Demo

<script setup>
import { ref } from 'vue'
</script>

### Variants

<div class="demo-container">
  <div class="demo-column">
    <orio-banner variant="info">
      This is an info banner with helpful information.
    </orio-banner>
    <orio-banner variant="success">
      Success! Your changes have been saved.
    </orio-banner>
    <orio-banner variant="alert">
      Warning: This action cannot be undone.
    </orio-banner>
    <orio-banner variant="danger">
      Error: Something went wrong.
    </orio-banner>
  </div>
</div>

### With Custom Content

<div class="demo-container">
  <div class="demo-column">
    <orio-banner variant="info">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <orio-icon name="info" size="20" />
        <span>You can put any content inside the banner.</span>
      </div>
    </orio-banner>
    <orio-banner variant="success">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span>Your file has been uploaded successfully.</span>
        <orio-button size="small">View File</orio-button>
      </div>
    </orio-banner>
  </div>
</div>

## Usage

### Basic

```vue
<template>
  <orio-banner variant="info">
    This is an informational message.
  </orio-banner>
</template>
```

### With Icon and Button

```vue
<template>
  <orio-banner variant="success">
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <orio-icon name="check" size="20" />
      <span>Operation completed successfully!</span>
    </div>
  </orio-banner>
</template>
```

## Props

| Prop      | Type                                            | Default  | Description          |
| --------- | ----------------------------------------------- | -------- | -------------------- |
| `variant` | `'danger' \| 'alert' \| 'success' \| 'info'`    | `'info'` | Banner color variant |

## Slots

| Slot      | Description                              |
| --------- | ---------------------------------------- |
| `default` | Banner content - can be any valid markup |
