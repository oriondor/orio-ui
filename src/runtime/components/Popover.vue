<template>
  <div>
    <div ref="triggerRef">
      <slot :toggle="togglePopover" :is-open="showPopover" />
    </div>

    <Teleport to="body">
      <Transition name="animate-fade-slide" appear>
        <div
          v-if="showPopover"
          ref="containerRef"
          class="popover"
          :style="popoverStyle"
        >
          <slot name="content" :toggle="togglePopover" :is-open="showPopover" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, useTemplateRef, watch } from "vue";
import {
  useElementBounding,
  onClickOutside,
  useEventListener,
} from "@vueuse/core";

type PopoverPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "left-top"
  | "left-bottom"
  | "right-top"
  | "right-bottom";

interface PopoverProps {
  /**
   * Defines where the popover is placed relative to the trigger.
   * Acceptable single values: 'top', 'bottom', 'left', 'right'
   * Acceptable combos: 'top-left', 'top-right', 'bottom-left', 'bottom-right',
   *                    'left-top', 'left-bottom', 'right-top', 'right-bottom'
   * If you only provide 'top', 'bottom', 'left', or 'right',
   * it aligns center by default.
   */
  position?: PopoverPosition;
  /**
   * Distance (in px) between the popover and the trigger element.
   */
  offset?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<PopoverProps>(), {
  position: "bottom-left",
  offset: 10,
  disabled: false,
});

const triggerRef = useTemplateRef<HTMLElement>("triggerRef");
const containerRef = useTemplateRef<HTMLElement>("containerRef");

const { width: popoverWidth, height: popoverHeight } =
  useElementBounding(containerRef);

const showPopover = ref(false);
const triggerRect = ref<DOMRect | null>(null);
const popoverRect = ref<DOMRect | null>(null);

/**
 * Calculates the inline style for the popover based on position & offset.
 */
const popoverStyle = computed(() => {
  if (!showPopover.value || !triggerRect.value || !popoverRect.value) {
    return;
  }

  const [main, sub = "center"] = currentPosition.value.split("-");
  const offset = props.offset;

  const tRect = triggerRect.value;
  const pRect = popoverRect.value;

  let topValue = 0;
  let leftValue = 0;

  // Calculate vertical position (top)
  if (main === "top") {
    topValue = tRect.top - offset - pRect.height;
  } else if (main === "bottom") {
    topValue = tRect.bottom + offset;
  } else {
    // For 'left' or 'right' main, center vertically
    topValue = tRect.top + tRect.height / 2 - pRect.height / 2;
  }

  // Calculate horizontal position (left)
  if (sub === "left") {
    leftValue = tRect.right - pRect.width;
  } else if (sub === "right") {
    leftValue = tRect.left;
  } else {
    // 'center' is default horizontally
    leftValue = tRect.left + tRect.width / 2 - pRect.width / 2;
  }

  // If the main position is 'left' or 'right', override horizontal positioning
  if (main === "left") {
    leftValue = tRect.left - offset - pRect.width;
  } else if (main === "right") {
    leftValue = tRect.right + offset;
  }

  return {
    top: `${topValue}px`,
    left: `${leftValue}px`,
  };
});

const currentPosition = ref(props.position);

const getFallbackPositions = (pos: string): PopoverPosition[] => {
  const [main = "", sub = "center"] = pos.split("-");

  const opposites: Record<string, string> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  };

  const allPositions = [
    `${main}-${sub}`,
    `${opposites[main]}-${sub}`,
    `${main}-center`,
    `${opposites[main]}-center`,
  ];

  // Only add cross-axis fallbacks when sub is a real direction (not "center")
  if (sub !== "center") {
    allPositions.push(
      `${sub}-${main}`, // e.g. left-top
      `${sub}-${opposites[main]}`,
    );
  }

  return [...new Set(allPositions)] as PopoverPosition[];
};

function checkIfFits(
  position: string,
  tRect: DOMRect,
  pRect: DOMRect,
  offset: number,
) {
  const [main] = position.split("-");

  const space = {
    top: tRect.top,
    bottom: window.innerHeight - tRect.bottom,
    left: tRect.left,
    right: window.innerWidth - tRect.right,
  };

  if (main === "top" && space.top < pRect.height + offset) return false;
  if (main === "bottom" && space.bottom < pRect.height + offset) return false;
  if (main === "left" && space.left < pRect.width + offset) return false;
  if (main === "right" && space.right < pRect.width + offset) return false;

  return true;
}

/**
 * Calculates bounding client rects for trigger & popover,
 * updating reactive refs.
 */
async function updateRects() {
  await nextTick();
  const triggerEl = triggerRef.value;
  const popoverEl = containerRef.value;

  if (!triggerEl || !popoverEl) return;

  const tRect = triggerEl.getBoundingClientRect();
  triggerRect.value = tRect;

  const fallbacks = getFallbackPositions(props.position);

  // Hide while measuring to avoid flicker
  popoverEl.style.visibility = "hidden";

  for (const pos of fallbacks) {
    const pRect = popoverEl.getBoundingClientRect();
    const fits = checkIfFits(pos, tRect, pRect, props.offset);

    if (fits) {
      popoverRect.value = pRect;
      currentPosition.value = pos;
      popoverEl.style.visibility = "";
      return;
    }
  }

  // No position fits — use original and restore visibility
  popoverRect.value = popoverEl.getBoundingClientRect();
  currentPosition.value = props.position;
  popoverEl.style.visibility = "";
}

/**
 * Toggles popover visibility.
 * @param {boolean|null} force - If `true`/`false`, force that state; if `null`, toggle.
 */
async function togglePopover(force: boolean | null = null) {
  if (props.disabled) return;
  showPopover.value = force !== null ? force : !showPopover.value;

  if (!showPopover.value) return;

  await nextTick();
  updateRects();
}

/**
 * Closes the popover if the click is outside trigger/popover.
 */
onClickOutside(
  containerRef,
  () => {
    showPopover.value = false;
  },
  { ignore: [triggerRef] },
);

/**
 * Updates position of popover on scroll/resize if popover is open.
 */
function redrawPopover() {
  if (!showPopover.value) return;
  updateRects();
}

watch([popoverWidth, popoverHeight], redrawPopover);

useEventListener("scroll", redrawPopover, { capture: true });
useEventListener("resize", redrawPopover, { capture: true });
</script>
<style lang="scss" scoped>
.popover {
  border: 0;
  background-color: transparent;
  position: fixed;
  z-index: 999999;
}
</style>
