<script setup lang="ts">
import type { ControlLayout } from "./ControlElement.vue";

export type InputLayout = ControlLayout | "inner";

interface Props {
  layout?: InputLayout;
}

withDefaults(defineProps<Props>(), {
  layout: "vertical",
});

const modelValue = defineModel<string>({ default: "" });
</script>

<template>
  <orio-control-element
    v-slot="{ id }"
    v-bind="$attrs"
    :layout="layout === 'inner' ? 'vertical' : layout"
    :class="{ inner: layout === 'inner' }"
  >
    <slot name="before" />
    <input v-bind="$attrs" :id v-model="modelValue" type="text" />
    <slot name="after" />
  </orio-control-element>
</template>

<style lang="scss" scoped>
@use "../assets/css/mixins" as *;

:deep(.slot-wrapper) {
  @include input-wrapper;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.75rem;
}

input {
  @include input-inner;
  flex: 1;
  min-width: 0;
  padding: 0.5rem 0;
}

.inner {
  @include inner-label;

  input {
    padding: 1.25rem 0 0.25rem;
  }
}
</style>
