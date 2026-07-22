<script lang="ts">
export type { CalendarMarker, MarkerVariant } from "../utils/calendar-markers";
</script>

<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { useI18n } from "vue-i18n";
import {
  useRovingGrid,
  type ArrowDirection,
  type PageDirection,
} from "../composables/useRovingGrid";
import {
  addMonths,
  formatISO,
  isSameDay,
  parseISO,
  startOfMonth,
} from "../utils/date";
import {
  createMarkerResolver,
  type CalendarMarker,
} from "../utils/calendar-markers";
import CalendarGrid, {
  type CalendarCell,
} from "./date/components/CalendarGrid.vue";

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

const cells = computed<CalendarCell[][]>(() => {
  const firstOfMonth = visibleMonth.value;
  const leadingOffset = (firstOfMonth.getDay() - props.weekStartsOn + 7) % 7;
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - leadingOffset);

  const selectedDate = parseISO(props.selected);
  const resolveMarker = createMarkerResolver(props.markers, props.getMarker);

  const flat = Array.from({ length: 42 }, (_, dayOffset) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + dayOffset);
    const iso = formatISO(date);
    return {
      iso,
      label: date.getDate(),
      ariaLabel: fullDateLabel(iso),
      isToday: isSameDay(date, today),
      isSelected: !!selectedDate && isSameDay(date, selectedDate),
      isDisabled: props.isDisabled?.(iso) ?? false,
      outOfMonth: date.getMonth() !== firstOfMonth.getMonth(),
      marker: resolveMarker(iso),
    } satisfies CalendarCell;
  });

  return Array.from({ length: 6 }, (_, weekIndex) =>
    flat.slice(weekIndex * 7, weekIndex * 7 + 7),
  );
});

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

const ARROW_DAY_DELTA: Record<ArrowDirection, number> = {
  up: -7,
  down: 7,
  left: -1,
  right: 1,
};

function onArrowOverflow(
  direction: ArrowDirection,
  currentKey: string,
): string | null {
  const date = parseISO(currentKey);
  if (!date) return null;
  const stepDays = ARROW_DAY_DELTA[direction];
  // Loop past disabled days in the same direction; cap to a sane horizon
  // (~2 years) so a fully-disabled future doesn't spin forever.
  for (let attempt = 0; attempt < 750; attempt++) {
    date.setDate(date.getDate() + stepDays);
    const iso = formatISO(date);
    if (!props.isDisabled?.(iso)) return iso;
  }
  return null;
}

function onPage(
  direction: PageDirection,
  bigJump: boolean,
  currentKey: string,
): string | null {
  const date = parseISO(currentKey);
  if (!date) return null;
  const monthDelta = (direction === "down" ? 1 : -1) * (bigJump ? 12 : 1);
  const target = new Date(date.getFullYear(), date.getMonth() + monthDelta, 1);
  const lastDayOfTargetMonth = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  target.setDate(Math.min(date.getDate(), lastDayOfTargetMonth));
  return formatISO(target);
}

const roving = {
  getInitialKey: initialActiveISO,
  onArrowOverflow,
  onPage,
};

function onActiveKeyChange(iso: string) {
  const date = parseISO(iso);
  if (date && !isInVisibleMonth(date)) {
    anchor.value = formatISO(startOfMonth(date));
  }
}

// --- month/year nav (roving toolbar) — stays local to the day calendar ---

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
    <CalendarGrid
      type="day"
      :cells="cells"
      :labelled-by="titleId"
      :roving="roving"
      @select="emit('select', $event)"
      @cell-enter="emit('dayEnter', $event)"
      @update:active-key="onActiveKeyChange"
    />
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

.calendar-weekdays {
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
</style>
