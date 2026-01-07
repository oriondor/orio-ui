<script setup lang="ts">
import { computed } from 'vue';
import { nanoid } from 'nanoid';

interface Props {
  month?: boolean;
}
defineProps<Props>();

const date = defineModel<string | null | undefined>('date', {
  required: true,
});

const randomName = computed(() => `date-${nanoid(8)}`);
</script>

<template>
  <orio-control-element class="date-picker" v-bind="$attrs">
    <input
      v-model="date"
      :type="month ? 'month' : 'date'"
      class="date-input"
      :name="randomName"
    />
  </orio-control-element>
</template>

<style scoped>
.date-picker * {
  width: 100%;
  cursor: pointer;
}

.date-picker-label {
  display: inline-flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: var(--color-text);
}

.date-input {
  /* border-box allows correct sizing for input */
  box-sizing: border-box;
  appearance: none;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  color: var(--color-text);
  font-size: 0.95rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

/* Hover + focus */
.date-input:hover {
  border-color: var(--color-accent);
}
.date-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-soft);
  outline: none;
}

/* Disabled */
.date-input:disabled {
  background-color: var(--color-surface);
  color: var(--color-muted);
  cursor: not-allowed;
}

/* Calendar icon (WebKit browsers like Chrome/Safari) */
.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(36%) sepia(65%) saturate(325%) hue-rotate(180deg);
  opacity: 0.7;
  transition: opacity 0.2s ease;
}
.date-input::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
</style>
