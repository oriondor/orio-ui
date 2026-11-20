<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { usePressAndHold } from "../../composables/usePressAndHold";
import type { NumberInputProps } from "./index.vue";

const props = withDefaults(defineProps<NumberInputProps>(), {
  layout: "vertical",
  min: undefined,
  max: undefined,
  step: 1,
  decimalPlaces: 0,
  disabled: false,
});

// xs/sm fields get xs buttons so the tile stays clear of the border.
const buttonSize = computed(() =>
  props.size === "xs" || props.size === "sm" ? "xs" : "sm",
);

const modelValue = defineModel<number | null>({ default: null });

const { t } = useI18n();
const { pressAndHold, stop } = usePressAndHold();
</script>

<template>
  <orio-number-input v-model="modelValue" v-bind="$props" class="horizontal">
    <template #controls="{ increase, decrease, isAtMax, isAtMin }">
      <orio-button
        appearance="minimal"
        icon="minus"
        variant="subdued"
        :size="buttonSize"
        :aria-label="t('numberInput.decrease')"
        tabindex="-1"
        :disabled="isAtMin || disabled"
        @mousedown="pressAndHold(decrease)"
        @mouseup="stop"
        @mouseleave="stop"
      />
      <orio-button
        appearance="minimal"
        icon="plus"
        variant="subdued"
        :size="buttonSize"
        :aria-label="t('numberInput.increase')"
        tabindex="-1"
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
    // lets the buttons read the field height (cqh) to match side and top gaps
    container-type: size;
  }

  // centred on the whole field; side gap equals the top/bottom gap
  :deep(.controls > .control) {
    // tile = icon + horizontal padding (the Button's own tokens)
    margin-inline: calc(
      (100cqh - var(--control-icon-size) - 2 * var(--control-px)) / 2
    );
  }

  :deep(.slot-wrapper) {
    line-height: 0;
  }

  &.inner :deep(.controls) {
    // above the full-width label, which would otherwise cover the buttons' tops
    z-index: 2;
  }

  &.inner :deep(.control-label) {
    left: 0;
    right: 0;
    text-align: center;
  }
}
</style>
