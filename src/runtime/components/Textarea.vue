<script setup lang="ts">
import { useAttrs } from 'vue';

const attrs = useAttrs();
defineEmits<{
  (e: 'input', value: string): void;
}>();

const modelValue = defineModel<string>({ default: '' });
</script>

<template>
  <orio-control-element v-bind="attrs">
    <textarea v-bind="attrs" v-model="modelValue" rows="4" class="textarea" />
  </orio-control-element>
</template>

<style lang="scss" scoped>
.textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  color: var(--color-text);
  background-color: var(--color-bg);
  box-sizing: border-box;
  resize: vertical; /* Let user resize vertically only */
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::placeholder {
    color: var(--color-muted);
  }

  &:hover {
    border-color: var(--color-accent);
  }

  &:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px var(--color-accent-soft);
    outline: none;
  }

  &:disabled {
    background-color: var(--color-surface);
    color: var(--color-muted);
    cursor: not-allowed;
  }
}
</style>
