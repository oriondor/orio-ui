# Popover

Smart-positioned popover with automatic fallback placement.

## Live Demo

<script setup>
import { ref } from 'vue'
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-popover position="bottom-left">
      <template #default="{ toggle }">
        <orio-button type="secondary" @click="toggle()">
          Bottom Left
        </orio-button>
      </template>
      <template #content="{ toggle }">
        <div style="padding: 1rem; background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider); border-radius: 4px; min-width: 200px;">
          <p>Popover content here!</p>
          <orio-button type="subdued" @click="toggle(false)">Close</orio-button>
        </div>
      </template>
    </orio-popover>

    <orio-popover position="top-right">
      <template #default="{ toggle }">
        <orio-button type="secondary" @click="toggle()">
          Top Right
        </orio-button>
      </template>
      <template #content="{ toggle }">
        <div style="padding: 1rem; background: var(--vp-c-bg); border: 1px solid var(--vp-c-divider); border-radius: 4px; min-width: 200px;">
          <p>Different position!</p>
          <orio-button type="subdued" @click="toggle(false)">Close</orio-button>
        </div>
      </template>
    </orio-popover>
  </div>
</div>

## Usage

```vue
<template>
  <orio-popover position="bottom-left">
    <template #default="{ toggle }">
      <orio-button @click="toggle()">
        Show Popover
      </orio-button>
    </template>

    <template #content="{ toggle }">
      <div class="popover-content">
        <p>Your content here</p>
        <button @click="toggle(false)">Close</button>
      </div>
    </template>
  </orio-popover>
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `string` | `'bottom-left'` | Popover position |
| `offset` | `number` | `10` | Distance from trigger (px) |
| `disabled` | `boolean` | `false` | Disable popover |

### Position Values

- Single: `'top'`, `'bottom'`, `'left'`, `'right'`
- Combos: `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`, `'left-top'`, `'left-bottom'`, `'right-top'`, `'right-bottom'`

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ toggle }` | Trigger element |
| `content` | `{ toggle }` | Popover content |

## Features

- Automatic viewport detection
- Fallback positioning if content doesn't fit
- Click outside to close
- Teleports to body
- Handles scroll/resize events
