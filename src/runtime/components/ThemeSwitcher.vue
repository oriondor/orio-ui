<script setup lang="ts">
import { useTheme } from "../composables/useTheme";
import { THEMES } from "../constants/theme";

interface Props {
  themes?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  themes: () => [...THEMES],
});

const { theme, setTheme } = useTheme();
</script>

<template>
  <orio-selector
    :model-value="theme"
    :options="props.themes"
    @update:model-value="setTheme($event as string)"
  />
</template>
