<script setup lang="ts">
import { computed, toRefs, useSlots } from "vue";
import type { RouteLocationRaw } from "vue-router";
import { useLinkNavigation } from "../utils/link";
import type { ControlProps } from "./ControlElement.vue";

interface Props extends ControlProps {
  icon?: string;
  active?: boolean;
  /** Renders a real `<a href>` instead of a `<button>`; internal paths navigate through the Vue router when one is installed (no reload). `active` still drives styling and `aria-current`. Ignored while `disabled`. */
  to?: RouteLocationRaw;
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
});

const { disabled, active } = toRefs(props);

const slots = useSlots();

const asLink = computed(() => props.to !== undefined && !disabled.value);
const { hrefFor, navigate } = useLinkNavigation();

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
</script>

<template>
  <orio-control-element v-slot="{ control }" v-bind="props">
    <component
      :is="asLink ? 'a' : 'button'"
      v-bind="{ ...$attrs, ...control }"
      :href="asLink ? hrefFor(to!) : undefined"
      :class="['orio-nav-button-el', { 'icon-only': isIconOnly, active }]"
      :aria-current="active ? 'page' : undefined"
      @click="click"
    >
      <slot name="icon">
        <orio-icon v-if="icon" :name="icon" />
      </slot>
      <slot />
    </component>
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

  &:hover:not(:disabled) {
    color: var(--color-accent);
  }

  &.active {
    color: var(--color-accent);
    font-weight: 600;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}
</style>
