# Icon

SVG icon component with bundled icons.

## Live Demo

<script setup>
import { ref } from 'vue'
</script>

<div class="demo-container">
  <h3>Shopping & Cart</h3>
  <div class="demo-row">
    <orio-tooltip text="shopping-cart">
      <orio-icon name="shopping-cart" />
    </orio-tooltip>
    <orio-tooltip text="shopping-bag">
      <orio-icon name="shopping-bag" />
    </orio-tooltip>
    <orio-tooltip text="cart-plus">
      <orio-icon name="cart-plus" />
    </orio-tooltip>
    <orio-tooltip text="cart-remove">
      <orio-icon name="cart-remove" />
    </orio-tooltip>
  </div>

  <h3>Products & Inventory</h3>
  <div class="demo-row">
    <orio-tooltip text="tag">
      <orio-icon name="tag" />
    </orio-tooltip>
    <orio-tooltip text="barcode">
      <orio-icon name="barcode" />
    </orio-tooltip>
    <orio-tooltip text="package">
      <orio-icon name="package" />
    </orio-tooltip>
    <orio-tooltip text="gift">
      <orio-icon name="gift" />
    </orio-tooltip>
    <orio-tooltip text="box">
      <orio-icon name="box" />
    </orio-tooltip>
  </div>

  <h3>User & Account</h3>
  <div class="demo-row">
    <orio-tooltip text="user">
      <orio-icon name="user" />
    </orio-tooltip>
    <orio-tooltip text="heart">
      <orio-icon name="heart" />
    </orio-tooltip>
    <orio-tooltip text="heart-outline">
      <orio-icon name="heart-outline" />
    </orio-tooltip>
    <orio-tooltip text="star">
      <orio-icon name="star" />
    </orio-tooltip>
    <orio-tooltip text="star-outline">
      <orio-icon name="star-outline" />
    </orio-tooltip>
  </div>

  <h3>Payment</h3>
  <div class="demo-row">
    <orio-tooltip text="credit-card">
      <orio-icon name="credit-card" />
    </orio-tooltip>
    <orio-tooltip text="wallet">
      <orio-icon name="wallet" />
    </orio-tooltip>
    <orio-tooltip text="receipt">
      <orio-icon name="receipt" />
    </orio-tooltip>
  </div>

  <h3>Navigation</h3>
  <div class="demo-row">
    <orio-tooltip text="home">
      <orio-icon name="home" />
    </orio-tooltip>
    <orio-tooltip text="menu">
      <orio-icon name="menu" />
    </orio-tooltip>
    <orio-tooltip text="filter">
      <orio-icon name="filter" />
    </orio-tooltip>
    <orio-tooltip text="grid-view">
      <orio-icon name="grid-view" />
    </orio-tooltip>
    <orio-tooltip text="list-view">
      <orio-icon name="list-view" />
    </orio-tooltip>
    <orio-tooltip text="chevron-down">
      <orio-icon name="chevron-down" />
    </orio-tooltip>
    <orio-tooltip text="chevron-up">
      <orio-icon name="chevron-up" />
    </orio-tooltip>
  </div>

  <h3>Actions</h3>
  <div class="demo-row">
    <orio-tooltip text="edit">
      <orio-icon name="edit" />
    </orio-tooltip>
    <orio-tooltip text="check">
      <orio-icon name="check" />
    </orio-tooltip>
    <orio-tooltip text="plus">
      <orio-icon name="plus" />
    </orio-tooltip>
    <orio-tooltip text="close">
      <orio-icon name="close" />
    </orio-tooltip>
    <orio-tooltip text="search">
      <orio-icon name="search" />
    </orio-tooltip>
    <orio-tooltip text="upload">
      <orio-icon name="upload" />
    </orio-tooltip>
    <orio-tooltip text="download">
      <orio-icon name="download" />
    </orio-tooltip>
    <orio-tooltip text="delete">
      <orio-icon name="delete" />
    </orio-tooltip>
    <orio-tooltip text="share">
      <orio-icon name="share" />
    </orio-tooltip>
    <orio-tooltip text="refresh">
      <orio-icon name="refresh" />
    </orio-tooltip>
    <orio-tooltip text="settings">
      <orio-icon name="settings" />
    </orio-tooltip>
    <orio-tooltip text="bell">
      <orio-icon name="bell" />
    </orio-tooltip>
    <orio-tooltip text="compare">
      <orio-icon name="compare" />
    </orio-tooltip>
    <orio-tooltip text="discount">
      <orio-icon name="discount" />
    </orio-tooltip>
  </div>

  <h3>Status & Info</h3>
  <div class="demo-row">
    <orio-tooltip text="info">
      <orio-icon name="info" />
    </orio-tooltip>
    <orio-tooltip text="warning">
      <orio-icon name="warning" />
    </orio-tooltip>
    <orio-tooltip text="check-circle">
      <orio-icon name="check-circle" />
    </orio-tooltip>
    <orio-tooltip text="error-circle">
      <orio-icon name="error-circle" />
    </orio-tooltip>
    <orio-tooltip text="help">
      <orio-icon name="help" />
    </orio-tooltip>
    <orio-tooltip text="loading-loop">
      <orio-icon name="loading-loop" />
    </orio-tooltip>
  </div>

  <h3>Shipping & Delivery</h3>
  <div class="demo-row">
    <orio-tooltip text="truck">
      <orio-icon name="truck" />
    </orio-tooltip>
    <orio-tooltip text="location">
      <orio-icon name="location" />
    </orio-tooltip>
    <orio-tooltip text="map-pin">
      <orio-icon name="map-pin" />
    </orio-tooltip>
  </div>

  <h3>Other</h3>
  <div class="demo-row">
    <orio-tooltip text="calendar">
      <orio-icon name="calendar" />
    </orio-tooltip>
  </div>

  <h3>Custom Sizes</h3>
  <div class="demo-row">
    <orio-icon name="shopping-cart" :size="16" />
    <orio-icon name="shopping-cart" :size="24" />
    <orio-icon name="shopping-cart" :size="32" />
    <orio-icon name="shopping-cart" :size="48" />
  </div>

  <h3>Custom Colors</h3>
  <div class="demo-row">
    <orio-icon name="check" color="green" />
    <orio-icon name="close" color="red" />
    <orio-icon name="heart" color="#ff69b4" />
  </div>
</div>

## Usage

```vue
<template>
  <orio-icon name="edit" />
  <orio-icon name="check" :size="32" color="green" />
</template>
```

## Available Icons

### Shopping & Cart

- `shopping-cart` - Full shopping cart with items
- `shopping-bag` - Shopping bag icon
- `cart-plus` - Add to cart action
- `cart-remove` - Remove from cart action

### Products & Inventory

- `tag` - Price tag
- `barcode` - Product barcode scanner
- `package` - Package/box for shipping
- `gift` - Gift/present icon
- `box` - Storage/inventory box

### User & Account

- `user` - User profile/account
- `heart` - Favorite/wishlist (filled)
- `heart-outline` - Favorite/wishlist (outline)
- `star` - Rating star (filled)
- `star-outline` - Rating star (outline)

### Payment

- `credit-card` - Credit card payment
- `wallet` - Digital wallet
- `receipt` - Order receipt/invoice

### Navigation

- `home` - Home page
- `menu` - Hamburger menu
- `filter` - Filter products
- `grid-view` - Grid layout view
- `list-view` - List layout view
- `chevron-down` - Dropdown chevron pointing down
- `chevron-up` - Dropdown chevron pointing up

### Actions

- `edit` - Edit/pencil icon
- `check` - Checkmark
- `plus` - Plus/add icon
- `close` - Close/X icon
- `search` - Search/magnifying glass
- `upload` - Upload arrow icon
- `download` - Download arrow icon
- `delete` - Delete/trash icon
- `share` - Share product/link
- `refresh` - Refresh/reload
- `settings` - Settings/preferences
- `bell` - Notifications/alerts
- `compare` - Compare products
- `discount` - Discounts/sales

### Status & Info

- `loading-loop` - Animated loading spinner
- `info` - Information
- `warning` - Warning/alert
- `check-circle` - Success confirmation
- `error-circle` - Error state
- `help` - Help/support

### Shipping & Delivery

- `truck` - Delivery/shipping
- `location` - Store location
- `map-pin` - Location pin

### Other

- `calendar` - Calendar icon

See the [Icon Registry](/utils/icon-registry) for more details on adding custom icons.

## Props

| Prop    | Type                 | Default          | Description             |
| ------- | -------------------- | ---------------- | ----------------------- |
| `name`  | `IconName \| string` | -                | Icon name from registry |
| `size`  | `string \| number`   | `'1em'`          | Icon size (px or em)    |
| `color` | `string`             | `'currentColor'` | Icon color (CSS color)  |
