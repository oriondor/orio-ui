<script setup lang="ts">
import { useSlots } from "vue";

export interface ListItemProps {
  selectable?: boolean;
}

const { selectable = false } = defineProps<ListItemProps>();

const slots = useSlots();

const selected = defineModel<boolean>("selected");

function click() {
  if (!selectable) return;
  selected.value = !selected.value;
}
</script>

<template>
  <li class="list-item" :class="{ selectable, selected }" @click="click">
    <div v-if="!!slots.start || selectable" class="boundary">
      <slot name="start">
        <orio-check-box :model-value="selected" />
      </slot>
    </div>
    <div class="content">
      <slot />
    </div>
    <div v-if="!!slots.end" class="boundary">
      <slot name="end" />
    </div>
  </li>
</template>

<style scoped lang="scss">
.list-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  user-select: none;

  &.selectable {
    cursor: pointer;
  }

  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &.selected {
    background-color: var(--color-accent);
    color: var(--color-accent-soft-darker);
  }

  &:hover:not(.selected) {
    background-color: var(--color-surface);
  }

  .content {
    flex-grow: 1;
  }

  .boundary {
    display: flex;
  }
}
</style>
