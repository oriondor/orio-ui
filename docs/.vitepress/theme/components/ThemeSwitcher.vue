<script setup lang="ts">
import { useTheme } from "../../../../src/runtime/composables/useTheme";

const { theme, setTheme } = useTheme();

const THEME_OPTIONS = [
  "normal",
  "navy",
  "teal",
  "forest",
  "wine",
  "royal",
] as const;
</script>

<template>
  <div class="theme-switcher">
    <orio-selector
      v-model="theme"
      :options="THEME_OPTIONS"
      placeholder="Theme"
      @update:model-value="setTheme"
    />
  </div>
</template>

<style scoped lang="scss">
.theme-switcher {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;

  :deep(.selector-trigger) {
    min-width: 7.5rem;
    font-size: 0.8125rem;
  }
}
</style>
