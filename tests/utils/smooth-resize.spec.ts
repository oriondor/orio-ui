import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

let notify: (entries: { target: Element }[]) => void = () => {};
const observed = new Set<Element>();

class FakeResizeObserver {
  constructor(callback: typeof notify) {
    notify = callback;
  }
  observe(element: Element) {
    observed.add(element);
  }
  unobserve(element: Element) {
    observed.delete(element);
  }
  disconnect() {}
}

// MutationObserver callbacks run as microtasks
const flush = () => new Promise((resolve) => setTimeout(resolve));

async function setup() {
  const { startSmoothResize } =
    await import("../../src/runtime/utils/smooth-resize");
  const container = document.createElement("div");
  container.setAttribute("data-smooth-resize", "");
  const content = document.createElement("div");
  container.append(content);
  let height = 100;
  Object.defineProperty(container, "offsetHeight", { get: () => height });
  const animate = vi.fn(() => ({ cancel: vi.fn(), onfinish: null }));
  container.animate = animate as unknown as typeof container.animate;
  document.body.append(container);
  startSmoothResize();
  await flush();
  return {
    container,
    content,
    animate,
    resize(next: number, target: Element = container.firstElementChild!) {
      height = next;
      notify([{ target }]);
    },
  };
}

describe("startSmoothResize", () => {
  beforeEach(() => {
    vi.resetModules();
    observed.clear();
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("animates the container from the previous height to the new one", async () => {
    const { animate, content, resize } = await setup();
    expect(observed.has(content)).toBe(true);
    resize(100); // first observation only records
    expect(animate).not.toHaveBeenCalled();

    resize(240);
    expect(animate).toHaveBeenCalledWith(
      [
        { height: "100px", overflow: "hidden" },
        { height: "240px", overflow: "hidden" },
      ],
      expect.objectContaining({ duration: 250 }),
    );
  });

  it("does not animate the first size of a swapped content element", async () => {
    const { animate, container, content, resize } = await setup();
    resize(100);
    const replacement = document.createElement("div");
    container.replaceChild(replacement, content);
    await flush();
    expect(observed.has(content)).toBe(false);
    resize(300, replacement);
    expect(animate).not.toHaveBeenCalled();
  });

  it("picks up containers added later and drops removed ones", async () => {
    const { container, content } = await setup();
    const later = document.createElement("section");
    later.setAttribute("data-smooth-resize", "");
    const laterContent = document.createElement("div");
    later.append(laterContent);
    document.body.append(later);
    container.remove();
    await flush();
    expect(observed.has(laterContent)).toBe(true);
    expect(observed.has(content)).toBe(false);
  });

  it("skips animation with reduced motion", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const { animate, resize } = await setup();
    resize(100);
    resize(200);
    expect(animate).not.toHaveBeenCalled();
  });
});
