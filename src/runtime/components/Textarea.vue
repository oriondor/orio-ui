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
    <textarea :id v-model="modelValue" rows="4" v-bind="attrs" />
  </orio-control-element>
</template>

<style lang="scss" scoped>
@use "../assets/css/mixins" as *;

.control.horizontal {
  align-items: flex-start;
  :deep(.control-label) {
    padding-top: var(--control-py);
  }
}

:deep(.slot-wrapper) {
  @include input-wrapper;
}

textarea {
  @include input-inner;
  width: 100%;
  padding: var(--control-py) var(--control-px);
  resize: vertical;
}

.inner {
  @include inner-label;

  textarea {
    padding: var(--control-inner-block-start) var(--control-px)
      var(--control-inner-block-end);
  }
}
</style>
