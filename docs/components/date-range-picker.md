# DateRangePicker

Start and end date selection with "Present" option.

## Live Demo

<script setup>
import { ref } from 'vue'

const employmentDates = ref({
  startDate: '2020-01-01',
  endDate: '2024-12-31'
})

const educationDates = ref({
  startDate: '2018-09-01',
  endDate: null
})
</script>

<div class="demo-container">
  <div class="demo-grid">
    <div>
      <strong>Employment Period:</strong>
      <orio-date-range-picker v-model:dates="employmentDates" />
    </div>

    <div>
      <strong>Education (with Present):</strong>
      <orio-date-range-picker v-model:dates="educationDates" />
    </div>
  </div>

  <div style="margin-top: 1rem; padding: 1rem; background: var(--vp-c-bg-mute); border-radius: 4px;">
    <strong>Employment:</strong> {{ employmentDates.startDate }} → {{ employmentDates.endDate }}<br>
    <strong>Education:</strong> {{ educationDates.startDate }} → {{ educationDates.endDate === null ? 'Present' : educationDates.endDate }}
  </div>
</div>

## Usage

```vue
<template>
  <orio-date-range-picker v-model:dates="dateRange" />
</template>

<script setup>
const dateRange = ref({
  startDate: '',
  endDate: ''
})
</script>
```

### With Month Picker

```vue
<orio-date-range-picker
  v-model:dates="monthRange"
  :month="true"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dates` | `ResumeDate` | - | Date range object (v-model:dates) |
| `month` | `boolean` | `false` | Month/year picker mode |

### ResumeDate Type

```typescript
interface ResumeDate {
  startDate: string
  endDate: string | null
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:dates` | `ResumeDate` | Emitted when dates change |

## Features

- Validates that start date is before end date
- "Present" checkbox sets `endDate` to `null`
- Shows error message if dates are invalid
