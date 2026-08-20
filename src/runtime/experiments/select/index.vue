<script setup lang="ts" generic="T extends object">
import { computed, ref, toRef, toRefs, useId, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import type { ControlProps } from "../../components/ControlElement.vue";
import { useControlTokens } from "../../composables/useControlSize";
import { useListKeyboard } from "../../composables/useListKeyboard";
import Popover from "../popover/index.vue";

export type SelectOption<T extends object = object> = string | T;

export interface SelectProps extends ControlProps {
  options: SelectOption[];
  /** Uniqueness key for object options. */
  field?: string;
  /** Display-label key for object options. Objects render as JSON without it. */
  optionName?: string;
  placeholder?: string;
}

const { t } = useI18n();

const props = withDefaults(defineProps<SelectProps>(), {
  field: "id",
});

const { field, optionName } = toRefs(props);

const modelValue = defineModel<SelectOption | null | undefined>({
  required: true,
});

const resolvedPlaceholder = computed(
  () => props.placeholder ?? t("selector.placeholder"),
);

const key = computed(() => field.value as Extract<keyof T, string>);
const label = computed(() => optionName.value as Extract<keyof T, string>);

function getOptionLabel(option: SelectOption | undefined | null): string {
  if (!option) return resolvedPlaceholder.value;
  if (typeof option === "string") return option;
  if (optionName.value) return String((option as T)[label.value]);
  return JSON.stringify(option);
}

function getOptionKey(option: SelectOption): string | number {
  if (typeof option === "string") return option;
  return String((option as T)[key.value]);
}

function isOptionSelected(option: SelectOption): boolean {
  if (!modelValue.value) return false;
  if (typeof option === "string") return modelValue.value === option;
  if (typeof modelValue.value === "string") return false;

  return (modelValue.value as T)[key.value] === (option as T)[key.value];
}

// The popover owns its open state in the DOM, so the listbox is opened and
// closed through the panel element itself. The panel is authored in this SFC
// (it is our slot content), so a template ref reaches it directly — no
// `getElementById`. `popoverId` still pairs trigger and panel for the Popover.
const popoverId = useId();
const isOpen = ref(false);
const panelRef = useTemplateRef<HTMLElement>("panelRef");

function openList() {
  panelRef.value?.showPopover();
}

function closeList() {
  panelRef.value?.hidePopover();
}

function selectOption(option: SelectOption) {
  modelValue.value = option;
  closeList();
}

const {
  highlightedIndex,
  listRef,
  onKeydown,
  reset: resetHighlight,
} = useListKeyboard({
  count: () => props.options.length,
  onSelect: (index) => selectOption(props.options[index]!),
  onOpen: openList,
  onClose: closeList,
  initialIndex: () => props.options.findIndex(isOptionSelected),
});

/**
 * Native `toggle` fires on the panel whenever the popover opens or closes —
 * including light-dismiss and Esc, which never pass through this component.
 * It is the only reliable open-state signal. The Popover suppresses the pair
 * its own silent reopen produces, so this does not see those.
 */
function onPanelToggle(event: Event) {
  isOpen.value = (event as ToggleEvent).newState === "open";

  if (isOpen.value) {
    resetHighlight();
  }
}

const { tokens: controlTokens } = useControlTokens(toRef(props, "size"));

// Select-specific props must never reach ControlElement.
const controlProps = computed(() => {
  const {
    options: _options,
    field: _field,
    optionName: _optionName,
    placeholder: _placeholder,
    ...rest
  } = props;

  return rest;
});
</script>

<template>
  <orio-control-element v-slot="{ control }" v-bind="controlProps">
    <!-- Placement is the Popover's concern; the listbox just picks a side. -->
    <Popover :id="popoverId" position="bottom span-right">
      <template #trigger="triggerProps">
        <slot
          name="trigger"
          v-bind="triggerProps"
          :control
          :isOpen
          :getOptionKey
          :getOptionLabel
        >
          <button
            v-bind="{ ...control, ...triggerProps }"
            type="button"
            class="select-trigger"
            aria-haspopup="listbox"
            :aria-expanded="isOpen"
            @keydown="onKeydown($event, isOpen)"
          >
            <slot name="trigger-label" :getOptionKey :getOptionLabel>
              <span class="trigger-label">
                {{ getOptionLabel(modelValue as T) }}
              </span>
            </slot>
            <orio-icon name="chevron-down" />
          </button>
        </slot>
      </template>

      <template #body="bodyProps">
        <div
          v-bind="bodyProps"
          ref="panelRef"
          class="select-content"
          :style="controlTokens"
          @toggle="onPanelToggle"
        >
          <ul v-if="options.length" ref="listRef" role="listbox">
            <orio-list-item
              v-for="(option, index) in options"
              :key="getOptionKey(option)"
              role="option"
              :selected="isOptionSelected(option)"
              :aria-selected="isOptionSelected(option)"
              :class="{ highlighted: index === highlightedIndex }"
              @click="selectOption(option)"
              @mouseenter="highlightedIndex = index"
            >
              <slot
                name="option"
                :option
                :selected="isOptionSelected(option)"
                :getOptionKey
                :getOptionLabel
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
    </Popover>
  </orio-control-element>
</template>

<style lang="scss" scoped>
.select-trigger {
  width: 100%;
  min-height: 1.5rem;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  cursor: pointer;

  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--control-radius);
  padding: var(--control-py) var(--control-px);
  color: var(--color-text);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    border-color: var(--color-accent);
    background-color: var(--color-surface);
  }
}

.trigger-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/*
 * The panel is rendered in the top layer, so these rules only reach it because
 * the element itself carries the class — descendant selectors from a parent do
 * not apply. Scoped styles work here since the element is authored in this SFC.
 */
.select-content {
  min-width: 12rem;
  max-height: 20rem;
  overflow: auto;
  padding: 0;

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
</style>
