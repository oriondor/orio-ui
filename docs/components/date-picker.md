# DatePicker

Date selection component with month/year picker support.

## Live Demo

<script setup>
import { ref } from 'vue'

const birthDate = ref('')
const startDate = ref('2024-01-15')
const monthOnly = ref('')
</script>

<div class="demo-container">
  <div class="demo-grid">
    <orio-date-picker
      v-model:date="birthDate"
      label="Birth Date"
    />

    <orio-date-picker
      v-model:date="startDate"
      label="Start Date"
    />

    <orio-date-picker
      v-model:date="monthOnly"
      label="Month & Year Only"
      :month="true"
    />
  </div>

  <div style="margin-top: 1rem; padding: 1rem; background: var(--vp-c-bg-mute); border-radius: 4px;">
    <strong>Selected dates:</strong><br>
    Birth: {{ birthDate || '(not selected)' }}<br>
    Start: {{ startDate }}<br>
    Month: {{ monthOnly || '(not selected)' }}
  </div>
</div>

## Usage

### Full Date

```vue
<template>
  <orio-date-picker
    v-model:date="selectedDate"
    label="Select Date"
  />
</template>

<script setup>
const selectedDate = ref('')
</script>
```

### Month & Year Only

```vue
<orio-date-picker
  v-model:date="selectedMonth"
  label="Select Month"
  :month="true"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `date` | `string` | - | Selected date (v-model:date) |
| `label` | `string` | `undefined` | Label text |
| `month` | `boolean` | `false` | Month/year picker mode |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:date` | `string` | Emitted when date changes |
