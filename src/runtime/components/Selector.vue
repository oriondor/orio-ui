<script setup lang="ts" generic="T extends object">
import { computed, ref, toRef, toRefs, useAttrs, useId } from "vue";
import type { ControlProps } from "./ControlElement.vue";
import { useControlTokens } from "../composables/useControlSize";
import { useListKeyboard } from "../composables/useListKeyboard";
import { useI18n } from "vue-i18n";
import { getFocusable } from "../utils/focusable";

export type SelectableOption<T extends object = object> = string | T;

export interface SelectProps extends ControlProps {
  options: SelectableOption[];
  multiple?: boolean;
  field?: string;
  optionName?: string;
  placeholder?: string;
}

const { t } = useI18n();
const listboxId = useId();

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
    return (
      Array.isArray(flatModalValue.value) &&
      (flatModalValue.value as string[]).includes(flatOption as string)
    );
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

const attrs = useAttrs();
const listboxLabel = computed(
  () =>
    props.label ||
    props.ariaLabel ||
    (attrs["aria-label"] as string | undefined) ||
    props.placeholder ||
    t("selector.placeholder"),
);

const selectorAttrs = computed(() => ({ getOptionKey, getOptionLabel }));

const popoverRef = ref<{ focusTrigger?: () => void } | null>(null);
const addonRef = ref<HTMLElement | null>(null);
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

const EDITABLE_KEY_ALLOWLIST = ["ArrowDown", "ArrowUp", "Escape"];

function isEventFromEditableElement(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  if (!target || target === event.currentTarget) return false;
  if (target.matches("input, textarea, select")) return true;
  return !!target.closest(
    "[contenteditable=''], [contenteditable='true'], [contenteditable='plaintext-only']",
  );
}

function onTriggerKeydown(
  event: KeyboardEvent,
  toggle: (force?: boolean | null) => void,
  isOpen: boolean,
) {
  popoverToggleRef.value = toggle;
  // Tab from the open trigger enters the addon, which the popover teleports
  // away from the trigger's tab order
  if (
    event.key === "Tab" &&
    !event.shiftKey &&
    isOpen &&
    !isEventFromEditableElement(event)
  ) {
    const first = getFocusable(addonRef.value)[0];
    if (first) {
      event.preventDefault();
      first.focus();
    }
    return;
  }
  if (
    isEventFromEditableElement(event) &&
    !EDITABLE_KEY_ALLOWLIST.includes(event.key)
  ) {
    return;
  }
  onKeydown(event, isOpen);
}

function isTextEntry(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement &&
    !["checkbox", "radio", "button", "submit", "reset"].includes(target.type)
  );
}

// Keys inside #options-addon: Tab leaves back to the trigger without
// trapping, arrows and Enter in a text field drive the list highlight.
// Escape is left to the Popover, which closes and refocuses the trigger.
function onContentKeydown(
  event: KeyboardEvent,
  toggle: (force?: boolean | null) => void,
) {
  if (event.defaultPrevented) return;
  const target = event.target as HTMLElement;
  if (event.key === "Tab") {
    const focusables = getFocusable(addonRef.value);
    if (event.shiftKey && target === focusables[0]) {
      event.preventDefault();
      popoverRef.value?.focusTrigger?.();
    } else if (!event.shiftKey && target === focusables.at(-1)) {
      // focus the trigger, then let the browser's Tab move on past it
      toggle(false);
      popoverRef.value?.focusTrigger?.();
    }
    return;
  }
  if (target.matches("select, textarea")) return;
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    popoverToggleRef.value = toggle;
    onKeydown(event, true);
  } else if (event.key === "Enter" && isTextEntry(target)) {
    event.preventDefault();
    // a single select closes on pick; the focused addon control unmounts
    if (selectHighlightedOption(toggle) && !props.multiple) {
      popoverRef.value?.focusTrigger?.();
    }
  }
}

function createTriggerKeydownHandler(
  toggle: (force?: boolean | null) => void,
  isOpen: boolean,
) {
  return (event: KeyboardEvent) => onTriggerKeydown(event, toggle, isOpen);
}

function selectHighlightedOption(
  toggle: (force?: boolean | null) => void,
): boolean {
  popoverToggleRef.value = toggle;
  const highlightedOption = props.options[highlightedIndex.value];
  if (highlightedIndex.value < 0 || highlightedOption === undefined) {
    return false;
  }
  toggleOption(highlightedOption, () => toggle(false));
  return true;
}

function createSelectHighlightedHandler(
  toggle: (force?: boolean | null) => void,
) {
  return () => selectHighlightedOption(toggle);
}

// Opening the list seeds the roving highlight so it is keyboard-navigable
// from the first arrow press. This lives here — the one place that sees both
// the popover's open event and owns the highlight — so triggers just "open"
// and never touch the highlight themselves.
function triggerToggle(
  popoverToggle: (force?: boolean | null) => void,
  isOpen: boolean,
  force: boolean | null = null,
) {
  const willOpen = force === true || (force === null && !isOpen);
  popoverToggle(force);
  if (willOpen) resetHighlight();
}

function createTriggerToggle(
  popoverToggle: (force?: boolean | null) => void,
  isOpen: boolean,
) {
  return (force: boolean | null = null) =>
    triggerToggle(popoverToggle, isOpen, force);
}
</script>

<template>
  <orio-control-element v-slot="{ control }" v-bind="controlProps">
    <orio-popover ref="popoverRef" position="bottom-right" :offset="5">
      <template #default="{ toggle, isOpen }">
        <slot
          name="trigger"
          :toggle="createTriggerToggle(toggle, isOpen)"
          :control
          :isOpen
          :listboxId
          :triggerKeydown="createTriggerKeydownHandler(toggle, isOpen)"
          :selectHighlighted="createSelectHighlightedHandler(toggle)"
          :attrs="$attrs"
          v-bind="selectorAttrs"
        >
          <button
            v-bind="{ ...$attrs, ...control }"
            type="button"
            class="selector-trigger"
            aria-haspopup="listbox"
            :aria-expanded="isOpen"
            @click="triggerToggle(toggle, isOpen)"
            @keydown="onTriggerKeydown($event, toggle, isOpen)"
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
        <div
          class="selector-content"
          :style="controlTokens"
          @keydown="onContentKeydown($event, toggle)"
        >
          <ul
            v-if="options.length"
            :id="listboxId"
            ref="listRef"
            role="listbox"
            :aria-label="listboxLabel"
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
          <div ref="addonRef"><slot name="options-addon" /></div>
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

  &:not(:disabled):hover {
    border-color: var(--color-accent);
    background-color: var(--color-surface); /* subtle lift */
  }

  &:not(:disabled):focus-within {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px var(--color-surface);
  }

  .icon {
    color: var(--color-muted);
    transition: color 0.2s ease;
  }

  &:not(:disabled):hover .icon {
    color: var(--color-accent);
  }

  // same look as a disabled Input: surface fill, muted text, no hover/focus change
  &:disabled {
    background-color: var(--color-surface);
    color: var(--color-muted);
    cursor: not-allowed;
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
