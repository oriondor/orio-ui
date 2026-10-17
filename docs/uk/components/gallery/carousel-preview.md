# Carousel Preview

Стрічка мініатюр, що показує всі зображення каруселі. Повністю незалежна від Carousel — поєднуйте їх через спільну `v-model:activeImage`.

## Живе демо

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

## Використання

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

## Власний слот мініатюри

Використовуйте scoped-слот `#image`, щоб налаштувати рендер кожної мініатюри.

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

## Пропси

| Проп    | Тип                                              | За замовчуванням | Опис                                            |
| ------- | ------------------------------------------------ | ---------------- | ----------------------------------------------- |
| `images`| `string[]`                                       | `[]`             | Масив URL зображень для показу мініатюрами       |
| `fit`   | `"fill" \| "cover" \| "contain" \| "scale-down"` | `"cover"`        | CSS object-fit для мініатюр                      |

## Модель

| Модель        | Тип      | Опис                                                         |
| ------------- | -------- | ------------------------------------------------------------ |
| `activeImage` | `string` | URL вибраного зображення — синхронізуйте з моделлю Carousel  |

## Можливості

- **Автономність** — не прив'язана до Carousel; з'єднується через спільну `v-model:activeImage`
- **Автоприховування** — рендериться лише за 2+ зображень
- **Прокручування** — горизонтальна прокрутка, коли зображень багато
- **Власні мініатюри** — scoped-слот `#image` для повного контролю
