<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { usePageScrollLock } from "../composables/usePageScrollLock";

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
  /** open and close animation length in ms; unset keeps 500 open / 400 close */
  duration?: number;
}

const props = defineProps<Props>();

const openDuration = computed(() => props.duration ?? 500);
const closeDuration = computed(() => props.duration ?? 400);

const durationVars = computed(() => ({
  "--modal-open-duration": `${openDuration.value}ms`,
  "--modal-close-duration": `${closeDuration.value}ms`,
}));

const show = defineModel<boolean>("show");

// keep the page locked through the close animation so the scrollbar
// doesn't pop back while the modal is still shrinking. after-leave also fires
// when reopening mid-leave, hence `visible = Boolean(show)` there, not false.
const visible = ref(false);

watch(
  show,
  (open) => {
    if (open) visible.value = true;
  },
  { immediate: true },
);

usePageScrollLock(visible);

const wrapper = ref<HTMLDivElement | null>(null);

// translate + scale that lays the modal exactly over the trigger rect
function originTransform(el: HTMLElement, origin: OriginRect) {
  const final = el.getBoundingClientRect();
  return `translate(${origin.x - final.left}px, ${origin.y - final.top}px) scale(${origin.width / final.width}, ${origin.height / final.height})`;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function animateOpen() {
  const el = wrapper.value;
  if (!el) return;

  // FLIP: jump onto the trigger without transition, then play to identity
  if (props.origin && !prefersReducedMotion()) {
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

  // backdrop fade is the longest leg; modal transitions bubble here too
  overlay.addEventListener("transitionend", (event) => {
    if (event.target === overlay) done();
  });
  // fallback when transitionend never fires (hidden tab)
  setTimeout(done, closeDuration.value + 100);

  if (props.origin && !prefersReducedMotion()) {
    // fade only at the tail so it visibly shrinks back into the trigger
    const fadeDelay = Math.max(0, closeDuration.value - 150);
    el.style.transition = `transform ${closeDuration.value}ms cubic-bezier(0.32, 0.72, 0, 1), opacity 150ms ease-in ${fadeDelay}ms`;
    el.style.transform = originTransform(el, props.origin);
  }
  el.style.opacity = "0";
}

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
      appear
      name="overlay-fade"
      @enter="animateOpen"
      @leave="animateClose"
      @after-leave="visible = Boolean(show)"
    >
      <div
        v-if="show"
        class="overlay"
        :style="durationVars"
        @click.self="show = false"
      >
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
    transform var(--modal-open-duration) cubic-bezier(0.32, 0.72, 0, 1),
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
/* backdrop runs as long as the modal leg; leave waits on its transitionend */
.overlay-fade-enter-active {
  transition:
    background var(--modal-open-duration) ease,
    backdrop-filter var(--modal-open-duration) ease;
}
.overlay-fade-leave-active {
  transition:
    background var(--modal-close-duration) ease,
    backdrop-filter var(--modal-close-duration) ease;
}

@media (prefers-reduced-motion: reduce) {
  .modal {
    transition: opacity 0.15s ease-out;
  }
  .overlay-fade-enter-active,
  .overlay-fade-leave-active {
    transition:
      background 0.15s ease,
      backdrop-filter 0.15s ease;
  }
}
</style>
