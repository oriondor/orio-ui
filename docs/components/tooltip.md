# Tooltip

Display contextual information on hover or focus.

## Live Demo

<script setup>
import { ref } from 'vue'
</script>

<div class="demo-container">
  <h3>Placements</h3>
  <div class="demo-row">
    <orio-tooltip text="Top tooltip" placement="top">
      <orio-button variant="secondary">Top</orio-button>
    </orio-tooltip>

    <orio-tooltip text="Bottom tooltip" placement="bottom">
      <orio-button variant="secondary">Bottom</orio-button>
    </orio-tooltip>

    <orio-tooltip text="Left tooltip" placement="left">
      <orio-button variant="secondary">Left</orio-button>
    </orio-tooltip>

    <orio-tooltip text="Right tooltip" placement="right">
      <orio-button variant="secondary">Right</orio-button>
    </orio-tooltip>

  </div>

  <h3>With Icons</h3>
  <div class="demo-row">
    <orio-tooltip text="Edit">
      <orio-icon name="edit" :size="24" />
    </orio-tooltip>

    <orio-tooltip text="Delete">
      <orio-icon name="delete" :size="24" />
    </orio-tooltip>

    <orio-tooltip text="Settings">
      <orio-icon name="settings" :size="24" />
    </orio-tooltip>

  </div>

  <h3>Custom Content</h3>
  <div class="demo-row">
    <orio-tooltip placement="top">
      <orio-button variant="secondary">Custom Content</orio-button>
      <template #content>
        <div style="padding: 0.25rem;">
          <strong>Rich Content</strong>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem;">
            Tooltips can contain any content
          </p>
        </div>
      </template>
    </orio-tooltip>
  </div>

  <h3>With Delay</h3>
  <div class="demo-row">
    <orio-tooltip text="Appears after 500ms" :delay="500">
      <orio-button variant="secondary">Delayed</orio-button>
    </orio-tooltip>
  </div>
</div>

## Usage

```vue
<template>
  <!-- Simple text tooltip -->
  <orio-tooltip text="Hello World">
    <button>Hover me</button>
  </orio-tooltip>

  <!-- Custom content slot -->
  <orio-tooltip placement="top">
    <button>Hover me</button>
    <template #content>
      <div>Custom HTML content</div>
    </template>
  </orio-tooltip>

  <!-- With delay -->
  <orio-tooltip text="Delayed" :delay="300">
    <button>Hover me</button>
  </orio-tooltip>
</template>
```

## Props

| Prop        | Type                                     | Default     | Description                                |
| ----------- | ---------------------------------------- | ----------- | ------------------------------------------ |
| `text`      | `string`                                 | `undefined` | Tooltip text (when not using content slot) |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`     | Tooltip position relative to trigger       |
| `delay`     | `number`                                 | `0`         | Delay before showing tooltip (ms)          |
| `disabled`  | `boolean`                                | `false`     | Disable tooltip                            |
| `offset`    | `number`                                 | `8`         | Distance from trigger element (px)         |

## Slots

| Slot      | Description                                    |
| --------- | ---------------------------------------------- |
| `default` | Trigger element                                |
| `content` | Custom tooltip content (overrides `text` prop) |

## Features

- Automatic positioning with arrow indicator
- Shows on hover and focus (keyboard accessible)
- Teleports to body to avoid z-index issues
- Updates position on scroll and resize
- Configurable delay
- Support for custom content via slot
- Dark theme by default
