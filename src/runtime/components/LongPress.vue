<script setup lang="ts">
import { computed, ref } from "vue";
import {
  useLongPress,
  type LongPressEvent,
  type LongPressSource,
} from "../composables/useLongPress";

export interface LongPressProps {
  delay?: number;
  scale?: number;
  forceTouch?: boolean;
  disabled?: boolean;
  moveTolerance?: number;
  /** thin bar above the content that fills over `delay` */
  progress?: boolean;
}

const props = withDefaults(defineProps<LongPressProps>(), {
  delay: 500,
  scale: 0.95,
  forceTouch: true,
  disabled: false,
  moveTolerance: 10,
  progress: false,
});

const emit = defineEmits<{
  trigger: [event: LongPressEvent, source: LongPressSource];
  pressStart: [event: PointerEvent | KeyboardEvent];
  pressCancel: [];
}>();

const root = ref<HTMLElement | null>(null);

const { isPressing, isHolding } = useLongPress(root, {
  delay: () => props.delay,
  moveTolerance: () => props.moveTolerance,
  forceTouch: () => props.forceTouch,
  disabled: () => props.disabled,
  onStart: (event) => emit("pressStart", event),
  onCancel: () => emit("pressCancel"),
  onTrigger: (event, source) => emit("trigger", event, source),
});

const style = computed(() => ({
  "--long-press-scale": props.scale,
  "--long-press-duration": `${props.delay}ms`,
}));
</script>

<template>
  <div
    ref="root"
    class="long-press"
    :class="{ pressing: isPressing, holding: isHolding, disabled, progress }"
    :style
  >
    <slot />
  </div>
</template>

<style scoped>
.long-press {
  position: relative;
  display: inline-flex;
  touch-action: manipulation;
  transform: scale(1);
  transition: transform 150ms ease-out;
}

.long-press.holding {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.long-press.pressing {
  transform: scale(var(--long-press-scale));
  transition-duration: var(--long-press-duration);
  transition-timing-function: ease-in;
}

/* kept under reduced motion: it is the only cue for how long to hold.
   Drawn on the child itself (the wrapper also spans the child's margin), over
   its top edge and inset past the rounded corners; page text color reads on
   both surface and accent fills. */
.long-press.progress > :slotted(*) {
  position: relative;
}

.long-press.progress > :slotted(*)::before {
  content: "";
  position: absolute;
  z-index: 1;
  inset-block-start: 3px;
  inset-inline: min(var(--control-radius, var(--border-radius-md)), 25%);
  height: 3px;
  border-radius: 2px;
  background: var(--long-press-progress-color, currentColor);
  pointer-events: none;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 150ms ease-out;
}

.long-press.progress.pressing > :slotted(*)::before {
  transform: scaleX(1);
  transition: transform var(--long-press-duration) linear;
}

@media (prefers-reduced-motion: reduce) {
  .long-press,
  .long-press.pressing {
    transform: none;
    transition: none;
  }
}
</style>
