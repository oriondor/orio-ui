<script setup lang="ts">
import { usePressAndHold } from "../../composables/usePressAndHold";

interface Props {
  min?: number;
  max?: number;
  step?: number;
  decimalPlaces?: number;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
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
        :disabled="isAtMax || disabled"
        @mousedown="pressAndHold(increase)"
        @mouseup="stop"
        @mouseleave="stop"
      />
      <orio-button
        appearance="minimal"
        icon="chevron-down"
        variant="subdued"
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
    justify-content: space-around;
    right: 3px;
    left: auto;
  }

  :deep(.slot-wrapper) {
    line-height: 0;
  }
}
</style>
