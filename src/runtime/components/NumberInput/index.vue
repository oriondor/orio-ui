<script setup lang="ts">
import { computed, ref, toRefs, useAttrs, useTemplateRef, watch } from "vue";
import { useFocus } from "@vueuse/core";
import type { ControlProps } from "../ControlElement.vue";
import type { InputLayout } from "../Input.vue";
import { roundTo } from "../../utils/decimal";

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

const modelValue = defineModel<number | null>({ default: null });

const input = useTemplateRef("input");
const { focused } = useFocus(input);
const attrs = useAttrs();

// `readonly` arrives as an attr (not a ControlProps key): "" / true / "readonly".
const isReadonly = () => attrs.readonly != null && attrs.readonly !== false;

function decimalsOf(value: number) {
  const [mantissa, exponent] = String(value).split("e");
  return Math.max(
    0,
    (mantissa.split(".")[1]?.length ?? 0) - Number(exponent ?? 0),
  );
}

const precision = computed(() =>
  Math.max(decimalPlaces.value, decimalsOf(step.value)),
);

function clamp(value: number) {
  let result = value;
  if (Number.isFinite(max.value) && result > (max.value as number)) {
    result = max.value as number;
  }
  if (Number.isFinite(min.value) && result < (min.value as number)) {
    result = min.value as number;
  }
  return result;
}

function normalize(value: number) {
  return clamp(roundTo(value, precision.value));
}

// Native number inputs only accept the plain "." form.
const formatDisplay = (value: number | null) =>
  value === null ? "" : String(value);

const display = ref(formatDisplay(modelValue.value));
// Only the initial attribute (SSR / native step base) is bound, via `.attr`.
// A bound `value` prop is re-applied by Vue on every re-render (resetting
// typed text) and also rewrites the attribute, so later changes go through
// the property here.
const initialDisplay = display.value;
watch(
  display,
  (text) => {
    if (input.value && input.value.value !== text) input.value.value = text;
  },
  { flush: "post" },
);

// Not `focused.value`: the slot re-render resets the template ref, which
// makes useFocus drop its state mid-typing.
const isTyping = () =>
  input.value !== null && document.activeElement === input.value;

const parseDisplay = (raw: string) => (raw === "" ? null : Number(raw));

// External model changes re-render the text, unless the user is typing
// something that already equals the model (compare like Vue's vModelText).
watch(modelValue, () => {
  if (!isTyping() || parseDisplay(display.value) !== modelValue.value) {
    display.value = formatDisplay(modelValue.value);
  }
});

function onInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value;
  display.value = raw;
  // `+ 0` keeps -0 out of the model.
  modelValue.value = raw === "" ? null : Number(raw) + 0;
}

function commit(value: number) {
  modelValue.value = value;
  display.value = formatDisplay(value);
}

function onBlur(event: FocusEvent) {
  // A readonly field only shows: no clamp, no commit.
  if (isReadonly()) return;
  const element = event.target as HTMLInputElement;
  // Native number input reports any bad input ("-", "e", a trailing "."
  // in Chrome) as empty (model null) but keeps showing it; clear so the
  // field matches the model. Intentional: "1." is dropped, not kept as 1.
  if (element.validity.badInput) {
    element.value = "";
    display.value = "";
  }
  if (modelValue.value === null) return;
  const target = normalize(modelValue.value);
  if (target !== modelValue.value) commit(target);
}

function stepBy(delta: number) {
  const base =
    modelValue.value ?? (Number.isFinite(min.value) ? min.value! : 0);
  commit(normalize(base + delta));
}

function increase() {
  if (props.disabled || isReadonly()) return;
  stepBy(step.value);
}

function decrease() {
  if (props.disabled || isReadonly()) return;
  stepBy(-step.value);
}

const isAtMax = computed(
  () =>
    modelValue.value !== null &&
    Number.isFinite(max.value) &&
    modelValue.value >= (max.value as number),
);

const isAtMin = computed(
  () =>
    modelValue.value !== null &&
    Number.isFinite(min.value) &&
    modelValue.value <= (min.value as number),
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
        type="number"
        :value.attr="initialDisplay"
        class="number-input"
        :min
        :max
        :step
        @input="onInput"
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
  inline-size: 100%;
  min-inline-size: 0;
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
