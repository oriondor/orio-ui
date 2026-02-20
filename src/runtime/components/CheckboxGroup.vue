<script setup lang="ts">
import { type ControlProps } from "./ControlElement.vue";

export interface CheckboxOption {
  label: string;
  value: unknown;
}

export interface CheckboxGroupProps extends Omit<
  ControlProps,
  "appearance" | "group" | "id"
> {
  options?: CheckboxOption[];
}

const props = withDefaults(defineProps<CheckboxGroupProps>(), {
  options: () => [],
  layout: "vertical",
  size: "md",
  error: null,
});

const modelValue = defineModel<unknown[]>({ default: () => [] });

function isChecked(value: unknown): boolean {
  return modelValue.value.includes(value);
}

function toggle(value: unknown): void {
  if (isChecked(value)) {
    modelValue.value = modelValue.value.filter((v) => v !== value);
  } else {
    modelValue.value = [...modelValue.value, value];
  }
}
</script>

<template>
  <orio-control-element group :label :layout :size :error class="group-control">
    <div class="checkboxes">
      <slot>
        <orio-check-box
          v-for="option in options"
          :key="String(option.value)"
          appearance="minimal"
          :model-value="isChecked(option.value)"
          @update:model-value="toggle(option.value)"
        >
          {{ option.label }}
        </orio-check-box>
      </slot>
    </div>
  </orio-control-element>
</template>

<style lang="scss" scoped>
.checkboxes {
  display: flex;
  flex-direction: column;
}

.group-control.control.horizontal {
  align-items: flex-start;
}
</style>
