<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useMediaQuery } from "@vueuse/core";
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

type Side = "start" | "end";

const [seedStart, seedEnd] = anchorPairFor(range.value?.start);
const anchors = reactive<Record<Side, string | null>>({
  start: seedStart,
  end: seedEnd,
});

watch(
  () => range.value?.start,
  (start) => {
    if (!parseISO(start)) return;
    const [nextStart, nextEnd] = anchorPairFor(start);
    if (anchors.start === nextStart || anchors.end === nextStart) return;
    anchors.start = nextStart;
    anchors.end = nextEnd;
  },
);

// two calendars don't fit side by side on a phone; show one and let the
// user switch which month it is
const isNarrow = useMediaQuery("(max-width: 48rem)");
const activeSide = ref<Side>("start");
const sides: Side[] = ["start", "end"];
const visibleSides = computed<Side[]>(() =>
  isNarrow.value ? [activeSide.value] : sides,
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
    // picked on the narrow End view: move only the hidden Start anchor, so
    // the start watcher keeps the End view where the user is looking
    if (isNarrow.value && activeSide.value === "end") {
      anchors.start = anchorPairFor(iso)[0];
    }
    // picked on the narrow Start view: the end comes next, usually close by,
    // so open the End view on the same month
    if (isNarrow.value && activeSide.value === "start") {
      anchors.end = anchorPairFor(iso)[0];
      activeSide.value = "end";
    }
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
        <div v-if="isNarrow" class="range-sides">
          <orio-button
            v-for="side in sides"
            :key="side"
            size="sm"
            :variant="side === activeSide ? 'primary' : 'secondary'"
            :aria-pressed="side === activeSide"
            @click="activeSide = side"
          >
            {{ t(`dateRangePicker.${side}`) }}
          </orio-button>
        </div>
        <div class="range-calendars">
          <template v-if="month">
            <orio-date-month-calendar
              v-for="side in visibleSides"
              :key="side"
              v-model:anchor="anchors[side]"
              :markers
              :get-marker="calendarGetMarker"
              :is-disabled="calendarIsDisabled"
              @select="pick($event, toggle)"
              @month-enter="onHover"
            />
          </template>
          <template v-else>
            <orio-calendar
              v-for="side in visibleSides"
              :key="side"
              v-model:anchor="anchors[side]"
              :markers
              :get-marker="calendarGetMarker"
              :is-disabled="calendarIsDisabled"
              @select="pick($event, toggle)"
              @day-enter="onHover"
            />
          </template>
        </div>
      </div>
    </template>
  </orio-date-picker-trigger>
</template>

<style lang="scss" scoped>
.range-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.range-sides {
  display: flex;
  gap: 0.25rem;
}

.range-calendars {
  display: flex;
  gap: 0.75rem;
}
</style>
