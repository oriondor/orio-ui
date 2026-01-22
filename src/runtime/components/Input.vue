<script setup lang="ts">
const modelValue = defineModel<string>({ default: "" });
</script>

<template>
  <orio-control-element v-bind="$attrs">
    <input
      v-model="modelValue"
      type="text"
      v-bind="$attrs"
      class="text-input"
    />
  </orio-control-element>
</template>

<style lang="scss" scoped>
@use "../assets/css/mixins" as *;

.text-input {
  @include base-input;
}
</style>
