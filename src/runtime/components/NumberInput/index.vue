<script setup lang="ts">
import { computed, toRefs } from "vue";

interface Props {
  min?: number;
  max?: number;
  step?: number;
  decimalPlaces?: number;
}

const props = withDefaults(defineProps<Props>(), {
  min: undefined,
  max: undefined,
  step: 1,
  decimalPlaces: 0,
});

const { min, max, step, decimalPlaces } = toRefs(props);

const modelValue = defineModel<number>({ default: 0 });

function setValidatedValue(value: number) {
  let finalValue = value;

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
  setValidatedValue(modelValue.value + step.value);
}

function decrease() {
  setValidatedValue(modelValue.value - step.value);
}

const isAtMax = computed(
  () => Number.isFinite(max.value) && modelValue.value >= (max.value as number),
);

const isAtMin = computed(
  () => Number.isFinite(min.value) && modelValue.value <= (min.value as number),
);

const slotExpose = computed(() => ({
  increase,
  decrease,
  isAtMax: isAtMax.value,
  isAtMin: isAtMin.value,
}));
</script>

<template>
  <orio-control-element v-bind="$attrs">
    <div class="wrapper">
      <input
        v-bind="$attrs"
        v-model="modelValue"
        type="number"
        class="number-input"
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

.wrapper {
  position: relative;
}

.number-input {
  @include base-input;
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
