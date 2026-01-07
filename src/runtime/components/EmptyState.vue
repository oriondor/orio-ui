<script setup lang="ts">
interface Props {
  icon?: string;
  title: string;
  description?: string;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
});
</script>

<template>
  <div class="empty-state" :class="size">
    <orio-icon v-if="icon" :name="icon" class="empty-state-icon" />
    <orio-view-text
      type="title"
      :size="size === 'large' ? 'medium' : 'small'"
      class="empty-state-title"
    >
      {{ title }}
    </orio-view-text>
    <orio-view-text
      v-if="description"
      type="subtitle"
      class="empty-state-description"
    >
      {{ description }}
    </orio-view-text>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--color-text-secondary);

  &.small {
    padding: 1rem;
    gap: 0.25rem;

    .empty-state-icon {
      font-size: 2rem;
    }
  }

  &.medium {
    padding: 2rem;
    gap: 0.5rem;

    .empty-state-icon {
      font-size: 3rem;
    }
  }

  &.large {
    padding: 3rem;
    gap: 1rem;

    .empty-state-icon {
      font-size: 4rem;
    }
  }
}

.empty-state-icon {
  color: var(--color-text-tertiary);
  opacity: 0.5;
}

.empty-state-title {
  color: var(--color-text-secondary);
}

.empty-state-description {
  color: var(--color-text-tertiary);
  max-width: 30ch;
}
</style>
