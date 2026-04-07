<script setup lang="ts" generic="T extends object">
import { computed, ref, toRef, toRefs } from "vue";
import type { ControlProps } from "./ControlElement.vue";
import { useControlTokens } from "../composables/useControlSize";
import { useListKeyboard } from "../composables/useListKeyboard";
import { useI18n } from "vue-i18n";

export type SelectableOption<T extends object = object> = string | T;

export interface SelectProps extends ControlProps {
  options: SelectableOption[];
  multiple?: boolean;
  field?: string;
  optionName?: string;
  placeholder?: string;
}

const { t } = useI18n();

const props = withDefaults(defineProps<SelectProps>(), {
  field: "id",
});

const { field, optionName } = toRefs(props);
const resolvedPlaceholder = computed(
  () => props.placeholder ?? t("selector.placeholder"),
);

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
  if (props.multiple) {
    const flatOption =
      typeof option === "string" ? option : (option as T)[key.value];
    return (flatModalValue.value as string[]).includes(flatOption as string);
  } else {
    if (typeof option === "string") return modelValue.value === option;
    return !!(
      flatModalValue.value && flatModalValue.value === (option as T)[key.value]
    );
  }
}

function getOptionLabel(option: SelectableOption | undefined): string {
  if (!option) return resolvedPlaceholder.value;
  if (typeof option === "string") return option;
  if (optionName.value) return String((option as T)[label.value]);
  return JSON.stringify(option);
}

function getOptionKey(option: SelectableOption): string | number {
  if (typeof option === "string") return option;
  return String((option as T)[key.value]);
}

const { tokens: controlTokens } = useControlTokens(toRef(props, "size"));

const controlProps = computed(() => {
  const {
    options: _options,
    multiple: _multiple,
    field: _field,
    optionName: _optionName,
    placeholder: _placeholder,
    ...rest
  } = props;
  return rest;
});

const selectorAttrs = computed(() => ({ getOptionKey, getOptionLabel }));

const popoverToggleRef = ref<(force?: boolean | null) => void>(() => {});

const {
  highlightedIndex,
  listRef,
  onKeydown,
  reset: resetHighlight,
} = useListKeyboard({
  count: () => props.options.length,
  onSelect: (index) =>
    toggleOption(props.options[index]!, () => popoverToggleRef.value(false)),
  onOpen: () => {
    popoverToggleRef.value(true);
    resetHighlight();
  },
  onClose: () => popoverToggleRef.value(false),
  initialIndex: () => props.options.findIndex(isOptionSelected),
});
</script>

<template>
  <orio-control-element v-bind="controlProps">
    <orio-popover position="bottom-right" :offset="5">
      <template #default="{ toggle, isOpen }">
        <slot name="trigger" :toggle>
          <button
            :id="props.id"
            type="button"
            class="selector-trigger"
            aria-haspopup="listbox"
            :aria-expanded="isOpen"
            @click="
              toggle();
              !isOpen && resetHighlight();
            "
            @keydown="
              popoverToggleRef = toggle;
              onKeydown($event, isOpen);
            "
          >
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
                    <span>
                      {{
                        t("selector.selected", { count: modelValue!.length })
                      }}
                    </span>
                  </template>
                </slot>
              </div>
              <orio-icon name="chevron-down" />
            </slot>
          </button>
        </slot>
      </template>

      <template #content="{ toggle }">
        <div class="selector-content" :style="controlTokens">
          <ul
            v-if="options.length"
            ref="listRef"
            role="listbox"
            :aria-multiselectable="multiple || undefined"
          >
            <orio-list-item
              v-for="(option, index) in options"
              :key="getOptionKey(option)"
              :selectable="multiple"
              :selected="isOptionSelected(option)"
              role="option"
              :aria-selected="isOptionSelected(option)"
              :class="{ highlighted: index === highlightedIndex }"
              @click="toggleOption(option, toggle)"
              @mouseenter="highlightedIndex = index"
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
            </orio-list-item>
          </ul>
          <slot v-else name="no-options">
            <orio-empty-state :title="t('selector.noOptions')" size="small" />
          </slot>
          <slot name="options-addon" />
        </div>
      </template>
    </orio-popover>
  </orio-control-element>
</template>

<style lang="scss" scoped>
.selector-trigger {
  width: 100%;
  z-index: 1;
  min-height: 1.5rem;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--control-radius);
  padding: var(--control-py) var(--control-px);
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
  border-radius: var(--control-radius);
  margin-top: 0.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    :deep(.list-item) {
      padding: var(--control-py) var(--control-px);
      cursor: pointer;

      &.highlighted:not(.selected) {
        background-color: var(--color-surface);
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
