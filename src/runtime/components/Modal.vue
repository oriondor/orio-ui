<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useScrollLock } from "@vueuse/core";

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

const isLocked = import.meta.client ? useScrollLock(document.body) : ref(false);

const wrapper = ref<HTMLDivElement | null>(null);

// translate + scale that lays the modal exactly over the trigger rect
function originTransform(el: HTMLElement, origin: OriginRect) {
  const final = el.getBoundingClientRect();
  return `translate(${origin.x - final.left}px, ${origin.y - final.top}px) scale(${origin.width / final.width}, ${origin.height / final.height})`;
}

function animateOpen() {
  const el = wrapper.value;
  if (!el) return;

  // FLIP: jump onto the trigger without transition, then play to identity
  if (props.origin) {
    el.style.transition = "none";
    el.style.transform = originTransform(el, props.origin);
    // force reflow so the start transform is committed before transitioning
    void el.offsetWidth;
  }
  el.style.transition = "";
  el.style.transform = "none";
  el.style.opacity = "1";
}

function animateClose(overlay: Element, done: () => void) {
  // wrapper ref is already cleared during leave, so query the element
  const el = overlay.querySelector<HTMLElement>(".modal");
  if (!el) return done();

  el.addEventListener("transitionend", (event) => {
    if (event.propertyName === "opacity") done();
  });
  // fallback when transitionend never fires (reduced motion, hidden tab)
  setTimeout(done, 500);

  if (props.origin) {
    // fade only at the tail so it visibly shrinks back into the trigger
    el.style.transition =
      "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.15s ease-in 0.25s";
    el.style.transform = originTransform(el, props.origin);
  }
  el.style.opacity = "0";
}

watch(show, (open) => {
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
  <teleport to="body">
    <transition
      name="overlay-fade"
      @enter="animateOpen"
      @leave="animateClose"
    >
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
    </transition>
  </teleport>
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
    transform 0.5s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.15s ease-out;

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

/* fade only the backdrop so the modal stays visible while it morphs */
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  background: transparent;
  backdrop-filter: blur(0);
}
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition:
    background 0.4s ease,
    backdrop-filter 0.4s ease;
}
</style>
