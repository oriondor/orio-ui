# DatePicker

Date selection component with month/year picker support.

<i>A lot of work should be done regarding this component, for now it's just standard browser's calendar wrapped in a component</i>

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
  </div>
</div>
<div class="demo-container">
  <div class="demo-grid">
    <orio-date-picker
      v-model:date="startDate"
      label="Start Date"
    />
  </div>
</div>
<div class="demo-container">
  <div class="demo-grid">
    <orio-date-picker
      v-model:date="monthOnly"
      label="Month & Year Only"
      month
    />
  </div>
</div>

  <div class="demo-output">
    <strong>Selected dates:</strong><br>
    Birth: {{ birthDate || '(not selected)' }}<br>
    Start: {{ startDate }}<br>
    Month: {{ monthOnly || '(not selected)' }}
  </div>

## Usage

### Full Date

```vue
<template>
  <orio-date-picker v-model:date="birthDate" label="Birth Date" />
  <orio-date-picker v-model:date="startDate" label="Start Date" />
  <orio-date-picker v-model:date="monthOnly" label="Month & Year Only" month />
</template>

<script setup>
const birthDate = ref("");
const startDate = ref("2024-01-15");
const monthOnly = ref("");
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

| Prop    | Type      | Default     | Description                  |
| ------- | --------- | ----------- | ---------------------------- |
| `date`  | `string`  | -           | Selected date (v-model:date) |
| `label` | `string`  | `undefined` | Label text                   |
| `month` | `boolean` | `false`     | Month/year picker mode       |

## Events

| Event         | Payload  | Description               |
| ------------- | -------- | ------------------------- |
| `update:date` | `string` | Emitted when date changes |
