# ControlElement

This is basically a wrapper that removes border, shadow, margin from the inside element and gives it a label.

It gives an inner element a freedom to be whatever it wants.

## Live Demo

<script setup>
import { ref } from 'vue'

const inputValue = ref('')
const textareaValue = ref('')
const numberValue = ref(0)
const selectorValue = ref(null)
const checkboxValue = ref(false)
const switchValue = ref(false)
const innerInputValue = ref('')
const innerTextareaValue = ref('')

const options = ['Apple', 'Banana', 'Cherry', 'Date']
</script>

<div class="demo-container">
  <orio-control-element label="You can add label here">
    <input type="text" placeholder="Notice standard styling is not a case here" style="width: stretch" />
  </orio-control-element>
</div>

## Sizes

The `size` prop controls font-size, padding, border-radius, and element sizing across all wrapped components. Available sizes: `sm`, `md` (default), `lg`, `xl`.

### Input

<div class="demo-container">
  <orio-input v-model="inputValue" label="Small" placeholder="sm input" size="sm" />
  <orio-input v-model="inputValue" label="Medium (default)" placeholder="md input" size="md" />
  <orio-input v-model="inputValue" label="Large" placeholder="lg input" size="lg" />
  <orio-input v-model="inputValue" label="Extra Large" placeholder="xl input" size="xl" />
</div>

### Input with Icons

<div class="demo-container">
  <orio-input v-model="inputValue" placeholder="sm" size="sm">
    <template #before><orio-icon name="search" /></template>
  </orio-input>
  <orio-input v-model="inputValue" placeholder="md" size="md">
    <template #before><orio-icon name="search" /></template>
  </orio-input>
  <orio-input v-model="inputValue" placeholder="lg" size="lg">
    <template #before><orio-icon name="search" /></template>
  </orio-input>
  <orio-input v-model="inputValue" placeholder="xl" size="xl">
    <template #before><orio-icon name="search" /></template>
  </orio-input>
</div>

### Textarea

<div class="demo-container">
  <div class="demo-grid">
    <orio-textarea v-model="textareaValue" label="Small" placeholder="sm textarea" size="sm" :rows="2" />
    <orio-textarea v-model="textareaValue" label="Medium" placeholder="md textarea" size="md" :rows="2" />
  </div>
  <div class="demo-grid">
    <orio-textarea v-model="textareaValue" label="Large" placeholder="lg textarea" size="lg" :rows="2" />
    <orio-textarea v-model="textareaValue" label="Extra Large" placeholder="xl textarea" size="xl" :rows="2" />
  </div>
</div>

### Button

<div class="demo-container">
  <div class="demo-row">
    <orio-button size="sm">Small</orio-button>
    <orio-button size="md">Medium</orio-button>
    <orio-button size="lg">Large</orio-button>
    <orio-button size="xl">Extra Large</orio-button>
  </div>
  <div class="demo-row">
    <orio-button size="sm" variant="secondary">Small</orio-button>
    <orio-button size="md" variant="secondary">Medium</orio-button>
    <orio-button size="lg" variant="secondary">Large</orio-button>
    <orio-button size="xl" variant="secondary">Extra Large</orio-button>
  </div>
</div>

### Button with Icons

<div class="demo-container">
  <div class="demo-row">
    <orio-button size="sm" icon="plus">Add</orio-button>
    <orio-button size="md" icon="plus">Add</orio-button>
    <orio-button size="lg" icon="plus">Add</orio-button>
    <orio-button size="xl" icon="plus">Add</orio-button>
  </div>
  <div class="demo-row">
    <orio-button size="sm" icon="settings" />
    <orio-button size="md" icon="settings" />
    <orio-button size="lg" icon="settings" />
    <orio-button size="xl" icon="settings" />
  </div>
</div>

### NavButton

<div class="demo-container">
  <div class="demo-row">
    <orio-nav-button size="sm" icon="home">Home</orio-nav-button>
    <orio-nav-button size="md" icon="home">Home</orio-nav-button>
    <orio-nav-button size="lg" icon="home">Home</orio-nav-button>
    <orio-nav-button size="xl" icon="home">Home</orio-nav-button>
  </div>
</div>

### SwitchButton

<div class="demo-container">
  <div class="demo-row">
    <orio-switch-button v-model="switchValue" size="sm">Small</orio-switch-button>
    <orio-switch-button v-model="switchValue" size="md">Medium</orio-switch-button>
    <orio-switch-button v-model="switchValue" size="lg">Large</orio-switch-button>
    <orio-switch-button v-model="switchValue" size="xl">Extra Large</orio-switch-button>
  </div>
</div>

### Selector

<div class="demo-container">
  <div class="demo-grid">
    <orio-selector v-model="selectorValue" :options="options" label="Small" size="sm" />
    <orio-selector v-model="selectorValue" :options="options" label="Medium" size="md" />
    <orio-selector v-model="selectorValue" :options="options" label="Large" size="lg" />
    <orio-selector v-model="selectorValue" :options="options" label="Extra Large" size="xl" />
  </div>
</div>

### CheckBox

<div class="demo-container">
  <div class="demo-row">
    <orio-check-box v-model="checkboxValue" size="sm">Small</orio-check-box>
    <orio-check-box v-model="checkboxValue" size="md">Medium</orio-check-box>
    <orio-check-box v-model="checkboxValue" size="lg">Large</orio-check-box>
    <orio-check-box v-model="checkboxValue" size="xl">Extra Large</orio-check-box>
  </div>
</div>

## Inner Layout

Input and Textarea support `layout="inner"`, which floats the label inside the control boundary. The label starts as a placeholder and animates upward when the field is focused or filled.

### Input

<div class="demo-container">
  <div class="demo-grid">
    <orio-input v-model="innerInputValue" label="Full Name" layout="inner" />
    <orio-input v-model="innerInputValue" type="email" label="Email Address" layout="inner" />
    <orio-input v-model="innerInputValue" type="password" label="Password" layout="inner" />
  </div>
  <div class="demo-grid">
    <orio-input v-model="innerInputValue" label="Search" layout="inner" size="sm">
      <template #before><orio-icon name="search" /></template>
    </orio-input>
    <orio-input v-model="innerInputValue" label="Website" layout="inner" size="lg">
      <template #after><orio-icon name="external-link" /></template>
    </orio-input>
  </div>
</div>

### Textarea

<div class="demo-container">
  <div class="demo-grid">
    <orio-textarea v-model="innerTextareaValue" label="Notes" layout="inner" />
    <orio-textarea v-model="innerTextareaValue" label="Feedback" layout="inner" />
  </div>
</div>

### Inner with sizes

<div class="demo-container">
  <div class="demo-grid">
    <orio-input v-model="innerInputValue" label="Small" layout="inner" size="sm" />
    <orio-input v-model="innerInputValue" label="Medium (default)" layout="inner" size="md" />
    <orio-input v-model="innerInputValue" label="Large" layout="inner" size="lg" />
    <orio-input v-model="innerInputValue" label="Extra Large" layout="inner" size="xl" />
  </div>
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

### Setting Size

```vue
<!-- Size applies to any component wrapped with ControlElement -->
<orio-input v-model="name" label="Name" size="sm" />
<orio-input v-model="name" label="Name" size="md" />
<orio-input v-model="name" label="Name" size="lg" />
<orio-input v-model="name" label="Name" size="xl" />

<orio-button size="lg">Large Button</orio-button>
<orio-selector v-model="value" :options="options" size="sm" />
```

## Props

| Prop         | Type                                | Default    | Description                                              |
| ------------ | ----------------------------------- | ---------- | -------------------------------------------------------- |
| `appearance` | `'normal' \| 'minimal'`            | `'normal'` | Minimal removes margin, border, and box-shadow from slot |
| `size`       | `'sm' \| 'md' \| 'lg' \| 'xl'`    | `'md'`     | Controls font-size, padding, and radius of inner elements |
| `layout`     | `'vertical' \| 'horizontal'`       | `'vertical'` | Label position relative to the control                 |
| `label`      | `string`                           | -          | Label text displayed above the control                   |

## Slots

| Slot      | Description          |
| --------- | -------------------- |
| `default` | Form control element |

## CSS Variables

ControlElement sets the following CSS custom properties based on `size`, which child components consume:

| Variable                        | sm       | md (default) | lg       | xl       |
| ------------------------------- | -------- | ------------ | -------- | -------- |
| `--control-font-size`           | 0.75rem  | 0.875rem     | 1.25rem  | 1.75rem  |
| `--control-label-font-size`     | 0.65rem  | 0.75rem      | 0.875rem | 1.25rem  |
| `--control-py`                  | 0.25rem  | 0.5rem       | 0.625rem | 0.75rem  |
| `--control-px`                  | 0.5rem   | 0.75rem      | 1rem     | 1.25rem  |
| `--control-gap`                 | 0.25rem  | 0.5rem       | 0.5rem   | 0.75rem  |
| `--control-radius`              | 4px      | 8px          | 8px      | 12px     |
| `--control-icon-size`           | 0.75rem  | 1rem         | 1.25rem  | 1.5rem   |

## Notes

- Used internally by Input, Textarea, DatePicker, etc.
- Provides consistent spacing and layout
- Can be used to wrap custom form controls
- The `label` is passed via attributes and rendered automatically
- Size cascades via CSS variables — child components read them automatically
