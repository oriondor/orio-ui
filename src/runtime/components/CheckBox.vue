<script setup lang="ts">
const modelValue = defineModel<boolean>({ required: false });

defineProps<{
  checkedIcon?: string; // optional: pass icon name for checked state
  uncheckedIcon?: string; // optional: pass icon name for unchecked state
}>();
</script>

<template>
  <orio-control-element class="checkbox">
    <label class="checkbox-label">
      <input
        v-model="modelValue"
        type="checkbox"
        class="checkbox-input"
        tabindex="-1"
      />
      <span
        class="checkbox-box"
        :class="{
          defaultChecked: !checkedIcon,
          defaultUnchecked: !uncheckedIcon,
        }"
      >
        <slot name="icon" :checked="modelValue">
          <orio-icon v-if="modelValue && checkedIcon" :name="checkedIcon" />
          <orio-icon
            v-else-if="!modelValue && uncheckedIcon"
            :name="uncheckedIcon"
          />
        </slot>
      </span>
      <slot />
    </label>
  </orio-control-element>
</template>

<style lang="scss" scoped>
.checkbox {
  --box-size: 1rem;

  &-label {
    position: relative;
    user-select: none;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--color-text);
  }

  &-input {
    position: absolute;
    inset: 0;
    width: var(--box-size);
    height: 1rem;
    margin: 0;
    opacity: 0;
  }

  &-box {
    width: var(--box-size);
    height: var(--box-size);
    border: 2px solid var(--color-border);
    border-radius: var(--border-radius-sm);
    background-color: var(--color-bg);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;
  }

  .checkbox-input:checked + .checkbox-box {
    background-color: var(--color-accent);
    border-color: var(--color-accent);
  }

  .checkbox-input:checked + .checkbox-box.defaultChecked {
    &::after {
      content: '';
      width: 0.3rem;
      height: 0.6rem;
      position: relative;
      bottom: 0.1rem;
      border: solid var(--color-accent-ink);
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }

  &-label:hover .checkbox-box {
    border-color: var(--color-accent);
  }
  .checkbox-input:focus-visible + .checkbox-box {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}
</style>
