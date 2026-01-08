<script setup lang="ts">
interface Props {
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
  <orio-control-element>
    <button
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
  gap: 0.5rem;

  border-radius: var(--border-radius-md);
  background-color: var(--color-surface);
  color: var(--color-muted);
  border: 1px solid var(--color-border);

  padding: 8px 16px;
  font-size: 1rem;
  line-height: 1.5;

  cursor: pointer;
  user-select: none;

  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;

  &:hover:not(.disabled) {
    border-color: var(--color-accent);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  &.active {
    background-color: var(--color-accent-soft);
    color: var(--color-accent);
    border-color: var(--color-accent);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
