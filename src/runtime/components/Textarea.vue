<script setup lang="ts">
import { useAttrs } from "vue";
import type { InputLayout } from "./Input.vue";

const attrs = useAttrs();
const modelValue = defineModel<string>({ default: "" });

interface Props {
  layout?: InputLayout;
}

withDefaults(defineProps<Props>(), {
  layout: "vertical",
});
</script>

<template>
  <orio-control-element
    v-slot="{ id }"
    v-bind="attrs"
    :layout="layout === 'inner' ? 'vertical' : layout"
    :class="{ inner: layout === 'inner' }"
  >
    <textarea v-bind="attrs" :id v-model="modelValue" rows="4" />
  </orio-control-element>
</template>

<style lang="scss" scoped>
@use "../assets/css/mixins" as *;

.control.horizontal {
  align-items: flex-start;
  :deep(.control-label) {
    padding-top: 0.5rem;
  }
}

:deep(.slot-wrapper) {
  @include input-wrapper;
}

textarea {
  @include input-inner;
  width: 100%;
  padding: 0.5rem 0.75rem;
  resize: vertical;
}

.inner {
  @include inner-label;

  textarea {
    padding: 1.25rem 0.75rem 0.25rem;
  }
}
</style>
