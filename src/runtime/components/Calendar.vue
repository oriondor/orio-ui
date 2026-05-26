<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRovingGrid } from "../composables/useRovingGrid";
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
  startOfMonth(
    parseISO(anchor.value) ?? parseISO(props.selected) ?? new Date(),
  ),
);

function shiftMonth(delta: number) {
  anchor.value = formatISO(addMonths(visibleMonth.value, delta));
}

function shiftYear(delta: number) {
  const target = new Date(visibleMonth.value);
  target.setFullYear(target.getFullYear() + delta);
  anchor.value = formatISO(startOfMonth(target));
}

const monthLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    month: "long",
    year: "numeric",
  }).format(visibleMonth.value),
);

const titleId = useId();

const dayLabelFormat = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
);

function fullDateLabel(iso: string): string {
  const date = parseISO(iso);
  return date ? dayLabelFormat.value.format(date) : iso;
}

const weekdayLabels = computed(() => {
  // 1998-07-14 is a Tuesday
  const tuesday = new Date(1998, 6, 14);
  return Array.from({ length: 7 }, (_, position) => {
    const date = new Date(tuesday);
    date.setDate(
      tuesday.getDate() + ((position + props.weekStartsOn - 2 + 7) % 7),
    );
    return new Intl.DateTimeFormat(locale.value, { weekday: "short" }).format(
      date,
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

function resolveMarker(
  iso: string,
  reversedMarkers: CalendarMarker[],
): ResolvedMarker | null {
  const matched =
    props.getMarker?.(iso) ??
    reversedMarkers.find(
      (marker) => iso >= marker.start && iso <= marker.end,
    ) ??
    null;
  if (!matched) return null;
  return {
    variant: matched.variant,
    isStart: iso === matched.start,
    isEnd: iso === matched.end,
  };
}

const days = computed<Day[]>(() => {
  const firstOfMonth = visibleMonth.value;
  const leadingOffset = (firstOfMonth.getDay() - props.weekStartsOn + 7) % 7;
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - leadingOffset);

  const selectedDate = parseISO(props.selected);
  const reversedMarkers = [...props.markers].reverse();

  return Array.from({ length: 42 }, (_, dayOffset) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + dayOffset);
    const iso = formatISO(date);
    return {
      iso,
      label: date.getDate(),
      inMonth: date.getMonth() === firstOfMonth.getMonth(),
      isToday: isSameDay(date, today),
      isSelected: !!selectedDate && isSameDay(date, selectedDate),
      isDisabled: props.isDisabled?.(iso) ?? false,
      marker: resolveMarker(iso, reversedMarkers),
    };
  });
});

const weeks = computed<Day[][]>(() =>
  Array.from({ length: 6 }, (_, weekIndex) =>
    days.value.slice(weekIndex * 7, weekIndex * 7 + 7),
  ),
);

function isInVisibleMonth(date: Date): boolean {
  return (
    date.getMonth() === visibleMonth.value.getMonth() &&
    date.getFullYear() === visibleMonth.value.getFullYear()
  );
}

function initialActiveISO(): string {
  const selectedDate = parseISO(props.selected);
  if (selectedDate && isInVisibleMonth(selectedDate)) {
    return formatISO(selectedDate);
  }
  if (isInVisibleMonth(today)) return formatISO(today);
  return formatISO(visibleMonth.value);
}

interface NavButton {
  key: string;
  ariaLabel: string;
  icon: string;
  size: "sm" | "md";
  action: () => void;
}

const navButtons = computed<NavButton[]>(() => [
  {
    key: "year-prev",
    ariaLabel: t("calendar.previousYear"),
    icon: "chevron-left",
    size: "md",
    action: () => shiftYear(-1),
  },
  {
    key: "month-prev",
    ariaLabel: t("calendar.previousMonth"),
    icon: "chevron-left",
    size: "sm",
    action: () => shiftMonth(-1),
  },
  {
    key: "month-next",
    ariaLabel: t("calendar.nextMonth"),
    icon: "chevron-right",
    size: "sm",
    action: () => shiftMonth(1),
  },
  {
    key: "year-next",
    ariaLabel: t("calendar.nextYear"),
    icon: "chevron-right",
    size: "md",
    action: () => shiftYear(1),
  },
]);

const navRows = computed<NavButton[][]>(() => [navButtons.value]);

const navRef = ref<HTMLDivElement | null>(null);

const {
  tabindexFor: tabindexForNav,
  setActive: setActiveNav,
  onKeydown: onNavKeydown,
} = useRovingGrid<NavButton>({
  rows: navRows,
  gridRef: navRef,
  getKey: (button) => button.key,
  initial: () => "month-prev",
  onActivate: (button) => button.action(),
});

function onNavButtonClick(button: NavButton) {
  setActiveNav(button.key, false);
  button.action();
}

const ARROW_DAY_DELTA: Record<string, number> = {
  up: -7,
  down: 7,
  left: -1,
  right: 1,
};

const gridRef = ref<HTMLDivElement | null>(null);

const { activeKey, setActive, tabindexFor, onKeydown } = useRovingGrid<Day>({
  rows: weeks,
  gridRef,
  getKey: (day) => day.iso,
  initial: initialActiveISO,
  isNavigable: (day) => !day.isDisabled,
  onActivate(day) {
    if (day.isDisabled) return;
    emit("select", day.iso);
  },
  onArrowOverflow(direction, currentKey) {
    const date = parseISO(currentKey);
    if (!date) return null;
    const stepDays = ARROW_DAY_DELTA[direction]!;
    // Loop past disabled days in the same direction; cap to a sane horizon
    // (~2 years) so a fully-disabled future doesn't spin forever.
    for (let attempt = 0; attempt < 750; attempt++) {
      date.setDate(date.getDate() + stepDays);
      const iso = formatISO(date);
      if (!props.isDisabled?.(iso)) return iso;
    }
    return null;
  },
  onPage(direction, bigJump, currentKey) {
    const date = parseISO(currentKey);
    if (!date) return null;
    const monthDelta = (direction === "down" ? 1 : -1) * (bigJump ? 12 : 1);
    const target = new Date(
      date.getFullYear(),
      date.getMonth() + monthDelta,
      1,
    );
    const lastDayOfTargetMonth = new Date(
      target.getFullYear(),
      target.getMonth() + 1,
      0,
    ).getDate();
    target.setDate(Math.min(date.getDate(), lastDayOfTargetMonth));
    return formatISO(target);
  },
});

watch(activeKey, (iso) => {
  const date = parseISO(iso);
  if (date && !isInVisibleMonth(date)) {
    anchor.value = formatISO(startOfMonth(date));
  }
});

function onDayClick(day: Day) {
  if (day.isDisabled) return;
  setActive(day.iso, false);
  emit("select", day.iso);
}

function onDayMouseenter(day: Day) {
  emit("dayEnter", day.iso);
}
</script>

<template>
  <div class="calendar">
    <div
      ref="navRef"
      class="calendar-nav"
      role="toolbar"
      aria-orientation="horizontal"
      :aria-label="t('calendar.navigation')"
      @keydown="onNavKeydown"
    >
      <template v-for="(button, position) in navButtons" :key="button.key">
        <orio-button
          variant="subdued"
          :icon="button.icon"
          :size="button.size"
          :focus-key="button.key"
          :tabindex="tabindexForNav(button.key)"
          :aria-label="button.ariaLabel"
          @click="onNavButtonClick(button)"
        />
        <span v-if="position === 1" :id="titleId" class="calendar-month-title">
          {{ monthLabel }}
        </span>
      </template>
    </div>
    <div class="calendar-weekdays">
      <span
        v-for="weekday in weekdayLabels"
        :key="weekday"
        class="calendar-weekday"
      >
        {{ weekday }}
      </span>
    </div>
    <div
      ref="gridRef"
      class="calendar-grid"
      role="grid"
      :aria-labelledby="titleId"
      @keydown="onKeydown"
    >
      <div
        v-for="(week, weekIndex) in weeks"
        :key="weekIndex"
        role="row"
        class="calendar-week"
      >
        <button
          v-for="day in week"
          :key="day.iso"
          type="button"
          role="gridcell"
          class="calendar-day"
          :class="{
            'out-of-month': !day.inMonth,
            today: day.isToday,
            selected: day.isSelected,
            'has-marker': !!day.marker,
            [`marker-${day.marker?.variant}`]: !!day.marker,
            'marker-start': day.marker?.isStart,
            'marker-end': day.marker?.isEnd,
            active: day.iso === activeKey,
          }"
          :focus-key="day.iso"
          :tabindex="tabindexFor(day.iso)"
          :aria-selected="day.isSelected"
          :aria-current="day.isToday ? 'date' : undefined"
          :aria-label="fullDateLabel(day.iso)"
          :disabled="day.isDisabled"
          @click="onDayClick(day)"
          @mouseenter="onDayMouseenter(day)"
        >
          <orio-badge v-if="day.isSelected" pill variant="primary">
            {{ day.label }}
          </orio-badge>
          <template v-else>{{ day.label }}</template>
        </button>
      </div>
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
  width: 22rem;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.calendar-month-title {
  flex: 1;
  text-align: center;
  font-weight: 600;
  text-transform: capitalize;
}

.calendar-weekdays,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-week {
  display: contents;
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

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: -2px;
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
