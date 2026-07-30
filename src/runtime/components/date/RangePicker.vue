<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { ControlProps } from "../ControlElement.vue";
import type { CalendarMarker } from "../Calendar.vue";
import {
  addMonths,
  formatDate,
  formatISO,
  parseISO,
  startOfMonth,
  type DateRange,
} from "../../utils/date";

export type { DateRange };

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

const range = defineModel<DateRange>({
  default: () => ({ start: null, end: null }),
});

const { locale, t } = useI18n();

const displayFormat = computed<Intl.DateTimeFormatOptions | undefined>(() =>
  props.month ? { month: "short", year: "numeric" } : undefined,
);

const display = computed(() => {
  const format = displayFormat.value;
  const start = format
    ? formatDate(range.value?.start, locale.value, format)
    : formatDate(range.value?.start, locale.value);
  const end = format
    ? formatDate(range.value?.end, locale.value, format)
    : formatDate(range.value?.end, locale.value);
  if (start && end) return `${start} – ${end}`;
  return start || end || "";
});

const placeholderText = computed(
  () => props.placeholder ?? t("dateRangePicker.placeholder"),
);

function anchorPairFor(startIso: string | null | undefined): [string, string] {
  const startDate = parseISO(startIso) ?? new Date();
  if (props.month) {
    const firstOfYear = new Date(startDate.getFullYear(), 0, 1);
    return [
      formatISO(firstOfYear),
      formatISO(new Date(startDate.getFullYear() + 1, 0, 1)),
    ];
  }
  const firstOfMonth = startOfMonth(startDate);
  return [formatISO(firstOfMonth), formatISO(addMonths(firstOfMonth, 1))];
}

const [seedLeft, seedRight] = anchorPairFor(range.value?.start);
const leftAnchor = ref<string | null>(seedLeft);
const rightAnchor = ref<string | null>(seedRight);

watch(
  () => range.value?.start,
  (start) => {
    if (!parseISO(start)) return;
    const [nextLeft, nextRight] = anchorPairFor(start);
    if (leftAnchor.value === nextLeft || rightAnchor.value === nextLeft) return;
    leftAnchor.value = nextLeft;
    rightAnchor.value = nextRight;
  },
);

const hovering = ref<string | null>(null);

const previewEnd = computed(() => {
  if (range.value?.end) return range.value.end;
  if (!hovering.value || !range.value?.start) return null;
  const start = parseISO(range.value.start);
  const hover = parseISO(hovering.value);
  if (!start || !hover) return null;
  return hover > start ? hovering.value : null;
});

const previewStart = computed(() => {
  if (range.value?.start && range.value?.end) return range.value.start;
  if (!hovering.value || !range.value?.start) return range.value?.start ?? null;
  const start = parseISO(range.value.start);
  const hover = parseISO(hovering.value);
  if (!start || !hover) return range.value.start;
  return hover < start ? hovering.value : range.value.start;
});

const previewMarker = computed<CalendarMarker | null>(() => {
  if (!previewStart.value || !previewEnd.value) return null;
  return {
    variant: "accent",
    start: previewStart.value,
    end: previewEnd.value,
  };
});

const calendarGetMarker = computed(() => (iso: string) => {
  const preview = previewMarker.value;
  if (preview && iso >= preview.start && iso <= preview.end) return preview;
  return props.getMarker?.(iso) ?? null;
});

const calendarIsDisabled = computed(() => (iso: string) => {
  if (props.min && iso < props.min) return true;
  if (props.max && iso > props.max) return true;
  return props.isDisabled?.(iso) ?? false;
});

function pick(iso: string, toggle: (force?: boolean | null) => void) {
  const current = range.value ?? { start: null, end: null };

  if (!current.start || (current.start && current.end)) {
    range.value = { start: iso, end: null };
    return;
  }

  const startDate = parseISO(current.start);
  const picked = parseISO(iso);
  if (!startDate || !picked) return;

  if (picked < startDate) {
    range.value = { start: iso, end: current.start };
  } else {
    range.value = { start: current.start, end: iso };
  }
  hovering.value = null;
  toggle(false);
}

function onHover(iso: string) {
  hovering.value = iso;
}

function clearHover() {
  hovering.value = null;
}
</script>

<template>
  <orio-date-picker-trigger
    v-bind="props"
    :text="display"
    :placeholder="placeholderText"
  >
    <template #default="{ toggle }">
      <div class="range-content" @mouseleave="clearHover">
        <template v-if="month">
          <orio-date-month-calendar
            v-model:anchor="leftAnchor"
            :markers
            :get-marker="calendarGetMarker"
            :is-disabled="calendarIsDisabled"
            @select="pick($event, toggle)"
            @month-enter="onHover"
          />
          <orio-date-month-calendar
            v-model:anchor="rightAnchor"
            :markers
            :get-marker="calendarGetMarker"
            :is-disabled="calendarIsDisabled"
            @select="pick($event, toggle)"
            @month-enter="onHover"
          />
        </template>
        <template v-else>
          <orio-calendar
            v-model:anchor="leftAnchor"
            :markers
            :get-marker="calendarGetMarker"
            :is-disabled="calendarIsDisabled"
            @select="pick($event, toggle)"
            @day-enter="onHover"
          />
          <orio-calendar
            v-model:anchor="rightAnchor"
            :markers
            :get-marker="calendarGetMarker"
            :is-disabled="calendarIsDisabled"
            @select="pick($event, toggle)"
            @day-enter="onHover"
          />
        </template>
      </div>
    </template>
  </orio-date-picker-trigger>
</template>

<style lang="scss" scoped>
.range-content {
  display: flex;
  gap: 0.75rem;
}
</style>
