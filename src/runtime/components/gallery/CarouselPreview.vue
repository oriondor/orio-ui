<script setup lang="ts">
import { toRefs } from "vue";

interface Props {
  images?: string[];
  fit?: "fill" | "cover" | "contain" | "scale-down";
}

const props = withDefaults(defineProps<Props>(), {
  images: () => [],
  fit: "cover",
});

const { images, fit } = toRefs(props);

const activeImage = defineModel<string>("activeImage");
</script>

<template>
  <div v-if="images.length > 1" class="carousel-preview">
    <button
      v-for="(image, index) of images"
      :key="image"
      type="button"
      class="preview-item"
      :class="{ active: image === activeImage }"
      :aria-pressed="image === activeImage"
      :aria-label="`Show image ${index + 1} of ${images.length}`"
      @click="activeImage = image"
    >
      <slot name="image" :image>
        <img :src="image" alt="" draggable="false" />
      </slot>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.carousel-preview {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.25rem 0;
}

.preview-item {
  flex-shrink: 0;
  width: 3.5rem;
  height: 3.5rem;
  padding: 0;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background: var(--color-surface);
  cursor: pointer;
  overflow: hidden;
  opacity: 0.6;
  transition:
    opacity 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    opacity: 0.85;
  }

  &.active {
    opacity: 1;
    border-color: var(--color-accent);
  }

  :deep(> *) {
    width: 100%;
    height: 100%;
    object-fit: v-bind(fit);
    display: block;
  }
}
</style>
