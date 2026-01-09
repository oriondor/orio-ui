<script setup lang="ts">
import { computed, toRefs, useAttrs, useSlots } from "vue";

interface Props {
  icon?: string;
  disabled?: boolean;
  active?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
});

const { disabled, active } = toRefs(props);

const attrs = useAttrs();
const slots = useSlots();

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
}
</script>

<template>
  <orio-control-element>
    <button
      v-bind="attrs"
      :class="{ 'icon-only': isIconOnly, active }"
      :disabled
      :aria-current="active ? 'page' : undefined"
      @click="click"
    >
      <slot name="icon">
        <orio-icon v-if="icon" :name="icon" />
      </slot>
      <slot />
    </button>
  </orio-control-element>
</template>

<style lang="scss" scoped>
button {
  background-color: transparent;
  color: var(--color-text);
  border: none;
  border-radius: var(--border-radius-md);
  padding: 8px 16px;
  font-size: 1rem;
  line-height: 1.5;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  user-select: none;
  transition: color 0.2s ease;

  &.icon-only {
    padding: 8px;
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
