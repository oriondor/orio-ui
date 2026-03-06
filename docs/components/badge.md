# Badge

A versatile badge component that works as both a standalone badge and a wrapper that positions a badge over any content.

## Live Demo

<script setup>
import { ref } from 'vue'
const showBadge = ref(true)
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
    <orio-badge pill>New</orio-badge>
    <orio-badge pill variant="danger">99+</orio-badge>
    <orio-badge pill variant="alert">Hot</orio-badge>
    <orio-badge pill variant="grey">Beta</orio-badge>
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
    <orio-badge variant="primary" pill>
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
    <orio-badge variant="primary" pill>
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
        <orio-icon name="mail" />
      </template>
    </orio-badge>
    <orio-badge variant="primary">
      <template #wrapping>
        <orio-icon name="bell" />
      </template>
      3
    </orio-badge>
    <orio-badge variant="alert">
      <template #wrapping>
        <orio-icon name="chat" />
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

### Hidden

Use the `hidden` prop to suppress the badge without removing the wrapping content. Toggle it reactively to show or hide the badge based on application state.

<div class="demo-container">
  <div class="demo-row" style="gap: 2rem; align-items: center;">
    <orio-badge variant="danger" :hidden="!showBadge">
      <template #wrapping>
        <orio-nav-button icon="bell" />
      </template>
      4
    </orio-badge>
    <orio-badge variant="primary" :hidden="!showBadge">New</orio-badge>
    <orio-switch-button v-model="showBadge">Show badge</orio-switch-button>
  </div>
</div>

## Usage

### Standalone Badge

```vue
<template>
  <orio-badge>5</orio-badge>
  <orio-badge variant="danger">Error</orio-badge>
  <orio-badge pill>New</orio-badge>
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

### Hidden

```vue
<template>
  <!-- Standalone badge -->
  <orio-badge :hidden="!hasUnread">New</orio-badge>

  <!-- Positioned badge — wrapping content still renders when hidden -->
  <orio-badge variant="danger" :hidden="!hasNotifications">
    <template #wrapping>
      <orio-nav-button icon="bell" />
    </template>
    4
  </orio-badge>
</template>
```

## Props

| Prop      | Type                                         | Default     | Description                             |
| --------- | -------------------------------------------- | ----------- | --------------------------------------- |
| `variant` | `'danger' \| 'alert' \| 'primary' \| 'grey'` | `'primary'` | Badge color variant                     |
| `pill`    | `boolean`                                    | `false`     | Renders with pill (fully rounded) shape |
| `hidden`  | `boolean`                                    | `false`     | When true, the badge is not rendered    |

## Slots

| Slot       | Description                                          |
| ---------- | ---------------------------------------------------- |
| `default`  | Badge content. If empty, badge renders as a dot      |
| `wrapping` | Content to wrap. Badge positions top-right over this |
