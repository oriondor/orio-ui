<script setup lang="ts" generic="T extends object">
import { computed, toRefs } from "vue";

export type SelectableOption<T extends object = object> = string | T;

export interface SelectProps<T extends object = object> {
  options: SelectableOption[];
  multiple?: boolean;
  field?: string;
  optionName?: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<SelectProps>(), {
  placeholder: "Select an option",
  field: "id",
});

const { field, optionName, placeholder } = toRefs(props);

const modelValue = defineModel<
  SelectableOption | SelectableOption[] | null | undefined
>({
  required: true,
});

// Key to the object when option is not 'string'
const key = computed(() => field.value as Extract<keyof T, string>);
const label = computed(() => optionName.value as Extract<keyof T, string>);

const flatModalValue = computed(() => {
  if (!modelValue.value) return null;
  if (!props.multiple || !Array.isArray(modelValue.value))
    return typeof modelValue.value === "string"
      ? modelValue.value
      : (modelValue.value as T)[key.value];
  return modelValue.value.map((option) =>
    typeof option === "string" ? option : (option as T)[key.value],
  );
});

function toggleOption(option: SelectableOption, toggle: () => void) {
  if (props.multiple) {
    if (Array.isArray(modelValue.value)) {
      const index = modelValue.value.findIndex((opt) =>
        typeof option === "string"
          ? option === opt
          : opt[key.value] === (option as T)[key.value],
      );
      if (index > -1) {
        modelValue.value.splice(index, 1);
      } else {
        modelValue.value.push(option);
      }
    } else {
      modelValue.value = [option];
    }
  } else {
    modelValue.value = option;
    // should later be turned off with some additional interaction modes
    toggle();
  }
}

function isOptionSelected(option: SelectableOption): boolean {
  if (typeof option === "string") return modelValue.value === option;
  return !!(
    flatModalValue.value &&
    (flatModalValue.value === (option as T)[key.value] ||
      (flatModalValue.value as string[]).includes(
        (option as T)[key.value] as string,
      ))
  );
}

function getOptionLabel(option: SelectableOption | undefined): string {
  if (!option) return placeholder.value;
  if (typeof option === "string") return option;
  if (optionName.value) return String((option as T)[label.value]);
  return JSON.stringify(option);
}

function getOptionKey(option: SelectableOption): string | number {
  if (typeof option === "string") return option;
  return String((option as T)[key.value]);
}

const selectorAttrs = computed(() => ({ getOptionKey, getOptionLabel }));
</script>

<template>
  <orio-control-element>
    <orio-popover position="bottom-right" :offset="5">
      <template #default="{ toggle }">
        <slot name="trigger" :toggle>
          <div class="selector-trigger">
            <slot
              name="trigger-content"
              :toggle
              v-bind="selectorAttrs"
              :attrs="$attrs"
            >
              <div class="trigger-content">
                <slot
                  name="trigger-label"
                  :toggle
                  v-bind="selectorAttrs"
                  :attrs="$attrs"
                >
                  <template v-if="!props.multiple">
                    {{ getOptionLabel(modelValue as T) }}
                  </template>
                  <template v-else-if="Array.isArray(modelValue)">
                    <span> {{ modelValue!.length }} selected </span>
                  </template>
                </slot>
              </div>
              <orio-icon name="chevron-down" />
            </slot>
          </div>
        </slot>
      </template>

      <template #content="{ toggle }">
        <div class="selector-content">
          <ul v-if="options.length">
            <li
              v-for="option in options"
              :key="getOptionKey(option)"
              :class="{ selected: isOptionSelected(option) }"
              @click="toggleOption(option, toggle)"
            >
              <slot
                name="option"
                :option
                :toggle
                :selected="isOptionSelected(option)"
                v-bind="selectorAttrs"
              >
                {{ getOptionLabel(option) }}
              </slot>
            </li>
          </ul>
          <slot v-else name="no-options">
            <orio-empty-state title="No options found" size="small" />
          </slot>
          <slot name="options-addon" />
        </div>
      </template>
    </orio-popover>
  </orio-control-element>
</template>

<style lang="scss" scoped>
.selector-trigger {
  z-index: 1;
  min-height: 1.5rem;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--color-text);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    border-color: var(--color-accent);
    background-color: var(--color-surface); /* subtle lift */
  }

  &:focus-within {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px var(--color-surface);
  }

  .icon {
    color: var(--color-muted);
    transition: color 0.2s ease;
  }

  &:hover .icon {
    color: var(--color-accent);
  }
}

.selector-content {
  min-width: 15rem;
  max-height: 20rem;
  overflow: auto;

  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  margin-top: 0.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      transition:
        background-color 0.15s ease,
        color 0.15s ease;

      color: var(--color-text);

      &:hover {
        background-color: var(--color-surface); /* neutral lift */
      }

      &.selected {
        background-color: var(--color-accent);
        color: var(--color-accent-soft-darker);
        font-weight: 400;
      }
    }
  }
}

.trigger-content {
  width: 100%;
}

:deep(.popover) {
  width: 100%;
}
</style>
