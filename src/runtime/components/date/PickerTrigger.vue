<script setup lang="ts">
import { computed } from "vue";
import type { ControlProps } from "../ControlElement.vue";

interface Props extends ControlProps {
  text?: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  text: "",
  placeholder: "",
});

const controlProps = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { text, placeholder, ...rest } = props;
  return rest;
});
</script>

<template>
  <orio-control-element v-slot="{ control }" v-bind="controlProps">
    <orio-popover position="bottom-right" :offset="5">
      <template #default="{ toggle, isOpen }">
        <button
          v-bind="control"
          type="button"
          class="date-trigger"
          :aria-expanded="isOpen"
          @click="toggle()"
        >
          <span :class="{ placeholder: !text }">
            {{ text || placeholder }}
          </span>
          <orio-icon name="calendar" />
        </button>
      </template>
      <template #content="{ toggle }">
        <slot :toggle />
      </template>
    </orio-popover>
  </orio-control-element>
</template>

<style lang="scss" scoped>
.date-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--control-gap);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--control-radius);
  padding: var(--control-py) var(--control-px);
  color: var(--color-text);
  cursor: pointer;
  user-select: none;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: var(--color-accent);
    background-color: var(--color-surface);
  }

  &[aria-expanded="true"],
  &:focus-visible {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px var(--color-surface);
    outline: none;
  }

  .placeholder {
    color: var(--color-muted);
  }

  .icon {
    color: var(--color-muted);
    transition: color 0.2s ease;
  }

  &:hover .icon {
    color: var(--color-accent);
  }
}
</style>
