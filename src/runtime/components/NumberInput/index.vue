<script setup lang="ts">
import { computed, toRefs, useTemplateRef } from "vue";
import { useFocus } from "@vueuse/core";
import type { ControlProps } from "../ControlElement.vue";
import type { InputLayout } from "../Input.vue";

export interface NumberInputProps extends Omit<ControlProps, "layout"> {
  layout?: InputLayout;
  min?: number;
  max?: number;
  step?: number;
  decimalPlaces?: number;
}

const props = withDefaults(defineProps<NumberInputProps>(), {
  layout: "vertical",
  min: undefined,
  max: undefined,
  step: 1,
  decimalPlaces: 0,
});

const { min, max, step, decimalPlaces } = toRefs(props);

const modelValue = defineModel<number | null>({ default: 0 });

const input = useTemplateRef("input");
const { focused } = useFocus(input);

function setValidatedValue(value: number | null) {
  let finalValue = value ?? 0;
  if (Number.isFinite(max.value) && finalValue > (max.value as number)) {
    finalValue = max.value as number;
  }

  if (Number.isFinite(min.value) && finalValue < (min.value as number)) {
    finalValue = min.value as number;
  }

  finalValue = Number((finalValue ?? 0).toFixed(decimalPlaces.value));

  modelValue.value = finalValue;
}

function onBlur() {
  setValidatedValue(modelValue.value);
}

function increase() {
  setValidatedValue((modelValue.value ?? 0) + step.value);
}

function decrease() {
  setValidatedValue((modelValue.value ?? 0) - step.value);
}

const isAtMax = computed(
  () =>
    Number.isFinite(max.value) &&
    (modelValue.value ?? 0) >= (max.value as number),
);

const isAtMin = computed(
  () =>
    Number.isFinite(min.value) &&
    (modelValue.value ?? 0) <= (min.value as number),
);

const controlProps = computed(() => {
  const {
    min: _min,
    max: _max,
    step: _step,
    decimalPlaces: _decimalPlaces,
    ...rest
  } = props;
  return rest;
});

const slotExpose = computed(() => ({
  increase,
  decrease,
  isAtMax: isAtMax.value,
  isAtMin: isAtMin.value,
}));

defineExpose({ input, focused });
</script>

<template>
  <orio-control-element
    v-slot="{ control }"
    v-bind="controlProps"
    :layout="layout === 'inner' ? 'vertical' : layout"
    :class="{ inner: layout === 'inner' }"
  >
    <div class="wrapper">
      <input
        v-bind="{ ...$attrs, ...control }"
        ref="input"
        v-model="modelValue"
        type="number"
        class="number-input"
        :min
        :max
        :step
        @blur="onBlur"
      />
      <div class="controls">
        <slot name="controls" v-bind="slotExpose" />
      </div>
    </div>
  </orio-control-element>
</template>

<style scoped lang="scss">
@use "../../assets/css/mixins" as *;

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}

.wrapper {
  position: relative;
}

.number-input {
  @include base-input;
}

.inner {
  @include inner-label;

  .number-input {
    padding: var(--control-inner-block-start) var(--control-px)
      var(--control-inner-block-end);
  }
}

.controls {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  pointer-events: none;

  :deep(button) {
    pointer-events: auto;
  }
}
</style>
