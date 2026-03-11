<script setup lang="ts">
import type { ControlProps } from "./ControlElement.vue";

interface Props extends ControlProps {
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const modelValue = defineModel<boolean>({ required: false });

function toggle() {
  if (props.disabled) return;
  modelValue.value = !modelValue.value;
}
</script>

<template>
  <orio-control-element v-slot="{ id }" v-bind="props">
    <button
      :id
      v-bind="$attrs"
      class="switch-button"
      :class="{ active: modelValue, disabled: disabled }"
      :disabled="disabled"
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
    >
      <slot />
    </button>
  </orio-control-element>
</template>

<style lang="scss" scoped>
.switch-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--control-gap);

  border-radius: var(--control-radius);
  background-color: var(--color-surface);
  color: var(--color-muted);
  border: 1px solid var(--color-border);

  padding: var(--control-py) var(--control-px);

  cursor: pointer;
  user-select: none;

  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;

  &:hover:not(.disabled) {
    border-color: var(--color-border);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  &.active {
    background-color: var(--color-accent-active);
    color: var(--color-accent-soft);
    border-color: var(--color-accent);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
