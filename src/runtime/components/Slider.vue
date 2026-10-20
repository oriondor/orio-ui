<script setup lang="ts">
import { computed } from "vue";
import type { ControlProps } from "./ControlElement.vue";

interface Props extends ControlProps {
  min?: number;
  max?: number;
  step?: number;
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
});

const modelValue = defineModel<number>({ default: 0 });

// Zero, negative or non-finite step would divide into NaN; fall back to 1.
const safeStep = computed(() =>
  Number.isFinite(props.step) && props.step > 0 ? props.step : 1,
);

function decimalsOf(number: number) {
  return (String(number).split(".")[1] ?? "").length;
}

// Values sit on min + k * step, so keep the precision of both.
const precision = computed(() =>
  Math.max(decimalsOf(props.min), decimalsOf(safeStep.value)),
);

function normalize(value: number) {
  const stepped =
    props.min +
    Math.round((value - props.min) / safeStep.value) * safeStep.value;
  const clamped = Math.min(props.max, Math.max(props.min, stepped));
  return Number(clamped.toFixed(precision.value));
}

const value = computed(() => normalize(modelValue.value));

const percent = computed(() =>
  props.max === props.min
    ? "0%"
    : `${((value.value - props.min) / (props.max - props.min)) * 100}%`,
);

function onInput(event: Event) {
  modelValue.value = normalize(
    Number((event.target as HTMLInputElement).value),
  );
}
</script>

<template>
  <orio-control-element v-slot="{ control }" v-bind="props">
    <slot name="before" />
    <input
      type="range"
      :min
      :max
      :step="safeStep"
      :value
      v-bind="{ ...$attrs, ...control }"
      @input="onInput"
    />
    <slot name="after" />
  </orio-control-element>
</template>

<style lang="scss" scoped>
@mixin thumb {
  box-sizing: border-box;
  width: var(--control-slider-thumb);
  height: var(--control-slider-thumb);
  border-radius: 50%;
  background: var(--color-accent-hover);
  border: calc(var(--control-slider-thumb) / 4.5) solid var(--color-bg);
  box-shadow: 0 0 0 1px var(--color-accent);
  cursor: pointer;
}

:deep(.slot-wrapper) {
  display: flex;
  align-items: center;
  gap: var(--control-gap);
}

input {
  flex: 1;
  min-width: 0;
  height: var(--control-slider-thumb);
  margin: 0;
  background: transparent;
  appearance: none;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: var(--control-slider-track);
    background: linear-gradient(
      to right,
      var(--color-accent) v-bind(percent),
      var(--color-border) v-bind(percent)
    );
  }

  &::-webkit-slider-thumb {
    @include thumb;
    appearance: none;
    margin-top: calc(
      (var(--control-slider-track) - var(--control-slider-thumb)) / 2
    );
  }

  &::-moz-range-track {
    height: var(--control-slider-track);
    background: var(--color-border);
  }

  &::-moz-range-progress {
    height: var(--control-slider-track);
    background: var(--color-accent);
  }

  &::-moz-range-thumb {
    @include thumb;
  }

  &:focus-visible {
    outline: none;

    &::-webkit-slider-thumb {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }

    &::-moz-range-thumb {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &::-webkit-slider-thumb {
      cursor: not-allowed;
    }

    &::-moz-range-thumb {
      cursor: not-allowed;
    }
  }
}
</style>
