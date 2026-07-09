<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useFocus } from "@vueuse/core";
import type { ControlLayout, ControlProps } from "./ControlElement.vue";

export type InputLayout = ControlLayout | "inner";

interface Props extends Omit<ControlProps, "layout"> {
  layout?: InputLayout;
}

const props = withDefaults(defineProps<Props>(), {
  layout: "vertical",
});
const input = useTemplateRef("input");
const { focused } = useFocus(input);

const modelValue = defineModel<string>({ default: "" });
defineExpose({ input, focused });
</script>

<template>
  <orio-control-element
    v-slot="{ control }"
    v-bind="props"
    :layout="layout === 'inner' ? 'vertical' : layout"
    :class="{ inner: layout === 'inner' }"
  >
    <slot name="before" />
    <input
      ref="input"
      v-model="modelValue"
      type="text"
      v-bind="{ ...$attrs, ...control }"
    />
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
