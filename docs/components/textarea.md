# Textarea

Multi-line text input component with label and layout support.

## Live Demo

<script setup>
import { ref } from 'vue'

const bio = ref('')
const message = ref('This is a default message.\nYou can edit me!')
const innerNotes = ref('')
const innerFeedback = ref('')
const horizontalComment = ref('')
</script>

### Vertical (default)

<div class="demo-container">
  <div class="demo-grid">
    <orio-textarea
      v-model="bio"
      label="Biography"
      placeholder="Tell us about yourself..."
    />
    <orio-textarea
      v-model="message"
      label="Message"
      placeholder="Enter your message"
    />
  </div>
</div>

### Horizontal

<div class="demo-container">
  <orio-textarea
    v-model="horizontalComment"
    label="Comment"
    placeholder="Leave a comment..."
    layout="horizontal"
  />
</div>

### Inner

<div class="demo-container">
  <div class="demo-grid">
    <orio-textarea
      v-model="innerNotes"
      label="Notes"
      layout="inner"
    />
    <orio-textarea
      v-model="innerFeedback"
      label="Feedback"
      layout="inner"
    />
  </div>
</div>

## Usage

### Basic

```vue
<template>
  <orio-textarea
    v-model="description"
    label="Description"
    placeholder="Enter description..."
  />
</template>

<script setup>
const description = ref("");
</script>
```

### Horizontal Layout

```vue
<orio-textarea
  v-model="comment"
  label="Comment"
  layout="horizontal"
/>
```

### Inner Layout

```vue
<orio-textarea
  v-model="notes"
  label="Notes"
  layout="inner"
/>
```

## Props

| Prop         | Type                                         | Default      | Description                          |
| ------------ | -------------------------------------------- | ------------ | ------------------------------------ |
| `modelValue` | `string`                                     | `""`         | Textarea value (v-model)             |
| `layout`     | `"vertical" \| "horizontal" \| "inner"`   | `"vertical"` | Label position relative to textarea  |
| `label`      | `string`                                     | `undefined`  | Label text                           |
| `placeholder`| `string`                                     | `undefined`  | Placeholder text                     |

All standard HTML textarea attributes are supported via `v-bind="$attrs"`.

## Events

| Event               | Payload  | Description                         |
| ------------------- | -------- | ----------------------------------- |
| `update:modelValue` | `string` | Emitted when textarea value changes |

## Styling

```css
--color-bg           /* Textarea background */
--color-border       /* Border color */
--color-text         /* Text color */
--color-accent       /* Focus border color */
--color-accent-soft  /* Focus ring color */
--color-muted        /* Placeholder and inner label color */
```
