<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  style?: 'dotted' | 'dashed' | 'solid' | 'double' | 'groove' | 'ridge';
  size?: number | string;
  margin?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  style: 'solid',
  size: 1,
  margin: 1,
});

const sizePx = computed(() => `${props.size}px`);
const margin = computed(() => `${props.margin}rem`);
</script>

<template>
  <div />
</template>

<style scoped>
div {
  width: 100%;
  border-block-end: v-bind(sizePx) v-bind(style) var(--color-border);
  margin-block: v-bind(margin);
}
</style>
