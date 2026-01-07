# ControlElement

Form control wrapper component with label support.

## Live Demo

<script setup>
import { ref } from 'vue'
</script>

<div class="demo-container">
  <orio-control-element>
    <input type="text" placeholder="Input wrapped in ControlElement" style="width: 100%; padding: 0.5rem; border: 1px solid var(--vp-c-divider); border-radius: 4px;" />
  </orio-control-element>

  <orio-control-element>
    <select style="width: 100%; padding: 0.5rem; border: 1px solid var(--vp-c-divider); border-radius: 4px;">
      <option>Option 1</option>
      <option>Option 2</option>
    </select>
  </orio-control-element>
</div>

## Usage

```vue
<template>
  <orio-control-element>
    <input type="text" />
  </orio-control-element>
</template>
```

## Props

None - this is a simple wrapper component.

## Slots

| Slot | Description |
|------|-------------|
| `default` | Form control element |

## Notes

- Used internally by Input, Textarea, DatePicker, etc.
- Provides consistent spacing and layout
- Can be used to wrap custom form controls
