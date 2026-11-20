<script setup lang="ts">
import { useI18n } from "vue-i18n";

export type TagStyle = "neutral" | "accent";

export interface TagProps {
  text: string;
  id?: string;
  variant?: TagStyle;
  removable?: boolean;
}
withDefaults(defineProps<TagProps>(), {
  variant: "neutral",
  removable: false,
});
defineEmits<{ remove: [] }>();
const { t } = useI18n();
</script>

<template>
  <span class="tag" :class="`tag--${variant}`">
    {{ text }}
    <button
      v-if="removable"
      type="button"
      class="tag-remove"
      :aria-label="t('tag.remove', { text })"
      @click.stop="$emit('remove')"
      @keydown.enter.stop
      @keydown.space.stop
    >
      <orio-icon name="close-rounded" />
    </button>
  </span>
</template>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
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

.tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  min-height: 24px;
  margin: -0.25rem -0.4rem -0.25rem 0;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.tag-remove:hover {
  background-color: color-mix(in srgb, currentColor 15%, transparent);
}

.tag-remove:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}
</style>
