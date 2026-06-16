<script setup lang="ts">
import { usePressAndHold } from "../../composables/usePressAndHold";
import type { NumberInputProps } from "./index.vue";

withDefaults(defineProps<NumberInputProps>(), {
  layout: "vertical",
  min: undefined,
  max: undefined,
  step: 1,
  decimalPlaces: 0,
  disabled: false,
});

const modelValue = defineModel<number>({ default: 0 });

const { pressAndHold, stop } = usePressAndHold();
</script>

<template>
  <orio-number-input v-model="modelValue" v-bind="$props" class="vertical">
    <template #controls="{ increase, decrease, isAtMax, isAtMin }">
      <orio-button
        appearance="minimal"
        icon="chevron-up"
        variant="subdued"
        size="xs"
        pill
        :disabled="isAtMax || disabled"
        @mousedown="pressAndHold(increase)"
        @mouseup="stop"
        @mouseleave="stop"
      />
      <orio-button
        appearance="minimal"
        icon="chevron-down"
        variant="subdued"
        size="xs"
        pill
        :disabled="isAtMin || disabled"
        @mousedown="pressAndHold(decrease)"
        @mouseup="stop"
        @mouseleave="stop"
      />
    </template>
  </orio-number-input>
</template>

<style scoped lang="scss">
.vertical {
  :deep(.controls) {
    flex-direction: column;
    justify-content: center;
    gap: 0;
    right: 3px;
    left: auto;
  }

  :deep(.controls button) {
    padding-block: 0;
  }

  :deep(.slot-wrapper) {
    line-height: 0;
  }
}
</style>
