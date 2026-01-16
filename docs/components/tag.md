# Tag

Styled tag/badge component.

## Live Demo

<script setup>
import { ref } from 'vue'
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-tag text="Default Tag" />
    <orio-tag text="Accent Tag" variant="accent" />
    <orio-tag text="Neutral Tag" variant="neutral" />
  </div>

  <div class="demo-row" style="margin-top: 1rem;">
    <orio-tag text="React" />
    <orio-tag text="Vue" />
    <orio-tag text="Angular" />
    <orio-tag text="Svelte" />
  </div>
</div>

## Usage

```vue
<template>
  <div>
    <orio-tag text="JavaScript" />
    <orio-tag text="Featured" variant="accent" />
  </div>
</template>
```

## Props

| Prop      | Type                       | Default     | Description      |
| --------- | -------------------------- | ----------- | ---------------- |
| `text`    | `string`                   | -           | Tag text content |
| `variant` | `'neutral' \| 'accent'`    | `'neutral'` | Tag visual style |
