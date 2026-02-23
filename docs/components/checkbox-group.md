# CheckboxGroup

Group of checkboxes with a shared legend, built on a semantic `<fieldset>` element.

## Live Demo

<script setup>
import { ref, computed } from 'vue'

const permissions = ref(['read'])
const notifications = ref(['email', 'push'])
const days = ref([])
const selected = ref(['vue'])

const permissionOptions = [
  { label: 'Read', value: 'read' },
  { label: 'Write', value: 'write' },
  { label: 'Delete', value: 'delete' },
]

const notificationOptions = [
  { label: 'Email', value: 'email' },
  { label: 'Push notifications', value: 'push' },
  { label: 'SMS', value: 'sms' },
]

const dayOptions = [
  { label: 'Monday', value: 'mon' },
  { label: 'Tuesday', value: 'tue' },
  { label: 'Wednesday', value: 'wed' },
  { label: 'Thursday', value: 'thu' },
  { label: 'Friday', value: 'fri' },
]

const daysError = computed(() =>
  days.value.length === 0 ? 'Please select at least one day.' : null
)
</script>

### Vertical (default)

<div class="demo-container">
  <div class="demo-grid">
    <orio-checkbox-group
      v-model="permissions"
      label="Permissions"
      :options="permissionOptions"
    />
    <orio-checkbox-group
      v-model="notifications"
      label="Notify me via"
      :options="notificationOptions"
    />
  </div>
</div>

<div class="demo-output">
  <strong>Permissions:</strong> {{ permissions.join(', ') || 'none' }}<br>
  <strong>Notifications:</strong> {{ notifications.join(', ') || 'none' }}
</div>

### Horizontal

<div class="demo-container">
  <div class="demo-grid">
    <orio-checkbox-group
      v-model="notifications"
      label="Notify me via"
      layout="horizontal"
      :options="notificationOptions"
    />
  </div>
</div>

### With Error

<div class="demo-container">
  <div class="demo-grid">
    <orio-checkbox-group
      v-model="days"
      label="Working days"
      :options="dayOptions"
      :error="daysError"
    />
  </div>
</div>

### Slot-based Composition

Use the default slot to place `<orio-check-box>` components directly when you need custom logic per option.

<div class="demo-container">
  <div class="demo-grid">
    <orio-checkbox-group v-model="selected" label="Frameworks">
      <orio-check-box
        appearance="minimal"
        :model-value="selected.includes('vue')"
        @update:model-value="v => v ? selected.push('vue') : selected.splice(selected.indexOf('vue'), 1)"
      >
        Vue
      </orio-check-box>
      <orio-check-box
        appearance="minimal"
        :model-value="selected.includes('react')"
        @update:model-value="v => v ? selected.push('react') : selected.splice(selected.indexOf('react'), 1)"
      >
        React
      </orio-check-box>
      <orio-check-box
        appearance="minimal"
        :model-value="selected.includes('svelte')"
        @update:model-value="v => v ? selected.push('svelte') : selected.splice(selected.indexOf('svelte'), 1)"
      >
        Svelte
      </orio-check-box>
    </orio-checkbox-group>
  </div>
</div>

<div class="demo-output">
  <strong>Selected:</strong> {{ selected.join(', ') || 'none' }}
</div>

## Usage

### Basic

```vue
<template>
  <orio-checkbox-group
    v-model="selected"
    label="Permissions"
    :options="options"
  />
</template>

<script setup>
import { ref } from "vue";

const selected = ref(["read"]);
const options = [
  { label: "Read", value: "read" },
  { label: "Write", value: "write" },
  { label: "Delete", value: "delete" },
];
</script>
```

### Horizontal Layout

```vue
<orio-checkbox-group
  v-model="selected"
  label="Notify me via"
  layout="horizontal"
  :options="options"
/>
```

### With Error

```vue
<orio-checkbox-group
  v-model="selected"
  label="Working days"
  :options="dayOptions"
  :error="selected.length === 0 ? 'Select at least one day.' : null"
/>
```

### Slot-based

Use the slot when you need per-option custom markup or icons. Pass `appearance="minimal"` to each `CheckBox` so it strips its outer margin.

```vue
<orio-checkbox-group v-model="selected" label="Frameworks">
  <orio-check-box
    appearance="minimal"
    :model-value="selected.includes('vue')"
    @update:model-value="toggle('vue')"
  >
    Vue
  </orio-check-box>
  <orio-check-box
    appearance="minimal"
    :model-value="selected.includes('react')"
    @update:model-value="toggle('react')"
  >
    React
  </orio-check-box>
</orio-checkbox-group>
```

## Props

| Prop         | Type                           | Default      | Description                                        |
| ------------ | ------------------------------ | ------------ | -------------------------------------------------- |
| `modelValue` | `unknown[]`                    | `[]`         | Array of selected values (v-model)                 |
| `options`    | `CheckboxOption[]`             | `[]`         | List of options to render (ignored when slot used) |
| `label`      | `string`                       | `undefined`  | Legend text for the group                          |
| `layout`     | `"vertical" \| "horizontal"`   | `"vertical"` | Legend position relative to the checkboxes         |
| `size`       | `"sm" \| "md" \| "lg" \| "xl"` | `"md"`       | Size of the checkboxes and label                   |
| `error`      | `string \| null`               | `null`       | Error message displayed below the group            |

### CheckboxOption

```ts
interface CheckboxOption {
  label: string;
  value: unknown;
}
```

## Events

| Event               | Payload     | Description                          |
| ------------------- | ----------- | ------------------------------------ |
| `update:modelValue` | `unknown[]` | Emitted when any checkbox is toggled |

## Slots

| Slot      | Description                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `default` | Custom checkbox content. Overrides `options` prop. Use `appearance="minimal"` on each `<orio-check-box>`. |

## Accessibility

- Renders as `<fieldset>` with `<legend>` — screen readers announce the group label before each individual checkbox.
- Each `<orio-check-box>` inside uses a native `<input type="checkbox">` with a visible `<label>`, so focus, keyboard, and screen reader behaviour are fully native.
