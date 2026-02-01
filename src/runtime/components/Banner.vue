<script setup lang="ts">
export type BannerVariant = "danger" | "alert" | "success" | "info";

interface Props {
  variant?: BannerVariant;
}

withDefaults(defineProps<Props>(), {
  variant: "info",
});
</script>

<template>
  <div class="banner" :class="[variant]">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.banner {
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid transparent;
  color: var(--color-text);

  &.danger {
    background-color: var(--color-danger-soft);
    border-color: var(--color-danger-border);
  }

  &.alert {
    background-color: var(--color-alert-soft);
    border-color: var(--color-alert-border);
  }

  &.success {
    background-color: var(--color-success-soft);
    border-color: var(--color-success-border);
  }

  &.info {
    background-color: var(--color-info-soft);
    border-color: var(--color-info-border);
  }
}
</style>
