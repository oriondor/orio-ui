<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { ControlProps } from "../ControlElement.vue";
import type { CalendarMarker } from "../Calendar.vue";
import { formatDate } from "../../utils/date";

interface Props extends ControlProps {
  placeholder?: string;
  month?: boolean;
  min?: string | null;
  max?: string | null;
  markers?: CalendarMarker[];
  getMarker?: (iso: string) => CalendarMarker | null;
  isDisabled?: (iso: string) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
  min: null,
  max: null,
  markers: () => [],
});

const value = defineModel<string | null>({ default: null });

const { locale, t } = useI18n();

const displayFormat = computed<Intl.DateTimeFormatOptions | undefined>(() =>
  props.month ? { month: "short", year: "numeric" } : undefined,
);

const display = computed(() =>
  displayFormat.value
    ? formatDate(value.value, locale.value, displayFormat.value)
    : formatDate(value.value, locale.value),
);
const placeholderText = computed(
  () => props.placeholder ?? t("datePicker.placeholder"),
);

const calendarIsDisabled = computed(() => (iso: string) => {
  if (props.min && iso < props.min) return true;
  if (props.max && iso > props.max) return true;
  return props.isDisabled?.(iso) ?? false;
});

function pick(iso: string, toggle: (force?: boolean | null) => void) {
  value.value = iso;
  toggle(false);
}
</script>

<template>
  <orio-date-picker-trigger
    v-bind="props"
    :text="display"
    :placeholder="placeholderText"
  >
    <template #default="{ toggle }">
      <orio-date-month-calendar
        v-if="month"
        :selected="value"
        :markers
        :get-marker="getMarker"
        :is-disabled="calendarIsDisabled"
        @select="pick($event, toggle)"
      />
      <orio-calendar
        v-else
        :selected="value"
        :markers
        :get-marker="getMarker"
        :is-disabled="calendarIsDisabled"
        @select="pick($event, toggle)"
      />
    </template>
  </orio-date-picker-trigger>
</template>
