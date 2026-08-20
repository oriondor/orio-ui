import { type Ref, ref, nextTick } from "vue";

export interface ListKeyboardOptions {
  /** Total number of items in the list */
  count: () => number;
  /** Called when an item is confirmed (Enter/Space) */
  onSelect: (index: number) => void;
  /** Called to open the list (ArrowDown/ArrowUp/Enter/Space when closed) */
  onOpen?: () => void;
  /** Called to close the list (Escape) */
  onClose?: () => void;
  /** Find the index of the initially highlighted item (e.g. currently selected) */
  initialIndex?: () => number;
}

export function useListKeyboard(options: ListKeyboardOptions) {
  const highlightedIndex = ref(-1);
  const listRef: Ref<HTMLElement | null> = ref(null);

  function scrollIntoView() {
    const ul = listRef.value;
    if (!ul || highlightedIndex.value < 0) return;
    const li = ul.children[highlightedIndex.value] as HTMLElement | undefined;
    li?.scrollIntoView({ block: "nearest" });
  }

  function highlight(index: number) {
    const count = options.count();
    if (count === 0) return;
    highlightedIndex.value = Math.max(0, Math.min(index, count - 1));
    scrollIntoView();
  }

  function reset() {
    // Nothing to highlight in an empty list, and index 0 would make Enter
    // "select" an option that does not exist.
    if (options.count() === 0) {
      highlightedIndex.value = -1;
      return;
    }

    const initial = options.initialIndex?.() ?? 0;
    highlightedIndex.value = Math.max(initial, 0);
    nextTick(scrollIntoView);
  }

  const keyActions: Record<string, (isOpen: boolean) => void> = {
    ArrowDown(isOpen) {
      if (!isOpen) return options.onOpen?.();
      highlight(highlightedIndex.value + 1);
    },
    ArrowUp(isOpen) {
      if (!isOpen) return options.onOpen?.();
      highlight(highlightedIndex.value - 1);
    },
    Home(isOpen) {
      if (!isOpen) return;
      highlight(0);
    },
    End(isOpen) {
      if (!isOpen) return;
      highlight(options.count() - 1);
    },
    Enter(isOpen) {
      if (!isOpen) return options.onOpen?.();
      if (highlightedIndex.value >= 0) options.onSelect(highlightedIndex.value);
    },
    " "(isOpen) {
      if (!isOpen) return options.onOpen?.();
      if (highlightedIndex.value >= 0) options.onSelect(highlightedIndex.value);
    },
    Escape() {
      highlightedIndex.value = -1;
      options.onClose?.();
    },
  };

  function onKeydown(e: KeyboardEvent, isOpen: boolean) {
    const action = keyActions[e.key];
    if (!action) return;
    e.preventDefault();
    action(isOpen);
  }

  return { highlightedIndex, listRef, onKeydown, reset };
}
