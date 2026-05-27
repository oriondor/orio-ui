<script setup lang="ts">
import type { ControlProps } from "./ControlElement.vue";

export interface RadioButtonProps extends ControlProps {
  /** The value this radio represents; compared to v-model to determine checked state */
  value?: unknown;
  /** Inline label text (alternative to default slot) */
  text?: string;
  /** Visually hides the label while keeping it accessible to SR (screen readers) */
  hideLabel?: boolean;
}

const modelValue = defineModel<unknown>();

const props = defineProps<RadioButtonProps>();
</script>

<template>
  <orio-control-element v-slot="{ control }" v-bind="props" class="radio">
    <label class="radio-label">
      <input
        v-model="modelValue"
        v-bind="control"
        type="radio"
        :value="value"
        class="radio-input"
        tabindex="-1"
      />
      <span class="radio-box" />
      <span
        v-if="text || $slots.default"
        class="radio-text"
        :class="{ 'sr-only': hideLabel }"
      >
        <slot>{{ text }}</slot>
      </span>
    </label>
  </orio-control-element>
</template>

<style lang="scss" scoped>
.radio {
  --box-size: var(--control-icon-size, 1rem);

  &-label {
    position: relative;
    user-select: none;
    display: inline-flex;
    align-items: center;
    gap: var(--control-gap, 0.4rem);
    color: var(--color-text);
    cursor: pointer;
  }

  &-input {
    position: absolute;
    inset: 0;
    width: var(--box-size);
    height: 1rem;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }

  &-box {
    cursor: pointer;
    flex-shrink: 0;
    width: var(--box-size);
    height: var(--box-size);
    border: 2px solid var(--color-border);
    border-radius: var(--border-radius-pill);
    background-color: var(--color-bg);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;
  }

  .radio-input:checked + .radio-box {
    background-color: var(--color-accent);
    border-color: var(--color-accent);

    &::after {
      position: absolute;
      content: "";
      width: calc(var(--box-size) * 0.4);
      height: calc(var(--box-size) * 0.4);
      border-radius: var(--border-radius-pill);
      background-color: var(--color-accent-ink);
    }
  }

  &-label:hover .radio-box {
    border-color: var(--color-accent);
  }

  .radio-input:focus-visible + .radio-box {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
