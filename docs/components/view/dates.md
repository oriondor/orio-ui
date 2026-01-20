# View Dates

Display formatted date ranges with support for single dates, date ranges, and "Present" indicators.

## Live Demo

<script setup>
import { ref } from 'vue'

const singleDate = { startDate: '2024-03-15' }
const dateRange = { startDate: '2022-01-01', endDate: '2024-06-30' }
const currentRange = { startDate: '2023-05-01', endDate: null }
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-view-dates :dates="singleDate" />
  </div>
  <div class="demo-row">
    <orio-view-dates :dates="dateRange" />
  </div>
  <div class="demo-row">
    <orio-view-dates :dates="currentRange" />
  </div>
</div>

## Usage

### Single Date

```vue
<template>
  <orio-view-dates :dates="{ startDate: '2024-03-15' }" />
</template>
```

### Date Range

```vue
<template>
  <orio-view-dates :dates="{ startDate: '2022-01-01', endDate: '2024-06-30' }" />
</template>
```

### Current (with "Present")

Use `null` for `endDate` to display "Present":

```vue
<template>
  <orio-view-dates :dates="{ startDate: '2023-05-01', endDate: null }" />
</template>
```

### Month/Year Format

Use `month` prop to show only month and year:

```vue
<template>
  <orio-view-dates :dates="dates" month />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dates` | `ResumeDate` | required | Date object with startDate and optional endDate |
| `month` | `boolean` | `false` | Show only month/year instead of full date |
| `size` | `'small' \| 'medium' \| 'large'` | `'small'` | Text size |
| `type` | `'text' \| 'title' \| 'subtitle' \| 'italics'` | `'italics'` | Text style |

## Types

```ts
interface ResumeDate {
  startDate: string;
  endDate?: string | null; // undefined = single date, null = "Present"
}
```

## Notes

- Uses `Intl.DateTimeFormat` for localized formatting (en-US)
- When `endDate` is `undefined`, only the start date is shown
- When `endDate` is `null`, "Present" is displayed
- Internally uses `orio-view-text` for consistent typography
