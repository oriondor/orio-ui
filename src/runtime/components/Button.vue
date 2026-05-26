<script setup lang="ts">
import { computed, toRefs, useSlots } from "vue";
import type { ControlProps } from "./ControlElement.vue";

interface Props extends ControlProps {
  variant?: "primary" | "secondary" | "subdued";
  icon?: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
});

const { loading, disabled } = toRefs(props);

const slots = useSlots();

const isIconOnly = computed(() => {
  const hasIcon = !!props.icon || !!slots.icon;
  const hasDefault = !!slots.default;
  return hasIcon && !hasDefault;
});

const emit = defineEmits<{
  (e: "click", event: PointerEvent): void;
  (e: "mousedown", event: MouseEvent): void;
  (e: "mouseup", event: MouseEvent): void;
  (e: "mouseleave", event: MouseEvent): void;
}>();

function click(event: PointerEvent) {
  if (loading.value || disabled.value) return;
  emit("click", event);
}

function onMousedown(event: MouseEvent) {
  if (loading.value || disabled.value) return;
  emit("mousedown", event);
}

function onMouseup(event: MouseEvent) {
  emit("mouseup", event);
}

function onMouseleave(event: MouseEvent) {
  emit("mouseleave", event);
}
</script>

<template>
  <orio-control-element v-slot="{ control }" v-bind="props">
    <button
      v-bind="{ ...$attrs, ...control }"
      :class="[variant, 'gradient-hover', { 'icon-only': isIconOnly }]"
      @click="click"
      @mousedown="onMousedown"
      @mouseup="onMouseup"
      @mouseleave="onMouseleave"
    >
      <orio-loading-spinner v-if="loading" />
      <slot v-else name="icon">
        <orio-icon v-if="icon" :name="icon" />
      </slot>
      <slot />
    </button>
  </orio-control-element>
</template>

<style lang="scss" scoped>
button {
  background-color: var(--color-accent);
  color: var(--color-accent-ink);
  border: 1px solid transparent;
  border-radius: var(--control-radius);
  padding: var(--control-py) var(--control-px);
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: var(--control-gap);
  user-select: none;

  &.icon-only {
    // padding: 0;
    line-height: 0;
    aspect-ratio: 1;
  }

  &:disabled,
  &:disabled:hover {
    background-color: var(--color-accent-soft-base);
    color: var(--color-muted);
    border-color: var(--color-accent-border);
    cursor: not-allowed;
    background-image: none;
  }

  &:active {
    border: 1px solid var(--color-accent-border);
  }

  &.primary {
    --gh-color: var(--color-accent);
  }

  &.secondary {
    background-color: transparent;
    border: 1px solid var(--color-accent);
    color: var(--color-accent-active);
    &:hover {
      color: var(--color-accent-hover);
    }
  }

  &.subdued {
    background-color: transparent;
    color: var(--color-accent-active);
    &:hover {
      color: var(--color-accent-hover);
    }
  }

  &:active {
    border-color: var(--color-accent-border) !important;
  }

  &:hover {
    color: var(--color-accent-ink);
  }
}
</style>
