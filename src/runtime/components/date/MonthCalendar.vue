<script setup lang="ts">
import { computed, useId } from "vue";
import { useI18n } from "vue-i18n";
import type {
  ArrowDirection,
  PageDirection,
} from "../../composables/useRovingGrid";
import { formatISO, parseISO, startOfMonth } from "../../utils/date";
import {
  createMarkerResolver,
  type CalendarMarker,
} from "../../utils/calendar-markers";
import CalendarGrid, { type CalendarCell } from "./components/CalendarGrid.vue";

export interface MonthCalendarProps {
  selected?: string | null;
  markers?: CalendarMarker[];
  getMarker?: (iso: string) => CalendarMarker | null;
  isDisabled?: (iso: string) => boolean;
}

const props = withDefaults(defineProps<MonthCalendarProps>(), {
  selected: null,
  markers: () => [],
});

const anchor = defineModel<string | null>("anchor", { default: null });

const emit = defineEmits<{
  select: [iso: string];
  monthEnter: [iso: string];
}>();

const { locale, t } = useI18n();

const today = new Date();

const visibleYear = computed(() => {
  const anchorDate =
    parseISO(anchor.value) ?? parseISO(props.selected) ?? new Date();
  return anchorDate.getFullYear();
});

function shiftYear(delta: number) {
  anchor.value = formatISO(new Date(visibleYear.value + delta, 0, 1));
}

function monthISO(year: number, monthIndex: number): string {
  return formatISO(new Date(year, monthIndex, 1));
}

// pin any ISO day to its first-of-month so selection/marker comparisons align
function pinToMonth(iso: string): string | null {
  const date = parseISO(iso);
  return date ? formatISO(startOfMonth(date)) : null;
}

const monthLabelFormat = computed(
  () => new Intl.DateTimeFormat(locale.value, { month: "short" }),
);
const fullLabelFormat = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, { month: "long", year: "numeric" }),
);

const cells = computed<CalendarCell[][]>(() => {
  const selectedIso = props.selected ? pinToMonth(props.selected) : null;
  const todayIso = formatISO(startOfMonth(today));
  const resolveMarker = createMarkerResolver(
    props.markers,
    props.getMarker,
    pinToMonth,
  );

  const flat = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthDate = new Date(visibleYear.value, monthIndex, 1);
    const iso = monthISO(visibleYear.value, monthIndex);
    return {
      iso,
      label: monthLabelFormat.value.format(monthDate),
      ariaLabel: fullLabelFormat.value.format(monthDate),
      isToday: iso === todayIso,
      isSelected: iso === selectedIso,
      isDisabled: props.isDisabled?.(iso) ?? false,
      marker: resolveMarker(iso),
    } satisfies CalendarCell;
  });

  return Array.from({ length: 4 }, (_, rowIndex) =>
    flat.slice(rowIndex * 3, rowIndex * 3 + 3),
  );
});

const titleId = useId();

function initialActiveISO(): string {
  const selectedIso = props.selected ? pinToMonth(props.selected) : null;
  if (selectedIso && selectedIso.startsWith(String(visibleYear.value))) {
    return selectedIso;
  }
  if (today.getFullYear() === visibleYear.value) {
    return formatISO(startOfMonth(today));
  }
  return monthISO(visibleYear.value, 0);
}

const ARROW_MONTH_DELTA: Record<ArrowDirection, number> = {
  up: -3,
  down: 3,
  left: -1,
  right: 1,
};

// Overflow targets live outside the rendered year, so the grid could never
// resolve them — page the anchor to the target year before handing the key
// back to the roving grid (see the onArrowOverflow contract in useRovingGrid).
function pageAnchorToYearOf(iso: string): string {
  const date = parseISO(iso);
  if (date && date.getFullYear() !== visibleYear.value) {
    anchor.value = formatISO(new Date(date.getFullYear(), 0, 1));
  }
  return iso;
}

// Cap the disabled-month search to a sane horizon (~20 years) so a fully
// disabled future doesn't spin forever.
const SEARCH_HORIZON_MONTHS = 240;

// Walk from `startIso` in `stepMonths` increments and return the first month
// the consumer does not disable — the roving grid focuses whatever key we hand
// back, and a disabled cell is an unfocusable button.
function firstEnabledMonthFrom(
  startIso: string,
  stepMonths: number,
): string | null {
  const start = parseISO(startIso);
  if (!start) return null;
  const candidates = Array.from({ length: SEARCH_HORIZON_MONTHS }, (_, step) =>
    monthISO(start.getFullYear(), start.getMonth() + step * stepMonths),
  );
  return candidates.find((iso) => !props.isDisabled?.(iso)) ?? null;
}

function onArrowOverflow(
  direction: ArrowDirection,
  currentKey: string,
): string | null {
  const date = parseISO(currentKey);
  if (!date) return null;
  const stepMonths = ARROW_MONTH_DELTA[direction];
  const target = firstEnabledMonthFrom(
    monthISO(date.getFullYear(), date.getMonth() + stepMonths),
    stepMonths,
  );
  return target ? pageAnchorToYearOf(target) : null;
}

function onPage(
  direction: PageDirection,
  _bigJump: boolean,
  currentKey: string,
): string | null {
  const date = parseISO(currentKey);
  if (!date) return null;
  const yearDelta = direction === "down" ? 1 : -1;
  // Same month one year away is the starting point; from there step month by
  // month in the paging direction until an enabled month turns up.
  const target = firstEnabledMonthFrom(
    monthISO(date.getFullYear() + yearDelta, date.getMonth()),
    yearDelta,
  );
  return target ? pageAnchorToYearOf(target) : null;
}

const roving = {
  getInitialKey: initialActiveISO,
  onArrowOverflow,
  onPage,
};

function onActiveKeyChange(iso: string) {
  const date = parseISO(iso);
  if (date && date.getFullYear() !== visibleYear.value) {
    anchor.value = formatISO(new Date(date.getFullYear(), 0, 1));
  }
}
</script>

<template>
  <div class="month-calendar">
    <div class="month-calendar-nav">
      <orio-button
        variant="subdued"
        icon="chevron-left"
        size="sm"
        :aria-label="t('calendar.previousYear')"
        @click="shiftYear(-1)"
      />
      <span :id="titleId" class="month-calendar-title">{{ visibleYear }}</span>
      <orio-button
        variant="subdued"
        icon="chevron-right"
        size="sm"
        :aria-label="t('calendar.nextYear')"
        @click="shiftYear(1)"
      />
    </div>
    <CalendarGrid
      type="month"
      :cells="cells"
      :labelled-by="titleId"
      :roving="roving"
      @select="emit('select', $event)"
      @cell-enter="emit('monthEnter', $event)"
      @update:active-key="onActiveKeyChange"
    />
  </div>
</template>

<style lang="scss" scoped>
.month-calendar {
  display: inline-block;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: 0.75rem;
  user-select: none;
  font-size: var(--control-font-size, var(--font-md));
  color: var(--color-text);
  width: 16rem;
}

.month-calendar-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.month-calendar-title {
  flex: 1;
  text-align: center;
  font-weight: 600;
}
</style>
