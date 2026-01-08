# Textarea

Multi-line text input component with label support.

## Live Demo

<script setup>
import { ref } from 'vue'

const bio = ref('')
const message = ref('This is a default message.\nYou can edit me!')
</script>

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

  <div class="demo-output">
    <strong>Bio length:</strong> {{ bio.length }} characters<br>
    <strong>Message preview:</strong> {{ message.substring(0, 50) }}{{ message.length > 50 ? '...' : '' }}
  </div>
</div>

## Usage

```vue
<template>
  <orio-textarea
    v-model="description"
    label="Description"
    placeholder="Enter description..."
  />
</template>

<script setup>
const description = ref('')
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | - | Textarea value (v-model) |
| `label` | `string` | `undefined` | Label text displayed above textarea |
| `placeholder` | `string` | `undefined` | Placeholder text |

All standard HTML textarea attributes are supported via `v-bind="$attrs"`.

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted when textarea value changes |
