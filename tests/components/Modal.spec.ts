import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { config, enableAutoUnmount, mount } from "@vue/test-utils";
import Modal from "../../src/runtime/components/Modal.vue";
import Popover from "../../src/runtime/components/Popover.vue";
import { i18n } from "../../src/runtime/i18n";
import { nextTick, ref } from "vue";

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
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

    it("takes Tab and Esc back when focus fell to body", () => {
      const onUpdateShow = vi.fn();
      mountModal({ "onUpdate:show": onUpdateShow });
      (document.activeElement as HTMLElement | null)?.blur();
      expect(document.activeElement).toBe(document.body);

      expect(press(document.body, "Tab").defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(dialog());

      dialog().blur();
      press(document.body, "Escape");
      expect(onUpdateShow).toHaveBeenCalledWith(false);
    });

    it("lets only the topmost open modal take Esc from body", async () => {
      vi.useFakeTimers();
      const onLower = vi.fn();
      const onUpper = vi.fn();
      mountModal({ "onUpdate:show": onLower });
      const upper = mountModal({ "onUpdate:show": onUpper });
      (document.activeElement as HTMLElement | null)?.blur();

      press(document.body, "Escape");
      expect(onUpper).toHaveBeenCalledWith(false);
      expect(onLower).not.toHaveBeenCalled();

      // upper is still in its leave transition: the lower one is topmost now
      await upper.setProps({ show: false });
      (document.activeElement as HTMLElement | null)?.blur();
      press(document.body, "Escape");
      expect(onLower).toHaveBeenCalledWith(false);
      // let the leave finish so the closing dialog leaves the DOM
      await vi.advanceTimersByTimeAsync(500);
      vi.useRealTimers();
    });

    it("keeps a caller id on the dialog", () => {
      mountModal({ id: "settings-dialog" });
      expect(dialog().id).toBe("settings-dialog");
    });

    it("renders a nested popover inside the dialog", async () => {
      const onUpdateShow = vi.fn();
      mount(Modal, {
        props: { show: true, origin: null, "onUpdate:show": onUpdateShow },
        // caller id doubles as the popover teleport target
        attrs: { id: "picker-dialog" },
        slots: {
          default: `<orio-popover>
            <template #default="{ toggle }">
              <button class="trigger" @click="toggle()">Open</button>
            </template>
            <template #content><button class="inside">Pick</button></template>
          </orio-popover>`,
        },
        global: {
          stubs: { transition: false },
          components: { OrioPopover: Popover },
        },
      });
      await nextTick();
      document.querySelector<HTMLElement>(".trigger")!.click();
      await nextTick();
      await nextTick();
      const content = document.querySelector(".inside");
      expect(content?.closest('[role="dialog"]')).toBe(dialog());

      // Esc in the popover closes it, not the modal, and refocuses the trigger
      (content as HTMLElement).focus();
      const escape = press(content!, "Escape");
      // popover leave transition finishes on the next frames
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(escape.defaultPrevented).toBe(true);
      expect(document.querySelector(".inside")).toBeNull();
      expect(document.activeElement).toBe(document.querySelector(".trigger"));
      expect(onUpdateShow).not.toHaveBeenCalled();
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

  describe("presentation", () => {
    function stubMedia({ narrow = false, reducedMotion = false } = {}) {
      vi.stubGlobal("matchMedia", (query: string) => ({
        matches: query.includes("reduced-motion") ? reducedMotion : narrow,
        addEventListener: () => {},
        removeEventListener: () => {},
      }));
    }

    function mountModal(props: Record<string, unknown> = {}, attrs = {}) {
      return mount(Modal, {
        props: { show: true, origin: null, ...props },
        attrs,
        slots: { default: "Body" },
        global: { stubs: { transition: false } },
      });
    }

    const modalElement = () => document.querySelector<HTMLElement>(".modal")!;

    beforeEach(() => stubMedia());

    it("defaults to dialog", () => {
      mountModal();
      expect(modalElement().dataset.presentation).toBe("dialog");
    });

    it("renders sheet when asked", () => {
      mountModal({ presentation: "sheet" });
      expect(modalElement().dataset.presentation).toBe("sheet");
    });

    it.each([
      [true, "sheet"],
      [false, "dialog"],
    ])("auto resolves for narrow=%s to %s", (narrow, expected) => {
      stubMedia({ narrow });
      mountModal({ presentation: "auto" });
      expect(modalElement().dataset.presentation).toBe(expected);
    });

    it("keeps the mode it opened in when the viewport changes while open", async () => {
      stubMedia({ narrow: true });
      const wrapper = mountModal({ presentation: "auto", show: false });
      await wrapper.setProps({ show: true });
      expect(modalElement().dataset.presentation).toBe("sheet");
      stubMedia({ narrow: false });
      await wrapper.setProps({ title: "Re-render" });
      expect(modalElement().dataset.presentation).toBe("sheet");
    });

    it("renders an aria-hidden grip only for a sheet with dragHandle", () => {
      mountModal({ presentation: "sheet", dragHandle: true });
      const grip = document.querySelector(".modal-grip");
      expect(grip?.getAttribute("aria-hidden")).toBe("true");
      expect(grip?.parentElement?.classList.contains("modal-inner")).toBe(true);
    });

    it.each([
      [{ presentation: "sheet" }],
      [{ presentation: "dialog", dragHandle: true }],
    ])("has no grip for %o", (props) => {
      mountModal(props);
      expect(document.querySelector(".modal-grip")).toBeNull();
    });

    it("keeps .modal-inner the first child of .modal", () => {
      mountModal({ presentation: "sheet", dragHandle: true });
      expect(modalElement().firstElementChild?.className).toContain(
        "modal-inner",
      );
    });

    it("ignores origin in a sheet", async () => {
      const wrapper = mountModal({
        presentation: "sheet",
        show: false,
        origin: { x: 10, y: 10, width: 50, height: 20 },
      });
      await wrapper.setProps({ show: true });
      const element = modalElement();
      expect(element.style.transform).toBe("none");
      expect(element.style.transition).toBe("");
    });

    it("slides down on close without fading", async () => {
      vi.useFakeTimers();
      const wrapper = mountModal({ presentation: "sheet" });
      await wrapper.setProps({ show: false });
      const element = modalElement();
      expect(element.style.transform).toBe("translateY(100%)");
      expect(element.style.transition).toContain("transform");
      expect(element.style.opacity).not.toBe("0");
      await vi.advanceTimersByTimeAsync(500);
      vi.useRealTimers();
    });

    it("reopening mid-close slides back with no stuck transform", async () => {
      vi.useFakeTimers();
      const wrapper = mountModal({ presentation: "sheet" });
      await wrapper.setProps({ show: false });
      await wrapper.setProps({ show: true });
      const element = modalElement();
      expect(element.style.transform).toBe("none");
      expect(element.style.transition).toBe("");
      await vi.advanceTimersByTimeAsync(500);
      vi.useRealTimers();
    });

    it("only fades under reduced motion", async () => {
      stubMedia({ reducedMotion: true });
      vi.useFakeTimers();
      const wrapper = mountModal({ presentation: "sheet" });
      await wrapper.setProps({ show: false });
      const element = modalElement();
      expect(element.style.opacity).toBe("0");
      expect(element.style.transform).not.toBe("translateY(100%)");
      await vi.advanceTimersByTimeAsync(500);
      vi.useRealTimers();
    });

    it("lands class, style and attrs on .modal", () => {
      mountModal(
        { presentation: "sheet" },
        { class: "mine", style: "--modal-radius: 20px", "data-test": "x" },
      );
      const element = modalElement();
      expect(element.classList.contains("mine")).toBe(true);
      expect(element.style.getPropertyValue("--modal-radius")).toBe("20px");
      expect(element.dataset.test).toBe("x");
    });

    it("keeps dialog semantics, Esc and focus in a sheet", () => {
      const onUpdateShow = vi.fn();
      mountModal({ presentation: "sheet", "onUpdate:show": onUpdateShow });
      const element = modalElement();
      expect(element.getAttribute("role")).toBe("dialog");
      expect(element.getAttribute("aria-modal")).toBe("true");
      expect(document.activeElement).toBe(element);
      element.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        }),
      );
      expect(onUpdateShow).toHaveBeenCalledWith(false);
    });
  });
});
