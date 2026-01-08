<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useData } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { useTheme } from '../../../src/runtime/composables/useTheme';
import ThemeSwitcher from './components/ThemeSwitcher.vue';

const { isDark } = useData();
const { mode, setMode } = useTheme();

// Sync VitePress appearance with Orio UI mode
watch(
  isDark,
  (dark) => {
    const newMode = dark ? 'dark' : 'light';
    if (mode.value !== newMode) {
      setMode(newMode);
    }
  },
  { immediate: true },
);

// On mount, sync initial state
onMounted(() => {
  setMode(isDark.value ? 'dark' : 'light');
});
</script>

<template>
  <default-theme.Layout>
    <template #nav-bar-content-after>
      <theme-switcher />
    </template>
  </default-theme.Layout>
</template>
