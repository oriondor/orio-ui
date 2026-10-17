# Carousel

Інтерактивна карусель зображень із плавними переходами, підтримкою свайпів і адаптивними розмірами. Ідеальна для показу фотографій, зображень товарів чи будь-якого візуального вмісту.

## Живе демо

<script setup>
  import { ref } from "vue";

  const basePath = "/samples";
  const images = [
    "horizontal-sized-photo.png",
    "mobile-sized-photo.png",
    "square-sized-photo.png",
  ]

  const currentFitValue = ref('contain')
  const currentSizeValue = ref('400:')

  const fitOptions = ["fill", "cover", "contain", "scale-down"]

  const sizeOptions = ["400:550", "400:", ":550"]
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

# Власне зображення всередині каруселі

Це корисно, якщо потрібно якось змінити кожне зображення, передане в компонент

У цьому прикладі над зображенням плаває м'ячик

<div class="demo-container">
  <orio-gallery-carousel :images="images.map((image) => `${basePath}/${image}`)">
    <template #image="{ image }">
      <div class="image-container">
        <img class="base-image" :src="image" />
        <img class="design-overlay" :src="`${basePath}/ball.png`" />
      </div>
    </template>
  </orio-gallery-carousel>
</div>

Ось як цього досягти

```vue
<orio-gallery-carousel
  style="margin: auto"
  :images="images.map((image) => `${basePath}/${image}`)"
>
  <template #image="{ image }">
    <div class="image-container">
      <img class="base-image" :src="image" />
      <img class="design-overlay" :src="`${basePath}/ball.png`" />
    </div>
  </template>
</orio-gallery-carousel>

<style scoped>
.image-container {
  position: relative;
  width: 100%;
  height: 100%;
}
.base-image {
  width: 100%;
  height: auto;
  height: 100%;
  object-fit: contain;
}

.design-overlay {
  position: absolute;
  top: 20%;
  left: 20%;
  width: 20%;
  height: auto;
  object-fit: contain;
}
</style>
```

# Мінімалістичний вигляд

Використайте `appearance="minimal"`, щоб прибрати рамку й фон каруселі. Стрілки навігації приховані й з'являються лише під час наведення — ідеально для вбудовування каруселі просто у вміст сторінки без видимої рамки віджета.

<div class="demo-container">
  <orio-gallery-carousel :images="images.map((image) => `${basePath}/${image}`)" appearance="minimal" />
</div>

```vue
<orio-gallery-carousel :images="images" appearance="minimal" />
```

# Динамічний розмір за розміром зображення

Передайте лише одну частину розміру — друга підлаштується під розмір справжнього зображення

<div class="demo-container">
  <div style="display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1rem;">
    <orio-switch-button
      v-for="size in sizeOptions"
      :key="size"
      :model-value="size === currentSizeValue"
      @update:model-value="currentSizeValue = size"
    >
      {{ size }}
    </orio-switch-button>
  </div>
  <orio-gallery-carousel :images="images.map((image) => `${basePath}/${image}`)" :size="currentSizeValue" />
</div>

<style>
  .carousel {
    margin: auto;
  }
  .image-container {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .base-image {
    width: 100%;
    height: auto;
    height: 100%;
    object-fit: contain;
  }

  .design-overlay {
    position: absolute;
    top: 20%;
    left: 20%;
    width: 20%;
    height: auto;
    object-fit: contain;
  }
</style>

## Використання

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

## Пропси

| Проп         | Тип                                              | За замовчуванням | Опис                                                                                     |
| ------------ | ------------------------------------------------ | ---------------- | ---------------------------------------------------------------------------------------- |
| `images`     | `string[]`                                       | `[]`             | Масив URL зображень для показу в каруселі                                                |
| `size`       | `string`                                         | `"400:550"`      | Розміри каруселі у форматі «ширина:висота» (наприклад, «800:600»)                        |
| `fit`        | `"fill" \| "cover" \| "contain" \| "scale-down"` | `"contain"`      | CSS-властивість object-fit для зображень (як зображення вписуються в контейнер)          |
| `appearance` | `"default" \| "minimal"`                         | `"default"`      | Візуальний стиль. `minimal` прибирає рамку/фон і ховає навігацію до наведення            |

## Модель

| Модель        | Тип      | Опис                                            |
| ------------- | -------- | ----------------------------------------------- |
| `activeImage` | `string` | URL поточного зображення (готово для v-model)   |

## Можливості

- **Плавні переходи** — зображення виїжджають і зникають з анімаціями прозорості та трансформації
- **Кнопки навігації** — кнопки «назад»/«вперед» з кольорами, що автоматично підлаштовуються для видимості
- **Підтримка свайпів** — жести дотиком і перетягуванням мишею для природної взаємодії
- **Адаптивність** — автоматично масштабується під контейнер, зберігаючи пропорції
- **Навігація з клавіатури** — перехід стрілками (у фокусі)
- **Гнучкі розміри** — керування вписуванням зображення (contain, cover, fill, scale-down)
- **Циклічна навігація** — безшовний перехід з останнього зображення на перше й навпаки
- **Мінімалістичний вигляд** — режим без рамки й фону з навігацією, що з'являється під час наведення

## Приклади використання

### Базове використання

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

### Власний розмір

```vue
<template>
  <!-- 16:9 aspect ratio, 800px wide -->
  <orio-gallery-carousel :images="images" size="800:450" />
</template>
```

### Різні режими вписування

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

### Мінімалістичний вигляд

```vue
<template>
  <!-- No border/background; navigation arrows appear on hover only -->
  <orio-gallery-carousel :images="images" appearance="minimal" />
</template>
```

### Кероване активне зображення

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

## Взаємодія

### Миша/дотик

- **Свайп/перетягування ліворуч** — наступне зображення
- **Свайп/перетягування праворуч** — попереднє зображення
- **Клік по стрілках** — перехід до сусідніх зображень

### Поріг

Поріг свайпу зараз становить 10 пікселів. Щоб спрацювала навігація, свайп має перевищити цю відстань.

## Нотатки щодо стилізації

- Компонент використовує CSS custom properties з вашої теми
- У Chrome/Firefox кнопки навігації автоматично підлаштовуються під яскравість фону
- Safari використовує запасний стиль з білими іконками й тінями для кращої сумісності
- Зображення неперетягувані, щоб не заважати жестам свайпу

## Доступність

- Кнопки навігації мають підписи іконок для скрінрідерів
- Зображенням варто мати змістовний alt-текст (зараз як запасний варіант використовується URL зображення)
- Варто додати підтримку навігації з клавіатури для кращої доступності
