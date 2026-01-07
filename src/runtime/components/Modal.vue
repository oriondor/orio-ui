<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { useWindowSize, useTimeoutFn } from '@vueuse/core';

export interface OriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const props = defineProps<{
  origin: OriginRect | null;
}>();

const show = defineModel<boolean>('show');

const wrapper = ref<HTMLDivElement | null>(null);

const { width: windowWidth, height: windowHeight } = useWindowSize();

function animateToCenter(el: HTMLDivElement) {
  useTimeoutFn(() => {
    requestAnimationFrame(() => {
      el.style.transform = 'translate(0, 0) scale(1)';
      el.style.opacity = '1';
    });
  }, 100);
}

async function animateOpen() {
  await nextTick();

  const el = wrapper.value;
  if (!el) return;
  if (!props.origin) {
    animateToCenter(el);
    return;
  }

  const { x, y, width, height } = props.origin;

  el.style.transform = `
        translate(${x - windowWidth.value / 2}px, ${y - windowHeight.value / 2}px)
        scale(${width / el.offsetWidth}, ${height / el.offsetHeight})
      `;
  el.style.opacity = '0.5';

  animateToCenter(el);
}

watch(show, (open) => {
  if (open) animateOpen();
});
</script>

<template>
  <transition name="overlay-fade">
    <div v-if="show" class="overlay" @click.self="show = false">
      <div ref="wrapper" class="modal">
        <slot />
      </div>
    </div>
  </transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);

  display: flex;
  justify-content: center;
  align-items: center;

  transition: opacity 0.25s ease;
}

.modal {
  position: absolute;

  width: 380px;
  max-width: 90vw;
  max-height: 90vh;

  background: white;
  border-radius: 1rem;
  padding: 24px;

  transform-origin: top left;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);

  transition:
    transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.3s ease;

  color: var(--color-muted);
  opacity: 0;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}
</style>
