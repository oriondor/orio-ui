# Taggable Selector

A multi-select dropdown that displays selected options as tags inside the trigger. Built on top of [Selector](/components/selector) and [Tag](/components/tag).

## Live Demo

<script setup>
import { ref } from 'vue'

const selectedUsers = ref([])
const users = [
  { id: 1, text: 'John Doe', variant: 'accent' },
  { id: 2, text: 'Jane Smith', variant: 'accent' },
  { id: 3, text: 'Bob Johnson', variant: 'neutral' },
  { id: 4, text: 'Alice Williams', variant: 'accent' }
]

const selectedTags = ref([])
const tags = [
  { id: 'bug', text: 'Bug', variant: 'accent' },
  { id: 'feature', text: 'Feature', variant: 'accent' },
  { id: 'docs', text: 'Documentation', variant: 'neutral' },
  { id: 'refactor', text: 'Refactor', variant: 'neutral' },
  { id: 'perf', text: 'Performance', variant: 'accent' }
]

const selectedWithLabel = ref([])
</script>

### Basic

<div class="demo-container">
  <orio-taggable-selector
    v-model="selectedUsers"
    :options="users"
    placeholder="Select users"
  />

  <div class="demo-output">
    <strong>Selected:</strong> {{ selectedUsers.length > 0 ? selectedUsers.map(u => u.text).join(', ') : 'None' }}
  </div>
</div>

### With Label

<div class="demo-container">
  <orio-taggable-selector
    v-model="selectedWithLabel"
    :options="users"
    label="Assignees"
    placeholder="Select users"
  />

  <div class="demo-output">
    <strong>Selected:</strong> {{ selectedWithLabel.length > 0 ? selectedWithLabel.map(u => u.text).join(', ') : 'None' }}
  </div>
</div>

### Mixed Variants

<div class="demo-container">
  <orio-taggable-selector
    v-model="selectedTags"
    :options="tags"
    label="Labels"
    placeholder="Add labels"
  />

  <div class="demo-output">
    <strong>Selected:</strong> {{ selectedTags.length > 0 ? selectedTags.map(t => t.text).join(', ') : 'None' }}
  </div>
</div>

## Usage

### Basic

```vue
<script setup>
const selected = ref([]);
const options = [
  { id: 1, text: "Option A", variant: "accent" },
  { id: 2, text: "Option B", variant: "neutral" },
];
</script>

<template>
  <orio-taggable-selector
    v-model="selected"
    :options="options"
    placeholder="Select options"
  />
</template>
```

### With Label

```vue
<orio-taggable-selector
  v-model="selected"
  :options="options"
  label="Categories"
  placeholder="Pick categories"
/>
```

## How It Works

TaggableSelector wraps the [Selector](/components/selector) component with `multiple` and `option-name="text"` hardcoded. It overrides the `trigger-label` slot to render each selected option as an `<orio-tag>`, using the `text` and `variant` fields from each option object.

Options must conform to the `TagProps` interface:

```typescript
interface TagProps {
  text: string;
  id?: string;
  variant?: "neutral" | "accent";
}
```

## Props

Inherits all props from [Selector](/components/selector) except `multiple` (always true) and `optionName` (always `"text"`).

| Prop          | Type         | Default              | Description                               |
| ------------- | ------------ | -------------------- | ----------------------------------------- |
| `options`     | `TagProps[]` | -                    | Array of tag objects to select from       |
| `field`       | `string`     | `'id'`               | Key field used as unique identifier       |
| `placeholder` | `string`     | `'Select an option'` | Placeholder text when nothing is selected |
| `label`       | `string`     | -                    | Label text (passed to ControlElement)     |

## Model

| Model        | Type         | Description                                 |
| ------------ | ------------ | ------------------------------------------- |
| `modelValue` | `TagProps[]` | Two-way binding for the selected tags array |

## Styling

Selected tags wrap inside the trigger with flex-wrap:

```css
--color-accent-soft   /* Accent tag background */
--color-accent-border /* Accent tag border */
--color-surface       /* Neutral tag background */
--color-border        /* Neutral tag border */
```
