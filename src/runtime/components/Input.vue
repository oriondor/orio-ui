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
    <input :id v-model="modelValue" type="text" v-bind="$attrs" />
    <slot name="after" />
  </orio-control-element>
</template>

<style lang="scss" scoped>
@use "../assets/css/mixins" as *;

:deep(.slot-wrapper) {
  @include input-wrapper;
  display: flex;
  align-items: center;
  gap: var(--control-gap);
  padding: 0 var(--control-px);
}

input {
  @include input-inner;
  flex: 1;
  min-width: 0;
  padding: var(--control-py) 0;
}

.inner {
  @include inner-label;

  :deep(.slot-wrapper) {
    padding: var(--control-inner-block-start) var(--control-px)
      var(--control-inner-block-end);
  }

  input {
    padding: 0;
  }
}
</style>
