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

// each test starts a fresh module, so its page observer must not outlive it
const mutationObservers: MutationObserver[] = [];
class TrackedMutationObserver extends MutationObserver {
  constructor(callback: MutationCallback) {
    super(callback);
    mutationObservers.push(this);
  }
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
    vi.stubGlobal("MutationObserver", TrackedMutationObserver);
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
  });

  afterEach(() => {
    mutationObservers.forEach((observer) => observer.disconnect());
    mutationObservers.length = 0;
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

  it("keeps an emptied container tracked so its collapse animates", async () => {
    const { animate, content, resize } = await setup();
    resize(100);
    content.remove();
    await flush();
    expect(observed.has(content)).toBe(true);
    resize(20, content);
    expect(animate).toHaveBeenCalledWith(
      [
        { height: "100px", overflow: "hidden" },
        { height: "20px", overflow: "hidden" },
      ],
      expect.anything(),
    );
  });

  it("cancels running animations when reduced motion turns on", async () => {
    let onChange = () => {};
    const media = {
      matches: false,
      addEventListener: (_type: string, listener: () => void) => {
        onChange = listener;
      },
    };
    vi.stubGlobal("matchMedia", () => media);
    const { animate, resize } = await setup();
    resize(100);
    resize(200);
    const animation = animate.mock.results[0].value;
    media.matches = true;
    onChange();
    expect(animation.cancel).toHaveBeenCalled();
  });

  it("ignores mutations outside containers", async () => {
    const { container } = await setup();
    const querySpy = vi.spyOn(document, "querySelectorAll");
    document.body.append(document.createElement("p"));
    container.firstElementChild!.append(document.createElement("span"));
    await flush();
    expect(querySpy).not.toHaveBeenCalled();
    querySpy.mockRestore();
  });
});
