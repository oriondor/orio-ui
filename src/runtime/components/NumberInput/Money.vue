<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  toRefs,
  useAttrs,
  useId,
  useTemplateRef,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import type { ControlProps } from "../ControlElement.vue";
import type { InputLayout } from "../Input.vue";
import { plainDecimal, roundTo, shiftDecimal } from "../../utils/decimal";

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

const { min, max } = toRefs(props);
const modelValue = defineModel<number | null>({ default: null });

const field = useTemplateRef("field");
const attrs = useAttrs();
const { t, locale: uiLocale } = useI18n();
const fieldId = props.id ?? useId();
const currencyId = `${fieldId}-currency`;

const isReadonly = () => attrs.readonly != null && attrs.readonly !== false;

// The browser locale does not exist on the server. Until mounted, server and
// first client render share this fallback, so hydration cannot mismatch.
const FALLBACK_LOCALE = "en-US";
const MAX_PLACES = 20;
const browserLocale = ref<string>();
onMounted(() => {
  browserLocale.value = navigator.language;
});
const activeLocale = computed(
  () => props.locale ?? browserLocale.value ?? FALLBACK_LOCALE,
);

// Bidi marks: LRM, RLM, ALM.
const stripBidiMarks = (raw: string) =>
  raw.replace(/[\u200E\u200F\u061C]/g, "");
// Any whitespace (incl. NBSP, NNBSP) is one space; typographic apostrophe is "'".
const canonical = (raw: string) =>
  raw.replace(/\s/g, " ").replace(/\u2019/g, "'");
// Every \p{Nd} block is a contiguous run of 0-9: the digit is the offset into it.
const toAsciiDigit = (char: string) => {
  const codePoint = char.codePointAt(0)!;
  let offset = 0;
  while (/^\p{Nd}$/u.test(String.fromCodePoint(codePoint - offset - 1))) {
    offset++;
  }
  return String(offset % 10);
};

// Decimals must fit Intl (0..100) and stay sane: 0..20 integers only.
function resolvePlaces(fallback: number) {
  const requested = props.decimalPlaces;
  if (requested === undefined) return fallback;
  if (
    Number.isInteger(requested) &&
    requested >= 0 &&
    requested <= MAX_PLACES
  ) {
    return requested;
  }
  console.warn(
    `[orio-number-input-money] decimalPlaces must be an integer 0-${MAX_PLACES}, got ${requested}`,
  );
  return fallback;
}

function buildFormats(locale: string) {
  // latn: values the component formats use Latin digits (parsing reads native ones).
  const base = { numberingSystem: "latn" };
  const currencyParts = (
    currencyDisplay: Intl.NumberFormatOptions["currencyDisplay"],
  ) =>
    new Intl.NumberFormat(locale, {
      ...base,
      style: "currency",
      currency: props.currency,
      currencyDisplay,
    });
  const currencyFormat = currencyParts(props.currencyDisplay);
  const places = resolvePlaces(
    currencyFormat.resolvedOptions().maximumFractionDigits!,
  );
  const parts = currencyFormat.formatToParts(1234.5);
  const affixIndex = parts.findIndex((part) => part.type === "currency");
  const integerIndex = parts.findIndex((part) => part.type === "integer");
  const marks = new Intl.NumberFormat(locale, {
    ...base,
    minimumFractionDigits: 1,
  }).formatToParts(1234567.5);
  const mark = (type: string) =>
    canonical(marks.find((part) => part.type === type)?.value ?? "");
  // Accepted currency tokens: whatever is displayed, plus symbol, narrow symbol and code.
  const tokens = [
    parts[affixIndex]?.value,
    ...(["symbol", "narrowSymbol", "code"] as const).map(
      (display) =>
        currencyParts(display)
          .formatToParts(1)
          .find((part) => part.type === "currency")?.value,
    ),
    props.currency.toUpperCase(),
  ].filter((token): token is string => Boolean(token));
  return {
    places,
    affix: {
      text: parts[affixIndex]?.value ?? "",
      position: affixIndex < integerIndex ? "before" : "after",
    },
    tokens: [...new Set(tokens.map(canonical))].sort(
      (a, b) => b.length - a.length,
    ),
    decimalMark: mark("decimal"),
    groupMark: mark("group"),
    raw: new Intl.NumberFormat(locale, {
      ...base,
      useGrouping: false,
      maximumFractionDigits: places,
    }),
    grouped: new Intl.NumberFormat(locale, {
      ...base,
      minimumFractionDigits: places,
      maximumFractionDigits: places,
    }),
  };
}

const formats = computed(() => {
  try {
    return buildFormats(activeLocale.value);
  } catch (error) {
    // Unknown currency or locale: Intl throws RangeError. Keep rendering.
    console.warn("[orio-number-input-money] cannot format", error);
    const places = resolvePlaces(2);
    return {
      places,
      affix: null,
      tokens: [] as string[],
      decimalMark: ".",
      groupMark: ",",
      raw: new Intl.NumberFormat(FALLBACK_LOCALE, {
        numberingSystem: "latn",
        useGrouping: false,
        maximumFractionDigits: places,
      }),
      grouped: new Intl.NumberFormat(FALLBACK_LOCALE, {
        numberingSystem: "latn",
        minimumFractionDigits: places,
        maximumFractionDigits: places,
      }),
    };
  }
});

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

// Major mode: at most 15 significant digits survive decimal -> double -> decimal.
const MAX_DIGITS = 15;
const withinMajorCeiling = (integer: string, fraction: string) =>
  `${integer}${fraction.replace(/0+$/, "")}`.replace(/^0+/, "").length <=
  MAX_DIGITS;

// The one ceiling for text and model values, in both modes: at most 15
// significant digits AND the scaled minor-unit integer is a safe integer.
const withinCeiling = (integer: string, fraction: string) =>
  withinMajorCeiling(integer, fraction) &&
  Number.isSafeInteger(
    Number(`${integer}${fraction.padEnd(formats.value.places, "0")}`),
  );

// Exact decimal text of a model value that can be shown without rounding, or
// why it cannot (non-finite, too many decimals, beyond the ceiling).
function inspectModel(
  value: number,
): { text: string } | { reason: "invalid" | "tooLarge" } {
  if (!Number.isFinite(value)) return { reason: "invalid" };
  const { places } = formats.value;
  let text: string;
  if (props.minorUnits) {
    if (!Number.isInteger(value)) return { reason: "invalid" };
    if (!Number.isSafeInteger(value)) return { reason: "tooLarge" };
    const digits = String(Math.abs(value)).padStart(places + 1, "0");
    const split = digits.length - places;
    text = `${value < 0 ? "-" : ""}${digits.slice(0, split)}${
      places ? `.${digits.slice(split)}` : ""
    }`;
  } else {
    text = plainDecimal(value);
  }
  const [integer, fraction = ""] = text.replace("-", "").split(".");
  if (!props.minorUnits && fraction.length > places) {
    return { reason: "invalid" };
  }
  return withinCeiling(integer, fraction) ? { text } : { reason: "tooLarge" };
}
const exactText = (value: number) => {
  const result = inspectModel(value);
  return "text" in result ? result.text : null;
};

function formatModel(value: number | null, editing: boolean) {
  if (value === null) return "";
  const text = exactText(value);
  // Never round or guess: show the outside value's own digits (empty if non-finite).
  if (text === null) return plainDecimal(value);
  const format = editing ? formats.value.raw : formats.value.grouped;
  // Exact: Intl formats the decimal string itself (no float round trip).
  return format.format(text as unknown as number);
}

// Not valid yet, but a prefix of a valid value ("-", "$", "5 US"): no error
// while typing, judged on blur. Blocks native submit meanwhile.
const INCOMPLETE = Symbol("incomplete");
// Valid shape, but beyond what the model can hold exactly.
const TOO_LARGE = Symbol("tooLarge");

// First group 1-3 digits without a leading zero, middle groups 2-3 (Indian
// 12,34,567), last group exactly 3.
const validGroups = (integer: string, mark: string) => {
  const groups = integer.split(mark);
  return (
    groups.length > 1 &&
    /^[1-9]\d{0,2}$/.test(groups[0]) &&
    groups.slice(1, -1).every((group) => /^\d{2,3}$/.test(group)) &&
    /^\d{3}$/.test(groups.at(-1)!)
  );
};

/**
 * Digits and separators -> integer and fraction digits (P1). The format is read
 * from the text; the field locale only breaks a true tie ("1,234").
 */
function splitNumber(text: string) {
  const { groupMark } = formats.value;
  const marks = text.replace(/\d/g, "");
  const kinds = [...new Set(marks)];
  if (kinds.length === 0) return { integer: text, fraction: "" };
  if (kinds.length > 2) return undefined;
  if (kinds.length === 2) {
    // The last mark is the decimal (once); the other must be valid grouping.
    const decimal = marks.at(-1)!;
    if (decimal !== "." && decimal !== ",") return undefined;
    if (marks.split(decimal).length > 2) return undefined;
    const other = kinds.find((kind) => kind !== decimal)!;
    const at = text.lastIndexOf(decimal);
    const integer = text.slice(0, at);
    return validGroups(integer, other)
      ? { integer: integer.split(other).join(""), fraction: text.slice(at + 1) }
      : undefined;
  }
  const [mark] = kinds;
  // Space and apostrophe are only ever grouping; so is a repeated mark.
  if (marks.length > 1 || (mark !== "." && mark !== ",")) {
    if (validGroups(text, mark)) {
      return { integer: text.split(mark).join(""), fraction: "" };
    }
    // "1,234,5", "12,34,5": a prefix of a valid grouped number is incomplete.
    const groups = text.split(mark);
    const last = groups.at(-1)!;
    return last.length < 3 &&
      validGroups(groups.slice(0, -1).join(mark) + mark + "000", mark)
      ? INCOMPLETE
      : undefined;
  }
  const [integer, fraction] = text.split(mark);
  // Could be grouping only as "d 3-digit group"; then the field locale decides.
  const tie = fraction.length === 3 && /^[1-9]\d{0,2}$/.test(integer);
  return tie && mark === groupMark
    ? { integer: `${integer}${fraction}`, fraction: "" }
    : { integer, fraction };
}

/**
 * Text -> model. `null` = empty, `undefined` = can never become valid,
 * `INCOMPLETE` = may still become valid, `TOO_LARGE` = beyond the ceiling.
 * Note: `min`/`max` are in model units (cents with `minorUnits`); `step` is
 * always in major units.
 */
function parse(
  raw: string,
): number | null | undefined | typeof INCOMPLETE | typeof TOO_LARGE {
  const { tokens, places } = formats.value;
  let text = canonical(
    stripBidiMarks(raw)
      .replace(/\p{Nd}/gu, toAsciiDigit)
      .replace(/\u066B/g, ".")
      .replace(/\u066C/g, ",")
      .replace(/\u2212/g, "-"),
  ).trim();

  // Sign and one currency token are accepted at the edges only.
  let negative = false;
  let tokenSeen = false;
  for (;;) {
    if (!negative && text.startsWith("-")) {
      negative = true;
      text = text.slice(1).trim();
      continue;
    }
    const token = tokenSeen
      ? undefined
      : (tokens.find((candidate) => text.startsWith(candidate)) ??
        tokens.find((candidate) => text.endsWith(candidate)));
    if (!token) break;
    tokenSeen = true;
    text = (
      text.startsWith(token)
        ? text.slice(token.length)
        : text.slice(0, -token.length)
    ).trim();
  }
  // Without negatives allowed a minus can never become valid.
  if (negative && !(min.value < 0)) return undefined;
  if (text === "") return negative || tokenSeen ? INCOMPLETE : null;

  // G6: a started currency token ("U", "5 US") is incomplete, not wrong.
  const started = tokenSeen
    ? undefined
    : tokens
        .flatMap((token) =>
          Array.from({ length: token.length - 1 }, (_, at) =>
            token.slice(0, at + 1),
          ),
        )
        .find((prefix) => text.endsWith(prefix));
  if (started !== undefined) {
    const rest = text.slice(0, -started.length).trim();
    if (rest === "") return INCOMPLETE;
    text = rest;
  }
  if (!/^[\d.,' ]+$/.test(text)) return undefined;

  const split = splitNumber(text);
  if (!split || split === INCOMPLETE) return split;
  const { integer } = split;
  let { fraction } = split;
  if (integer === "" && fraction === "") return INCOMPLETE;
  // P2: extra fraction digits are dropped when all zeros, an error otherwise.
  if (fraction.length > places) {
    if (/[1-9]/.test(fraction.slice(places))) return undefined;
    fraction = fraction.slice(0, places);
  }
  if (!withinCeiling(integer, fraction)) return TOO_LARGE;
  // The text was complete, only a currency token was still missing.
  if (started !== undefined) return INCOMPLETE;
  const sign = negative ? "-" : "";
  if (props.minorUnits) {
    return (
      Number(`${sign}${integer || "0"}${fraction.padEnd(places, "0")}`) + 0
    );
  }
  // `+ 0` keeps -0 out of the model.
  return Number(`${sign}${integer || "0"}.${fraction || "0"}`) + 0;
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

const typing = ref(false);
// Set while the text was typed or pasted (not an untouched outside value).
const dirty = ref(false);
const fault = ref<"invalid" | "tooLarge" | null>(null);
// Text that may still become valid; blocks submit, no visible error until blur.
const incomplete = ref(false);
const hasParseError = computed(() => fault.value !== null);
const display = ref(formatModel(modelValue.value, false));

// Blur found a clamp bound the field cannot show: value kept, error shown.
const clampUnshowable = ref(false);

function resetTyping() {
  clampUnshowable.value = false;
  dirty.value = false;
  fault.value = null;
  incomplete.value = false;
}

// An outside model that cannot be shown exactly is never rewritten or emitted.
const modelUnshowable = computed(
  () => modelValue.value !== null && exactText(modelValue.value) === null,
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
    display.value = formatModel(modelValue.value, typing.value);
  },
  { flush: "pre" },
);

function onInput(raw: string) {
  display.value = raw;
  dirty.value = true;
  clampUnshowable.value = false;
  const parsed = parse(raw);
  fault.value =
    parsed === undefined ? "invalid" : parsed === TOO_LARGE ? "tooLarge" : null;
  incomplete.value = parsed === INCOMPLETE;
  // Incomplete input keeps the last valid model until blur judges it.
  if (typeof parsed === "number" || parsed === null) modelValue.value = parsed;
}

function onFocus() {
  typing.value = true;
  if (!hasParseError.value) display.value = formatModel(modelValue.value, true);
}

function commit(value: number | null) {
  resetTyping();
  modelValue.value = value;
  display.value = formatModel(value, typing.value);
}

function onBlur() {
  typing.value = false;
  // Only text the user typed is judged; an untouched outside value just clamps.
  if (dirty.value) {
    const parsed = parse(display.value);
    if (parsed === undefined || parsed === INCOMPLETE || parsed === TOO_LARGE) {
      // Unparsable text stays so the user can fix it; the error stays too.
      fault.value = parsed === TOO_LARGE ? "tooLarge" : "invalid";
      incomplete.value = false;
      return;
    }
  }
  if (modelUnshowable.value) return;
  if (modelValue.value === null) return commit(null);
  const clamped = clamp(modelValue.value);
  // Same rule as stepBy: never emit a bound the field cannot show exactly.
  if (exactText(clamped) === null) {
    resetTyping();
    display.value = formatModel(modelValue.value, false);
    clampUnshowable.value = true;
    return;
  }
  commit(clamped);
}

function stepBy(delta: number) {
  if (!Number.isFinite(delta) || modelUnshowable.value) return;
  const places = formats.value.places;
  const unit = props.minorUnits ? shiftDecimal(delta, places) : delta;
  const base =
    modelValue.value ?? (Number.isFinite(min.value) ? min.value! : 0);
  const result = clamp(roundTo(base + unit, props.minorUnits ? 0 : places));
  // Never emit a value the field cannot show exactly (ceiling, NaN, Infinity).
  if (exactText(result) === null) return;
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

// P3: copy and cut put the raw value on the clipboard, never the formatted one.
function rawText() {
  if (modelValue.value === null) return null;
  // Only when the shown text IS the model; otherwise the native copy is honest.
  if (parse(display.value) !== modelValue.value) return null;
  const text = exactText(modelValue.value);
  if (text === null) return null;
  return text.includes(".") ? text.replace(/\.?0+$/, "") : text;
}

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
  event.clipboardData.setData("text/plain", text);
  event.preventDefault();
  if (event.type === "cut" && selectionStart !== selectionEnd) {
    if (!props.disabled && !isReadonly()) onInput("");
  }
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
const slotExpose = computed(() => ({
  increase,
  decrease,
  isAtMax: isAtMax.value,
  isAtMin: isAtMin.value,
}));

const isOutOfRange = computed(
  () =>
    modelValue.value !== null &&
    ((Number.isFinite(max.value) && modelValue.value > (max.value as number)) ||
      (Number.isFinite(min.value) && modelValue.value < (min.value as number))),
);
const invalid = computed(
  () =>
    hasParseError.value ||
    incomplete.value ||
    modelUnshowable.value ||
    isOutOfRange.value,
);

const modelReason = computed(() =>
  modelValue.value === null
    ? null
    : ((inspectModel(modelValue.value) as { reason?: string }).reason ?? null),
);
const invalidMessage = computed(() =>
  (fault.value ?? modelReason.value) === "tooLarge"
    ? t("moneyInput.tooLarge")
    : t(
        formats.value.places === 0
          ? "moneyInput.invalidWhole"
          : "moneyInput.invalid",
        { places: formats.value.places },
      ),
);
const builtInError = computed(() =>
  hasParseError.value || modelUnshowable.value ? invalidMessage.value : null,
);
// An empty consumer error ("") must not hide the built-in one.
const error = computed(
  () =>
    props.error ||
    builtInError.value ||
    (clampUnshowable.value && isOutOfRange.value
      ? t("moneyInput.outOfRange")
      : ""),
);

// Native form validation: bad, unfinished or out-of-range text blocks submit.
// One computed, so a language switch updates the message too.
const validityMessage = computed(
  () =>
    builtInError.value ??
    (incomplete.value
      ? invalidMessage.value
      : isOutOfRange.value
        ? t("moneyInput.outOfRange")
        : ""),
);
watch(
  [() => field.value?.input, validityMessage],
  ([input, message]) => input?.setCustomValidity(message),
  { flush: "post" },
);

// The visible text is localised, so the form carries a hidden canonical value
// in model units; empty when the text is invalid, incomplete or unshowable.
const submitValue = computed(() => {
  if (invalid.value || modelValue.value === null) return "";
  return props.minorUnits ? String(modelValue.value) : (rawText() ?? "");
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
