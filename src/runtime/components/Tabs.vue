<script setup lang="ts" generic="T extends string | number">
import { computed, ref, toRef } from "vue";
import { useControlTokens } from "../composables/useControlSize";
import type { ControlSize } from "./ControlElement.vue";

interface TabOption<V> {
  value: V;
  label: string;
  icon?: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    options: TabOption<T>[];
    /** Look only. */
    variant?: "underline" | "segmented";
    /** Semantics only: `tablist` for content switching, `radiogroup` for choosing a value. */
    role?: "tablist" | "radiogroup";
    /** Accessible name (aria-label). Use `aria-labelledby` for a visible label. */
    label?: string;
    /** `tablist` only: tabs get `{idPrefix}-tab-{value}` ids and `aria-controls="{idPrefix}-panel-{value}"`. */
    idPrefix?: string;
    /** Full width with equal-width items. */
    block?: boolean;
    disabled?: boolean;
    size?: ControlSize;
  }>(),
  { variant: "underline", role: "tablist" },
);

const model = defineModel<T | undefined>();

defineSlots<{
  option?(props: { option: TabOption<T>; selected: boolean }): unknown;
}>();

const { tokens } = useControlTokens(toRef(props, "size"));

const isTablist = computed(() => props.role === "tablist");
const rootRef = ref<HTMLElement>();

/** First match wins when values are duplicated. */
const selectedIndex = computed(() =>
  model.value === undefined
    ? -1
    : props.options.findIndex((option) => option.value === model.value),
);

function isEnabled(index: number) {
  return !props.options[index]?.disabled;
}

/** Roving tab stop: the selected item (even if it became disabled), else the first enabled one. */
const tabStopIndex = computed(() => {
  if (selectedIndex.value >= 0) return selectedIndex.value;
  return props.options.findIndex((option) => !option.disabled);
});

function select(index: number) {
  if (props.disabled || !isEnabled(index)) return;
  const { value } = props.options[index];
  if (value !== model.value) model.value = value;
}

function isRtl() {
  const root = rootRef.value;
  const explicit = root?.closest("[dir]")?.getAttribute("dir");
  if (explicit === "rtl" || explicit === "ltr") return explicit === "rtl";
  return !!root && getComputedStyle(root).direction === "rtl";
}

function moveTo(index: number) {
  select(index);
  rootRef.value?.querySelectorAll<HTMLElement>("button")[index]?.focus();
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  const enabled = props.options
    .map((_, index) => index)
    .filter((index) => isEnabled(index));
  if (!enabled.length) return;

  const forwardKey = isRtl() ? "ArrowLeft" : "ArrowRight";
  const backwardKey = isRtl() ? "ArrowRight" : "ArrowLeft";
  const focusedIndex = Array.from(
    rootRef.value!.querySelectorAll("button"),
  ).indexOf((event.target as HTMLElement).closest("button")!);
  const current = enabled.indexOf(focusedIndex);

  let next: number;
  if (event.key === "Home") next = 0;
  else if (event.key === "End") next = enabled.length - 1;
  else if (event.key === forwardKey || event.key === backwardKey) {
    const step = event.key === forwardKey ? 1 : -1;
    // A focused-but-disabled selected item is not in `enabled`: step from the tab stop's neighbours.
    if (current === -1) {
      next = step === 1 ? 0 : enabled.length - 1;
    } else {
      next = (current + step + enabled.length) % enabled.length;
    }
  } else return;

  event.preventDefault();
  moveTo(enabled[next]);
}

function itemAttrs(option: TabOption<T>, index: number) {
  const selected = index === selectedIndex.value;
  return isTablist.value
    ? {
        role: "tab",
        "aria-selected": selected,
        id: props.idPrefix
          ? `${props.idPrefix}-tab-${option.value}`
          : undefined,
        "aria-controls": props.idPrefix
          ? `${props.idPrefix}-panel-${option.value}`
          : undefined,
      }
    : { role: "radio", "aria-checked": selected };
}
</script>

<template>
  <div
    ref="rootRef"
    :role="role"
    :aria-label="label"
    :aria-disabled="disabled || undefined"
    :class="['tabs', variant, { block }]"
    :style="tokens"
    @keydown="onKeydown"
  >
    <button
      v-for="(option, index) in options"
      :key="option.value"
      v-bind="itemAttrs(option, index)"
      type="button"
      :class="['tab', { selected: index === selectedIndex }]"
      :tabindex="index === tabStopIndex && !disabled ? 0 : -1"
      :disabled="disabled || undefined"
      :aria-disabled="option.disabled || undefined"
      @click="select(index)"
    >
      <slot name="option" :option :selected="index === selectedIndex">
        <orio-icon v-if="option.icon" :name="option.icon" />
        <span class="tab-label">{{ option.label }}</span>
      </slot>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.tabs {
  --tabs-gap: var(--orio-tabs-gap, var(--control-gap));
  --tabs-radius: var(--orio-tabs-radius, var(--control-radius));
  --tabs-track-bg: var(--orio-tabs-track-bg, var(--color-surface));
  --tabs-active-bg: var(--orio-tabs-active-bg, var(--color-accent));
  --tabs-active-ink: var(--orio-tabs-active-ink, var(--color-accent-ink));

  display: flex;
  box-sizing: border-box;
  max-width: 100%;
  gap: var(--tabs-gap);
  font-size: var(--control-font-size);

  &.block {
    width: 100%;
    .tab {
      flex: 1 1 0;
    }
  }
}

.tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--control-gap);
  /* labels ellipsise, but flex shrink is proportional: keep short items readable */
  min-width: min(100%, 4.5rem);
  min-height: 24px;
  box-sizing: border-box;
  padding: var(--control-py) var(--control-px);
  font: inherit;
  color: var(--color-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  user-select: none;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;

  &:hover:not(.selected, [aria-disabled="true"], :disabled) {
    color: var(--color-text);
  }

  &[aria-disabled="true"],
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .tab-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.underline {
  border-bottom: 1px solid var(--color-border);

  .tab {
    border-radius: var(--tabs-radius) var(--tabs-radius) 0 0;
    box-shadow: inset 0 -2px 0 transparent;
    margin-bottom: -1px;

    &.selected {
      color: var(--color-text);
      font-weight: 600;
      box-shadow: inset 0 -2px 0 var(--color-accent);
    }
  }
}

.segmented {
  --tabs-radius: var(--orio-tabs-radius, var(--border-radius-pill));

  width: fit-content;
  padding: 0.125rem;
  background: var(--tabs-track-bg);
  border-radius: var(--tabs-radius);

  &.block {
    width: 100%;
  }

  .tab {
    border-radius: var(--tabs-radius);

    &.selected {
      color: var(--tabs-active-ink);
      background: var(--tabs-active-bg);
      font-weight: 600;
    }
  }
}
</style>
