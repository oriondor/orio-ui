<script setup lang="ts">
import { ref, nextTick, watch, computed } from "vue";
import { useWindowSize, useTimeoutFn, useScrollLock } from "@vueuse/core";

import { useSlots } from "vue";

const slots = useSlots();

export interface OriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  title?: string;
  origin: OriginRect | null;
}

const props = defineProps<Props>();

const show = defineModel<boolean>("show");

const isLocked = useScrollLock(document.body);

const wrapper = ref<HTMLDivElement | null>(null);

const { width: windowWidth, height: windowHeight } = useWindowSize();

function animateToCenter(el: HTMLDivElement) {
  useTimeoutFn(() => {
    requestAnimationFrame(() => {
      el.style.transform = "translate(0, 0) scale(1)";
      el.style.opacity = "1";
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
  el.style.opacity = "0.5";

  animateToCenter(el);
}

watch(show, (open) => {
  if (open) animateOpen();
  isLocked.value = open as boolean;
});

const hasHeader = computed(() => {
  return Boolean(props.title || slots.header);
});

const hasFooter = computed(() => {
  return Boolean(slots.footer);
});
</script>

<template>
  <transition name="overlay-fade">
    <teleport to="body">
      <div v-if="show" class="overlay" @click.self="show = false">
        <div ref="wrapper" class="modal">
          <header v-if="hasHeader" class="modal-header">
            <slot name="header">
              <orio-view-text type="title" class="modal-title">
                {{ title }}
              </orio-view-text>
              <orio-button
                icon="close"
                variant="subdued"
                class="modal-close"
                @click="show = false"
              />
            </slot>
          </header>

          <section class="modal-content">
            <slot />
          </section>

          <footer v-if="hasFooter" class="modal-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </teleport>
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
  z-index: 99;
}

.modal {
  position: absolute;
  z-index: 100;

  display: flex;
  flex-direction: column;

  min-width: 380px;
  max-width: 90vw;
  max-height: 90vh;

  background: var(--color-surface);
  border-radius: var(--border-radius-lg);

  transform-origin: top left;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);

  transition:
    transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.3s ease;

  color: var(--color-text);
  opacity: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-block-end: 1px solid var(--color-border);
  padding: 0.5rem 1rem;
}

.modal-content {
  padding: 0.5rem 1rem;
  overflow-y: auto;
  max-height: 100%;
}

.modal-footer {
  border-block-start: 1px solid var(--color-border);
  padding: 0.5rem 1rem;
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
