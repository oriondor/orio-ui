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
    <orio-date-range-picker v-model:dates="employmentDates" label="Employment Period" />
  </div>
</div>

<div class="demo-container">
  <div class="demo-grid">
    <orio-date-range-picker v-model:dates="educationDates" label="Education (with Present)" />
  </div>
</div>

<div class="demo-output">
  <strong>Employment:</strong> {{ employmentDates.startDate }} → {{ employmentDates.endDate }}<br>
  <strong>Education:</strong> {{ educationDates.startDate }} → {{ educationDates.endDate === null ? 'Present' : educationDates.endDate }}
</div>

## Usage

```vue
<template>
  <orio-date-range-picker
    v-model:dates="employmentDates"
    label="Employment Period"
  />
  <orio-date-range-picker
    v-model:dates="educationDates"
    label="Education (with Present)"
  />
</template>

<script setup>
const employmentDates = ref({
  startDate: "2020-01-01",
  endDate: "2024-12-31",
});

const educationDates = ref({
  startDate: "2018-09-01",
  endDate: null,
});
</script>
```

### With Month Picker

```vue
<orio-date-range-picker v-model:dates="monthRange" :month="true" />
```

## Props

| Prop    | Type         | Default | Description                       |
| ------- | ------------ | ------- | --------------------------------- |
| `dates` | `ResumeDate` | -       | Date range object (v-model:dates) |
| `month` | `boolean`    | `false` | Month/year picker mode            |

### ResumeDate Type

```typescript
interface ResumeDate {
  startDate: string;
  endDate: string | null;
}
```

## Events

| Event          | Payload      | Description               |
| -------------- | ------------ | ------------------------- |
| `update:dates` | `ResumeDate` | Emitted when dates change |

## Features

- Validates that start date is before end date
- "Present" checkbox sets `endDate` to `null`
- Shows error message if dates are invalid
