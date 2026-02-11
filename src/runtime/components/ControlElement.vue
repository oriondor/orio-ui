<script setup lang="ts">
import { useId } from "vue";

export type ControlLayout = "vertical" | "horizontal";

export interface ControlProps {
  /**
   * Minimal will reset margin and remove border and box shadow from every element inside the slot
   */
  appearance?: "normal" | "minimal";
  /**
   * Error message to display below the control
   */
  error?: string | null;
  /**
   * ID for the control's form element, auto-generated if not provided
   */
  id?: string;
  /**
   * Label position relative to the control
   */
  layout?: ControlLayout;
}

const props = withDefaults(defineProps<ControlProps>(), {
  appearance: "normal",
  error: null,
  id: () => useId(),
  layout: "vertical",
});
</script>

<template>
  <div class="control" :class="[appearance, layout, { 'has-error': error }]">
    <label v-if="$attrs.label" class="control-label" :for="id">
      {{ $attrs.label }}
    </label>
    <div>
      <div class="slot-wrapper" v-bind="$attrs">
        <slot :id />
      </div>
      <span v-if="error" class="control-error">{{ error }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control {
  margin: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;

  .control-label {
    font-size: var(--font-md);
    user-select: none;
  }

  .control-error {
    color: var(--color-danger);
    font-size: var(--font-md);
  }

  &.has-error {
    .slot-wrapper :deep(*) {
      border-color: var(--color-danger);
      font-size: var(--font-md);
    }
  }

  &.minimal {
    margin: 0;

    .slot-wrapper :first-child {
      border: 0;
      &:focus {
        box-shadow: none;
      }
    }
  }

  &.horizontal {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;

    .control-label {
      white-space: nowrap;
    }
  }
}
</style>
