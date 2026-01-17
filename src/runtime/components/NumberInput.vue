<script setup lang="ts">
import { ref, toRefs } from "vue";

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

const interval = ref<number | null>(null);
const timeout = ref<number | null>(null);

function pressAndHold(callback: () => void) {
  callback();
  timeout.value = window.setTimeout(() => {
    interval.value = window.setInterval(callback, 50);
  }, 500);
}

function stop() {
  if (timeout.value) {
    window.clearTimeout(timeout.value);
    timeout.value = null;
  }
  if (interval.value) {
    window.clearInterval(interval.value);
    interval.value = null;
  }
}

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
</script>

<template>
  <orio-control-element v-bind="$attrs">
    <div class="wrapper">
      <input
        v-bind="$attrs"
        v-model="modelValue"
        type="number"
        class="number-input"
      />
      <div class="controls">
        <orio-button
          appearance="minimal"
          icon="chevron-up"
          :disabled="Number.isFinite(max) && modelValue >= (max as number)"
          @mousedown="pressAndHold(() => setValidatedValue(modelValue + step))"
          @mouseup="stop"
          @mouseleave="stop"
        />
        <orio-button
          appearance="minimal"
          icon="chevron-down"
          :disabled="Number.isFinite(min) && modelValue <= (min as number)"
          @mousedown="pressAndHold(() => setValidatedValue(modelValue - step))"
          @mouseup="stop"
          @mouseleave="stop"
        />
      </div>
    </div>
  </orio-control-element>
</template>

<style scoped lang="scss">
@use "../assets/css/mixins" as *;

.number-input {
  @include base-input;
}

.wrapper {
  position: relative;
}

.controls {
  position: absolute;
  height: 100%;
  right: 3px;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  div {
    margin: 0.25rem;
  }
}
</style>
