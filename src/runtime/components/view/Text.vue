<script setup lang="ts">
import { computed, useAttrs } from 'vue';

export type TextTypes = 'text' | 'title' | 'subtitle' | 'italics';

export interface TextProps {
  type?: TextTypes;
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  uppercase?: boolean;
  icon?: string | null;
  lineClamp?: number | string;
}
const props = withDefaults(defineProps<TextProps>(), {
  type: 'text',
  size: 'medium',
  uppercase: false,
  icon: null,
  lineClamp: undefined,
});
const attrs = useAttrs();
const modelValue = defineModel<string>();

const clampLines = computed(() => Number(props.lineClamp ?? 1));
</script>

<template>
  <div :class="[type, size, { uppercase, clamp: !!lineClamp }]" v-bind="attrs">
    <orio-icon v-if="icon" :name="icon" />
    <slot>
      {{ modelValue }}
    </slot>
  </div>
</template>

<style lang="scss" scoped>
div {
  white-space: pre-wrap;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &.clamp {
    display: -webkit-box;
    overflow: hidden;
    line-clamp: v-bind(clampLines);
    -webkit-line-clamp: v-bind(clampLines);
    -webkit-box-orient: vertical;
  }

  &.uppercase {
    text-transform: uppercase;
  }

  &.text {
    color: var(--color-text);
  }
  &.title {
    font-weight: bold;
    color: var(--color-text);
  }
  &.subtitle {
    font-weight: semi-bold;
    color: var(--color-muted);
  }
  &.italics {
    font-style: italic;
    color: var(--color-muted);
  }

  &.small {
    font-size: 0.75rem;
  }
  &.medium {
    font-size: 0.875rem;
  }
  &.large {
    font-size: 1.25rem;
  }
  &.extra-large {
    font-size: 1.75rem;
  }
}
</style>
