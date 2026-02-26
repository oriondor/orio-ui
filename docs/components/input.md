# Input

Text input component with label, icon slots, and layout support.

## Live Demo

<script setup>
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const password = ref('')
const search = ref('')
const innerName = ref('')
const innerEmail = ref('')
const innerSearch = ref('')
const innerPassword = ref('')
const innerWebsite = ref('')
const horizontalCity = ref('')
const horizontalZip = ref('')
</script>

### Vertical (default)

<div class="demo-container">
  <div class="demo-grid">
    <orio-input
      v-model="name"
      placeholder="Enter your name"
      label="Name"
    >
      <template #before>
        <orio-icon name="user" />
      </template>
    </orio-input>
    <orio-input
      v-model="email"
      type="email"
      placeholder="you@example.com"
      label="Email"
    />
    <orio-input
      v-model="password"
      type="password"
      placeholder="••••••••"
      label="Password"
    />
  </div>
</div>

### With Icons

<div class="demo-container">
  <div class="demo-grid">
    <orio-input
      v-model="search"
      placeholder="Search..."
    >
      <template #before>
        <orio-icon name="search" />
      </template>
    </orio-input>
    <orio-input
      v-model="email"
      type="email"
      placeholder="you@example.com"
      label="Email"
    >
      <template #after>
        <orio-icon name="mail" />
      </template>
    </orio-input>
    <orio-input
      v-model="password"
      type="password"
      placeholder="••••••••"
      label="Password"
    >
      <template #before>
        <orio-icon name="lock" />
      </template>
      <template #after>
        <orio-icon name="eye" />
      </template>
    </orio-input>
  </div>
</div>

### Horizontal

<div class="demo-container">
  <div class="demo-grid">
    <orio-input
      v-model="horizontalCity"
      placeholder="City"
      label="City"
      layout="horizontal"
    />
    <orio-input
      v-model="horizontalZip"
      placeholder="Zip Code"
      label="Zip"
      layout="horizontal"
    />
  </div>
</div>

### Inner

<div class="demo-container">
  <div class="demo-grid">
    <orio-input
      v-model="innerName"
      label="Full Name"
      layout="inner"
    />
    <orio-input
      v-model="innerEmail"
      type="email"
      label="Email Address"
      layout="inner"
    />
  </div>
</div>

### Inner with Icons

<div class="demo-container">
  <div class="demo-grid">
    <orio-input
      v-model="innerSearch"
      label="Search"
      layout="inner"
    >
      <template #before>
        <orio-icon name="search" />
      </template>
    </orio-input>
    <orio-input
      v-model="innerPassword"
      type="password"
      label="Password"
      layout="inner"
    >
      <template #before>
        <orio-icon name="lock" />
      </template>
      <template #after>
        <orio-icon name="eye" />
      </template>
    </orio-input>
    <orio-input
      v-model="innerWebsite"
      type="url"
      label="Website"
      layout="inner"
    >
      <template #after>
        <orio-icon name="external-link" />
      </template>
    </orio-input>
  </div>
</div>

## Usage

### Basic

```vue
<template>
  <orio-input v-model="name" placeholder="Enter your name" />
</template>

<script setup>
const name = ref("");
</script>
```

### With Label

```vue
<orio-input
  v-model="email"
  label="Email Address"
  type="email"
  placeholder="you@example.com"
/>
```

### With Icons

```vue
<orio-input v-model="search" placeholder="Search...">
  <template #before>
    <orio-icon name="search" />
  </template>
</orio-input>

<orio-input v-model="password" type="password" label="Password">
  <template #before>
    <orio-icon name="lock" />
  </template>
  <template #after>
    <orio-icon name="eye" />
  </template>
</orio-input>
```

### Horizontal Layout

```vue
<orio-input v-model="city" label="City" layout="horizontal" />
```

### Inner Layout

```vue
<orio-input v-model="name" label="Full Name" layout="inner" />
```

### Different Types

```vue
<orio-input v-model="text" type="text" label="Text" />
<orio-input v-model="email" type="email" label="Email" />
<orio-input v-model="password" type="password" label="Password" />
<orio-input v-model="number" type="number" label="Age" />
<orio-input v-model="url" type="url" label="Website" />
```

## Props

| Prop          | Type                                    | Default      | Description                      |
| ------------- | --------------------------------------- | ------------ | -------------------------------- |
| `modelValue`  | `string`                                | `""`         | Input value (v-model)            |
| `layout`      | `"vertical" \| "horizontal" \| "inner"` | `"vertical"` | Label position relative to input |
| `label`       | `string`                                | `undefined`  | Label text                       |
| `placeholder` | `string`                                | `undefined`  | Placeholder text                 |
| `type`        | `string`                                | `"text"`     | HTML input type                  |

All standard HTML input attributes are supported via `v-bind="$attrs"`.

## Slots

| Slot     | Description                                 |
| -------- | ------------------------------------------- |
| `before` | Content placed before the input (e.g. icon) |
| `after`  | Content placed after the input (e.g. icon)  |

## Events

| Event               | Payload  | Description                      |
| ------------------- | -------- | -------------------------------- |
| `update:modelValue` | `string` | Emitted when input value changes |

## Styling

```css
--color-bg           /* Input background */
--color-border       /* Border color */
--color-text         /* Text color */
--color-accent       /* Focus border color */
--color-accent-soft  /* Focus ring color */
--color-muted        /* Placeholder and inner label color */
```
