---
kind: composable
category: Composables
purpose: arrow-key flat list navigation, listbox keyboard, dropdown keys
short: arrow / Home / End / Enter / Space / Esc handling for a flat indexable list with auto scroll-into-view
invariants: true
---

# useListKeyboard — agent-only invariants

`useListKeyboard` wires keyboard navigation for a flat list (listbox,
menu, dropdown). It owns the highlighted index, scrolls the highlighted
item into view, and emits open/close/select callbacks. Used internally by
`<orio-selector>`.

## Invariants

- **`options.count()` is called on every navigation** — pass a function,
  not a number. Lists that change size during interaction stay correct.
- **`options.onSelect(index)`** fires on Enter or Space when the list is
  open and a row is highlighted (`highlightedIndex >= 0`).
- **`options.onOpen()`** fires when the user presses Arrow Down/Up,
  Enter, or Space while the list is closed. Optional — without it,
  closed-state key presses are no-ops.
- **`options.onClose()`** fires on Escape (plus resets the highlight to
  `-1`). Optional.
- **`options.initialIndex()`** is called by `reset()` to set the
  highlight on (re)open — typically returns the currently selected row.
  Defaults to `0` when not provided.
- **Returned `listRef` MUST be attached to the list container** (the
  `<ul>` / `<ol>`) so `scrollIntoView` can find the highlighted child.
  Without it, the highlight still moves but never scrolls.
- **`onKeydown(e, isOpen)`** is the handler to wire on the trigger or
  list. The caller passes `isOpen` because the composable does not own
  open state.
- **Every matched key calls `e.preventDefault()`.** Unmatched keys
  bubble. Space is registered as `" "` (single space string).
- **Highlight clamps to `[0, count - 1]`.** `highlight(-1)` lands on 0,
  `highlight(99)` on `count - 1`.

## Gotchas

- **Children must be direct descendants of the `listRef` element** for
  scrollIntoView to target the correct row. Nested wrappers (a `<li>`
  with deep children) break the index → `ul.children[index]` lookup.
- **Space (`" "`) selection collides with form behaviors.** Inside a
  text input or button that already handles space, the preventDefault
  may swallow it. Wire `onKeydown` on the listbox container or wrapping
  focusable element, not on inputs.
- **`reset()` calls `scrollIntoView` on `nextTick`** — the list element
  must be in the DOM by then. Calling `reset()` before mounting the
  list won't scroll until after the next tick.
- **No type-ahead** ("press 'a' to jump to next item starting with a").
  Implement upstream if needed.

## Quick reference

```ts
import { ref } from "vue";
import { useListKeyboard } from "../composables/useListKeyboard";

const isOpen = ref(false);
const items = ref<string[]>(["Alpha", "Bravo", "Charlie"]);
const selected = ref<string | null>(null);

const { highlightedIndex, listRef, onKeydown, reset } = useListKeyboard({
  count: () => items.value.length,
  onSelect: (index) => {
    selected.value = items.value[index];
    isOpen.value = false;
  },
  onOpen: () => {
    isOpen.value = true;
    reset();
  },
  onClose: () => (isOpen.value = false),
  initialIndex: () => items.value.indexOf(selected.value ?? ""),
});
```

```vue
<template>
  <button @keydown="onKeydown($event, isOpen)" @click="onOpen">Open</button>
  <ul v-if="isOpen" ref="listRef">
    <li v-for="(item, index) in items" :key="item"
        :class="{ highlighted: index === highlightedIndex }">
      {{ item }}
    </li>
  </ul>
</template>
```

## Related

- `<orio-selector>` — uses this composable internally.
- `useRovingGrid` — 2D arrow-key roving focus.
- Public API reference: `docs/composables/use-list-keyboard.md`.
