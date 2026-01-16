# ControlElement

This is basically a wrapper that removes border, shadow, margin from the inside element and gives it a label.

It gives an inner element a freedom to be whatever it wants.

## Live Demo

<script setup>
import { ref } from 'vue'
</script>

<div class="demo-container">
  <orio-control-element label="You can add label here">
    <input type="text" placeholder="Notice standard styling is not a case here" style="width: stretch" />
  </orio-control-element>
</div>

## Usage

```vue
<template>
  <orio-control-element label="You can add label here">
    <input
      type="text"
      placeholder="Notice standard styling is not a case here"
      style="width: stretch"
    />
  </orio-control-element>
</template>
```

## Props

| Prop         | Type                     | Default    | Description                                              |
| ------------ | ------------------------ | ---------- | -------------------------------------------------------- |
| `appearance` | `'normal' \| 'minimal'`  | `'normal'` | Minimal removes margin, border, and box-shadow from slot |
| `label`      | `string` (via `$attrs`)  | -          | Label text displayed above the control                   |

## Slots

| Slot      | Description          |
| --------- | -------------------- |
| `default` | Form control element |

## Notes

- Used internally by Input, Textarea, DatePicker, etc.
- Provides consistent spacing and layout
- Can be used to wrap custom form controls
- The `label` is passed via attributes and rendered automatically
