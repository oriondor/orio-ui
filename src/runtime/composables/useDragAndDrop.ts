import {
  computed,
  onScopeDispose,
  readonly,
  ref,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from "vue";
import { useEventListener } from "@vueuse/core";

export interface DragSourceOptions {
  data?: MaybeRefOrGetter<unknown>;
  group?: MaybeRefOrGetter<string | undefined>;
  disabled?: MaybeRefOrGetter<boolean>;
  /** touch: ms of still hold before the drag starts. Default 300 */
  delay?: MaybeRefOrGetter<number>;
  /**
   * "auto": mouse/pen drag after 5px, touch after `delay`.
   * "manual": a press only arms the source; call `start()` (e.g. from a
   * long press) to begin the drag under the held pointer.
   */
  activation?: MaybeRefOrGetter<"auto" | "manual">;
  onStart?: (data: unknown) => void;
  onEnd?: (dropped: boolean) => void;
}

export interface DropTargetOptions {
  group?: MaybeRefOrGetter<string | undefined>;
  disabled?: MaybeRefOrGetter<boolean>;
  onDrop: (data: unknown, event: PointerEvent) => void;
}

interface ActiveDrag {
  data: unknown;
  group: string | undefined;
}

interface DropTarget {
  group: () => string | undefined;
  disabled: () => boolean;
  onDrop: DropTargetOptions["onDrop"];
}

// mouse and pen: distance that turns a press into a drag
const MOUSE_THRESHOLD = 5;
// touch: default hold before the drag starts, so a swipe still scrolls
const TOUCH_DELAY = 300;
// touch: movement during that hold that means the user is scrolling
const TOUCH_TOLERANCE = 10;

// one drag at a time page-wide, so the state is module-level
const activeDrag = shallowRef<ActiveDrag | null>(null);
const hoveredZone = shallowRef<HTMLElement | null>(null);
const dropTargets = new Map<HTMLElement, DropTarget>();

// innermost wrapper claims a pointerdown, outer draggables stay idle
const claimedEvents = new WeakSet<Event>();

function accepts(target: DropTarget, drag: ActiveDrag) {
  if (target.disabled()) return false;
  const group = target.group();
  return group === undefined || group === drag.group;
}

// innermost registered zone under the point that accepts the drag
function zoneAt(x: number, y: number, drag: ActiveDrag) {
  let element = document.elementFromPoint(x, y);
  while (element) {
    const target = dropTargets.get(element as HTMLElement);
    if (target && accepts(target, drag)) return element as HTMLElement;
    element = element.parentElement;
  }
  return null;
}

// copy of the source that follows the pointer; pointer-events: none keeps
// elementFromPoint reaching the zone underneath
function createGhost(source: HTMLElement) {
  const rect = source.getBoundingClientRect();
  const ghost = source.cloneNode(true) as HTMLElement;
  ghost.removeAttribute("id");
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    pointerEvents: "none",
    zIndex: "1000",
    opacity: "0.9",
    willChange: "transform",
  });
  document.body.append(ghost);
  return ghost;
}

export function useDragSource(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: DragSourceOptions = {},
) {
  const isDragging = ref(false);
  let start: { x: number; y: number } | null = null;
  let pointerId: number | undefined;
  let isTouch = false;
  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let ghost: HTMLElement | null = null;
  let swallowNextClick = false;

  const isDisabled = () => toValue(options.disabled) ?? false;
  const isManual = () => toValue(options.activation) === "manual";

  function begin(x: number, y: number) {
    const element = toValue(target);
    if (!element || !start) return;
    clearTimeout(holdTimer);
    window.getSelection()?.removeAllRanges();
    ghost = createGhost(element);
    activeDrag.value = {
      data: toValue(options.data),
      group: toValue(options.group),
    };
    isDragging.value = true;
    document.documentElement.style.cursor = "grabbing";
    move(x, y);
    options.onStart?.(activeDrag.value.data);
  }

  function move(x: number, y: number) {
    if (!ghost || !start || !activeDrag.value) return;
    ghost.style.transform = `translate(${x - start.x}px, ${y - start.y}px)`;
    hoveredZone.value = zoneAt(x, y, activeDrag.value);
  }

  // dropped: the pointer was released over a zone that still accepts.
  // expectClick: the pointer is (or was just) released, so a click follows
  function end(event: PointerEvent | null, expectClick = event !== null) {
    clearTimeout(holdTimer);
    const wasDragging = isDragging.value;
    const drag = activeDrag.value;
    const zone = hoveredZone.value;
    const dropTarget = zone && dropTargets.get(zone);
    start = null;
    pointerId = undefined;
    ghost?.remove();
    ghost = null;
    if (!wasDragging) return;
    isDragging.value = false;
    activeDrag.value = null;
    hoveredZone.value = null;
    document.documentElement.style.cursor = "";
    // the release would also click whatever sits under it
    swallowNextClick = expectClick;
    const dropped = Boolean(
      event && drag && dropTarget && accepts(dropTarget, drag),
    );
    if (dropped) dropTarget!.onDrop(drag!.data, event!);
    options.onEnd?.(dropped);
  }

  function handlePointerDown(event: PointerEvent) {
    if (claimedEvents.has(event) || isDisabled() || activeDrag.value) return;
    if (event.button !== 0 || event.isPrimary === false || event.ctrlKey) {
      return;
    }
    claimedEvents.add(event);
    start = { x: event.clientX, y: event.clientY };
    pointerId = event.pointerId;
    isTouch = event.pointerType === "touch";
    if (isTouch && !isManual()) {
      holdTimer = setTimeout(
        () => !isManual() && begin(start!.x, start!.y),
        toValue(options.delay) ?? TOUCH_DELAY,
      );
    }
  }

  function handlePointerMove(event: PointerEvent) {
    if (!start || event.pointerId !== pointerId) return;
    if (isDragging.value) return move(event.clientX, event.clientY);
    // manual: whoever calls start() owns the movement rules before it
    if (isManual()) return;
    const distance = Math.hypot(
      event.clientX - start.x,
      event.clientY - start.y,
    );
    if (isTouch) {
      if (distance >= TOUCH_TOLERANCE) end(null);
    } else if (distance >= MOUSE_THRESHOLD) {
      begin(event.clientX, event.clientY);
    }
  }

  function handlePointerUp(event: PointerEvent) {
    if (event.pointerId !== pointerId) return;
    // the release may land without a final pointermove (e.g. right after
    // start()), so pick the zone under the release point
    if (isDragging.value) move(event.clientX, event.clientY);
    end(event);
  }

  function handlePointerCancel(event: PointerEvent) {
    if (event.pointerId === pointerId) end(null);
  }

  // a non-passive touchmove is the only way to stop the page scrolling
  // under a touch drag that is already under way
  function handleTouchMove(event: TouchEvent) {
    if (isDragging.value && event.cancelable) event.preventDefault();
  }

  function handleKeyDown(event: KeyboardEvent) {
    // the button is still down, its release will click
    if (event.key === "Escape" && isDragging.value) end(null, true);
  }

  function handleClick(event: MouseEvent) {
    // keyboard and assistive-tech clicks have detail 0 and never pressed
    if (!swallowNextClick || event.detail === 0) return;
    swallowNextClick = false;
    event.stopPropagation();
    event.preventDefault();
  }

  // a touch release sends no click, so the next press disarms the swallow
  function disarmSwallow() {
    swallowNextClick = false;
  }

  function preventWhileHeld(event: Event) {
    if (start) event.preventDefault();
  }

  useEventListener(target, "pointerdown", handlePointerDown);
  // native drag of images and links inside would steal the pointer
  useEventListener(target, "dragstart", (event: DragEvent) =>
    event.preventDefault(),
  );
  // Android long-press menu during the hold
  useEventListener(target, "contextmenu", preventWhileHeld);
  // window-level: the pointer leaves the source as soon as the drag moves
  useEventListener("pointermove", handlePointerMove);
  useEventListener("pointerup", handlePointerUp);
  useEventListener("pointercancel", handlePointerCancel);
  useEventListener("selectstart", (event: Event) => {
    if (isDragging.value) event.preventDefault();
  });
  useEventListener("touchmove", handleTouchMove, { passive: false });
  useEventListener("keydown", handleKeyDown);
  useEventListener("click", handleClick, { capture: true });
  useEventListener("pointerdown", disarmSwallow, { capture: true });

  watch(isDisabled, (disabled) => {
    if (disabled) end(null);
  });

  onScopeDispose(() => end(null));

  /** begin the drag for the press in progress; no-op without one */
  function startDrag() {
    if (!start || activeDrag.value || isDisabled()) return;
    begin(start.x, start.y);
  }

  // annotated: readonly(ref) otherwise emits as ReadonlyMap in the .d.ts
  return {
    isDragging: readonly(isDragging) as Readonly<Ref<boolean>>,
    start: startDrag,
  };
}

export function useDropTarget(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: DropTargetOptions,
) {
  const entry: DropTarget = {
    group: () => toValue(options.group),
    disabled: () => toValue(options.disabled) ?? false,
    onDrop: (data, event) => options.onDrop(data, event),
  };

  watch(
    () => toValue(target),
    (element, previous) => {
      if (previous) dropTargets.delete(previous);
      if (element) dropTargets.set(element, entry);
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    const element = toValue(target);
    if (element) dropTargets.delete(element);
  });

  // a matching drag is under way anywhere on the page
  const isDragging = computed(
    () => activeDrag.value !== null && accepts(entry, activeDrag.value),
  );
  const isOver = computed(
    () => isDragging.value && hoveredZone.value === toValue(target),
  );

  return { isDragging, isOver };
}
