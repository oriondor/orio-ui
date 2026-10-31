/**
 * Page-wide height animation for every `[data-smooth-resize]` element.
 *
 * The container's first element child is measured (it must keep its natural
 * height); when it resizes, the container's height animates from the old
 * size to the new one. One ResizeObserver and one MutationObserver serve the
 * whole page, so components only add the attribute.
 */

const SELECTOR = "[data-smooth-resize]";
const DURATION = 250;
const EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

interface Tracked {
  content: Element;
  // last settled container height; null until the first observation
  height: number | null;
  animation: Animation | null;
}

let started = false;

export function startSmoothResize() {
  if (started || typeof window === "undefined") return;
  if (!("ResizeObserver" in window) || !("MutationObserver" in window)) return;
  started = true;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const tracked = new Map<HTMLElement, Tracked>();
  const containerOf = new Map<Element, HTMLElement>();

  const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const container = containerOf.get(entry.target);
      const state = container && tracked.get(container);
      if (container && state) animate(container, state, reducedMotion.matches);
    });
  });

  function untrack(container: HTMLElement) {
    const state = tracked.get(container);
    if (!state) return;
    state.animation?.cancel();
    resizeObserver.unobserve(state.content);
    containerOf.delete(state.content);
    tracked.delete(container);
  }

  // match the tracked set to the DOM: new containers, swapped first
  // children (v-if remount) and removed containers
  function sync() {
    const present = new Set(document.querySelectorAll<HTMLElement>(SELECTOR));
    [...tracked.keys()]
      .filter((container) => !present.has(container))
      .forEach(untrack);

    present.forEach((container) => {
      const content = container.firstElementChild;
      const state = tracked.get(container);
      // emptied: keep observing the detached child, whose drop to zero size
      // animates the container's collapse
      if (state?.content === content || (state && !content)) return;
      untrack(container);
      if (!content) return;
      // a new content element's first size is not a change
      tracked.set(container, { content, height: null, animation: null });
      containerOf.set(content, container);
      resizeObserver.observe(content);
    });
  }

  // only re-query when a mutation can touch a container or its first child
  const isRelevant = (record: MutationRecord) =>
    record.type === "attributes" ||
    (record.target instanceof Element && record.target.matches(SELECTOR)) ||
    [...record.addedNodes, ...record.removedNodes].some(
      (node) =>
        node instanceof Element &&
        (node.matches(SELECTOR) || node.querySelector(SELECTOR) !== null),
    );

  new MutationObserver((records) => {
    if (records.some(isRelevant)) sync();
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-smooth-resize"],
  });
  sync();

  // turned on mid-animation: jump to the final size
  reducedMotion.addEventListener?.("change", () => {
    if (!reducedMotion.matches) return;
    tracked.forEach((state) => {
      state.animation?.cancel();
      state.animation = null;
    });
  });
}

function animate(
  container: HTMLElement,
  state: Tracked,
  reducedMotion: boolean,
) {
  // mid-animation: continue from wherever the box is right now
  const from = state.animation ? container.offsetHeight : state.height;
  state.animation?.cancel();
  state.animation = null;
  // the observer runs after layout, so the box is already at its new size
  const to = container.offsetHeight;
  state.height = to;

  if (from === null || from === to) return;
  if (reducedMotion) return;

  const animation = container.animate(
    [
      { height: `${from}px`, overflow: "hidden" },
      { height: `${to}px`, overflow: "hidden" },
    ],
    { duration: DURATION, easing: EASING },
  );
  animation.onfinish = () => {
    if (state.animation === animation) state.animation = null;
  };
  state.animation = animation;
}
