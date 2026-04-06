<script setup lang="ts">
export type TagStyle = "neutral" | "accent";

export interface TagProps {
  text: string;
  id?: string;
  variant?: TagStyle;
}
withDefaults(defineProps<TagProps>(), {
  variant: "neutral",
});
</script>

<template>
  <span class="tag" :class="`tag--${variant}`">
    {{ text }}
  </span>
</template>

<style scoped>
.tag {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-sm);
  font-weight: 500;
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
