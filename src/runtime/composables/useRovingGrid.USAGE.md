---
kind: composable
category: Composables
purpose: roving-focus tabindex for 2D grids, grid keyboard navigation, calendar keyboard, table arrow nav
short: 2D arrow-key roving focus for grid-like UIs; handles arrows, Home/End, PageUp/Down, Enter/Space, and edge-overflow callbacks
invariants: true
---

# useRovingGrid — agent-only invariants

`useRovingGrid` implements the WAI-ARIA roving-tabindex pattern for a 2D
grid. Generic over `Cell`. Used internally by `<orio-calendar>`.

## Invariants

- **Only one cell has `tabindex="0"` at a time** — the active one. All
  others get `-1`. The consumer wires this via `tabindexFor(key)`.
- **Cells must carry a `focus-key="<key>"` attribute** matching
  `options.getKey(cell)` — `focusActive()` queries
  `[focus-key="..."]` with `CSS.escape` for the lookup.
- **`rows`** is a `Ref` to a 2D array of cells. Rows may have
  different column counts; navigation walks until it finds a valid
  cell or hits an undefined.
- **`activeKey`** is a `ComputedRef<string>`:
  - If the user has focused a cell, returns that key.
  - Otherwise returns `options.initial()` — the consumer's "default
    focus target" (typically today's date in a calendar).
- **`isNavigable(cell)`** (optional) — return `false` to skip cells
  during arrow nav. Skipped cells are stepped past in the same
  direction until a navigable cell is found, or the edge is hit.
- **`onArrowOverflow(direction, activeKey)`** — fires when an arrow
  would move past the rendered grid edge. Return a new `key` to focus
  (e.g. after paging to the next month). Return `null` for no-op.
- **`onPage(direction, bigJump, activeKey)`** — PageUp / PageDown.
  `bigJump` is `event.shiftKey`. Same return contract as overflow.
- **`onActivate(cell)`** fires on Enter or Space on the active cell.
- **`onKeydown` calls `preventDefault` on every handled key**. Arrow,
  Home, End, PageUp, PageDown, Enter, Space. Other keys bubble.
- **`focusActive()` runs on `nextTick`** — the DOM must reflect the
  active key by then. `scrollIntoView` with `block: nearest, inline:
  nearest, behavior: smooth`. Focus uses `preventScroll: true` (the
  scroll already happened).

## Gotchas

- **`getKey` must return strings** unique within the grid. Non-string
  keys break the `focus-key` attribute lookup.
- **No `aria-activedescendant` mode.** This is a roving-tabindex
  implementation only. For activedescendant grids, build separately.
- **`onArrowOverflow` must update backing state BEFORE returning the
  new key.** The caller relies on the new key being findable in
  `rows` on the next paint — usually the consumer mutates rows in
  the same tick and returns the new key synchronously.
- **`isNavigable: () => false` everywhere** would freeze arrow nav.
  Always leave at least the active cell navigable.

## Quick reference — calendar-style 2D grid

```ts
import { useRovingGrid } from "../composables/useRovingGrid";

interface Day { iso: string; inMonth: boolean }

const rows = ref<Day[][]>([...]); // 6 weeks × 7 days
const gridRef = ref<HTMLElement | null>(null);

const { activeKey, tabindexFor, onKeydown } = useRovingGrid({
  rows,
  gridRef,
  getKey: (day) => day.iso,
  initial: () => today.iso,
  isNavigable: (day) => day.inMonth,
  onActivate: (day) => emit("select", day.iso),
  onArrowOverflow: (direction, activeKey) => {
    pageMonth(direction); // mutates rows
    return findNeighborIsoForOverflow(direction, activeKey);
  },
  onPage: (direction, bigJump) => {
    pageMonth(direction, bigJump ? 12 : 1);
    return today.iso;
  },
});
```

```vue
<template>
  <table ref="gridRef" @keydown="onKeydown">
    <tr v-for="(week, weekIndex) in rows" :key="weekIndex">
      <td
        v-for="day in week"
        :key="day.iso"
        :focus-key="day.iso"
        :tabindex="tabindexFor(day.iso)"
      >
        {{ day.iso }}
      </td>
    </tr>
  </table>
</template>
```

## Related

- `<orio-calendar>` — uses this composable internally.
- `useListKeyboard` — 1D version for flat lists.
- Public API reference: `docs/composables/use-roving-grid.md`.
