<script setup lang="ts">
export interface ControlProps {
  /**
   * Minimal will reset margin and remove border and box shadow from every element inside the slot
   */
  appearance?: "normal" | "minimal";
  /**
   * Error message to display below the control
   */
  error?: string | null;
}

withDefaults(defineProps<ControlProps>(), {
  appearance: "normal",
  error: null,
});
</script>

<template>
  <div class="control" :class="[appearance, { 'has-error': error }]">
    <label v-if="$attrs.label" class="control-label">{{ $attrs.label }}</label>
    <div class="slot-wrapper" v-bind="$attrs">
      <slot />
    </div>
    <span v-if="error" class="control-error">{{ error }}</span>
  </div>
</template>

<style lang="scss" scoped>
.control {
  margin: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;

  .control-label {
    user-select: none;
  }

  .control-error {
    color: var(--color-danger);
    font-size: 0.875rem;
  }

  &.has-error {
    .slot-wrapper :deep(*) {
      border-color: var(--color-danger);
    }
  }

  &.minimal {
    margin: 0;

    .slot-wrapper :first-child {
      line-height: 1.5;
      border: 0;
      &:focus {
        box-shadow: none;
      }
    }
  }
}
</style>
