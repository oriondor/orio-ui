import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { config, enableAutoUnmount, mount } from "@vue/test-utils";
import Modal from "../../src/runtime/components/Modal.vue";
import { i18n } from "../../src/runtime/i18n";
import { nextTick, ref } from "vue";

vi.mock("@vueuse/core", () => ({
  useWindowSize: () => ({ width: { value: 800 }, height: { value: 600 } }),
  useTimeoutFn: (fn: () => void) => {
    fn();
    return { start: () => {}, stop: () => {} };
  },
  useScrollLock: () => ref(false),
}));

config.global.plugins = [i18n];
enableAutoUnmount(afterEach);
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Modal", () => {
  it("renders overlay when show is true", () => {
    const wrapper = mount(Modal, {
      props: { show: true, origin: null },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    expect(wrapper.find(".overlay").exists()).toBe(true);
  });

  it("does not render overlay when show is false", () => {
    const wrapper = mount(Modal, {
      props: { show: false, origin: null },
    });

    expect(wrapper.find(".overlay").exists()).toBe(false);
  });

  it("emits update when clicking overlay background", async () => {
    const onUpdateShow = vi.fn();
    const wrapper = mount(Modal, {
      props: { show: true, origin: null, "onUpdate:show": onUpdateShow },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    await wrapper.find(".overlay").trigger("click");

    expect(onUpdateShow).toHaveBeenCalledWith(false);
  });

  it("renders slot content", () => {
    const wrapper = mount(Modal, {
      props: { show: true, origin: null },
      slots: { default: "Modal content" },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    expect(wrapper.find(".modal").text()).toContain("Modal content");
  });

  describe("page scroll lock", () => {
    const root = document.documentElement;
    // real <transition> so the leave hooks run
    const options = {
      global: { stubs: { transition: false } },
    };

    function mountModal(show: boolean) {
      return mount(Modal, { props: { show, origin: null }, ...options });
    }

    // animateClose falls back to a 500ms timeout when transitionend never fires
    async function finishClose() {
      await vi.advanceTimersByTimeAsync(500);
      await nextTick();
    }

    beforeEach(() => {
      vi.useFakeTimers();
      vi.spyOn(root, "clientWidth", "get").mockReturnValue(1009);
      vi.stubGlobal("innerWidth", 1024);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("pads body by scrollbar width and exposes it as a CSS var", async () => {
      const wrapper = mountModal(false);

      await wrapper.setProps({ show: true });
      expect(document.body.style.paddingRight).toBe("15px");
      expect(root.style.getPropertyValue("--orio-scrollbar-gap")).toBe("15px");

      await wrapper.setProps({ show: false });
      await finishClose();
      expect(document.body.style.paddingRight).toBe("");
      expect(root.style.getPropertyValue("--orio-scrollbar-gap")).toBe("");
    });

    it("stays locked until the close animation finishes", async () => {
      const wrapper = mountModal(true);

      await wrapper.setProps({ show: false });
      expect(document.body.style.paddingRight).toBe("15px");

      await finishClose();
      expect(document.body.style.paddingRight).toBe("");
    });

    it("keeps the page locked until the last stacked modal closes", async () => {
      const outer = mountModal(true);
      const inner = mountModal(true);

      await inner.setProps({ show: false });
      await finishClose();
      expect(document.body.style.paddingRight).toBe("15px");

      outer.unmount();
      expect(document.body.style.paddingRight).toBe("");
      expect(root.style.getPropertyValue("--orio-scrollbar-gap")).toBe("");
    });

    it("stays locked when reopened during the close animation", async () => {
      const wrapper = mountModal(true);

      await wrapper.setProps({ show: false });
      await wrapper.setProps({ show: true });
      await finishClose();
      expect(document.body.style.paddingRight).toBe("15px");
    });

    it("adds the gap to existing body padding and restores it", async () => {
      document.body.style.paddingRight = "10px";
      const wrapper = mountModal(true);
      expect(document.body.style.paddingRight).toBe("25px");

      await wrapper.setProps({ show: false });
      await finishClose();
      expect(document.body.style.paddingRight).toBe("10px");
      document.body.style.paddingRight = "";
    });

    it("locks when mounted already open", () => {
      mountModal(true);
      expect(document.body.style.paddingRight).toBe("15px");
    });
  });

  describe("duration", () => {
    function overlayStyle(duration?: number) {
      const wrapper = mount(Modal, {
        props: { show: true, origin: null, duration },
        global: { stubs: { teleport: true } },
      });
      return wrapper.find(".overlay").attributes("style");
    }

    it("defaults to 500ms open and 400ms close", () => {
      const style = overlayStyle();
      expect(style).toContain("--modal-open-duration: 500ms");
      expect(style).toContain("--modal-close-duration: 400ms");
    });

    it("applies one duration to both directions", () => {
      const style = overlayStyle(250);
      expect(style).toContain("--modal-open-duration: 250ms");
      expect(style).toContain("--modal-close-duration: 250ms");
    });
  });

  describe("accessibility", () => {
    // real teleport + transition so the dialog lands in body and hooks run
    const options = { global: { stubs: { transition: false } } };

    function mountModal(props: Record<string, unknown> = {}) {
      return mount(Modal, {
        props: { show: true, origin: null, ...props },
        slots: { default: '<input class="field" />' },
        ...options,
      });
    }

    function dialog() {
      return document.querySelector<HTMLElement>('[role="dialog"]')!;
    }

    function press(target: Element, key: string, shiftKey = false) {
      const event = new KeyboardEvent("keydown", {
        key,
        shiftKey,
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      return event;
    }

    it("is a modal dialog labelled by its title", () => {
      mountModal({ title: "Settings" });
      const element = dialog();
      expect(element.getAttribute("aria-modal")).toBe("true");
      const title = document.getElementById(
        element.getAttribute("aria-labelledby")!,
      );
      expect(title?.textContent?.trim()).toBe("Settings");
    });

    it("drops aria-labelledby when a custom header replaces the title", () => {
      mount(Modal, {
        props: { show: true, origin: null, title: "Settings" },
        slots: { header: "<h2>Custom</h2>" },
        ...options,
      });
      expect(dialog().hasAttribute("aria-labelledby")).toBe(false);
    });

    it("puts consumer attrs on the dialog", () => {
      mountModal({ "aria-label": "Custom name" });
      expect(dialog().getAttribute("aria-label")).toBe("Custom name");
    });

    it.each([
      ["en", "Close"],
      ["uk", "Закрити"],
    ])("labels the icon-only close button in %s", async (locale, label) => {
      const previous = i18n.global.locale.value;
      i18n.global.locale.value = locale;
      try {
        mountModal({ title: "Settings" });
        await nextTick();
        const close = document.querySelector(".modal-close button");
        expect(close?.getAttribute("aria-label")).toBe(label);
      } finally {
        i18n.global.locale.value = previous;
      }
    });

    it("closes on Escape", async () => {
      const onUpdateShow = vi.fn();
      mountModal({ "onUpdate:show": onUpdateShow });
      press(document.querySelector(".field")!, "Escape");
      expect(onUpdateShow).toHaveBeenCalledWith(false);
    });

    it("leaves Escape to a child that already handled it", () => {
      const onUpdateShow = vi.fn();
      mountModal({ "onUpdate:show": onUpdateShow });
      const field = document.querySelector(".field")!;
      field.addEventListener("keydown", (event) => event.preventDefault());
      press(field, "Escape");
      expect(onUpdateShow).not.toHaveBeenCalled();
    });

    it("moves focus in on open and back to the trigger after close", async () => {
      vi.useFakeTimers();
      const trigger = document.createElement("button");
      document.body.append(trigger);
      trigger.focus();

      const wrapper = mountModal({ show: false });
      await wrapper.setProps({ show: true });
      expect(document.activeElement).toBe(dialog());

      await wrapper.setProps({ show: false });
      await vi.advanceTimersByTimeAsync(500);
      expect(document.activeElement).toBe(trigger);

      trigger.remove();
      vi.useRealTimers();
    });

    it("leaves focus in another modal that opened meanwhile", async () => {
      vi.useFakeTimers();
      const trigger = document.createElement("button");
      document.body.append(trigger);
      trigger.focus();

      const first = mountModal();
      await first.setProps({ show: false });
      mountModal();
      const second = document.activeElement;
      expect(second?.getAttribute("role")).toBe("dialog");

      await vi.advanceTimersByTimeAsync(500);
      expect(document.activeElement).toBe(second);

      trigger.remove();
      vi.useRealTimers();
    });

    it("skips hidden controls when wrapping Tab", () => {
      mount(Modal, {
        props: { show: true, origin: null, title: "Settings" },
        slots: { default: '<input class="field" /><input class="hidden" />' },
        ...options,
      });
      const hidden = document.querySelector<HTMLElement>(".hidden")!;
      hidden.checkVisibility = () => false;
      const field = document.querySelector<HTMLElement>(".field")!;
      const close = document.querySelector<HTMLElement>(".modal-close button")!;

      field.focus();
      expect(press(field, "Tab").defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(close);
    });

    it("wraps Tab inside the dialog", () => {
      mountModal({ title: "Settings" });
      const close = document.querySelector<HTMLElement>(".modal-close button")!;
      const field = document.querySelector<HTMLElement>(".field")!;

      field.focus();
      expect(press(field, "Tab").defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(close);

      expect(press(close, "Tab", true).defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(field);
    });
  });
});
