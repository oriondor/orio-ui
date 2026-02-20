<script setup lang="ts">
import { useId } from "vue";

export type ControlLayout = "vertical" | "horizontal";
export type ControlSize = "sm" | "md" | "lg" | "xl";

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
   * Marks this control as a group (adds role="group" and aria-labelledby).
   * The label renders as a <span> instead of <label>.
   * Use for groups of related controls (e.g. CheckboxGroup).
   */
  group?: boolean;
  /**
   * ID for the control's form element, auto-generated if not provided
   */
  id?: string;
  /**
   * Label text for the control (or legend text when group is true)
   */
  label?: string;
  /**
   * Label position relative to the control
   */
  layout?: ControlLayout;
  /**
   * Size of the control and its inner elements
   */
  size?: ControlSize;
}

const props = withDefaults(defineProps<ControlProps>(), {
  appearance: "normal",
  error: null,
  group: false,
  id: () => useId(),
  layout: "vertical",
  size: "md",
});
</script>

<template>
  <div
    class="control"
    :class="[appearance, layout, `size-${size}`, { 'has-error': error, group }]"
    v-bind="group ? { role: 'group', 'aria-labelledby': id } : {}"
  >
    <component
      :is="group ? 'span' : 'label'"
      v-if="label"
      class="control-label"
      v-bind="group ? { id } : { for: id }"
    >
      {{ label }}
    </component>
    <div class="control-group">
      <div class="slot-wrapper" v-bind="$attrs">
        <slot :id />
      </div>
      <span v-if="error" class="control-error">{{ error }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control {
  // Size tokens — md is the default
  --control-font-size: var(--font-md);
  --control-py: 0.5rem;
  --control-px: 0.75rem;
  --control-gap: 0.5rem;
  --control-radius: var(--border-radius-md);
  --control-icon-size: 1rem;
  --control-inner-block-start: 1.25rem;
  --control-inner-block-end: 0.25rem;
  --control-label-block-start: 0.25rem;

  &.size-sm {
    --control-font-size: var(--font-sm);
    --control-py: 0.25rem;
    --control-px: 0.5rem;
    --control-gap: 0.25rem;
    --control-radius: var(--border-radius-sm);
    --control-icon-size: 0.75rem;
    --control-inner-block-start: 1rem;
    --control-inner-block-end: 0.15rem;
    --control-label-block-start: 0.2rem;
  }

  &.size-lg {
    --control-font-size: var(--font-lg);
    --control-py: 0.625rem;
    --control-px: 1rem;
    --control-gap: 0.5rem;
    --control-radius: var(--border-radius-md);
    --control-icon-size: 1.25rem;
    --control-inner-block-start: 1.75rem;
    --control-inner-block-end: 0.25rem;
    --control-label-block-start: 0.25rem;
  }

  &.size-xl {
    --control-font-size: var(--font-xl);
    --control-py: 0.75rem;
    --control-px: 1.25rem;
    --control-gap: 0.75rem;
    --control-radius: var(--border-radius-lg);
    --control-icon-size: 1.5rem;
    --control-inner-block-start: 2.25rem;
    --control-inner-block-end: 0.375rem;
    --control-label-block-start: 0.25rem;
  }

  margin: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;

  .control-label {
    font-size: var(--control-font-size);
    user-select: none;
  }

  .control-group {
    width: 100%;
  }

  .control-error {
    color: var(--color-danger);
    font-size: var(--control-font-size);
  }

  .slot-wrapper :deep(*) {
    font-size: var(--control-font-size);
  }

  &.has-error {
    .slot-wrapper :deep(*) {
      border-color: var(--color-danger);
      font-size: var(--control-font-size);
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
