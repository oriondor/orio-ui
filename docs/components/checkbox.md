# CheckBox

Custom checkbox component with icon states.

## Live Demo

<script setup>
import { ref } from 'vue'

const agreed = ref(false)
const newsletter = ref(true)
const notifications = ref(false)
</script>

<div class="demo-container">
  <div class="demo-grid">
    <orio-check-box v-model="agreed">
      I agree to the terms and conditions
    </orio-check-box>

    <orio-check-box v-model="newsletter">
      Subscribe to newsletter
    </orio-check-box>

    <orio-check-box v-model="notifications">
      Enable notifications
    </orio-check-box>
  </div>

  <div style="margin-top: 1rem; padding: 1rem; background: var(--vp-c-bg-mute); border-radius: 4px;">
    <strong>Selections:</strong><br>
    Terms: {{ agreed ? '✓ Agreed' : '✗ Not agreed' }}<br>
    Newsletter: {{ newsletter ? '✓ Subscribed' : '✗ Not subscribed' }}<br>
    Notifications: {{ notifications ? '✓ Enabled' : '✗ Disabled' }}
  </div>
</div>

## Usage

```vue
<template>
  <orio-check-box v-model="accepted">
    I accept the terms
  </orio-check-box>
</template>

<script setup>
const accepted = ref(false)
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | - | Checkbox state (v-model) |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | Emitted when checkbox state changes |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Label text/content |
