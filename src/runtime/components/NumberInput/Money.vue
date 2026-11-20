<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  useAttrs,
  useId,
  useTemplateRef,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import type { ControlProps } from "../ControlElement.vue";
import type { InputLayout } from "../Input.vue";
import { roundTo, shiftDecimal } from "../../utils/decimal";
import {
  FALLBACK_LOCALE,
  formatMoney,
  inspectModel,
  moneyFormats,
  parseMoney,
} from "../../utils/money";
defineOptions({ inheritAttrs: false });

export interface NumberInputMoneyProps extends Omit<ControlProps, "layout"> {
  layout?: InputLayout;
  /** ISO 4217 code, e.g. "USD". */
  currency: string;
  /** BCP 47 tag. Default: the browser locale (known on the client only). */
  locale?: string;
  currencyDisplay?: Intl.NumberFormatOptions["currencyDisplay"];
  /** Fraction digits. Default: the currency's own (USD 2, JPY 0, KWD 3). */
  decimalPlaces?: number;
  /** Model is an integer of minor units (cents) instead of major units. */
  minorUnits?: boolean;
  /** In model units. Pass `-Infinity` to allow any negative. */
  min?: number;
  /** In model units. */
  max?: number;
  /** Step of `increase`/`decrease`, in major units. */
  step?: number;
}

const props = withDefaults(defineProps<NumberInputMoneyProps>(), {
  layout: "vertical",
  locale: undefined,
  currencyDisplay: "symbol",
  decimalPlaces: undefined,
  minorUnits: false,
  min: 0,
  max: undefined,
  step: 1,
});

const modelValue = defineModel<number | null>({ default: null });

const field = useTemplateRef("field");
const attrs = useAttrs();
const { t, locale: uiLocale } = useI18n();
const fieldId = props.id ?? useId();
const currencyId = `${fieldId}-currency`;

const isReadonly = () => attrs.readonly != null && attrs.readonly !== false;

const browserLocale = ref<string>();
onMounted(() => {
  browserLocale.value = navigator.language;
});
const activeLocale = computed(
  () => props.locale ?? browserLocale.value ?? FALLBACK_LOCALE,
);

const formats = computed(() =>
  moneyFormats(
    activeLocale.value,
    props.currency,
    props.currencyDisplay,
    props.decimalPlaces,
  ),
);

// The description follows the UI language (i18n), not the field's number locale.
const currencyName = computed(() => {
  try {
    return (
      new Intl.DisplayNames(uiLocale.value, { type: "currency" }).of(
        props.currency,
      ) ?? props.currency
    );
  } catch {
    return props.currency;
  }
});

// `min`/`max` are in model units (cents with `minorUnits`); `step` is always in
// major units. Missing or non-finite bounds do not limit.
const finiteOr = (value: number | undefined, fallback: number) =>
  value !== undefined && Number.isFinite(value) ? value : fallback;
const bounds = computed(() => ({
  lowest: finiteOr(props.min, -Infinity),
  highest: finiteOr(props.max, Infinity),
}));
const clamp = (value: number) =>
  Math.max(Math.min(value, bounds.value.highest), bounds.value.lowest);

const inspect = (value: number) =>
  inspectModel(value, formats.value.places, props.minorUnits);
const format = (value: number | null, editing: boolean) =>
  formatMoney(value, formats.value, props.minorUnits, editing);
const parse = (raw: string) =>
  parseMoney(raw, formats.value, props.minorUnits, bounds.value.lowest < 0);

const typing = ref(false);
// Set while the text was typed or pasted (not an untouched outside value).
const dirty = ref(false);
// "incomplete" may still become valid (blocks submit, no visible error until
// blur); "outOfRange": blur found a clamp bound the field cannot show.
const status = ref<"ok" | "incomplete" | "invalid" | "tooLarge" | "outOfRange">(
  "ok",
);
const hasParseError = computed(
  () => status.value === "invalid" || status.value === "tooLarge",
);
const display = ref(format(modelValue.value, false));

function resetTyping() {
  dirty.value = false;
  status.value = "ok";
}

// An outside model that cannot be shown exactly is never rewritten or emitted.
const modelUnshowable = computed(
  () => modelValue.value !== null && inspect(modelValue.value).text === null,
);
watch(
  modelUnshowable,
  (unshowable) => {
    if (unshowable) {
      console.warn(
        `[orio-number-input-money] model ${modelValue.value} cannot be shown exactly with ${formats.value.places} decimals`,
      );
    }
  },
  { immediate: true },
);

watch(
  [modelValue, formats, () => props.minorUnits],
  () => {
    // Own echo of a valid typed value must not be rewritten ("12.", "1,234").
    if (typing.value && parse(display.value) === modelValue.value) return;
    resetTyping();
    display.value = format(modelValue.value, typing.value);
  },
  { flush: "pre" },
);

function onInput(raw: string) {
  display.value = raw;
  dirty.value = true;
  const parsed = parse(raw);
  status.value = typeof parsed === "string" ? parsed : "ok";
  // Incomplete input keeps the last valid model until blur judges it.
  if (typeof parsed !== "string") modelValue.value = parsed;
}

function onFocus() {
  typing.value = true;
  if (!hasParseError.value) display.value = format(modelValue.value, true);
}

function commit(value: number | null) {
  resetTyping();
  modelValue.value = value;
  display.value = format(value, typing.value);
}

function onBlur() {
  typing.value = false;
  // A readonly field only shows: restore the text, never clamp or commit.
  if (isReadonly()) {
    resetTyping();
    display.value = format(modelValue.value, false);
    return;
  }
  // Only text the user typed is judged; an untouched outside value just clamps.
  if (dirty.value) {
    const parsed = parse(display.value);
    if (typeof parsed === "string") {
      // Unparsable text stays so the user can fix it; the error stays too.
      status.value = parsed === "tooLarge" ? "tooLarge" : "invalid";
      return;
    }
  }
  if (modelUnshowable.value) return;
  if (modelValue.value === null) return commit(null);
  const clamped = clamp(modelValue.value);
  // Same rule as stepBy: never emit a bound the field cannot show exactly.
  if (inspect(clamped).text === null) {
    resetTyping();
    display.value = format(modelValue.value, false);
    status.value = "outOfRange";
    return;
  }
  commit(clamped);
}

function stepBy(delta: number) {
  if (!Number.isFinite(delta) || modelUnshowable.value) return;
  const places = formats.value.places;
  // A step finer than the field's decimals cannot be shown, so it is refused.
  if (inspectModel(Math.abs(delta), places, false).text === null) return;
  const unit = props.minorUnits ? shiftDecimal(delta, places) : delta;
  const { lowest } = bounds.value;
  const base = modelValue.value ?? (Number.isFinite(lowest) ? lowest : 0);
  const result = clamp(roundTo(base + unit, props.minorUnits ? 0 : places));
  // Never emit a value the field cannot show exactly (ceiling, NaN, Infinity).
  if (inspect(result).text === null) return;
  commit(result);
}

function increase() {
  if (props.disabled || isReadonly()) return;
  stepBy(props.step);
}

function decrease() {
  if (props.disabled || isReadonly()) return;
  stepBy(-props.step);
}

// Copy and cut put the raw value on the clipboard, never the formatted one.
function rawText() {
  if (modelValue.value === null) return null;
  // Only when the shown text IS the model; otherwise the native copy is honest.
  if (parse(display.value) !== modelValue.value) return null;
  const { text } = inspect(modelValue.value);
  if (text === null) return null;
  return text.includes(".") ? text.replace(/\.?0+$/, "") : text;
}

// "1.234" alone reads as grouping in de-DE, so a 3-digit fraction gets a "0".
const clipboardText = (text: string) =>
  /\.\d{3}$/.test(text) ? `${text}0` : text;

function onClipboard(event: ClipboardEvent) {
  const input = field.value?.input;
  const text = rawText();
  if (!input || text === null || !event.clipboardData) return;
  const { selectionStart, selectionEnd, value } = input;
  // A partial selection copies as selected.
  if (
    selectionStart !== selectionEnd &&
    !(selectionStart === 0 && selectionEnd === value.length)
  ) {
    return;
  }
  event.clipboardData.setData("text/plain", clipboardText(text));
  event.preventDefault();
  if (event.type === "cut" && selectionStart !== selectionEnd) {
    if (!props.disabled && !isReadonly()) onInput("");
  }
}

const slotExpose = computed(() => ({
  increase,
  decrease,
  isAtMax:
    modelValue.value !== null && modelValue.value >= bounds.value.highest,
  isAtMin: modelValue.value !== null && modelValue.value <= bounds.value.lowest,
}));

const isOutOfRange = computed(
  () =>
    modelValue.value !== null &&
    (modelValue.value > bounds.value.highest ||
      modelValue.value < bounds.value.lowest),
);
const invalid = computed(
  () =>
    hasParseError.value ||
    status.value === "incomplete" ||
    modelUnshowable.value ||
    isOutOfRange.value,
);

const invalidMessage = computed(() => {
  const reason = hasParseError.value
    ? status.value
    : modelValue.value === null
      ? null
      : inspect(modelValue.value).reason;
  return reason === "tooLarge"
    ? t("moneyInput.tooLarge")
    : t(
        formats.value.places === 0
          ? "moneyInput.invalidWhole"
          : "moneyInput.invalid",
        { places: formats.value.places },
      );
});
const builtInError = computed(() =>
  hasParseError.value || modelUnshowable.value ? invalidMessage.value : null,
);
const outOfRangeMessage = computed(() =>
  isOutOfRange.value ? t("moneyInput.outOfRange") : "",
);
// An empty consumer error ("") must not hide the built-in one.
const error = computed(
  () =>
    props.error ||
    builtInError.value ||
    (status.value === "outOfRange" ? outOfRangeMessage.value : ""),
);

// Native form validation: bad, unfinished or out-of-range text blocks submit.
// One computed, so a language switch updates the message too.
const validityMessage = computed(
  () =>
    builtInError.value ??
    (status.value === "incomplete"
      ? invalidMessage.value
      : outOfRangeMessage.value),
);
watch(
  [() => field.value?.input, validityMessage],
  ([input, message]) => input?.setCustomValidity(message),
  { flush: "post" },
);

// The visible text is localised, so the form carries a hidden canonical value
// in model units; empty when the text is invalid, incomplete or unshowable.
const submitValue = computed(() => {
  const text = rawText();
  if (invalid.value || text === null) return "";
  return props.minorUnits ? String(modelValue.value) : text;
});

// The visible input keeps `form` via $attrs; the hidden one needs it too.
const formAttribute = computed(() => attrs.form as string | undefined);

const describedBy = computed(() =>
  [attrs["aria-describedby"], currencyId].filter(Boolean).join(" "),
);

const controlProps = computed(() => {
  const {
    currency: _currency,
    locale: _locale,
    currencyDisplay: _currencyDisplay,
    decimalPlaces: _decimalPlaces,
    minorUnits: _minorUnits,
    min: _min,
    max: _max,
    step: _step,
    name: _name,
    ...rest
  } = props;
  return { ...rest, id: fieldId, error: error.value };
});

function focusInput() {
  if (!props.disabled) field.value?.input?.focus();
}

defineExpose({
  input: computed(() => field.value?.input ?? null),
  focused: computed({
    get: () => field.value?.focused ?? false,
    set: (value: boolean) => {
      if (field.value) field.value.focused = value;
    },
  }),
  invalid,
});
</script>

<template>
  <orio-input
    ref="field"
    v-bind="{
      inputmode: 'decimal',
      autocomplete: 'off',
      ...$attrs,
      ...controlProps,
      type: 'text',
    }"
    :model-value="display"
    class="money"
    :aria-describedby="describedBy"
    @update:model-value="onInput"
    @focus="onFocus"
    @blur="onBlur"
    @copy="onClipboard"
    @cut="onClipboard"
  >
    <template #before>
      <span
        v-if="formats.affix?.position === 'before'"
        class="affix"
        aria-hidden="true"
        @pointerdown.prevent="focusInput"
      >
        {{ formats.affix.text }}
      </span>
    </template>
    <template #after>
      <span
        v-if="formats.affix?.position === 'after'"
        class="affix"
        aria-hidden="true"
        @pointerdown.prevent="focusInput"
      >
        {{ formats.affix.text }}
      </span>
      <slot name="controls" v-bind="slotExpose" />
      <input
        v-if="name"
        type="hidden"
        :name
        :form="formAttribute"
        :value="submitValue"
        :disabled="disabled"
      />
      <span :id="currencyId" class="visually-hidden">
        {{ t("moneyInput.currency", { name: currencyName }) }}
      </span>
    </template>
  </orio-input>
</template>

<style scoped lang="scss">
.money {
  // Accounting alignment: digits end-aligned, prefix stays at the start edge.
  :deep(input) {
    text-align: end;
    font-variant-numeric: tabular-nums;
  }
}

// Doubled class: beats ControlElement's `.slot-wrapper *` font-size rule.
.money.money :deep(.affix) {
  flex-shrink: 0;
  white-space: nowrap;
  user-select: none;
  color: var(--color-muted);

  @media (pointer: coarse) {
    font-size: max(16px, var(--control-font-size));
  }
}

.visually-hidden {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
