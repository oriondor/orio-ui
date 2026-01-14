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

  <h3>Arrows - Chevrons</h3>
  <div class="demo-row">
    <orio-tooltip text="chevron-up">
      <orio-icon name="chevron-up" />
    </orio-tooltip>
    <orio-tooltip text="chevron-down">
      <orio-icon name="chevron-down" />
    </orio-tooltip>
    <orio-tooltip text="chevron-left">
      <orio-icon name="chevron-left" />
    </orio-tooltip>
    <orio-tooltip text="chevron-right">
      <orio-icon name="chevron-right" />
    </orio-tooltip>
  </div>

  <h3>Arrows - Straight</h3>
  <div class="demo-row">
    <orio-tooltip text="arrow-up">
      <orio-icon name="arrow-up" />
    </orio-tooltip>
    <orio-tooltip text="arrow-down">
      <orio-icon name="arrow-down" />
    </orio-tooltip>
    <orio-tooltip text="arrow-left">
      <orio-icon name="arrow-left" />
    </orio-tooltip>
    <orio-tooltip text="arrow-right">
      <orio-icon name="arrow-right" />
    </orio-tooltip>
  </div>

  <h3>Arrows - Long (with tails)</h3>
  <div class="demo-row">
    <orio-tooltip text="arrow-back">
      <orio-icon name="arrow-back" />
    </orio-tooltip>
    <orio-tooltip text="arrow-forward">
      <orio-icon name="arrow-forward" />
    </orio-tooltip>
    <orio-tooltip text="arrow-upward">
      <orio-icon name="arrow-upward" />
    </orio-tooltip>
    <orio-tooltip text="arrow-downward">
      <orio-icon name="arrow-downward" />
    </orio-tooltip>
  </div>

  <h3>Arrows - Double & Expand</h3>
  <div class="demo-row">
    <orio-tooltip text="double-arrow-left">
      <orio-icon name="double-arrow-left" />
    </orio-tooltip>
    <orio-tooltip text="double-arrow-right">
      <orio-icon name="double-arrow-right" />
    </orio-tooltip>
    <orio-tooltip text="expand-more">
      <orio-icon name="expand-more" />
    </orio-tooltip>
    <orio-tooltip text="expand-less">
      <orio-icon name="expand-less" />
    </orio-tooltip>
  </div>

  <h3>Navigation & Links</h3>
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
    <orio-tooltip text="link">
      <orio-icon name="link" />
    </orio-tooltip>
    <orio-tooltip text="external-link">
      <orio-icon name="external-link" />
    </orio-tooltip>
  </div>

  <h3>Communication</h3>
  <div class="demo-row">
    <orio-tooltip text="mail">
      <orio-icon name="mail" />
    </orio-tooltip>
    <orio-tooltip text="message">
      <orio-icon name="message" />
    </orio-tooltip>
    <orio-tooltip text="chat">
      <orio-icon name="chat" />
    </orio-tooltip>
    <orio-tooltip text="phone">
      <orio-icon name="phone" />
    </orio-tooltip>
  </div>

  <h3>Media - Playback</h3>
  <div class="demo-row">
    <orio-tooltip text="play">
      <orio-icon name="play" />
    </orio-tooltip>
    <orio-tooltip text="pause">
      <orio-icon name="pause" />
    </orio-tooltip>
    <orio-tooltip text="stop">
      <orio-icon name="stop" />
    </orio-tooltip>
    <orio-tooltip text="skip-next">
      <orio-icon name="skip-next" />
    </orio-tooltip>
    <orio-tooltip text="skip-previous">
      <orio-icon name="skip-previous" />
    </orio-tooltip>
  </div>

  <h3>Media - Content</h3>
  <div class="demo-row">
    <orio-tooltip text="image">
      <orio-icon name="image" />
    </orio-tooltip>
    <orio-tooltip text="video">
      <orio-icon name="video" />
    </orio-tooltip>
    <orio-tooltip text="camera">
      <orio-icon name="camera" />
    </orio-tooltip>
    <orio-tooltip text="mic">
      <orio-icon name="mic" />
    </orio-tooltip>
    <orio-tooltip text="mic-off">
      <orio-icon name="mic-off" />
    </orio-tooltip>
    <orio-tooltip text="volume">
      <orio-icon name="volume" />
    </orio-tooltip>
    <orio-tooltip text="volume-off">
      <orio-icon name="volume-off" />
    </orio-tooltip>
  </div>

  <h3>Documents</h3>
  <div class="demo-row">
    <orio-tooltip text="file">
      <orio-icon name="file" />
    </orio-tooltip>
    <orio-tooltip text="folder">
      <orio-icon name="folder" />
    </orio-tooltip>
    <orio-tooltip text="folder-open">
      <orio-icon name="folder-open" />
    </orio-tooltip>
    <orio-tooltip text="document">
      <orio-icon name="document" />
    </orio-tooltip>
    <orio-tooltip text="pdf">
      <orio-icon name="pdf" />
    </orio-tooltip>
  </div>

  <h3>UI Controls</h3>
  <div class="demo-row">
    <orio-tooltip text="eye">
      <orio-icon name="eye" />
    </orio-tooltip>
    <orio-tooltip text="eye-off">
      <orio-icon name="eye-off" />
    </orio-tooltip>
    <orio-tooltip text="lock">
      <orio-icon name="lock" />
    </orio-tooltip>
    <orio-tooltip text="unlock">
      <orio-icon name="unlock" />
    </orio-tooltip>
    <orio-tooltip text="copy">
      <orio-icon name="copy" />
    </orio-tooltip>
  </div>

  <h3>Social Media</h3>
  <div class="demo-row">
    <orio-tooltip text="github">
      <orio-icon name="github" />
    </orio-tooltip>
    <orio-tooltip text="twitter">
      <orio-icon name="twitter" />
    </orio-tooltip>
    <orio-tooltip text="facebook">
      <orio-icon name="facebook" />
    </orio-tooltip>
    <orio-tooltip text="instagram">
      <orio-icon name="instagram" />
    </orio-tooltip>
    <orio-tooltip text="youtube">
      <orio-icon name="youtube" />
    </orio-tooltip>
    <orio-tooltip text="linkedin">
      <orio-icon name="linkedin" />
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

### Arrows - Chevrons (angled arrows)

- `chevron-up` - Chevron pointing up
- `chevron-down` - Chevron pointing down
- `chevron-left` - Chevron pointing left
- `chevron-right` - Chevron pointing right

### Arrows - Straight (simple triangles)

- `arrow-up` - Simple arrow pointing up
- `arrow-down` - Simple arrow pointing down
- `arrow-left` - Simple arrow pointing left
- `arrow-right` - Simple arrow pointing right

### Arrows - Long (with tails)

- `arrow-back` - Back navigation arrow
- `arrow-forward` - Forward navigation arrow
- `arrow-upward` - Upward navigation arrow
- `arrow-downward` - Downward navigation arrow

### Arrows - Special

- `double-arrow-left` - Skip/fast backward
- `double-arrow-right` - Skip/fast forward
- `expand-more` - Expand/show more content
- `expand-less` - Collapse/show less content

### Navigation & Links

- `home` - Home page
- `menu` - Hamburger menu
- `filter` - Filter options
- `grid-view` - Grid layout view
- `list-view` - List layout view
- `link` - Link/chain icon
- `external-link` - External link/open in new tab

### Communication

- `mail` - Email/envelope
- `message` - Message/SMS
- `chat` - Chat/conversation
- `phone` - Phone/call

### Media - Playback

- `play` - Play media
- `pause` - Pause media
- `stop` - Stop media
- `skip-next` - Skip to next
- `skip-previous` - Skip to previous

### Media - Content

- `image` - Image/photo
- `video` - Video/camera
- `camera` - Camera/take photo
- `mic` - Microphone on
- `mic-off` - Microphone muted
- `volume` - Volume/sound on
- `volume-off` - Volume muted

### Documents

- `file` - Generic file
- `folder` - Folder closed
- `folder-open` - Folder open
- `document` - Text document
- `pdf` - PDF document

### UI Controls

- `eye` - Show/visible
- `eye-off` - Hide/invisible
- `lock` - Locked/secure
- `unlock` - Unlocked/unsecure
- `copy` - Copy to clipboard

### Social Media

- `github` - GitHub
- `twitter` - Twitter/X
- `facebook` - Facebook
- `instagram` - Instagram
- `youtube` - YouTube
- `linkedin` - LinkedIn

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
