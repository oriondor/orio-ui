import { computed, nextTick, ref, type Ref } from "vue";

export type ArrowDirection = "up" | "down" | "left" | "right";
export type PageDirection = "up" | "down";

export interface RovingGridOptions<Cell> {
  rows: Ref<Cell[][]>;
  gridRef: Ref<HTMLElement | null>;
  getKey: (cell: Cell) => string;
  initial: () => string;
  /**
   * Cells where this returns `false` are skipped by arrow navigation —
   * pressing Arrow steps past them in the same direction until a navigable
   * cell is found (or the grid edge is reached, then `onArrowOverflow` fires).
   * Default: every cell is navigable.
   */
  isNavigable?: (cell: Cell) => boolean;
  onActivate?: (cell: Cell) => void;
  /**
   * Called when an arrow key would move past the rendered grid edge.
   * Return a new key to focus (caller should update any backing state, e.g.
   * paging to a new month, before returning). Return null to do nothing.
   */
  onArrowOverflow?: (
    direction: ArrowDirection,
    activeKey: string,
  ) => string | null;
  /**
   * Called for PageUp / PageDown (with Shift = larger jump).
   * Return a new key to focus, or null to do nothing.
   */
  onPage?: (
    direction: PageDirection,
    bigJump: boolean,
    activeKey: string,
  ) => string | null;
}

interface CellPosition<Cell> {
  rowIndex: number;
  columnIndex: number;
  cell: Cell;
}

const ARROW_OFFSETS: Record<
  ArrowDirection,
  { rowDelta: number; columnDelta: number }
> = {
  up: { rowDelta: -1, columnDelta: 0 },
  down: { rowDelta: 1, columnDelta: 0 },
  left: { rowDelta: 0, columnDelta: -1 },
  right: { rowDelta: 0, columnDelta: 1 },
};

const ARROW_KEYS: Record<string, ArrowDirection> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

export function useRovingGrid<Cell>(options: RovingGridOptions<Cell>) {
  const focusedKey = ref<string | null>(null);

  function findCell(key: string): CellPosition<Cell> | null {
    for (const [rowIndex, cellsInRow] of options.rows.value.entries()) {
      const columnIndex = cellsInRow.findIndex(
        (cell) => options.getKey(cell) === key,
      );
      if (columnIndex !== -1) {
        return { rowIndex, columnIndex, cell: cellsInRow[columnIndex]! };
      }
    }
    return null;
  }

  const activeKey = computed<string>(() => {
    if (focusedKey.value && findCell(focusedKey.value)) return focusedKey.value;
    return options.initial();
  });

  function focusActive() {
    nextTick(() => {
      const selector = `[focus-key="${CSS.escape(activeKey.value)}"]`;
      const element =
        options.gridRef.value?.querySelector<HTMLElement>(selector);
      if (!element) return;
      element.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "smooth",
      });
      element.focus({ preventScroll: true });
    });
  }

  function setActive(key: string, shouldFocus = true) {
    focusedKey.value = key;
    if (shouldFocus) focusActive();
  }

  function tryArrow(direction: ArrowDirection) {
    const position = findCell(activeKey.value);
    if (!position) return;
    const offset = ARROW_OFFSETS[direction];
    const rows = options.rows.value;
    let targetRowIndex = position.rowIndex + offset.rowDelta;
    let targetColumnIndex = position.columnIndex + offset.columnDelta;
    while (rows[targetRowIndex]?.[targetColumnIndex] !== undefined) {
      const candidate = rows[targetRowIndex]![targetColumnIndex]!;
      if (!options.isNavigable || options.isNavigable(candidate)) {
        setActive(options.getKey(candidate));
        return;
      }
      targetRowIndex += offset.rowDelta;
      targetColumnIndex += offset.columnDelta;
    }
    const overflowKey = options.onArrowOverflow?.(direction, activeKey.value);
    if (overflowKey) setActive(overflowKey);
  }

  function moveToRowEdge(toEnd: boolean) {
    const position = findCell(activeKey.value);
    if (!position) return;
    const row = options.rows.value[position.rowIndex]!;
    const ordered = toEnd ? [...row].reverse() : row;
    const edgeCell = ordered.find(
      (cell) => !options.isNavigable || options.isNavigable(cell),
    );
    if (!edgeCell) return;
    setActive(options.getKey(edgeCell));
  }

  function tryPage(direction: PageDirection, bigJump: boolean) {
    const newKey = options.onPage?.(direction, bigJump, activeKey.value);
    if (newKey) setActive(newKey);
  }

  function activate() {
    const position = findCell(activeKey.value);
    if (position) options.onActivate?.(position.cell);
  }

  function onKeydown(event: KeyboardEvent) {
    const arrow = ARROW_KEYS[event.key];
    if (arrow) {
      tryArrow(arrow);
    } else if (event.key === "Home") {
      moveToRowEdge(false);
    } else if (event.key === "End") {
      moveToRowEdge(true);
    } else if (event.key === "PageUp") {
      tryPage("up", event.shiftKey);
    } else if (event.key === "PageDown") {
      tryPage("down", event.shiftKey);
    } else if (event.key === "Enter" || event.key === " ") {
      activate();
    } else {
      return;
    }
    event.preventDefault();
  }

  function tabindexFor(key: string): 0 | -1 {
    return key === activeKey.value ? 0 : -1;
  }

  return {
    activeKey,
    setActive,
    focusActive,
    onKeydown,
    tabindexFor,
  };
}
