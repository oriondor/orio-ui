# Carousel

An interactive image carousel component with smooth transitions, swipe support, and responsive sizing. Perfect for showcasing photos, product images, or any visual content.

## Live Demo

<script setup>
  import { ref } from "vue";

  const basePath = "/samples";
  const images = [
    "horizontal-sized-photo.png",
    "mobile-sized-photo.png",
    "square-sized-photo.png",
  ]

  const currentFitValue = ref('contain')

  const fitOptions = ["fill", "cover", "contain", "scale-down"]
</script>

<div class="demo-container">
  <div style="display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1rem;">
    <orio-switch-button
      v-for="fit in fitOptions"
      :key="fit"
      :model-value="fit === currentFitValue"
      @update:model-value="currentFitValue = fit"
    >
      {{ fit }}
    </orio-switch-button>
  </div>
  <orio-gallery-carousel :images="images.map((image) => `${basePath}/${image}`)" :fit="currentFitValue" />
</div>

## Usage

```vue
<script setup>
const basePath = "/samples";
const images = [
  "horizontal-sized-photo.png",
  "mobile-sized-photo.png",
  "square-sized-photo.png",
];
</script>

<div class="demo-container">
  <orio-gallery-carousel :images="images.map((image) => `${basePath}/${image}`)" />
</div>
```

## Props

| Prop     | Type                                             | Default     | Description                                                          |
| -------- | ------------------------------------------------ | ----------- | -------------------------------------------------------------------- |
| `images` | `string[]`                                       | `[]`        | Array of image URLs to display in the carousel                       |
| `size`   | `string`                                         | `"400:550"` | Carousel dimensions in "width:height" format (e.g., "800:600")       |
| `fit`    | `"fill" \| "cover" \| "contain" \| "scale-down"` | `"contain"` | CSS object-fit property for images (how images fit within container) |

## Model

| Model         | Type     | Description                                   |
| ------------- | -------- | --------------------------------------------- |
| `activeImage` | `string` | Currently displayed image URL (v-model ready) |

## Features

- **Smooth Transitions** - Images slide in/out with fade and transform animations
- **Navigation Controls** - Previous/next buttons with auto-adapting colors for visibility
- **Swipe Support** - Touch and mouse drag gestures for natural interaction
- **Responsive** - Automatically scales to fit container while maintaining aspect ratio
- **Keyboard Navigation** - Navigate with arrow keys (when focused)
- **Flexible Sizing** - Control image fit behavior (contain, cover, fill, scale-down)
- **Loop Navigation** - Seamlessly loops from last to first image and vice versa

## Usage Examples

### Basic Usage

```vue
<script setup>
const images = [
  "/images/photo1.jpg",
  "/images/photo2.jpg",
  "/images/photo3.jpg",
];
</script>

<template>
  <orio-gallery-carousel :images="images" />
</template>
```

### Custom Size

```vue
<template>
  <!-- 16:9 aspect ratio, 800px wide -->
  <orio-gallery-carousel :images="images" size="800:450" />
</template>
```

### Different Image Fit Modes

```vue
<template>
  <!-- Contain: Show entire image (may have letterboxing) -->
  <orio-gallery-carousel :images="images" fit="contain" />

  <!-- Cover: Fill container (may crop image) -->
  <orio-gallery-carousel :images="images" fit="cover" />

  <!-- Fill: Stretch to fill (may distort) -->
  <orio-gallery-carousel :images="images" fit="fill" />
</template>
```

### Controlled Active Image

```vue
<script setup>
import { ref } from "vue";

const images = ["/img1.jpg", "/img2.jpg", "/img3.jpg"];
const currentImage = ref(images[0]);
</script>

<template>
  <orio-gallery-carousel v-model:activeImage="currentImage" :images="images" />

  <p>Currently showing: {{ currentImage }}</p>
</template>
```

## Interaction

### Mouse/Touch

- **Swipe/Drag Left** - Next image
- **Swipe/Drag Right** - Previous image
- **Click Arrows** - Navigate to adjacent images

### Threshold

The swipe threshold is currently set to 10 pixels. A swipe must exceed this distance to trigger navigation.

## Styling Notes

- The component uses CSS custom properties from your theme
- Navigation buttons automatically adapt to background brightness on Chrome/Firefox
- Safari uses a fallback styling with white icons and shadows for better compatibility
- Images are non-draggable to prevent interference with swipe gestures

## Accessibility

- Navigation buttons include icon labels for screen readers
- Images should have meaningful alt text (currently uses image URL as fallback)
- Consider adding keyboard navigation support for better accessibility
