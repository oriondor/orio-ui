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
  <orio-number-input v-model="modelValue" v-bind="$props" class="horizontal">
    <template #controls="{ increase, decrease, isAtMax, isAtMin }">
      <orio-button
        appearance="minimal"
        icon="minus"
        variant="subdued"
        :disabled="isAtMin || disabled"
        @mousedown="pressAndHold(decrease)"
        @mouseup="stop"
        @mouseleave="stop"
      />
      <orio-button
        appearance="minimal"
        icon="plus"
        variant="subdued"
        :disabled="isAtMax || disabled"
        @mousedown="pressAndHold(increase)"
        @mouseup="stop"
        @mouseleave="stop"
      />
    </template>
  </orio-number-input>
</template>

<style scoped lang="scss">
.horizontal {
  :deep(.number-input) {
    text-align: center;
  }

  :deep(.controls) {
    justify-content: space-between;
    padding: 0 3px;
  }
}
</style>
