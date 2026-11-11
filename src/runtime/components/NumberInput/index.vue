<script setup lang="ts">
import { computed, ref, toRefs, useAttrs, useTemplateRef, watch } from "vue";
import { useFocus } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import type { ControlProps } from "../ControlElement.vue";
import type { InputLayout } from "../Input.vue";
import { useDecimalFormatter } from "../../composables/useDecimalFormatter";

export type NumberInputType = "text" | "number";

export interface NumberInputProps extends Omit<ControlProps, "layout"> {
  layout?: InputLayout;
  type?: NumberInputType;
  min?: number;
  max?: number;
  step?: number;
  decimalPlaces?: number;
}

const props = withDefaults(defineProps<NumberInputProps>(), {
  layout: "vertical",
  type: "text",
  min: undefined,
  max: undefined,
  step: 1,
  decimalPlaces: 0,
});

const { min, max, step, decimalPlaces, type } = toRefs(props);

const modelValue = defineModel<number | null>({ default: null });

const input = useTemplateRef("input");
const { focused } = useFocus(input);
const { toNumber } = useDecimalFormatter();
const { locale } = useI18n();
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

// Decimal-exponent rounding: avoids binary float errors (1.005 -> 1.01),
// half away from zero.
function roundTo(value: number, places: number) {
  const sign = value < 0 ? -1 : 1;
  // Split "1e-7" so the exponent can be shifted instead of appended to.
  const [mantissa, exponent = "0"] = String(Math.abs(value)).split("e");
  const shifted = Math.round(
    Number(`${mantissa}e${Number(exponent) + places}`),
  );
  // Beyond 2^53 the shift is lossy and String() goes exponential ("1e+21"),
  // which would break the re-parse; such values have no fraction to round.
  if (!Number.isSafeInteger(shifted)) return value;
  // `+ 0` turns -0 (e.g. -0.4 at 0 places) into 0.
  return sign * Number(`${shifted}e-${places}`) + 0;
}

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

function formatDisplay(value: number | null) {
  if (value === null) return "";
  // Native number inputs only accept the plain "." form.
  if (type.value === "number") return String(value);
  return new Intl.NumberFormat(locale.value, {
    useGrouping: false,
    maximumFractionDigits: 20,
  }).format(value);
}

const display = ref(formatDisplay(modelValue.value));

// Not `focused.value`: the slot re-render resets the template ref, which
// makes useFocus drop its state mid-typing.
const isTyping = () =>
  input.value !== null && document.activeElement === input.value;

// Number mode: the browser already normalised the text; compare like
// Vue's vModelText does instead of rewriting what the user typed.
const parseDisplay = (raw: string) =>
  type.value === "number" ? (raw === "" ? null : Number(raw)) : toNumber(raw);

// External model/locale changes re-render the text, unless the user is
// typing something that already parses to the model (don't clobber "1,").
watch([modelValue, locale], () => {
  if (!isTyping() || parseDisplay(display.value) !== modelValue.value) {
    display.value = formatDisplay(modelValue.value);
  }
});

function onInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value;
  display.value = raw;
  if (type.value === "number") {
    // `+ 0` keeps -0 out of the model.
    modelValue.value = raw === "" ? null : Number(raw) + 0;
    return;
  }
  if (raw.trim() === "") {
    modelValue.value = null;
    return;
  }
  const parsed = toNumber(raw);
  // Unparsable mid-typing ("-", "abc") keeps the last model value.
  if (parsed !== null) modelValue.value = parsed + 0;
}

function commit(value: number) {
  modelValue.value = value;
  display.value = formatDisplay(value);
}

function onBlur(event: FocusEvent) {
  if (type.value === "number") {
    const element = event.target as HTMLInputElement;
    // Native number input reports "-" / "e" as empty (model null) but keeps
    // showing it; clear so the field matches the model.
    if (element.validity.badInput) {
      element.value = "";
      display.value = "";
    }
    if (modelValue.value === null) return;
    const target = normalize(modelValue.value);
    if (target !== modelValue.value) commit(target);
    return;
  }
  if (display.value.trim() === "") return;
  const parsed = toNumber(display.value);
  if (parsed === null) {
    display.value = formatDisplay(modelValue.value);
    return;
  }
  const target = normalize(parsed);
  // Valid value: keep the typed text and the model untouched.
  if (target !== parsed || Object.is(parsed, -0)) commit(target);
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

// Text mode has no native stepper; number mode keeps the browser's own.
function onArrow(event: KeyboardEvent, action: () => void) {
  if (type.value !== "text") return;
  event.preventDefault();
  action();
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
    type: _type,
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
        :type
        :inputmode="
          $attrs.inputmode ?? (type === 'text' ? 'decimal' : undefined)
        "
        :value="display"
        class="number-input"
        :min="type === 'number' ? min : undefined"
        :max="type === 'number' ? max : undefined"
        :step="type === 'number' ? step : undefined"
        @input="onInput"
        @blur="onBlur"
        @keydown.up="onArrow($event, increase)"
        @keydown.down="onArrow($event, decrease)"
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
