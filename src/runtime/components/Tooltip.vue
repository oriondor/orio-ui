<script setup lang="ts">
import { ref, computed, nextTick, toRefs, watch } from "vue";
import { useEventListener } from "@vueuse/core";

export interface TooltipProps {
  text?: string;
  placement?: "top" | "bottom" | "left" | "right";
  delay?: number;
  disabled?: boolean;
  offset?: number;
}

const props = withDefaults(defineProps<TooltipProps>(), {
  text: undefined,
  placement: "top",
  delay: 500,
  disabled: false,
  offset: 8,
});

const { disabled } = toRefs(props);

watch(disabled, () => {
  if (disabled.value) hideTooltip();
});

const isVisible = ref(false);
const trigger = ref<HTMLElement | null>(null);
const tooltip = ref<HTMLElement | null>(null);
const position = ref({ top: 0, left: 0 });
let showTimeout: ReturnType<typeof setTimeout> | null = null;

function calculatePosition() {
  if (!trigger.value || !tooltip.value) return;

  const triggerRect = trigger.value.getBoundingClientRect();
  const tooltipRect = tooltip.value.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  let top = 0;
  let left = 0;

  switch (props.placement) {
    case "top":
      top = triggerRect.top + scrollY - tooltipRect.height - props.offset;
      left =
        triggerRect.left +
        scrollX +
        (triggerRect.width - tooltipRect.width) / 2;
      break;
    case "bottom":
      top = triggerRect.bottom + scrollY + props.offset;
      left =
        triggerRect.left +
        scrollX +
        (triggerRect.width - tooltipRect.width) / 2;
      break;
    case "left":
      top =
        triggerRect.top +
        scrollY +
        (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.left + scrollX - tooltipRect.width - props.offset;
      break;
    case "right":
      top =
        triggerRect.top +
        scrollY +
        (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.right + scrollX + props.offset;
      break;
  }

  position.value = { top, left };
}

function showTooltip() {
  if (disabled.value) return;

  if (props.delay > 0) {
    showTimeout = setTimeout(() => {
      isVisible.value = true;
      nextTick(calculatePosition);
    }, props.delay);
  } else {
    isVisible.value = true;
    nextTick(calculatePosition);
  }
}

function hideTooltip() {
  if (showTimeout) {
    clearTimeout(showTimeout);
    showTimeout = null;
  }
  isVisible.value = false;
}

// Update position on scroll
useEventListener(
  window,
  "scroll",
  () => {
    if (isVisible.value) calculatePosition();
  },
  { capture: true },
);

// Update position on resize
useEventListener(window, "resize", () => {
  if (isVisible.value) calculatePosition();
});

const tooltipStyle = computed(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
}));

const arrowClass = computed(
  () => `orio-tooltip-arrow orio-tooltip-arrow-${props.placement}`,
);
</script>

<template>
  <div
    ref="trigger"
    class="trigger"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focus="showTooltip"
    @blur="hideTooltip"
  >
    <slot />
    <Teleport v-if="isVisible" to="body">
      <div
        ref="tooltip"
        class="orio-tooltip"
        :style="tooltipStyle"
        role="tooltip"
        :aria-hidden="!isVisible"
      >
        <div class="orio-tooltip-content">
          <slot name="content">
            {{ text }}
          </slot>
        </div>
        <div :class="arrowClass" />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>

<!-- Unscoped: teleported content lives outside the component tree,
     so scoped styles don't reliably apply. BEM prefix avoids collisions. -->
<style>
.orio-tooltip {
  position: absolute;
  z-index: 9999;
  pointer-events: none;
}

.orio-tooltip-content {
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius-sm, 4px);
  font-size: var(--font-md);
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.orio-tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.orio-tooltip-arrow-top {
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px 4px 0 4px;
  border-color: rgba(0, 0, 0, 0.9) transparent transparent transparent;
}

.orio-tooltip-arrow-bottom {
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 4px 4px 4px;
  border-color: transparent transparent rgba(0, 0, 0, 0.9) transparent;
}

.orio-tooltip-arrow-left {
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 4px 0 4px 4px;
  border-color: transparent transparent transparent rgba(0, 0, 0, 0.9);
}

.orio-tooltip-arrow-right {
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 4px 4px 4px 0;
  border-color: transparent rgba(0, 0, 0, 0.9) transparent transparent;
}
</style>
