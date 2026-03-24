<script setup lang="ts">
import { computed, toRef, useId } from "vue";
import { provideControlSize, sizeTokens } from "../composables/useControlSize";

defineOptions({ inheritAttrs: false });

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

provideControlSize(toRef(props, "size"));
const sizeStyle = computed(() => sizeTokens[props.size]);
</script>

<template>
  <div
    class="control"
    :class="[appearance, layout, `size-${size}`, { 'has-error': error, group }]"
    :style="sizeStyle"
    v-bind="{
      ...$attrs,
      ...(group
        ? { role: 'group', ...(label ? { 'aria-labelledby': id } : {}) }
        : {}),
    }"
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
      <div class="slot-wrapper">
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
    font-size: var(--control-label-font-size);
    user-select: none;
  }

  .control-group {
    width: 100%;
  }

  .control-error {
    color: var(--color-danger);
    font-size: var(--control-label-font-size);
  }

  .slot-wrapper :deep(*) {
    font-size: var(--control-font-size);
  }

  &.has-error {
    .slot-wrapper {
      border: 1px solid var(--color-danger);
    }

    .slot-wrapper :deep(*) {
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
