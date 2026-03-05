<script setup lang="ts">
import { useSlots, computed } from "vue";

export type BadgeVariant = "danger" | "alert" | "primary" | "grey";

interface Props {
  variant?: BadgeVariant;
  pill?: boolean;
  hidden?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  pill: false,
  hidden: false,
});

const slots = useSlots();

const hasWrapping = computed(() => !!slots.wrapping);
const hasDefaultContent = computed(() => !!slots.default);
const isDot = computed(() => !hasDefaultContent.value);
</script>

<template>
  <div v-if="hasWrapping" class="badge-wrapper">
    <slot name="wrapping" />
    <span
      v-if="!hidden"
      class="badge positioned"
      :class="[variant, { pill, dot: isDot }]"
    >
      <slot />
    </span>
  </div>
  <span
    v-else-if="!hidden"
    class="badge"
    :class="[variant, { pill, dot: isDot }]"
  >
    <slot />
  </span>
</template>

<style scoped>
.badge-wrapper {
  position: relative;
  display: inline-flex;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem 0.35rem;
  font-size: var(--font-sm);
  font-weight: 600;
  border-radius: var(--border-radius-sm);
  border: 1px solid transparent;
  white-space: nowrap;
  user-select: none;
}

.badge.positioned {
  position: absolute;
  top: 15%;
  right: 15%;
  transform: translate(50%, -50%);
}

.badge.pill {
  border-radius: var(--border-radius-pill);
}

.badge.dot {
  width: 0.5rem;
  height: 0.5rem;
  min-width: 0.5rem;
  min-height: 0.5rem;
  padding: 0;
  border-radius: 50%;
}

.badge.primary {
  background-color: var(--color-accent);
  color: var(--color-accent-ink);
  border-color: var(--color-accent);
}

.badge.danger {
  background-color: var(--color-danger);
  color: var(--color-danger-ink);
  border-color: var(--color-danger);
}

.badge.alert {
  background-color: var(--color-alert);
  color: var(--color-alert-ink);
  border-color: var(--color-alert);
}

.badge.grey {
  background-color: var(--color-surface);
  color: var(--color-muted);
  border-color: var(--color-border);
}
</style>
