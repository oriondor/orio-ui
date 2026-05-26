<script setup lang="ts">
import { computed, toRef, useId } from "vue";
import { provideControlSize, sizeTokens } from "../composables/useControlSize";

defineOptions({ inheritAttrs: false });

export type ControlLayout = "vertical" | "horizontal";
export type ControlSize = "sm" | "md" | "lg" | "xl";

/**
 * A11y + form attrs that flow from the caller through ControlElement to the
 * actual interactive element via the `control` slot prop. Never rendered on
 * the wrapper itself.
 */
export interface ControlPassthroughProps {
  /** Native `tabindex` for the inner element. */
  tabindex?: number | string;
  /** Roving-focus identifier — see useRovingGrid. Rendered as `focus-key` DOM attr. */
  focusKey?: string;
  /** Disables the inner element AND drives wrapper disabled styling. */
  disabled?: boolean;
  /** Marks the inner element required and sets `aria-required`. */
  required?: boolean;
  /** Native `name` attribute for the inner form element. */
  name?: string;
  /** Accessible name for the inner element when no visible label is set. */
  ariaLabel?: string;
}

export interface ControlProps extends ControlPassthroughProps {
  /** Minimal resets margin and removes border/box-shadow from every element inside the slot. */
  appearance?: "normal" | "minimal";
  /** Error message to display below the control. Also drives `aria-invalid` and `aria-describedby` on the inner element. */
  error?: string | null;
  /** Marks this control as a group (adds role="group" + aria-labelledby on the wrapper). The label renders as a <span> instead of <label>. Use for groups of related controls (e.g. CheckboxGroup). */
  group?: boolean;
  /** ID for the inner form element. Auto-generated if not provided. */
  id?: string;
  /** Label text for the control (or legend text when group is true). */
  label?: string;
  /** Label position relative to the control. */
  layout?: ControlLayout;
  /** Size of the control and its inner elements. */
  size?: ControlSize;
  /** Whether the element should fill the container. */
  fill?: boolean;
}

/**
 * Bag the consumer spreads onto the inner interactive element via the `control`
 * slot prop: `<input v-bind="control" />`. Extends the caller-facing
 * passthrough props with attrs derived from ControlElement state
 * (`aria-invalid` from `error`, `aria-describedby` pointing at the error span,
 * etc.) and the required `id`.
 */
export interface ControlSlotAttrs extends ControlPassthroughProps {
  id: string;
  ariaDescribedby?: string;
  ariaInvalid?: boolean;
  ariaRequired?: boolean;
}

const props = withDefaults(defineProps<ControlProps>(), {
  appearance: "normal",
  error: null,
  group: false,
  id: () => useId(),
  layout: "vertical",
  size: "md",
  fill: false,
});

provideControlSize(toRef(props, "size"));
const sizeStyle = computed(() => sizeTokens[props.size]);

const errorId = computed(() => (props.error ? `${props.id}-error` : undefined));

const control = computed<ControlSlotAttrs>(() => ({
  id: props.id,
  tabindex: props.tabindex,
  focusKey: props.focusKey,
  disabled: props.disabled || undefined,
  required: props.required || undefined,
  name: props.name,
  ariaLabel: props.ariaLabel,
  ariaDescribedby: errorId.value,
  ariaInvalid: props.error ? true : undefined,
  ariaRequired: props.required || undefined,
}));
</script>

<template>
  <div
    class="control"
    :class="[
      appearance,
      layout,
      `size-${size}`,
      { 'has-error': error, group, fill, disabled },
      $attrs.class,
    ]"
    :style="[sizeStyle, $attrs.style as never]"
    v-bind="
      group
        ? { role: 'group', ...(label ? { 'aria-labelledby': id } : {}) }
        : {}
    "
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
        <slot :id :control />
      </div>
      <span v-if="error" :id="errorId" class="control-error">{{ error }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control {
  margin: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  border-radius: var(--control-radius);

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

  &.fill .slot-wrapper {
    display: flex;

    & > * {
      flex: 1;
    }
  }

  .slot-wrapper :deep(*) {
    font-size: var(--control-font-size);
  }

  &.has-error {
    // If component has .error-fields - we want manual error handling for it
    // Can be improved in the future though
    .slot-wrapper:not(:has(:deep(.error-fields))) {
      border: 1px solid var(--color-danger);
    }

    .slot-wrapper :deep(.error-fields .slot-wrapper > *) {
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
