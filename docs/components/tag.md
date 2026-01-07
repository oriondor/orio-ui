# Tag

Styled tag/badge component.

## Live Demo

<script setup>
import { ref } from 'vue'
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-tag>Default Tag</orio-tag>
    <orio-tag style="accent">Accent Tag</orio-tag>
    <orio-tag style="neutral">Neutral Tag</orio-tag>
  </div>

  <div class="demo-row" style="margin-top: 1rem;">
    <orio-tag>React</orio-tag>
    <orio-tag>Vue</orio-tag>
    <orio-tag>Angular</orio-tag>
    <orio-tag>Svelte</orio-tag>
  </div>
</div>

## Usage

```vue
<template>
  <div>
    <orio-tag>JavaScript</orio-tag>
    <orio-tag style="accent">Featured</orio-tag>
  </div>
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `style` | `'neutral' \| 'accent'` | `'neutral'` | Tag visual style |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Tag content/text |
