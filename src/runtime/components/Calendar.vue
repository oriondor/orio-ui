<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  addMonths,
  formatISO,
  isSameDay,
  parseISO,
  startOfMonth,
} from "../utils/date";

export type MarkerVariant = "accent" | "success" | "alert" | "danger" | "muted";

export interface CalendarMarker {
  variant: MarkerVariant;
  start: string;
  end: string;
}

export interface CalendarProps {
  selected?: string | null;
  markers?: CalendarMarker[];
  getMarker?: (iso: string) => CalendarMarker | null;
  isDisabled?: (iso: string) => boolean;
  weekStartsOn?: 0 | 1;
}

const props = withDefaults(defineProps<CalendarProps>(), {
  selected: null,
  markers: () => [],
  weekStartsOn: 1,
});

const anchor = defineModel<string | null>("anchor", { default: null });

const emit = defineEmits<{
  select: [iso: string];
  dayEnter: [iso: string];
}>();

const { locale, t } = useI18n();

const today = new Date();

const visibleMonth = computed(() =>
  startOfMonth(parseISO(anchor.value) ?? new Date()),
);

function shift(delta: number) {
  anchor.value = formatISO(addMonths(visibleMonth.value, delta));
}

const monthLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    month: "long",
    year: "numeric",
  }).format(visibleMonth.value),
);

const weekdayLabels = computed(() => {
  // 2024-01-07 is a Sunday
  const sunday = new Date(2024, 0, 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + ((i + props.weekStartsOn) % 7));
    return new Intl.DateTimeFormat(locale.value, { weekday: "short" }).format(
      d,
    );
  });
});

interface ResolvedMarker {
  variant: MarkerVariant;
  isStart: boolean;
  isEnd: boolean;
}

interface Day {
  iso: string;
  label: number;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  marker: ResolvedMarker | null;
}

function resolveMarker(iso: string): ResolvedMarker | null {
  if (props.getMarker) {
    const m = props.getMarker(iso);
    if (m) {
      return {
        variant: m.variant,
        isStart: iso === m.start,
        isEnd: iso === m.end,
      };
    }
  }
  for (let i = props.markers.length - 1; i >= 0; i--) {
    const m = props.markers[i]!;
    if (iso >= m.start && iso <= m.end) {
      return {
        variant: m.variant,
        isStart: iso === m.start,
        isEnd: iso === m.end,
      };
    }
  }
  return null;
}

const days = computed<Day[]>(() => {
  const first = visibleMonth.value;
  const startWeekday = first.getDay();
  const offset = (startWeekday - props.weekStartsOn + 7) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() - offset);

  const sel = parseISO(props.selected);

  const result: Day[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const iso = formatISO(d);
    result.push({
      iso,
      label: d.getDate(),
      inMonth: d.getMonth() === first.getMonth(),
      isToday: isSameDay(d, today),
      isSelected: !!sel && isSameDay(d, sel),
      isDisabled: props.isDisabled?.(iso) ?? false,
      marker: resolveMarker(iso),
    });
  }
  return result;
});

function onSelect(day: Day) {
  if (day.isDisabled) return;
  emit("select", day.iso);
}

function onEnter(day: Day) {
  emit("dayEnter", day.iso);
}
</script>

<template>
  <div class="calendar">
    <div class="calendar-nav">
      <orio-button
        variant="subdued"
        icon="chevron-left"
        :aria-label="t('calendar.previousMonth')"
        @click="shift(-1)"
      />
      <span class="calendar-month-title">{{ monthLabel }}</span>
      <orio-button
        variant="subdued"
        icon="chevron-right"
        :aria-label="t('calendar.nextMonth')"
        @click="shift(1)"
      />
    </div>
    <div class="calendar-weekdays">
      <span v-for="w in weekdayLabels" :key="w" class="calendar-weekday">
        {{ w }}
      </span>
    </div>
    <div class="calendar-grid">
      <button
        v-for="day in days"
        :key="day.iso"
        type="button"
        class="calendar-day"
        :class="{
          'out-of-month': !day.inMonth,
          today: day.isToday,
          selected: day.isSelected,
          'has-marker': !!day.marker,
          [`marker-${day.marker?.variant}`]: !!day.marker,
          'marker-start': day.marker?.isStart,
          'marker-end': day.marker?.isEnd,
        }"
        :disabled="day.isDisabled"
        @click="onSelect(day)"
        @mouseenter="onEnter(day)"
      >
        <orio-badge v-if="day.isSelected" pill variant="primary">
          {{ day.label }}
        </orio-badge>
        <template v-else>{{ day.label }}</template>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.calendar {
  display: inline-block;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: 0.75rem;
  user-select: none;
  font-size: var(--control-font-size, var(--font-md));
  color: var(--color-text);
  min-width: 17rem;
}

.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.calendar-month-title {
  font-weight: 600;
  text-transform: capitalize;
}

.calendar-weekdays,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-weekday {
  text-align: center;
  font-size: var(--font-xs);
  color: var(--color-muted);
  padding: 0.25rem 0;
  text-transform: uppercase;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  font-size: inherit;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover:not(:disabled):not(.has-marker):not(.selected) {
    background-color: var(--color-surface);
  }

  &.out-of-month {
    color: var(--color-muted);
    opacity: 0.45;
  }

  &.today {
    box-shadow: inset 0 0 0 1px var(--color-accent);
  }

  &.has-marker {
    background-color: var(--marker-bg);
    color: var(--marker-color);
    border-radius: 0;
  }

  &.has-marker.marker-start {
    border-top-left-radius: var(--border-radius-sm);
    border-bottom-left-radius: var(--border-radius-sm);
  }

  &.has-marker.marker-end {
    border-top-right-radius: var(--border-radius-sm);
    border-bottom-right-radius: var(--border-radius-sm);
  }

  &.marker-accent {
    --marker-bg: var(--color-accent-soft);
    --marker-color: var(--color-accent);
  }
  &.marker-success {
    --marker-bg: var(--color-success-soft);
    --marker-color: var(--color-success);
  }
  &.marker-alert {
    --marker-bg: var(--color-alert-soft);
    --marker-color: var(--color-alert);
  }
  &.marker-danger {
    --marker-bg: var(--color-danger-soft);
    --marker-color: var(--color-danger);
  }
  &.marker-muted {
    --marker-bg: var(--color-surface);
    --marker-color: var(--color-muted);
  }

  &:disabled {
    color: var(--color-muted);
    cursor: not-allowed;
    opacity: 0.4;
  }
}
</style>
