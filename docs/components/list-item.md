# List Item

A flexible list item component with optional start/end boundary slots, selection support, and icon integration. Ideal for building option lists, menus, and selectable item groups.

## Live Demo

<script setup>
import { ref } from 'vue'

const selected1 = ref(false)
const selected2 = ref(false)
const selected3 = ref(false)
</script>

### Simple Item

<div class="demo-container">
  <orio-list-item>
    Dashboard
  </orio-list-item>
</div>

### With Start Icon

<div class="demo-container">
  <orio-list-item>
    <template #start>
      <orio-icon name="mail" />
    </template>
    Inbox
  </orio-list-item>
</div>

### With End Icon

<div class="demo-container">
  <orio-list-item>
    Settings
    <template #end>
      <orio-icon name="chevron-right" />
    </template>
  </orio-list-item>
</div>

### With Icons on Both Sides

<div class="demo-container">
  <orio-list-item>
    <template #start>
      <orio-icon name="credit-card" />
    </template>
    Payment Methods
    <template #end>
      <orio-icon name="external-link" />
    </template>
  </orio-list-item>
</div>

### Selectable

<div class="demo-container">
  <orio-list-item selectable v-model:selected="selected1">
    <template #end>
      <orio-icon name="mail" />
    </template>
    Email notifications
  </orio-list-item>
  <orio-list-item selectable v-model:selected="selected2">
    <template #end>
      <orio-icon name="chat" />
    </template>
    Chat notifications
  </orio-list-item>
  <orio-list-item selectable v-model:selected="selected3">
    <template #end>
      <orio-icon name="phone" />
    </template>
    Phone notifications
  </orio-list-item>

  <div class="demo-output">
    <strong>Selected:</strong>
    Email: {{ selected1 }},
    Chat: {{ selected2 }},
    Phone: {{ selected3 }}
  </div>
</div>

### Selectable with Custom Start Slot

When `selectable` is true, the start slot defaults to a checkbox. You can override it:

<div class="demo-container">
  <orio-list-item selectable v-model:selected="selected1">
    <template #start>
      <orio-icon name="image" />
    </template>
    Custom start icon (still toggleable)
  </orio-list-item>
</div>

## Usage

### Basic

```vue
<orio-list-item>
  Simple text item
</orio-list-item>
```

### With Start Icon

```vue
<orio-list-item>
  <template #start>
    <orio-icon name="mail" />
  </template>
  Inbox
</orio-list-item>
```

### With End Icon

```vue
<orio-list-item>
  Settings
  <template #end>
    <orio-icon name="chevron-right" />
  </template>
</orio-list-item>
```

### With Icons on Both Sides

```vue
<orio-list-item>
  <template #start>
    <orio-icon name="credit-card" />
  </template>
  Payment Methods
  <template #end>
    <orio-icon name="external-link" />
  </template>
</orio-list-item>
```

### Selectable with v-model

```vue
<script setup>
const selected = ref(false);
</script>

<template>
  <orio-list-item selectable v-model:selected="selected">
    Toggle me
  </orio-list-item>
</template>
```

## Props

| Prop         | Type      | Default | Description                                                                        |
| ------------ | --------- | ------- | ---------------------------------------------------------------------------------- |
| `selectable` | `boolean` | `false` | Enables click-to-toggle behavior and shows a checkbox in the start slot by default |

## Model

| Model      | Type      | Description                                                     |
| ---------- | --------- | --------------------------------------------------------------- |
| `selected` | `boolean` | Two-way binding for the selection state. Use `v-model:selected` |

## Slots

| Slot      | Description                                                                                |
| --------- | ------------------------------------------------------------------------------------------ |
| `default` | Main content of the list item                                                              |
| `start`   | Left boundary — shown when provided, or when `selectable` is true (defaults to a checkbox) |
| `end`     | Right boundary — only rendered when provided                                               |

## Styling

```css
--color-accent         /* Selected item background */
--color-accent-soft-darker  /* Selected item text color */
--color-surface        /* Hover background (non-selected) */
```
