# SwitchButton

Toggle button component with active/inactive states, perfect for filters and view mode switches.

## Live Demo

<script setup>
import { ref } from 'vue'

const isActive = ref(false)
const gridView = ref(false)
const showArchived = ref(false)
const filter1 = ref(true)
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-switch-button v-model="isActive">Toggle Me</orio-switch-button>
    <orio-switch-button v-model="gridView">Grid View</orio-switch-button>
    <orio-switch-button v-model="showArchived">Show Archived</orio-switch-button>
  </div>
</div>

<div class="demo-output">
  <strong>States:</strong><br>
  Toggle: {{ isActive ? 'Active' : 'Inactive' }}<br>
  View: {{ gridView ? 'Grid' : 'List' }}<br>
  Archived: {{ showArchived ? 'Shown' : 'Hidden' }}
</div>

## States

<div class="demo-container">
  <div class="demo-row">
    <orio-switch-button v-model="filter1">Active</orio-switch-button>
    <orio-switch-button :model-value="false">Inactive</orio-switch-button>
    <orio-switch-button :model-value="true" :disabled="true">Disabled Active</orio-switch-button>
    <orio-switch-button :model-value="false" :disabled="true">Disabled Inactive</orio-switch-button>
  </div>
</div>

## Usage

### Basic

```vue
<template>
  <orio-switch-button v-model="isEnabled">
    Enable Feature
  </orio-switch-button>
</template>

<script setup>
import { ref } from 'vue'

const isEnabled = ref(false)
</script>
```

### Filter Buttons

```vue
<template>
  <div class="filters">
    <orio-switch-button v-model="showCompleted">
      Completed
    </orio-switch-button>
    <orio-switch-button v-model="showPending">
      Pending
    </orio-switch-button>
    <orio-switch-button v-model="showCancelled">
      Cancelled
    </orio-switch-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showCompleted = ref(true)
const showPending = ref(true)
const showCancelled = ref(false)
</script>
```

### Disabled State

```vue
<orio-switch-button v-model="option" :disabled="true">
  Locked Option
</orio-switch-button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | `false` | Active state (v-model) |
| `disabled` | `boolean` | `false` | Disables button interaction |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | Emitted when button is toggled |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Button label text/content |

## Keyboard Support

- **Space** or **Enter** - Toggle the button state
- **Tab** - Navigate between switch buttons

## Styling

The switch button uses these CSS variables:

```css
--color-surface         /* Inactive background */
--color-muted           /* Inactive text color */
--color-border          /* Default border */
--color-accent          /* Active text and border */
--color-accent-soft     /* Active background */
--border-radius-md      /* Border radius */
```

## Use Cases

- **Filters**: Toggle visibility of specific content categories
- **View Modes**: Switch between different display layouts (grid/list, compact/detailed)
- **Options**: Enable/disable features or settings
- **Multi-select**: Allow users to select multiple independent options
