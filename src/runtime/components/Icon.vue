<script setup lang="ts">
import { computed } from "vue";
import { iconRegistry, type IconName } from "../utils/icon-registry";

export interface IconProps {
  name: IconName | string;
  size?: string | number;
  color?: string;
}

const props = withDefaults(defineProps<IconProps>(), {
  color: "currentColor",
});

const iconSvg = computed(() => iconRegistry[props.name] || "");
const sizeValue = computed(() => {
  if (props.size == null) return undefined;
  return typeof props.size === "number" ? `${props.size}px` : props.size;
});
</script>

<template>
  <span
    class="orio-icon"
    :style="{ color, width: sizeValue, height: sizeValue }"
    v-html="iconSvg"
  />
</template>

<style scoped>
.orio-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--control-icon-size, 1.5em);
  height: var(--control-icon-size, 1.5em);
}

.orio-icon :deep(svg) {
  width: 100%;
  height: 100%;
  fill: currentColor;
}
</style>
