<script setup lang="ts">
export type TagStyle = 'neutral' | 'accent';

interface Props {
  text: string;
  variant?: TagStyle;
}
withDefaults(defineProps<Props>(), {
  variant: 'neutral',
});
</script>

<template>
  <span class="tag" :class="`tag--${variant}`">
    {{ text }}
  </span>
</template>

<style scoped>
.tag {
  max-height: 1rem;
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1;
  border: 1px solid transparent;
  user-select: none;
}

/* Neutral (gray chip) */
.tag--neutral {
  background-color: var(--color-surface);
  border-color: color-mix(
    in srgb,
    var(--color-border) 80%,
    var(--color-accent) 20%
  );
  color: var(--color-muted);
}

/* Accent (themed chip) */
.tag--accent {
  background-color: var(--color-accent-soft);
  border-color: var(--color-accent-border);
  color: var(--color-accent);
}
</style>
