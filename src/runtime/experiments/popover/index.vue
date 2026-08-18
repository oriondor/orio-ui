<script setup lang="ts">
import { computed, useId } from "vue";
import { useStyleTag, useEventListener, useDebounceFn } from "@vueuse/core";

/**
 * Curated subset of the CSS `position-area` grammar.
 *
 * Deliberately a closed union rather than csstype's `Property.PositionArea`:
 * that type ends in `(string & {})`, so it accepts any string, and the value is
 * interpolated straight into a `<style>` tag below.
 *
 * A single keyword spans the cross axis (`bottom` = centered below the
 * trigger). `bottom span-right` starts the panel at the trigger's left edge and
 * runs right — the equivalent of the shipped Popover's `bottom-left`.
 * `bottom right` pins the panel to the corner tile.
 */
export type PopoverPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top span-left"
  | "top span-right"
  | "bottom span-left"
  | "bottom span-right"
  | "left span-top"
  | "left span-bottom"
  | "right span-top"
  | "right span-bottom"
  | "top left"
  | "top right"
  | "bottom left"
  | "bottom right";

/**
 * Flip strategy. `"initial"` is the plain CSS behaviour — the browser resolves
 * `position-try-fallbacks` when the panel is laid out and never revisits it.
 * `"auto"` adds the silent reopen that re-resolves it during scrolling.
 */
export type PopoverFlip = "auto" | "initial" | "off";

export interface PopoverProps {
  /**
   * Id shared by the trigger (`popovertarget`) and the panel (`id`).
   * Generated per instance when omitted; must be unique on the page.
   */
  id?: string;
  /**
   * Where the panel sits relative to the trigger, as a `position-area` value.
   */
  position?: PopoverPosition;
  /**
   * Distance between trigger and panel, in rem.
   */
  gap?: number;
  /**
   * How hard the panel works to stay inside the viewport.
   *
   * - `"auto"` — flip on open, and re-resolve while open when scrolling or
   *   resizing pushes the panel out of view.
   * - `"initial"` — flip on open only. The side is then fixed for as long as
   *   the panel stays open, even if it scrolls off-screen.
   * - `"off"` — never flip; the panel always renders on the requested side.
   */
  flip?: PopoverFlip;
}

const {
  id = useId(),
  position = "bottom",
  gap = 0.25,
  flip = "auto",
} = defineProps<PopoverProps>();

// Two root nodes (trigger + panel), so there is nowhere sensible for fallthrough
// attrs to land. Consumers put attrs on their own slot content instead.
defineOptions({ inheritAttrs: false });

// Native Popover API wiring: the trigger points at the panel by id, the panel
// opts into top-layer rendering. No JS state, no positioning maths.
const triggerProps = computed(() => ({
  popovertarget: id,
  class: "popover-trigger",
  // accessibility props?
}));

const bodyProps = computed(() => ({
  id,
  class: "popover-body",
  popover: "auto",
}));

// Per-instance styles. Both the anchor name and the selectors are scoped by
// `id` — a shared `--popover-trigger` would make every panel on the page
// resolve to the same trigger. The trigger is selected via its
// `popovertarget`, so it needs no id of its own; the `:is(button, input)`
// guard keeps the anchor off wrapper elements that the attribute may also
// fall through to (e.g. `<orio-button>`'s outer div), which would otherwise
// reintroduce duplicate anchor names.
const anchorName = computed(() => `--popover-trigger-${id}`);

/** Main axis of the requested position; the cross axis is the second keyword. */
const mainAxis = computed(() => position.split(" ")[0]);

/**
 * Flip the block axis first for top/bottom placements and the inline axis first
 * for left/right ones, then the other axis, then both. First fit wins, so the
 * panel stays as close to the requested side as the viewport allows.
 */
const positionTryFallbacks = computed(() => {
  const isBlockAxis = mainAxis.value === "top" || mainAxis.value === "bottom";

  return isBlockAxis
    ? "flip-block, flip-inline, flip-block flip-inline"
    : "flip-inline, flip-block, flip-block flip-inline";
});

/**
 * Class that kills the panel's transitions for the duration of a silent
 * reopen. Carries id specificity, so it beats the zero-specificity defaults.
 */
const INSTANT_CLASS = "popover-instant";

const panelElement = () =>
  typeof document === "undefined" ? null : document.getElementById(id);

/**
 * jsdom and older browsers have no Popover API, and `:popover-open` throws as
 * an unknown selector there. Everything below is a no-op without it.
 */
const supportsPopover = () =>
  typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;

/**
 * True while a silent reopen is in flight. The native `beforetoggle`/`toggle`
 * events would otherwise fire a spurious close/open pair at any consumer
 * listening on the panel.
 */
let isRecalculating = false;

/**
 * Force the browser to re-resolve `position-try-fallbacks`.
 *
 * The fallback is only chosen when the panel is laid out — scrolling moves the
 * panel with its anchor on the compositor without re-running the choice, and
 * neither rewriting `position-area` nor toggling `position-try-fallbacks`
 * invalidates it (measured in Chrome 151). A close/open pair does, because the
 * panel is laid out afresh on show.
 *
 * Hiding and showing happen in the same task with transitions suppressed, so
 * the browser never paints the closed state: no flicker, no replayed open
 * animation. Focus and the panel's own scroll position are restored, since
 * hiding a popover returns focus to the invoker and a display change resets
 * `scrollTop`.
 */
function recalculatePlacement() {
  if (!supportsPopover()) {
    return;
  }

  const panel = panelElement();

  if (!panel?.matches(":popover-open")) {
    return;
  }

  const rect = panel.getBoundingClientRect();
  const overflows =
    rect.top < 0 ||
    rect.left < 0 ||
    rect.bottom > window.innerHeight ||
    rect.right > window.innerWidth;

  if (!overflows) {
    return;
  }

  const activeElement = document.activeElement;
  const { scrollTop, scrollLeft } = panel;

  isRecalculating = true;
  panel.classList.add(INSTANT_CLASS);
  panel.hidePopover();
  panel.showPopover();
  panel.scrollTop = scrollTop;
  panel.scrollLeft = scrollLeft;

  if (activeElement instanceof HTMLElement && panel.contains(activeElement)) {
    activeElement.focus();
  }

  // `toggle` is dispatched as a queued task, so the flag has to outlive this one.
  setTimeout(() => {
    isRecalculating = false;
  });

  requestAnimationFrame(() => panel.classList.remove(INSTANT_CLASS));
}

// Scroll idle rather than every frame: one relayout per gesture instead of
// sixty, and the panel tracks its anchor natively in between.
const scheduleRecalculation = useDebounceFn(recalculatePlacement, 100);

useEventListener(
  "scroll",
  () => {
    if (flip === "auto") {
      scheduleRecalculation();
    }
  },
  { capture: true, passive: true },
);

useEventListener("resize", () => {
  if (flip === "auto") {
    scheduleRecalculation();
  }
});

// Swallow the close/open pair the silent reopen produces. Non-bubbling events
// still have a capture phase, so a document-level capture listener runs before
// anything the consumer attached to the panel itself.
useEventListener(
  () => (typeof document === "undefined" ? null : document),
  ["beforetoggle", "toggle"],
  (event: Event) => {
    if (isRecalculating && event.target === panelElement()) {
      event.stopImmediatePropagation();
    }
  },
  { capture: true },
);

/** Panel enters moving away from the trigger, so the motion reads as "opening". */
const enterTransform = computed(() => {
  const offsets: Record<string, string> = {
    bottom: "translateY(calc(-1 * var(--popover-enter-distance)))",
    top: "translateY(var(--popover-enter-distance))",
    right: "translateX(calc(-1 * var(--popover-enter-distance)))",
    left: "translateX(var(--popover-enter-distance))",
  };

  return offsets[mainAxis.value] ?? "none";
});

// Surface and motion defaults are wrapped in `:where()` so they carry zero
// specificity — a consumer class on the panel overrides them without `!important`
// or an id selector. Anchor positioning is not wrapped: it has to win.
//
// The panel is `position: fixed`, never `absolute`. Under `absolute` the
// containing block is the initial containing block, whose scrollable overflow
// region spans the whole document, so a panel hanging below the fold overflows
// nothing and the flip fallbacks never fire. `fixed` measures against the
// viewport, which is what flipping should react to. Verified in Chrome 151:
// identical CSS flips with `fixed` and does not with `absolute`.
//
// Comments stay out of the template literal — it ships into a live style tag.
const styles = computed(
  () => `
  :is(button, input)[popovertarget="${id}"] {
    anchor-name: ${anchorName.value};
  }

  .popover-body#${id} {
    position-anchor: ${anchorName.value};
    position: fixed;
    position-area: ${position};
    margin: ${gap}rem;
    ${flip === "off" ? "" : `position-try-fallbacks: ${positionTryFallbacks.value};`}
  }

  :where(.popover-body#${id}) {
    --popover-enter-distance: 0.5rem;

    box-sizing: border-box;
    padding: 0.5rem 0.75rem;
    background: var(--color-bg);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--control-radius, var(--border-radius-md));
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);

    opacity: 0;
    transform: ${enterTransform.value};
    transition:
      opacity var(--motion-duration-medium) var(--motion-ease-smooth),
      transform var(--motion-duration-medium) var(--motion-ease-smooth),
      overlay var(--motion-duration-medium) allow-discrete,
      display var(--motion-duration-medium) allow-discrete;
  }

  :where(.popover-body#${id}):popover-open {
    opacity: 1;
    transform: none;
  }

  /* Entry side of the discrete transition — without this the panel pops in. */
  @starting-style {
    :where(.popover-body#${id}):popover-open {
      opacity: 0;
      transform: ${enterTransform.value};
    }
  }

  /* Applied only while a silent reopen is in flight. */
  .popover-body#${id}.${INSTANT_CLASS} {
    transition: none;
    opacity: 1;
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    :where(.popover-body#${id}) {
      transition-duration: 0s;
      transform: none;
    }
  }
`,
);

useStyleTag(styles);
</script>

<template>
  <slot name="trigger" v-bind="triggerProps">
    <orio-button v-bind="triggerProps">Open</orio-button>
  </slot>
  <slot name="body" v-bind="bodyProps">
    <div v-bind="bodyProps">Test popover</div>
  </slot>
</template>

<style scoped></style>
