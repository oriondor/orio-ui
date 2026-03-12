# Badge

A versatile badge component that works as both a standalone badge and a wrapper that positions a badge over any content.

## Live Demo

<script setup>
import { ref } from 'vue'
</script>

### Standalone Badges

<div class="demo-container">
  <div class="demo-row">
    <orio-badge>5</orio-badge>
    <orio-badge variant="danger">3</orio-badge>
    <orio-badge variant="alert">!</orio-badge>
    <orio-badge variant="grey">0</orio-badge>
  </div>
</div>

### Pill Type

<div class="demo-container">
  <div class="demo-row">
    <orio-badge type="pill">New</orio-badge>
    <orio-badge type="pill" variant="danger">99+</orio-badge>
    <orio-badge type="pill" variant="alert">Hot</orio-badge>
    <orio-badge type="pill" variant="grey">Beta</orio-badge>
  </div>
</div>

### With Buttons

<div class="demo-container">
  <div class="demo-row" style="gap: 2rem;">
    <orio-badge variant="danger">
      <template #wrapping>
        <orio-button>Notifications</orio-button>
      </template>
      3
    </orio-badge>
    <orio-badge variant="primary" type="pill">
      <template #wrapping>
        <orio-button variant="secondary">Messages</orio-button>
      </template>
      12
    </orio-badge>
  </div>
</div>

### With NavButton (Text)

<div class="demo-container">
  <div class="demo-row" style="gap: 2rem;">
    <orio-badge variant="danger">
      <template #wrapping>
        <orio-nav-button icon="mail">Inbox</orio-nav-button>
      </template>
      5
    </orio-badge>
    <orio-badge variant="primary">
      <template #wrapping>
        <orio-nav-button icon="message">Messages</orio-nav-button>
      </template>
      12
    </orio-badge>
    <orio-badge variant="alert">
      <template #wrapping>
        <orio-nav-button icon="shopping-cart">Cart</orio-nav-button>
      </template>
      3
    </orio-badge>
  </div>
</div>

### With NavButton (Icon Only)

<div class="demo-container">
  <div class="demo-row" style="gap: 2rem;">
    <orio-badge variant="danger">
      <template #wrapping>
        <orio-nav-button icon="bell" />
      </template>
      7
    </orio-badge>
    <orio-badge variant="primary" type="pill">
      <template #wrapping>
        <orio-nav-button icon="mail" />
      </template>
      99+
    </orio-badge>
    <orio-badge variant="alert">
      <template #wrapping>
        <orio-nav-button icon="shopping-cart" />
      </template>
      2
    </orio-badge>
    <orio-badge variant="grey">
      <template #wrapping>
        <orio-nav-button icon="heart" />
      </template>
      0
    </orio-badge>
  </div>
</div>

### With Icon Component

<div class="demo-container">
  <div class="demo-row" style="gap: 2rem;">
    <orio-badge variant="danger">
      <template #wrapping>
        <orio-icon name="mail" size="24" />
      </template>
    </orio-badge>
    <orio-badge variant="primary">
      <template #wrapping>
        <orio-icon name="bell" size="24" />
      </template>
      3
    </orio-badge>
    <orio-badge variant="alert">
      <template #wrapping>
        <orio-icon name="chat" size="24" />
      </template>
    </orio-badge>
  </div>
</div>

### Dot Mode

When no content is provided in the default slot, the badge renders as a small dot - useful for status indicators.

<div class="demo-container">
  <div class="demo-row" style="gap: 2rem;">
    <orio-badge variant="danger">
      <template #wrapping>
        <orio-nav-button icon="bell" />
      </template>
    </orio-badge>
    <orio-badge variant="alert">
      <template #wrapping>
        <orio-nav-button icon="mail" />
      </template>
    </orio-badge>
    <orio-badge variant="primary">
      <template #wrapping>
        <orio-nav-button icon="user" />
      </template>
    </orio-badge>
    <orio-badge variant="grey">
      <template #wrapping>
        <orio-nav-button icon="settings" />
      </template>
    </orio-badge>
  </div>
</div>

## Usage

### Standalone Badge

```vue
<template>
  <orio-badge>5</orio-badge>
  <orio-badge variant="danger">Error</orio-badge>
  <orio-badge type="pill">New</orio-badge>
</template>
```

### With NavButton

```vue
<template>
  <!-- With text -->
  <orio-badge variant="danger">
    <template #wrapping>
      <orio-nav-button icon="mail">Inbox</orio-nav-button>
    </template>
    5
  </orio-badge>

  <!-- Icon only -->
  <orio-badge variant="primary">
    <template #wrapping>
      <orio-nav-button icon="bell" />
    </template>
    3
  </orio-badge>
</template>
```

### Dot Mode

```vue
<template>
  <orio-badge variant="danger">
    <template #wrapping>
      <orio-nav-button icon="bell" />
    </template>
  </orio-badge>
</template>
```

## Props

| Prop      | Type                                         | Default     | Description               |
| --------- | -------------------------------------------- | ----------- | ------------------------- |
| `variant` | `'danger' \| 'alert' \| 'primary' \| 'grey'` | `'primary'` | Badge color variant       |
| `type`    | `'default' \| 'pill'`                        | `'default'` | Badge border radius style |

## Slots

| Slot       | Description                                          |
| ---------- | ---------------------------------------------------- |
| `default`  | Badge content. If empty, badge renders as a dot      |
| `wrapping` | Content to wrap. Badge positions top-right over this |
