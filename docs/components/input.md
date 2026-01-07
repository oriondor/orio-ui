# Input

Text input component with label and placeholder support.

## Live Demo

<script setup>
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const password = ref('')
</script>

<div class="demo-container">
  <div class="demo-grid">
    <orio-input
      v-model="name"
      placeholder="Enter your name"
      label="Name"
    />
    <orio-input
      v-model="email"
      type="email"
      placeholder="you@example.com"
      label="Email"
    />
    <orio-input
      v-model="password"
      type="password"
      placeholder="••••••••"
      label="Password"
    />
  </div>

  <div style="margin-top: 1rem; padding: 1rem; background: var(--vp-c-bg-mute); border-radius: 4px;">
    <strong>Current values:</strong><br>
    Name: {{ name || '(empty)' }}<br>
    Email: {{ email || '(empty)' }}<br>
    Password: {{ password || '(empty)' }}
  </div>
</div>

## Usage

### Basic

```vue
<template>
  <orio-input v-model="name" placeholder="Enter your name" />
</template>

<script setup>
const name = ref('')
</script>
```

### With Label

```vue
<orio-input
  v-model="email"
  label="Email Address"
  type="email"
  placeholder="you@example.com"
/>
```

### Different Types

```vue
<orio-input v-model="text" type="text" label="Text" />
<orio-input v-model="email" type="email" label="Email" />
<orio-input v-model="password" type="password" label="Password" />
<orio-input v-model="number" type="number" label="Age" />
<orio-input v-model="url" type="url" label="Website" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | - | Input value (v-model) |
| `label` | `string` | `undefined` | Label text displayed above input |
| `placeholder` | `string` | `undefined` | Placeholder text |
| `type` | `string` | `'text'` | HTML input type |

All standard HTML input attributes are supported via `v-bind="$attrs"`.

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted when input value changes |

## Styling

```css
--color-bg           /* Input background */
--color-border       /* Border color */
--color-text         /* Text color */
--color-accent       /* Focus border color */
```
