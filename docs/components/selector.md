# Selector

Generic dropdown selector supporting both single and multi-select modes with custom option rendering.

## Live Demo

<script setup>
import { ref } from 'vue'

// Simple string array
const selectedCountry = ref(null)
const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan']

// Multiple selection
const selectedColors = ref([])
const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange']

// Object array with custom fields
const selectedUser = ref(null)
const users = [
  { id: 1, name: 'John Doe', role: 'Admin' },
  { id: 2, name: 'Jane Smith', role: 'User' },
  { id: 3, name: 'Bob Johnson', role: 'Manager' },
  { id: 4, name: 'Alice Williams', role: 'User' }
]
</script>

### Single Select (Strings)

<div class="demo-container">
  <orio-selector
    v-model="selectedCountry"
    :options="countries"
    placeholder="Select a country"
  />

  <div style="margin-top: 1rem; padding: 1rem; background: var(--vp-c-bg-mute); border-radius: 4px;">
    <strong>Selected:</strong> {{ selectedCountry || 'None' }}
  </div>
</div>

### Multiple Select

<div class="demo-container">
  <orio-selector
    v-model="selectedColors"
    :options="colors"
    placeholder="Select colors"
    :multiple="true"
  />

  <div style="margin-top: 1rem; padding: 1rem; background: var(--vp-c-bg-mute); border-radius: 4px;">
    <strong>Selected:</strong> {{ selectedColors.length > 0 ? selectedColors.join(', ') : 'None' }}
  </div>
</div>

### Object Array with Custom Fields

<div class="demo-container">
  <orio-selector
    v-model="selectedUser"
    :options="users"
    field="id"
    option-name="name"
    placeholder="Select a user"
  />

  <div style="margin-top: 1rem; padding: 1rem; background: var(--vp-c-bg-mute); border-radius: 4px;">
    <strong>Selected User:</strong>
    <template v-if="selectedUser">
      {{ selectedUser.name }} ({{ selectedUser.role }})
    </template>
    <template v-else>
      None
    </template>
  </div>
</div>

## Usage

### Simple String Array

```vue
<template>
  <orio-selector
    v-model="selected"
    :options="['Option 1', 'Option 2', 'Option 3']"
    placeholder="Select an option"
  />
</template>

<script setup>
const selected = ref(null)
</script>
```

### Object Array

```vue
<template>
  <orio-selector
    v-model="selectedUser"
    :options="users"
    field="id"
    option-name="name"
  />
</template>

<script setup>
const selectedUser = ref(null)
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
]
</script>
```

### Multiple Selection

```vue
<orio-selector
  v-model="selected"
  :options="options"
  :multiple="true"
/>
```

### Custom Option Rendering

```vue
<orio-selector v-model="selected" :options="users">
  <template #option="{ option }">
    <div style="display: flex; justify-content: space-between;">
      <strong>{{ option.name }}</strong>
      <span style="color: gray;">{{ option.role }}</span>
    </div>
  </template>
</orio-selector>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array<string \| object>` | - | Array of options to select from |
| `multiple` | `boolean` | `false` | Enable multi-select mode |
| `field` | `string` | `'id'` | Key field for object options (used as unique identifier) |
| `optionName` | `string` | `undefined` | Field to display for object options |
| `placeholder` | `string` | `'Select an option'` | Placeholder text |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `any \| any[]` | Emitted when selection changes |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `trigger` | `{ toggle }` | Custom trigger element |
| `trigger-content` | `{ toggle, getOptionKey, getOptionLabel }` | Custom trigger content |
| `trigger-label` | `{ toggle, getOptionKey, getOptionLabel }` | Custom trigger label text |
| `option` | `{ option, toggle, selected, getOptionKey, getOptionLabel }` | Custom option rendering |
| `no-options` | - | Custom empty state when no options |
| `options-addon` | - | Additional content at bottom of dropdown |

## TypeScript

The Selector component supports TypeScript generics:

```typescript
interface User {
  id: number
  name: string
  role: string
}

const selectedUser = ref<User | null>(null)
```

## Styling

```css
--color-bg           /* Dropdown background */
--color-border       /* Border color */
--color-text         /* Text color */
--color-accent       /* Selected item background */
--color-surface      /* Hover background */
```
