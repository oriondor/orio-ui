<script setup lang="ts">
import { computed } from "vue";
import { iconRegistry, type IconName } from "../utils/icon-registry";

export interface IconProps {
  name: IconName | string;
  size?: string | number;
  color?: string;
}

const props = withDefaults(defineProps<IconProps>(), {
  size: "1em",
  color: "currentColor",
});

const iconSvg = computed(() => iconRegistry[props.name] || "");
const sizeValue = computed(() =>
  typeof props.size === "number" ? `${props.size}px` : props.size,
);
</script>

<template>
  <span
    class="orio-icon"
    :style="{
      width: sizeValue,
      height: sizeValue,
      color: color,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }"
    v-html="iconSvg"
  />
</template>

<style scoped>
.orio-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.orio-icon :deep(svg) {
  width: 100%;
  height: 100%;
  fill: currentColor;
}
</style>
