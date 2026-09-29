<script setup lang="ts">
import { computed, ref } from "vue";
import {
  useLongPress,
  type LongPressSource,
} from "../composables/useLongPress";

export interface LongPressProps {
  delay?: number;
  scale?: number;
  forceTouch?: boolean;
  disabled?: boolean;
  moveTolerance?: number;
}

const props = withDefaults(defineProps<LongPressProps>(), {
  delay: 500,
  scale: 0.95,
  forceTouch: true,
  disabled: false,
  moveTolerance: 10,
});

const emit = defineEmits<{
  trigger: [event: PointerEvent | MouseEvent, source: LongPressSource];
  pressStart: [event: PointerEvent];
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
    :class="{ pressing: isPressing, holding: isHolding, disabled }"
    :style
  >
    <slot />
  </div>
</template>

<style scoped>
.long-press {
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

@media (prefers-reduced-motion: reduce) {
  .long-press,
  .long-press.pressing {
    transform: none;
    transition: none;
  }
}
</style>
