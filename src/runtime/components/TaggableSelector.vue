<script setup lang="ts">
import type { SelectProps } from "./Selector.vue";
import type { TagProps } from "./Tag.vue";

const props = withDefaults(defineProps<SelectProps>(), {
  optionName: "text",
});

const modelValue = defineModel<TagProps[]>();
</script>

<template>
  <orio-selector v-bind="props" v-model="modelValue" multiple>
    <template #trigger-label>
      <orio-tag
        v-for="tag in modelValue"
        :key="tag.id"
        :text="tag.text"
        :variant="tag.variant"
      />
    </template>
  </orio-selector>
</template>

<style scoped>
:deep(.trigger-content) {
  display: flex;
  flex-wrap: wrap;
  text-align: left;
  gap: 0.5rem;
}
</style>
