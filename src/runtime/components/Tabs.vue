<script setup lang="ts" generic="T extends string | number">
import { computed, nextTick, onMounted, ref, toRef, watch } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { useControlTokens } from "../composables/useControlSize";
import type { ControlSize } from "./ControlElement.vue";

export interface TabsOption<V = string | number> {
  value: V;
  label: string;
  icon?: string;
  disabled?: boolean;
}

export interface TabsProps<V = string | number> {
  options: TabsOption<V>[];
  /** Look only. */
  variant?: "underline" | "segmented";
  /** Semantics only: `tablist` for content switching, `radiogroup` for choosing a value. */
  role?: "tablist" | "radiogroup";
  /** Accessible name (aria-label). Use `aria-labelledby` for a visible label. */
  label?: string;
  /** `tablist` only: tabs get `{idPrefix}-tab-{value}` ids and `aria-controls="{idPrefix}-panel-{value}"`. */
  idPrefix?: string;
  /** Full width. `true` / `"equal"`: equal-width items; `"content"`: items sized by their content, spare space shared. */
  block?: boolean | "equal" | "content";
  disabled?: boolean;
  size?: ControlSize;
  /** Compact padding, gap and font so labels fit in tight spaces. Never switches by itself; bind it to your own breakpoint. */
  dense?: boolean;
}

const props = withDefaults(defineProps<TabsProps<T>>(), {
  variant: "underline",
  role: "tablist",
});

const model = defineModel<T | undefined>();

defineSlots<{
  option?(props: { option: TabsOption<T>; selected: boolean }): unknown;
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

/** Direct children only: the option slot may contain its own buttons. */
function tabButtons() {
  return Array.from(
    rootRef.value?.querySelectorAll<HTMLElement>(":scope > button") ?? [],
  );
}

const buttonRefs = ref<HTMLElement[]>([]);

interface IndicatorBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Selected item's box in the strip's padding-box coordinates; null = nothing to show (no selection, or not rendered/measurable). */
const box = ref<IndicatorBox | null>(null);
/** True only while a selection change is gliding; every other re-measure is instant. */
const animate = ref(false);

function measure() {
  const button = tabButtons()[selectedIndex.value];
  // display:none ancestors report 0x0; the resize observer re-measures when shown.
  box.value =
    button && (button.offsetWidth || button.offsetHeight)
      ? {
          x: button.offsetLeft,
          y: button.offsetTop,
          width: button.offsetWidth,
          height: button.offsetHeight,
        }
      : null;
}

onMounted(measure);

/** Last model value seen, to tell a real selection change from options being re-ordered or re-created. */
let lastValue = model.value;

// One watcher: a changed selected value glides even when options is replaced in the same tick (inline `:options="[...]"` parents); a re-measure caused only by options/size/variant/block stays instant.
watch(
  [
    selectedIndex,
    () => props.options,
    () => props.size,
    () => props.variant,
    () => props.block,
    () => props.dense,
  ],
  async ([current], [previous]) => {
    const glide =
      box.value !== null &&
      model.value !== lastValue &&
      previous >= 0 &&
      current >= 0;
    lastValue = model.value;
    await nextTick();
    animate.value = glide;
    measure();
  },
  { deep: true },
);

// ponytail: a `dir` flip alone does not resize anything, so a fit-content strip keeps its old (mirrored-wrong) box until selection, label or strip size changes; observe `dir` with useMutationObserver if that matters.
// Items change size on their own (fonts, labels, selected weight, container width).
useResizeObserver(() => [rootRef.value, ...buttonRefs.value], measure);

function moveTo(index: number) {
  select(index);
  tabButtons()[index]?.focus();
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  const count = props.options.length;
  const firstEnabled = props.options.findIndex((option) => !option.disabled);
  if (firstEnabled === -1) return;

  const forwardKey = isRtl() ? "ArrowLeft" : "ArrowRight";
  const backwardKey = isRtl() ? "ArrowRight" : "ArrowLeft";
  const focusedIndex = tabButtons().indexOf(
    (event.target as HTMLElement).closest("button")!,
  );

  let next: number;
  if (event.key === "Home") next = firstEnabled;
  else if (event.key === "End")
    next = props.options.findLastIndex((option) => !option.disabled);
  else if (event.key === forwardKey || event.key === backwardKey) {
    if (focusedIndex === -1) return;
    const step = event.key === forwardKey ? 1 : -1;
    // Walk from the focused item (even a disabled one) to the nearest enabled, wrapping.
    next = focusedIndex;
    do next = (next + step + count) % count;
    while (!isEnabled(next));
  } else return;

  event.preventDefault();
  moveTo(next);
}

function itemAttrs(option: TabsOption<T>, index: number) {
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
    :class="[
      'tabs',
      variant,
      {
        block: !!block,
        'fill-content': block === 'content',
        dense,
        placed: !!box,
      },
    ]"
    :style="tokens"
    @keydown="onKeydown"
  >
    <button
      v-for="(option, index) in options"
      :key="index"
      ref="buttonRefs"
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
    <span
      v-if="box"
      :class="['indicator', { animate }]"
      :style="{
        '--indicator-x': `${box.x}px`,
        '--indicator-y': `${box.y}px`,
        '--indicator-width': `${box.width}px`,
        '--indicator-height': `${box.height}px`,
      }"
      aria-hidden="true"
      @transitionend="
        (event: TransitionEvent) =>
          event.propertyName === 'transform' && (animate = false)
      "
      @transitioncancel="animate = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.tabs {
  /* Contains the items' z-index so they never paint over consumer elements. */
  isolation: isolate;
  --tabs-gap: var(--orio-tabs-gap, var(--control-gap));
  --tabs-px: var(--orio-tabs-padding-x, var(--control-px));
  --tabs-font-size: var(--orio-tabs-font-size, var(--control-font-size));
  --tabs-radius: var(--orio-tabs-radius, var(--control-radius));
  --tabs-track-bg: var(--orio-tabs-track-bg, var(--color-surface));
  --tabs-active-bg: var(--orio-tabs-active-bg, var(--color-accent));
  --tabs-active-ink: var(--orio-tabs-active-ink, var(--color-accent-ink));
  --tabs-transition: var(--orio-tabs-transition, 250ms ease);

  /* Grid, not flex: columns are sized max-content up to the strip, and when it is narrower the free space is shared equally, so a short label keeps its full width while a longer sibling absorbs the shrink. Items can never exceed the track, whatever the gap or count; only labels ellipsise. */
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, max-content);
  justify-content: start;
  box-sizing: border-box;
  max-width: 100%;
  gap: var(--tabs-gap);
  font-size: var(--tabs-font-size);

  /* Strained: tighter, still derived from the size tokens; a consumer --orio-tabs-gap wins. */
  &.dense {
    --tabs-gap: var(--orio-tabs-gap, calc(var(--control-gap) / 2));
    --tabs-px: var(--orio-tabs-padding-x, calc(var(--control-px) * 0.6));
    --tabs-font-size: var(
      --orio-tabs-font-size,
      calc(var(--control-font-size) * 0.9)
    );
  }

  &.block {
    width: 100%;
    grid-auto-columns: minmax(0, 1fr);
  }

  /* Content-sized tracks (auto) that stretch: spare space is shared, nothing is narrower than its label while it fits. */
  &.block.fill-content {
    grid-auto-columns: minmax(0, auto);
    justify-content: stretch;
  }
}

.tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--control-gap);
  min-width: 0;
  min-height: 24px;
  box-sizing: border-box;
  padding: var(--control-py) var(--tabs-px);
  font: inherit;
  color: var(--color-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  user-select: none;
  /* Above the indicator, which is a later positioned sibling. */
  position: relative;
  z-index: 1;
  transition: color var(--tabs-transition);

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

/* One element glides to the selected item. Until it is placed (SSR, first paint, unmeasurable) the selected item paints its own fill instead. */
.indicator {
  position: absolute;
  inset: 0 auto auto 0;
  width: var(--indicator-width);
  height: var(--indicator-height);
  transform: translate(var(--indicator-x), var(--indicator-y));
  pointer-events: none;

  &.animate {
    transition:
      transform var(--tabs-transition),
      width var(--tabs-transition),
      height var(--tabs-transition);
  }
}

/* Dim like the item it follows (disabled selected item or whole strip). */
.tabs:has(.tab.selected[aria-disabled="true"], .tab.selected:disabled)
  .indicator {
  opacity: 0.5;
}

@media (prefers-reduced-motion: reduce) {
  .indicator.animate,
  .tab {
    transition: none;
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

  &.placed .tab.selected {
    box-shadow: none;
  }

  .indicator {
    height: 2px;
    background: var(--color-accent);
    /* Sits on the item's bottom edge (items overlap the border by 1px). */
    transform: translate(
      var(--indicator-x),
      calc(var(--indicator-y) + var(--indicator-height) - 2px)
    );
    border-radius: 1px;
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

  &.placed .tab.selected {
    background: transparent;
  }

  .indicator {
    background: var(--tabs-active-bg);
    border-radius: var(--tabs-radius);
  }
}
</style>
