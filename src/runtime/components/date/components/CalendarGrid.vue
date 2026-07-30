<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  useRovingGrid,
  type ArrowDirection,
  type PageDirection,
} from "../../../composables/useRovingGrid";
import type { ResolvedMarker } from "../../../utils/calendar-markers";

export interface CalendarCell {
  iso: string;
  label: string | number;
  ariaLabel: string;
  isSelected: boolean;
  isToday: boolean;
  isDisabled: boolean;
  outOfMonth?: boolean;
  marker: ResolvedMarker | null;
}

export interface CalendarGridRoving {
  getInitialKey: () => string;
  onArrowOverflow: (
    direction: ArrowDirection,
    activeKey: string,
  ) => string | null;
  onPage: (
    direction: PageDirection,
    bigJump: boolean,
    activeKey: string,
  ) => string | null;
}

interface Props {
  type: "day" | "month";
  cells: CalendarCell[][];
  labelledBy: string;
  roving: CalendarGridRoving;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [iso: string];
  cellEnter: [iso: string];
  "update:activeKey": [iso: string];
}>();

const rows = computed(() => props.cells);
const gridRef = ref<HTMLDivElement | null>(null);
const columns = computed(() => (props.type === "day" ? 7 : 3));

const { activeKey, setActive, tabindexFor, onKeydown } =
  useRovingGrid<CalendarCell>({
    rows,
    gridRef,
    getKey: (cell) => cell.iso,
    initial: () => props.roving.getInitialKey(),
    isNavigable: (cell) => !cell.isDisabled,
    onActivate(cell) {
      if (cell.isDisabled) return;
      emit("select", cell.iso);
    },
    onArrowOverflow: (direction, key) =>
      props.roving.onArrowOverflow(direction, key),
    onPage: (direction, bigJump, key) =>
      props.roving.onPage(direction, bigJump, key),
  });

watch(activeKey, (iso) => emit("update:activeKey", iso));

function onCellClick(cell: CalendarCell) {
  if (cell.isDisabled) return;
  setActive(cell.iso, false);
  emit("select", cell.iso);
}

function onCellMouseenter(cell: CalendarCell) {
  emit("cellEnter", cell.iso);
}
</script>

<template>
  <div
    ref="gridRef"
    class="calendar-grid"
    :class="`type-${type}`"
    role="grid"
    :aria-labelledby="labelledBy"
    :style="{ '--calendar-columns': columns }"
    @keydown="onKeydown"
  >
    <div
      v-for="(row, rowIndex) in cells"
      :key="rowIndex"
      role="row"
      class="calendar-row"
    >
      <button
        v-for="cell in row"
        :key="cell.iso"
        type="button"
        role="gridcell"
        class="calendar-cell"
        :class="{
          'out-of-month': cell.outOfMonth,
          today: cell.isToday,
          selected: cell.isSelected,
          'has-marker': !!cell.marker,
          [`marker-${cell.marker?.variant}`]: !!cell.marker,
          'marker-start': cell.marker?.isStart,
          'marker-end': cell.marker?.isEnd,
          active: cell.iso === activeKey,
        }"
        :focus-key="cell.iso"
        :tabindex="tabindexFor(cell.iso)"
        :aria-selected="cell.isSelected"
        :aria-current="type === 'day' && cell.isToday ? 'date' : undefined"
        :aria-label="cell.ariaLabel"
        :disabled="cell.isDisabled"
        @click="onCellClick(cell)"
        @mouseenter="onCellMouseenter(cell)"
      >
        <orio-badge
          v-if="type === 'day' && cell.isSelected"
          pill
          variant="primary"
        >
          {{ cell.label }}
        </orio-badge>
        <template v-else>{{ cell.label }}</template>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(var(--calendar-columns), 1fr);
}

.calendar-row {
  display: contents;
}

.calendar-cell {
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

.type-day .calendar-cell {
  aspect-ratio: 1;
}

.type-month .calendar-cell {
  padding: 0.5rem 0;
  text-transform: capitalize;

  // wins over .has-marker on specificity; restore the radius the marker
  // range flattens so a selected month keeps its filled badge shape
  &.selected {
    background-color: var(--color-accent);
    color: var(--color-bg);
    border-radius: var(--border-radius-sm);
  }
}
</style>
