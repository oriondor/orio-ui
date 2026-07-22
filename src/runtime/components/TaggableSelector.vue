<script setup lang="ts" generic="T extends object">
import { computed, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import type { SelectableOption, SelectProps } from "./Selector.vue";
import type { TagProps } from "./Tag.vue";
import { useFuzzySearch } from "../composables/useFuzzySearch";

export interface TaggableSelectorProps extends Omit<SelectProps, "multiple"> {
  tagVariant?: TagProps["variant"];
  /** Show the "Create …" button and allow Enter-to-create when nothing
   *  matches the search. Defaults to true; pass false to disable creation. */
  allowCreate?: boolean;
}

const props = withDefaults(defineProps<TaggableSelectorProps>(), {
  field: "id",
  optionName: "text",
  allowCreate: true,
});

const { options, optionName } = toRefs(props);

const modelValue = defineModel<SelectableOption[]>({ default: () => [] });
const search = defineModel<string>("search", { default: "" });

const emit = defineEmits<{
  /** The user asked to create a new option — via the "Create …" button, or
   *  Enter while nothing matches the search. Payload is the current search text. */
  create: [search: string];
}>();

const { t } = useI18n();

const labelKey = computed(() => optionName.value as Extract<keyof T, string>);

const optionsAreStrings = computed(() => typeof options.value[0] === "string");

const filteredStringOptions = useFuzzySearch(
  computed(() => (optionsAreStrings.value ? (options.value as string[]) : [])),
  search,
);
// note: fuse keys are fixed at setup time — optionName must not change at runtime
const filteredObjectOptions = useFuzzySearch<T>(
  computed(() => (optionsAreStrings.value ? [] : (options.value as T[]))),
  search,
  { keys: [props.optionName ?? "text"], threshold: 0.3 },
);
const filteredOptions = computed<SelectableOption[]>(() =>
  optionsAreStrings.value
    ? filteredStringOptions.value
    : filteredObjectOptions.value,
);

const exactMatchExists = computed(() =>
  options.value.some((option) =>
    typeof option === "string"
      ? option === search.value
      : String((option as T)[labelKey.value]) === search.value,
  ),
);

const resolvedPlaceholder = computed(() => {
  if (modelValue.value.length) return "";
  return props.placeholder ?? t("taggableSelector.placeholder");
});

const canCreate = computed(
  () => props.allowCreate && !!search.value && !exactMatchExists.value,
);

function createOption() {
  if (!canCreate.value) return;
  emit("create", search.value);
  search.value = "";
}

function onSearchEnter(isOpen: boolean, selectHighlighted: () => boolean) {
  if (isOpen && selectHighlighted()) return;
  // Enter only creates when the search matches nothing; otherwise it selects.
  if (!filteredOptions.value.length) createOption();
}

const selectorProps = computed(() => {
  const {
    tagVariant: _tagVariant,
    placeholder: _placeholder,
    allowCreate: _allowCreate,
    ...rest
  } = props;
  return rest;
});
</script>

<template>
  <orio-selector
    v-bind="selectorProps"
    v-model="modelValue"
    :options="filteredOptions"
    multiple
  >
    <template
      #trigger="{
        toggle,
        control,
        isOpen,
        triggerKeydown,
        selectHighlighted,
        getOptionKey,
        getOptionLabel,
      }"
    >
      <div
        v-bind="control"
        class="taggable-trigger"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        @click="toggle()"
        @keydown="triggerKeydown"
      >
        <orio-tag
          v-for="option in modelValue"
          :key="getOptionKey(option)"
          :text="getOptionLabel(option)"
          :variant="tagVariant"
        />
        <input
          v-model="search"
          class="taggable-search"
          type="text"
          :placeholder="resolvedPlaceholder"
          @click.stop="toggle(true)"
          @input="toggle(true)"
          @keydown.enter.prevent="onSearchEnter(isOpen, selectHighlighted)"
        />
        <orio-icon name="chevron-down" />
      </div>
    </template>

    <template #option="{ option, getOptionLabel }">
      <orio-tag :text="getOptionLabel(option)" :variant="tagVariant" />
    </template>

    <template #no-options>
      <orio-empty-state :title="t('taggableSelector.noMatches')" size="small" />
    </template>

    <template #options-addon>
      <div v-if="canCreate" class="create-option">
        <orio-button
          variant="subdued"
          icon="add"
          appearance="minimal"
          @click="createOption"
        >
          {{ t("taggableSelector.create", { search }) }}
        </orio-button>
      </div>
    </template>
  </orio-selector>
</template>

<style lang="scss" scoped>
.taggable-trigger {
  width: 100%;
  min-height: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;

  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--control-radius);
  padding: var(--control-py) var(--control-px);
  color: var(--color-text);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: var(--color-accent);
  }

  &:focus-within {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px var(--color-surface);
  }

  .icon {
    margin-left: auto;
    color: var(--color-muted);
  }
}

.taggable-search {
  flex: 1;
  min-width: 6rem;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  outline: none;
}

.create-option {
  border-top: 1px solid var(--color-border);

  :deep(button) {
    width: 100%;
    justify-content: flex-start;
    border-radius: 0;

    &:hover {
      background-color: var(--color-surface);
    }
  }
}
</style>
