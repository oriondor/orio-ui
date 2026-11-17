<script setup lang="ts">
import { ref, computed, watch, useAttrs, useId, useSlots, provide } from "vue";
import {
  breakpointsTailwind,
  useBreakpoints,
  useEventListener,
} from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { usePageScrollLock } from "../composables/usePageScrollLock";
import { modalTeleportTarget } from "../utils/modal";

const slots = useSlots();
const { t } = useI18n();
const titleId = useId();
const attrs = useAttrs();
const generatedId = useId();
// caller's id wins; nested popovers teleport to whichever id the dialog has
const dialogId = computed(
  () => (attrs.id as string | undefined) || generatedId,
);

provide(
  modalTeleportTarget,
  computed(() => `#${dialogId.value}`),
);

export interface OriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ModalPresentation = "dialog" | "sheet" | "auto";

interface Props {
  title?: string;
  origin: OriginRect | null;
  /** open and close animation length in ms; unset keeps 500 open / 400 close */
  duration?: number;
  /** `auto` = sheet below the Tailwind `sm` breakpoint (640px), decided on open */
  presentation?: ModalPresentation;
  /** decorative grip at the top of a sheet; no gesture */
  dragHandle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  presentation: "dialog",
});

const isCompactViewport = useBreakpoints(breakpointsTailwind).smaller("sm");
// resolved on open and kept until the modal has left, so resizing never
// swaps the mode (or its transform) mid-flight
const resolvedPresentation = ref<"dialog" | "sheet">("dialog");
const isSheet = computed(() => resolvedPresentation.value === "sheet");

// root is a teleport, so attrs (aria-label, aria-labelledby, …) go on the dialog
defineOptions({ inheritAttrs: false });

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

// element focused before opening, refocused once the modal is gone
let returnFocus: HTMLElement | null = null;

watch(
  show,
  (open) => {
    if (!open) return;
    if (!visible.value) {
      resolvedPresentation.value =
        props.presentation === "auto"
          ? isCompactViewport.value
            ? "sheet"
            : "dialog"
          : props.presentation;
      if (typeof document !== "undefined") {
        returnFocus = document.activeElement as HTMLElement | null;
      }
    }
    visible.value = true;
  },
  { immediate: true },
);

function afterLeave() {
  visible.value = Boolean(show.value);
  if (visible.value) return;
  // another modal opened meanwhile and owns focus now
  const active = document.activeElement;
  if (!active?.closest('[aria-modal="true"]')) {
    returnFocus?.focus({ preventScroll: true });
  }
  returnFocus = null;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// keep Tab inside the dialog: wrap from last to first and back
function trapTab(event: KeyboardEvent) {
  const el = wrapper.value;
  if (!el) return;
  // checkVisibility drops display:none / hidden controls (absent in jsdom)
  const focusables = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (element) => element.checkVisibility?.() !== false,
  );
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (!first || !last) {
    event.preventDefault();
    el.focus();
  } else if (event.shiftKey && (active === first || active === el)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

// a child that handled Esc (open selector, nested popup) calls preventDefault
function closeOnEscape(event: KeyboardEvent) {
  if (event.defaultPrevented) return;
  event.preventDefault();
  show.value = false;
}

usePageScrollLock(visible);

// focused control unmounted → focus fell to <body>, outside the overlay's
// key handlers. The topmost open modal takes Tab / Esc back from the window.
useEventListener("keydown", (event: KeyboardEvent) => {
  const dialog = wrapper.value;
  if (!dialog || document.activeElement !== document.body) return;
  // a closing modal stays in the DOM until its leave transition ends
  const openDialogs = document.querySelectorAll(
    '.overlay:not(.overlay-fade-leave-active) > [aria-modal="true"]',
  );
  if (openDialogs[openDialogs.length - 1] !== dialog) return;
  if (event.key === "Escape") closeOnEscape(event);
  else if (event.key === "Tab") {
    event.preventDefault();
    dialog.focus();
  }
});

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

  if (isSheet.value) {
    // start below the viewport (CSS), commit it, then slide up
    void el.offsetWidth;
  } else if (props.origin && !prefersReducedMotion()) {
    // FLIP: jump onto the trigger without transition, then play to identity
    el.style.transition = "none";
    el.style.transform = originTransform(el, props.origin);
    // force reflow so the start transform is committed before transitioning
    void el.offsetWidth;
  }
  el.style.transition = "";
  el.style.transform = "none";
  el.style.opacity = "1";
  el.focus({ preventScroll: true });
}

function animateClose(overlay: Element, done: () => void) {
  // wrapper ref is already cleared during leave, so query the element
  const el = overlay.querySelector<HTMLElement>(".modal");
  // reduced motion: no animation, so nothing to wait on; don't linger over the page
  if (!el || prefersReducedMotion()) return done();

  // backdrop fade is the longest leg; modal transitions bubble here too
  overlay.addEventListener("transitionend", (event) => {
    if (event.target === overlay) done();
  });
  // fallback when transitionend never fires (hidden tab)
  setTimeout(done, closeDuration.value + 100);

  if (isSheet.value) {
    // slide down; no fade, it leaves the viewport instead
    el.style.transition = `transform ${closeDuration.value}ms cubic-bezier(0.32, 0.72, 0, 1)`;
    el.style.transform = "translateY(100%)";
    return;
  }

  if (props.origin && !isSheet.value) {
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

// default header renders the title; a custom #header has no titleId element
const labelledBy = computed(() =>
  props.title && !slots.header ? titleId : undefined,
);

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
      @after-leave="afterLeave"
    >
      <div
        v-if="show"
        class="overlay"
        :style="durationVars"
        @click.self="show = false"
        @keydown.esc="closeOnEscape"
        @keydown.tab="trapTab"
      >
        <div
          v-bind="$attrs"
          :id="dialogId"
          ref="wrapper"
          class="modal"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          :aria-labelledby="labelledBy"
          :data-presentation="resolvedPresentation"
          data-smooth-resize
        >
          <!-- measured by the global smooth-resize watcher; .modal animates -->
          <div
            class="modal-inner"
            :class="{ 'has-grip': isSheet && dragHandle }"
          >
            <div
              v-if="isSheet && dragHandle"
              class="modal-grip"
              aria-hidden="true"
            />
            <header v-if="hasHeader" class="modal-header">
              <slot name="header">
                <orio-view-text :id="titleId" type="title" class="modal-title">
                  {{ title }}
                </orio-view-text>
                <orio-button
                  icon="close"
                  variant="subdued"
                  class="modal-close"
                  :aria-label="t('modal.close')"
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

  min-inline-size: min(var(--modal-min-inline-size, 380px), 100% - 2rem);
  max-inline-size: min(var(--modal-max-inline-size, 90vw), 100% - 2rem);

  background: var(--color-surface);
  border-radius: var(--modal-radius, var(--border-radius-lg));

  transform-origin: top left;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);

  transition:
    transform var(--modal-open-duration) cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.15s ease-out;

  color: var(--color-text);
  opacity: 0;
}

/* holds the natural height (capped) that the outer .modal animates to */
.modal-inner {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

/* sheet: docked to the bottom, full width, slides up from below */
.modal[data-presentation="sheet"] {
  inset-inline: 0;
  inset-block-end: 0;
  min-inline-size: 0;
  max-inline-size: none;
  border-end-start-radius: 0;
  border-end-end-radius: 0;
  box-shadow: none;
  transform: translateY(100%);
  opacity: 1;
  transition: transform var(--modal-open-duration)
    cubic-bezier(0.32, 0.72, 0, 1);
}

.modal[data-presentation="sheet"]:focus-visible {
  outline-offset: -2px;
}

.modal[data-presentation="sheet"] .modal-inner {
  max-height: none;
  max-block-size: var(--modal-max-block-size, 90dvh);
}

.modal[data-presentation="sheet"] .modal-content {
  overscroll-behavior: contain;
}

/* the last block keeps its own block-end padding (--modal-block-end) and clears the home indicator (needs viewport-fit=cover) */
.modal[data-presentation="sheet"] .modal-inner > :last-child {
  padding-block-end: calc(
    var(--modal-block-end, 0.5rem) + env(safe-area-inset-bottom, 0px)
  );
}

/* grip sits in the header's top padding, so the header stays compact */
.modal-inner.has-grip {
  position: relative;
  padding-block-start: 0.75rem;
}

.modal-inner.has-grip .modal-header {
  padding-block-start: 0.25rem;
}

.modal-grip {
  position: absolute;
  inset-block-start: 0.375rem;
  inset-inline: 0;
  margin-inline: auto;
  inline-size: 2.25rem;
  block-size: 0.25rem;
  border-radius: var(--border-radius-pill);
  background: var(--color-border);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-block-end: 1px solid var(--color-border);
  /* padding replaces the close button's control margin; ignore an app-wide --control-margin */
  --control-margin: 0;
  --modal-block-end: 1rem;
  padding: 1rem 1.5rem 1rem 1rem;
}

.modal-content {
  padding: 0.5rem 1rem;
  /* reserve the scrollbar's width so content doesn't shift when it appears */
  scrollbar-gutter: stable;
  overflow-y: auto;
  max-height: 100%;
}

.modal-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  /* gap replaces the control margin; ignore an app-wide --control-margin */
  --control-margin: 0;
  --modal-block-end: 1rem;
  border-block-start: 1px solid var(--color-border);
  padding: 1rem 1.5rem;
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

/* no motion at all: open and close are instant (close also skips the wait) */
@media (prefers-reduced-motion: reduce) {
  .modal,
  .modal[data-presentation="sheet"],
  .overlay-fade-enter-active,
  .overlay-fade-leave-active {
    transition: none;
  }
}
</style>
