<script setup lang="ts">
import { computed, toRefs, useAttrs, useSlots } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'subdued';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
});

const { loading, disabled } = toRefs(props);

const attrs = useAttrs();
const slots = useSlots();

const isIconOnly = computed(() => {
  const hasIcon = !!props.icon || !!slots.icon;
  const hasDefault = !!slots.default;
  return hasIcon && !hasDefault;
});

const emit = defineEmits<{
  (e: 'click', event: PointerEvent): void;
}>();

function click(event: PointerEvent) {
  if (loading.value || disabled.value) return;
  emit('click', event);
}
</script>

<template>
  <orio-control-element>
    <button
      v-bind="attrs"
      :class="[variant, 'gradient-hover', { 'icon-only': isIconOnly }]"
      @click="click"
    >
      <orio-loading-spinner v-if="loading" />
      <slot v-else name="icon">
        <orio-icon v-if="icon" :name="icon" />
      </slot>
      <slot />
    </button>
  </orio-control-element>
</template>

<style lang="scss" scoped>
button {
  background-color: var(--color-accent);
  color: var(--color-accent-ink);
  border: 1px solid transparent;
  border-radius: var(--border-radius-md);
  padding: 8px 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  user-select: none;

  &.icon-only {
    padding: 0;
    border-radius: 50%;
  }

  &:disabled {
    background-color: var(--color-accent-soft);
    color: var(--color-muted);
    border-color: var(--color-accent-border);
    cursor: not-allowed;
  }

  &:active {
    border: 1px solid var(--color-accent-border);
  }

  &.primary {
    --gh-color: var(--color-accent);
  }

  &.secondary {
    background-color: transparent;
    border: 1px solid var(--color-accent);
    color: var(--color-accent);
    &:hover {
      color: var(--color-accent-hover);
    }
  }

  &.subdued {
    background-color: transparent;
    color: var(--color-accent);
    &:hover {
      color: var(--color-accent-hover);
    }
  }

  &:active {
    border-color: var(--color-accent-border) !important;
  }

  &:hover {
    color: var(--color-accent-ink);
  }
}
</style>
