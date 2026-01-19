<script setup lang="ts">
export interface ControlProps {
  /**
   * Minimal will reset margin and remove border and box shadow from every element inside the slot
   */
  appearance?: "normal" | "minimal";
}

withDefaults(defineProps<ControlProps>(), {
  appearance: "normal",
});
</script>

<template>
  <div class="control" :class="[appearance]">
    <label v-if="$attrs.label" class="control-label">{{ $attrs.label }}</label>
    <div class="slot-wrapper" v-bind="$attrs">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control {
  margin: 0.5rem;

  .control-label {
    user-select: none;
  }

  .slot-wrapper {
    height: fit-content;
    line-height: 0;
  }

  &.minimal {
    margin: 0;

    .slot-wrapper :first-child {
      line-height: 1.5;
      border: 0;
      &:focus {
        box-shadow: none;
      }
    }
  }
}
</style>
