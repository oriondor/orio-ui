import {
  onScopeDispose,
  readonly,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from "vue";
import { useEventListener } from "@vueuse/core";

export type LongPressSource = "hold" | "force";

export interface LongPressOptions {
  delay?: MaybeRefOrGetter<number>;
  moveTolerance?: MaybeRefOrGetter<number>;
  forceTouch?: MaybeRefOrGetter<boolean>;
  disabled?: MaybeRefOrGetter<boolean>;
  onStart?: (event: PointerEvent) => void;
  onCancel?: () => void;
  onTrigger: (
    event: PointerEvent | MouseEvent,
    source: LongPressSource,
  ) => void;
}

// A pointerdown bubbles through every nested wrapper; the first (innermost)
// one to see it claims it so outer wrappers stay idle.
const claimedEvents = new WeakSet<Event>();

export function useLongPress(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: LongPressOptions,
) {
  const isPressing = ref(false);
  // From pointerdown until the finger lifts — outlives isPressing, which ends
  // at the trigger while the finger may still be down (iOS text selection).
  const isHolding = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let startPosition: { x: number; y: number } | null = null;
  let swallowNextClick = false;

  const isDisabled = () => toValue(options.disabled) ?? false;
  const isForceTouchEnabled = () =>
    (toValue(options.forceTouch) ?? true) && !isDisabled();

  function clearTimer() {
    if (timer === undefined) return;
    clearTimeout(timer);
    timer = undefined;
  }

  function reset() {
    clearTimer();
    startPosition = null;
    isPressing.value = false;
  }

  function cancel() {
    const wasPressing = isPressing.value;
    reset();
    isHolding.value = false;
    if (wasPressing) options.onCancel?.();
  }

  function clearSelectionInside() {
    const selection = window.getSelection();
    const element = toValue(target);
    if (!selection || !element || !selection.anchorNode) return;
    if (element.contains(selection.anchorNode)) selection.removeAllRanges();
  }

  function trigger(event: PointerEvent | MouseEvent, source: LongPressSource) {
    reset();
    clearSelectionInside();
    swallowNextClick = true;
    options.onTrigger(event, source);
  }

  function handlePointerDown(event: PointerEvent) {
    if (claimedEvents.has(event)) return;
    if (isDisabled()) return;
    if (event.button !== 0 || event.isPrimary === false) return;
    // macOS: ctrl+click is the context-menu gesture, not a press.
    if (event.ctrlKey) return;

    claimedEvents.add(event);
    clearTimer();
    startPosition = { x: event.clientX, y: event.clientY };
    isPressing.value = true;
    isHolding.value = true;
    options.onStart?.(event);
    timer = setTimeout(
      () => trigger(event, "hold"),
      toValue(options.delay) ?? 500,
    );
  }

  function handlePointerMove(event: PointerEvent) {
    if (!startPosition) return;
    const distance = Math.hypot(
      event.clientX - startPosition.x,
      event.clientY - startPosition.y,
    );
    if (distance >= (toValue(options.moveTolerance) ?? 10)) cancel();
  }

  function handleForceWillBegin(event: MouseEvent) {
    if (isForceTouchEnabled()) event.preventDefault();
  }

  function handleForceDown(event: MouseEvent) {
    if (!isForceTouchEnabled() || !isPressing.value) return;
    trigger(event, "force");
  }

  function handleClick(event: MouseEvent) {
    if (!swallowNextClick) return;
    // Keyboard activation (Enter/Space) has detail 0 and was never pressed.
    if (event.detail === 0) return;
    swallowNextClick = false;
    event.stopPropagation();
    event.preventDefault();
  }

  // Window-level so a release outside the target (e.g. over a modal overlay
  // the trigger opened) still ends the hold.
  function handleRelease() {
    isHolding.value = false;
  }

  // Touch browsers send the click in a later task than touchend, or not at
  // all, so no timer can tell. Every genuine pointer click starts with a
  // pointerdown, so the next one anywhere on the page disarms the swallow.
  function disarmSwallow() {
    swallowNextClick = false;
  }

  function handleContextMenu(event: MouseEvent) {
    if (isHolding.value) event.preventDefault();
  }

  function handleSelectStart(event: Event) {
    if (isHolding.value) event.preventDefault();
  }

  useEventListener(target, "pointerdown", handlePointerDown);
  useEventListener(target, "pointermove", handlePointerMove);
  useEventListener(
    target,
    ["pointerup", "pointerleave", "pointercancel"],
    cancel,
  );
  // Safari-only (Force Touch trackpad); never dispatched elsewhere.
  useEventListener<MouseEvent>(
    target,
    "webkitmouseforcewillbegin",
    handleForceWillBegin,
  );
  useEventListener<MouseEvent>(target, "webkitmouseforcedown", handleForceDown);
  // Window-level: after a trigger the release may land outside the target
  // (e.g. on a modal overlay opened by the trigger). No target → window,
  // which is a no-op during SSR.
  useEventListener("click", handleClick, { capture: true });
  useEventListener(["pointerup", "pointercancel"], handleRelease);
  useEventListener("pointerdown", disarmSwallow, { capture: true });
  useEventListener(target, "contextmenu", handleContextMenu);
  useEventListener(target, "selectstart", handleSelectStart);

  watch(isDisabled, (disabled) => {
    if (disabled) cancel();
  });

  onScopeDispose(clearTimer);

  return { isPressing: readonly(isPressing), isHolding: readonly(isHolding) };
}
