<script setup lang="ts">
import { computed, toRefs, useSlots } from "vue";
import type { RouteLocationRaw } from "vue-router";
import { useLinkNavigation } from "../utils/link";
import type { ControlProps } from "./ControlElement.vue";

interface Props extends ControlProps {
  icon?: string;
  active?: boolean;
  /** Adds a real `href`; internal paths navigate through the Vue router when one is installed (no reload). `active` still drives styling and `aria-current`. Ignored while `disabled`. */
  to?: RouteLocationRaw;
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
});

const { disabled, active } = toRefs(props);

const slots = useSlots();

const asLink = computed(() => props.to !== undefined && !disabled.value);
const { hrefFor, navigate } = useLinkNavigation();

/** A `role="button"` anchor has no `href`, so it needs an explicit tab stop; disabled leaves the tab order like a native disabled button. */
const elementTabindex = computed(() => {
  if (disabled.value) return -1;
  return props.tabindex ?? (asLink.value ? undefined : 0);
});

const isIconOnly = computed(() => {
  const hasIcon = !!props.icon || !!slots.icon;
  const hasDefault = !!slots.default;
  return hasIcon && !hasDefault;
});

const emit = defineEmits<{
  (e: "click", event: PointerEvent): void;
}>();

function click(event: PointerEvent) {
  if (disabled.value) return;
  emit("click", event);
  if (asLink.value) navigate(event, props.to!);
}

/** Without an `href` the anchor is a `role="button"`, so it activates like a native button: Enter on keydown, Space once on keyup. */
function activate(event: KeyboardEvent) {
  if (asLink.value) return;
  event.preventDefault();
  (event.currentTarget as HTMLElement).click();
}

/** Stops Space from scrolling the page; held-key repeats must not click. */
function holdSpace(event: KeyboardEvent) {
  if (!asLink.value) event.preventDefault();
}
</script>

<template>
  <orio-control-element v-slot="{ control }" v-bind="props">
    <a
      v-bind="{ ...$attrs, ...control }"
      :href="asLink ? hrefFor(to!) : undefined"
      :role="asLink ? undefined : 'button'"
      :tabindex="elementTabindex"
      :disabled="undefined"
      :aria-disabled="disabled || undefined"
      :class="['orio-nav-button-el', { 'icon-only': isIconOnly, active }]"
      :aria-current="active ? 'page' : undefined"
      @click="click"
      @keydown.enter="activate"
      @keydown.space="holdSpace"
      @keyup.space="activate"
    >
      <slot name="icon">
        <orio-icon v-if="icon" :name="icon" />
      </slot>
      <slot />
    </a>
  </orio-control-element>
</template>

<style lang="scss" scoped>
.orio-nav-button-el {
  text-decoration: none;
  box-sizing: border-box;
  background-color: transparent;
  color: var(--color-text);
  border: none;
  border-radius: var(--control-radius);
  padding: var(--control-py) var(--control-px);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--control-gap);
  user-select: none;
  transition: color 0.2s ease;

  &.icon-only {
    padding: var(--control-py);
    border-radius: 50%;
    aspect-ratio: 1;
    justify-content: center;
  }

  &:hover:not([aria-disabled="true"]) {
    color: var(--color-accent);
  }

  &.active {
    color: var(--color-accent);
    font-weight: 600;
  }

  &[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}
</style>
