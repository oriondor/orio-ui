import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import Popover from "../../src/runtime/experiments/popover/index.vue";

/**
 * jsdom implements no Popover API, so the recalculation path short-circuits.
 * Stub just enough of it — plus an open panel whose rect hangs below the
 * viewport — to observe whether a scroll triggers the silent reopen.
 */
function stubOpenOverflowingPanel(id: string) {
  const element = HTMLElement.prototype as unknown as Record<string, unknown>;
  const hidePopover = vi.fn();
  const showPopover = vi.fn();

  element.showPopover = showPopover;
  element.hidePopover = hidePopover;

  const panel = document.getElementById(id) as HTMLElement;
  panel.matches = ((selector: string) =>
    selector === ":popover-open") as HTMLElement["matches"];
  panel.getBoundingClientRect = (() => ({
    top: 10,
    left: 10,
    bottom: window.innerHeight + 200,
    right: 100,
    width: 90,
    height: window.innerHeight + 190,
  })) as HTMLElement["getBoundingClientRect"];

  return { hidePopover, showPopover };
}

const settleDebounce = () => new Promise((resolve) => setTimeout(resolve, 250));

afterEach(() => {
  const element = HTMLElement.prototype as unknown as Record<string, unknown>;
  delete element.showPopover;
  delete element.hidePopover;
});

/** Everything this component does lives in the style tag it injects. */
const injectedCss = () =>
  Array.from(document.head.querySelectorAll("style"))
    .map((style) => style.textContent)
    .join("\n");

describe("experiments/Popover", () => {
  describe("Trigger / panel wiring", () => {
    it("pairs the trigger and the panel through one id", () => {
      const wrapper = mount(Popover, { props: { id: "pop-1" } });

      expect(
        wrapper.find("button[popovertarget]").attributes("popovertarget"),
      ).toBe("pop-1");
      expect(wrapper.find(".popover-body").attributes("id")).toBe("pop-1");
      expect(wrapper.find(".popover-body").attributes("popover")).toBe("auto");

      wrapper.unmount();
    });

    it("falls back to an orio-button trigger", () => {
      const wrapper = mount(Popover, { props: { id: "pop-2" } });

      const trigger = wrapper.find("button[popovertarget]");
      expect(trigger.exists()).toBe(true);
      expect(trigger.classes()).toContain("popover-trigger");

      wrapper.unmount();
    });

    it("hands each slot its own attribute bag", () => {
      const wrapper = mount(Popover, {
        props: { id: "pop-3" },
        slots: {
          trigger: `<template #trigger="bag"><button v-bind="bag">go</button></template>`,
          body: `<template #body="bag"><section v-bind="bag">panel</section></template>`,
        },
      });

      expect(wrapper.find("button").attributes("popovertarget")).toBe("pop-3");
      expect(wrapper.find("section").attributes("id")).toBe("pop-3");

      wrapper.unmount();
    });
  });

  describe("Anchor scoping", () => {
    it("gives every instance its own anchor name", () => {
      const first = mount(Popover, { props: { id: "pop-a" } });
      const second = mount(Popover, { props: { id: "pop-b" } });

      const css = injectedCss();
      expect(css).toContain("anchor-name: --popover-trigger-pop-a");
      expect(css).toContain("anchor-name: --popover-trigger-pop-b");
      expect(css).toContain("position-anchor: --popover-trigger-pop-a");
      expect(css).toContain("position-anchor: --popover-trigger-pop-b");

      first.unmount();
      second.unmount();
    });

    it("only anchors real form controls, not wrapper elements", () => {
      const wrapper = mount(Popover, { props: { id: "pop-c" } });

      expect(injectedCss()).toContain(
        ':is(button, input)[popovertarget="pop-c"]',
      );

      wrapper.unmount();
    });
  });

  describe("Placement", () => {
    it("flips the block axis first for top/bottom placements", () => {
      const wrapper = mount(Popover, {
        props: { id: "pop-d", position: "bottom" },
      });

      expect(injectedCss()).toContain(
        "position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline",
      );

      wrapper.unmount();
    });

    it("flips the inline axis first for left/right placements", () => {
      const wrapper = mount(Popover, {
        props: { id: "pop-e", position: "left span-top" },
      });

      expect(injectedCss()).toContain(
        "position-try-fallbacks: flip-inline, flip-block, flip-block flip-inline",
      );

      wrapper.unmount();
    });

    it("omits fallbacks when flip is off", () => {
      const wrapper = mount(Popover, {
        props: { id: "pop-f", flip: "off" },
      });

      expect(injectedCss()).not.toContain("position-try-fallbacks");

      wrapper.unmount();
    });

    it("still emits fallbacks for flip=initial", () => {
      // "initial" is plain CSS flipping: resolved on open, never revisited.
      const wrapper = mount(Popover, {
        props: { id: "pop-m", flip: "initial" },
      });

      expect(injectedCss()).toContain("position-try-fallbacks");

      wrapper.unmount();
    });

    it("positions the panel fixed, so fallbacks measure against the viewport", () => {
      // With `position: absolute` the containing block is the initial containing
      // block, so a panel below the fold overflows nothing and never flips.
      const wrapper = mount(Popover, { props: { id: "pop-fixed" } });

      const css = injectedCss();
      expect(css).toContain("position: fixed");
      expect(css).not.toContain("position: absolute");

      wrapper.unmount();
    });

    it("writes position-area and gap into the panel rule", () => {
      const wrapper = mount(Popover, {
        props: { id: "pop-g", position: "top right", gap: 0.5 },
      });

      const css = injectedCss();
      expect(css).toContain("position-area: top right");
      expect(css).toContain("margin: 0.5rem");

      wrapper.unmount();
    });
  });

  describe("Silent recalculation", () => {
    it("emits a transition-killing class rule for the silent reopen", () => {
      const wrapper = mount(Popover, { props: { id: "pop-j" } });

      // Normal specificity, so it beats the :where() motion defaults without
      // !important; the reopen must not replay the open animation.
      expect(injectedCss()).toContain(".popover-body#pop-j.popover-instant");
      expect(injectedCss()).toContain("transition: none");

      wrapper.unmount();
    });

    it("reopens the panel on scroll idle when flip is auto", async () => {
      const wrapper = mount(Popover, {
        props: { id: "pop-auto", flip: "auto" },
        attachTo: document.body,
      });
      const { hidePopover, showPopover } = stubOpenOverflowingPanel("pop-auto");

      window.dispatchEvent(new Event("scroll"));
      await settleDebounce();

      expect(hidePopover).toHaveBeenCalledOnce();
      expect(showPopover).toHaveBeenCalledOnce();

      wrapper.unmount();
    });

    it("leaves the placement alone on scroll when flip is initial", async () => {
      const wrapper = mount(Popover, {
        props: { id: "pop-initial", flip: "initial" },
        attachTo: document.body,
      });
      const { hidePopover, showPopover } =
        stubOpenOverflowingPanel("pop-initial");

      window.dispatchEvent(new Event("scroll"));
      await settleDebounce();

      expect(hidePopover).not.toHaveBeenCalled();
      expect(showPopover).not.toHaveBeenCalled();

      wrapper.unmount();
    });

    it("leaves the placement alone on scroll when flip is off", async () => {
      const wrapper = mount(Popover, {
        props: { id: "pop-off", flip: "off" },
        attachTo: document.body,
      });
      const { hidePopover, showPopover } = stubOpenOverflowingPanel("pop-off");

      window.dispatchEvent(new Event("scroll"));
      await settleDebounce();

      expect(hidePopover).not.toHaveBeenCalled();
      expect(showPopover).not.toHaveBeenCalled();

      wrapper.unmount();
    });

    it("survives scroll and resize where the Popover API is missing", () => {
      // jsdom has no showPopover, and `:popover-open` throws there as an
      // unknown selector — the guard has to short-circuit before that.
      const wrapper = mount(Popover, { props: { id: "pop-k" } });

      expect(() => {
        window.dispatchEvent(new Event("scroll"));
        window.dispatchEvent(new Event("resize"));
      }).not.toThrow();

      wrapper.unmount();
    });

    it("stops listening once unmounted", () => {
      const wrapper = mount(Popover, { props: { id: "pop-l" } });
      wrapper.unmount();

      expect(() => window.dispatchEvent(new Event("scroll"))).not.toThrow();
      expect(injectedCss()).not.toContain("pop-l");
    });
  });

  describe("Defaults", () => {
    it("wraps surface and motion defaults in :where() so consumers can override", () => {
      const wrapper = mount(Popover, { props: { id: "pop-h" } });

      const css = injectedCss();
      expect(css).toContain(":where(.popover-body#pop-h)");
      expect(css).toContain("background: var(--color-bg)");
      expect(css).toContain("@starting-style");

      wrapper.unmount();
    });

    it("moves the panel away from the trigger on open", () => {
      const wrapper = mount(Popover, {
        props: { id: "pop-i", position: "top" },
      });

      expect(injectedCss()).toContain(
        "transform: translateY(var(--popover-enter-distance))",
      );

      wrapper.unmount();
    });
  });
});
