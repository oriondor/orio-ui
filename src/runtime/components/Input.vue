<script setup lang="ts">
defineEmits<{
  (e: 'input', value: string): void;
}>();

const text = defineModel<string>({ default: '' });
</script>

<template>
  <orio-control-element v-bind="$attrs">
    <input v-bind="$attrs" v-model="text" type="text" class="text-input" />
  </orio-control-element>
</template>

<style lang="scss" scoped>
.text-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  color: var(--color-text);
  background-color: var(--color-bg);
  box-sizing: border-box;
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
