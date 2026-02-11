<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  ref,
  toRefs,
  useTemplateRef,
  watch,
} from "vue";
import { useElementSize } from "@vueuse/core";

interface CarouselProps {
  images?: string[];
  size?: string;
  fit?: "fill" | "cover" | "contain" | "scale-down";
}

const props = withDefaults(defineProps<CarouselProps>(), {
  images: () => [],
  size: "400:550",
  fit: "contain",
});

const { images, size, fit } = toRefs(props);

const rawSizes = computed(() => {
  const parts = size.value.split(":");
  return {
    width: parts[0] ? parseFloat(parts[0]) : null,
    height: parts[1] ? parseFloat(parts[1]) : null,
  };
});

const isDynamicHeight = computed(
  () => rawSizes.value.width !== null && rawSizes.value.height === null,
);
const isDynamicWidth = computed(
  () => rawSizes.value.width === null && rawSizes.value.height !== null,
);

const carousel = useTemplateRef("carousel");
const measureContainer = useTemplateRef("measureContainer");
const { width: carouselWidth } = useElementSize(carousel);

// Track measured content dimensions
const contentWidth = ref(0);
const contentHeight = ref(0);

const contentAspectRatio = computed(() => {
  if (!contentWidth.value || !contentHeight.value) return 1;
  return contentWidth.value / contentHeight.value;
});

const calculatedSize = computed(() => {
  const { width, height } = rawSizes.value;

  if (isDynamicHeight.value) {
    const dynamicHeight = contentAspectRatio.value
      ? width! / contentAspectRatio.value
      : width;
    return {
      width: `${width}px`,
      height: `${dynamicHeight}px`,
    };
  }

  if (isDynamicWidth.value) {
    const dynamicWidth = contentAspectRatio.value
      ? height! * contentAspectRatio.value
      : height;
    return {
      width: `${dynamicWidth}px`,
      height: `${height}px`,
    };
  }

  return {
    width: `${width}px`,
    height: `${height}px`,
  };
});

const maxHeight = computed(() => {
  const { width, height } = rawSizes.value;
  if (!width || !height) return "none";
  const dimensions = width / height;
  if (!carouselWidth.value) return "100%";
  return `${carouselWidth.value / dimensions}px`;
});

function measureContent() {
  if (!measureContainer.value) return;
  const el = measureContainer.value as HTMLElement;
  contentWidth.value = el.scrollWidth;
  contentHeight.value = el.scrollHeight;
}

const activeImage = defineModel<string>("activeImage");

const activeImageIndex = computed(() =>
  images.value.findIndex((image) => image === activeImage.value),
);

// Swipe handling with closure
let pointerStartX = 0;

function onPointerDown(event: PointerEvent) {
  pointerStartX = event.clientX;
}

function onPointerUp(event: PointerEvent) {
  const diffX = pointerStartX - event.clientX;
  const threshold = 10;

  if (Math.abs(diffX) > threshold) {
    if (diffX > 0) {
      nextImage();
    } else {
      previousImage();
    }
  }
}

function nextImage() {
  if (activeImageIndex.value === images.value.length - 1) {
    activeImage.value = images.value[0];
    return;
  }
  activeImage.value = images.value[activeImageIndex.value + 1];
}

function previousImage() {
  if (activeImageIndex.value === 0) {
    activeImage.value = images.value[images.value.length - 1];
    return;
  }
  activeImage.value = images.value[activeImageIndex.value - 1];
}

function getItemClasses(image: string) {
  if (image === activeImage.value) return ["active-image"];
  if (
    images.value.findIndex((img) => image === img) ===
    activeImageIndex.value + 1
  )
    return ["next-image"];
  if (
    images.value.findIndex((img) => image === img) ===
    activeImageIndex.value - 1
  )
    return ["previous-image"];
}

// Re-measure content when active image changes
watch(activeImage, () => {
  if (isDynamicHeight.value || isDynamicWidth.value) {
    nextTick(measureContent);
  }
});

onMounted(() => {
  if (!activeImage.value) activeImage.value = images.value[0];
  if (isDynamicHeight.value || isDynamicWidth.value) {
    nextTick(measureContent);
  }
});
</script>

<template>
  <div class="carousel-wrapper">
    <!-- Hidden container to measure natural content size -->
    <div
      v-if="isDynamicHeight || isDynamicWidth"
      ref="measureContainer"
      class="carousel-measure"
    >
      <slot name="image" :image="activeImage">
        <img :src="activeImage" :alt="activeImage" @load="measureContent" />
      </slot>
    </div>
    <div ref="carousel" class="carousel">
      <div
        class="carousel-track"
        @pointerdown="onPointerDown"
        @pointerup="onPointerUp"
      >
        <div
          v-for="image of images"
          :key="image"
          class="carousel-item"
          :class="getItemClasses(image)"
        >
          <slot name="image" :image>
            <img :src="image" :alt="image" draggable="false" />
          </slot>
        </div>
        <template v-if="images.length > 1">
          <orio-button
            variant="subdued"
            icon="chevron-left"
            class="switch-button previous-button"
            @click="previousImage"
          >
            <template #icon>
              <orio-icon name="chevron-left" size="40px" />
            </template>
          </orio-button>
          <orio-button
            variant="subdued"
            class="switch-button next-button"
            @click="nextImage"
          >
            <template #icon>
              <orio-icon name="chevron-right" size="40px" />
            </template>
          </orio-button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carousel-wrapper {
  position: relative;
  display: block;
}

.carousel-measure {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
  width: max-content;
  height: max-content;
}

.carousel-measure img {
  display: block;
}

.carousel {
  overflow: hidden;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  width: v-bind("calculatedSize.width");
  height: v-bind("calculatedSize.height");
  max-width: 100%;
  max-height: v-bind(maxHeight);
  transition:
    width 0.3s ease,
    height 0.3s ease;
}

.carousel-track {
  position: relative;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  width: 100%;
  height: 100%;
  cursor: grab;
  user-select: none;
}

.carousel-track:active {
  cursor: grabbing;
}

.carousel-item {
  position: absolute;
  inset: 0;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  white-space: nowrap;
  opacity: 0;
  width: 100%;
  height: 100%;
  transition:
    opacity 0.5s ease-in-out,
    transform 0.5s ease-in-out;
  pointer-events: none;
}

.carousel-item.previous-image {
  transform: translateX(-100%);
}

.carousel-item.next-image {
  transform: translateX(100%);
}

.carousel-item.active-image {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: v-bind(fit);
}

.carousel-empty {
  color: var(--color-muted);
}

.switch-button {
  position: absolute;
}

/* Override button color inheritance */
.switch-button :deep(button) {
  background: transparent !important;
  border: none !important;
  color: transparent !important;
}

.switch-button :deep(button:hover) {
  color: transparent !important;
}

.switch-button :deep(.orio-icon) {
  color: white !important;
  fill: white !important;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8))
    drop-shadow(0 0 4px rgba(0, 0, 0, 0.6));
}

/* Use mix-blend-mode on browsers that support it properly (not Safari) */
@supports (mix-blend-mode: difference) and (not (-webkit-hyphens: none)) {
  .switch-button :deep(.orio-icon) {
    color: black !important;
    fill: black !important;
    mix-blend-mode: difference;
    filter: grayscale(1) contrast(9) invert(1) drop-shadow(0 0 1px black)
      drop-shadow(0 0 2px black);
  }
}

.switch-button.previous-button {
  left: 0;
}
.switch-button.next-button {
  right: 0;
}
</style>
