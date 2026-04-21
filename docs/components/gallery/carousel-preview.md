# Carousel Preview

A thumbnail strip component that displays all images from a carousel. Fully independent from the Carousel — connect them via shared `v-model:activeImage`.

## Live Demo

<script setup>
  import { ref } from "vue";

  const basePath = "/samples";
  const images = [
    "horizontal-sized-photo.png",
    "mobile-sized-photo.png",
    "square-sized-photo.png",
  ].map((image) => `${basePath}/${image}`);

  const activeImage = ref(images[0]);
</script>

<div class="demo-container">
  <orio-gallery-carousel v-model:active-image="activeImage" :images="images" />
  <orio-gallery-carousel-preview v-model:active-image="activeImage" :images="images" />
</div>

## Usage

```vue
<script setup>
import { ref } from "vue";

const images = ["/img1.jpg", "/img2.jpg", "/img3.jpg"];
const activeImage = ref(images[0]);
</script>

<template>
  <orio-gallery-carousel
    v-model:active-image="activeImage"
    :images="images"
  />
  <orio-gallery-carousel-preview
    v-model:active-image="activeImage"
    :images="images"
  />
</template>
```

## Custom thumbnail slot

Use the `#image` scoped slot to customize how each thumbnail renders.

<div class="demo-container">
  <orio-gallery-carousel-preview v-model:active-image="activeImage" :images="images">
    <template #image="{ image }">
      <img :src="image" style="border-radius: 4px;" />
    </template>
  </orio-gallery-carousel-preview>
</div>

```vue
<orio-gallery-carousel-preview
  v-model:active-image="activeImage"
  :images="images"
>
  <template #image="{ image }">
    <img :src="image" style="border-radius: 4px;" />
  </template>
</orio-gallery-carousel-preview>
```

## Props

| Prop    | Type                                             | Default   | Description                                          |
| ------- | ------------------------------------------------ | --------- | ---------------------------------------------------- |
| `images`| `string[]`                                       | `[]`      | Array of image URLs to display as thumbnails         |
| `fit`   | `"fill" \| "cover" \| "contain" \| "scale-down"` | `"cover"` | CSS object-fit for thumbnail images                  |

## Model

| Model         | Type     | Description                                              |
| ------------- | -------- | -------------------------------------------------------- |
| `activeImage` | `string` | Currently selected image URL — sync with Carousel's model |

## Features

- **Standalone** — not coupled to Carousel; connect via shared `v-model:activeImage`
- **Auto-hide** — only renders when there are 2+ images
- **Scrollable** — horizontal overflow scroll for many images
- **Custom thumbnails** — `#image` scoped slot for full control
