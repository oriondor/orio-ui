import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref, type Ref } from "vue";
import {
  useLongPress,
  type LongPressOptions,
} from "../../src/runtime/composables/useLongPress";

interface PointerInit {
  x?: number;
  y?: number;
  button?: number;
  isPrimary?: boolean;
  ctrlKey?: boolean;
}

function pointer(type: string, init: PointerInit = {}) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: init.x ?? 0,
    clientY: init.y ?? 0,
    button: init.button ?? 0,
    ctrlKey: init.ctrlKey ?? false,
  });
  Object.defineProperty(event, "isPrimary", { value: init.isPrimary ?? true });
  return event;
}

// Mouse/touch clicks carry detail >= 1; keyboard activation has detail 0.
function pointerClick(element: Element) {
  element.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 }),
  );
}

function forceEvent(type: string) {
  return new MouseEvent(type, { bubbles: true, cancelable: true });
}

async function setup(options: Partial<LongPressOptions> = {}) {
  const onTrigger = vi.fn();
  const onStart = vi.fn();
  const onCancel = vi.fn();
  const childClick = vi.fn();
  let isPressing: Readonly<Ref<boolean>> = ref(false);
  let isHolding: Readonly<Ref<boolean>> = ref(false);

  const Harness = defineComponent({
    setup() {
      const element = ref<HTMLElement | null>(null);
      ({ isPressing, isHolding } = useLongPress(element, {
        onTrigger,
        onStart,
        onCancel,
        ...options,
      }));
      return () =>
        h("div", { ref: element, class: "target" }, [
          h("button", { onClick: childClick }, "child"),
        ]);
    },
  });

  const wrapper = mount(Harness, { attachTo: document.body });
  // useEventListener binds in a post-flush watcher, one tick after mount
  await nextTick();
  const element = wrapper.find(".target").element as HTMLElement;
  const button = wrapper.find("button").element as HTMLButtonElement;

  return {
    wrapper,
    element,
    button,
    onTrigger,
    onStart,
    onCancel,
    childClick,
    isPressing: () => isPressing.value,
    isHolding: () => isHolding.value,
  };
}

describe("useLongPress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.getSelection()?.removeAllRanges();
    document.body.innerHTML = "";
  });

  describe("hold", () => {
    it("triggers once after the default 500ms delay", async () => {
      const { element, onTrigger, onStart } = await setup();
      const down = pointer("pointerdown");

      element.dispatchEvent(down);
      expect(onStart).toHaveBeenCalledWith(down);

      vi.advanceTimersByTime(499);
      expect(onTrigger).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onTrigger).toHaveBeenCalledTimes(1);
      expect(onTrigger).toHaveBeenCalledWith(down, "hold");
    });

    it("respects a custom delay", async () => {
      const { element, onTrigger } = await setup({ delay: 1000 });

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(999);
      expect(onTrigger).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onTrigger).toHaveBeenCalledTimes(1);
    });

    it("tracks isPressing from down until trigger", async () => {
      const { element, isPressing } = await setup();

      expect(isPressing()).toBe(false);
      element.dispatchEvent(pointer("pointerdown"));
      expect(isPressing()).toBe(true);

      vi.advanceTimersByTime(500);
      expect(isPressing()).toBe(false);
    });
  });

  describe("cancel", () => {
    it.each(["pointerup", "pointerleave", "pointercancel"])(
      "cancels on %s before the delay",
      async (type) => {
        const { element, onTrigger, onCancel, isPressing } = await setup();

        element.dispatchEvent(pointer("pointerdown"));
        vi.advanceTimersByTime(300);
        element.dispatchEvent(pointer(type));

        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(isPressing()).toBe(false);

        vi.advanceTimersByTime(1000);
        expect(onTrigger).not.toHaveBeenCalled();
      },
    );

    it("cancels when the pointer moves past moveTolerance", async () => {
      const { element, onTrigger, onCancel } = await setup({
        moveTolerance: 10,
      });

      element.dispatchEvent(pointer("pointerdown", { x: 0, y: 0 }));
      element.dispatchEvent(pointer("pointermove", { x: 6, y: 6 }));
      expect(onCancel).not.toHaveBeenCalled();

      element.dispatchEvent(pointer("pointermove", { x: 8, y: 8 }));
      expect(onCancel).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1000);
      expect(onTrigger).not.toHaveBeenCalled();
    });

    it("does not call onCancel when released after a trigger", async () => {
      const { element, onTrigger, onCancel } = await setup();

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);
      element.dispatchEvent(pointer("pointerup"));

      expect(onTrigger).toHaveBeenCalledTimes(1);
      expect(onCancel).not.toHaveBeenCalled();
    });

    it("restarts the timer on a rapid re-press", async () => {
      const { element, onTrigger } = await setup();

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(300);
      element.dispatchEvent(pointer("pointerup"));
      element.dispatchEvent(pointer("pointerdown"));

      vi.advanceTimersByTime(499);
      expect(onTrigger).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onTrigger).toHaveBeenCalledTimes(1);
    });
  });

  describe("ignored input", () => {
    it("ignores non-left mouse buttons", async () => {
      const { element, onTrigger, onStart } = await setup();

      element.dispatchEvent(pointer("pointerdown", { button: 2 }));
      vi.advanceTimersByTime(1000);

      expect(onStart).not.toHaveBeenCalled();
      expect(onTrigger).not.toHaveBeenCalled();
    });

    it("ignores ctrl+click so the macOS context menu still opens", async () => {
      const { element, onStart } = await setup();
      const menu = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
      });

      element.dispatchEvent(pointer("pointerdown", { ctrlKey: true }));
      element.dispatchEvent(menu);

      expect(onStart).not.toHaveBeenCalled();
      expect(menu.defaultPrevented).toBe(false);
    });

    it("ignores non-primary pointers", async () => {
      const { element, onTrigger } = await setup();

      element.dispatchEvent(pointer("pointerdown", { isPrimary: false }));
      vi.advanceTimersByTime(1000);

      expect(onTrigger).not.toHaveBeenCalled();
    });

    it("does nothing while disabled", async () => {
      const { element, onTrigger, onStart } = await setup({ disabled: true });

      element.dispatchEvent(pointer("pointerdown"));
      element.dispatchEvent(forceEvent("webkitmouseforcedown"));
      vi.advanceTimersByTime(1000);

      expect(onStart).not.toHaveBeenCalled();
      expect(onTrigger).not.toHaveBeenCalled();
    });

    it("cancels when disabled mid-press", async () => {
      const disabled = ref(false);
      const { element, onTrigger, onCancel } = await setup({ disabled });

      element.dispatchEvent(pointer("pointerdown"));
      disabled.value = true;
      await nextTick();

      expect(onCancel).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(1000);
      expect(onTrigger).not.toHaveBeenCalled();
    });
  });

  describe("Safari force click", () => {
    it("triggers immediately on webkitmouseforcedown", async () => {
      const { element, onTrigger } = await setup();
      const force = forceEvent("webkitmouseforcedown");

      element.dispatchEvent(pointer("pointerdown"));
      element.dispatchEvent(force);

      expect(onTrigger).toHaveBeenCalledTimes(1);
      expect(onTrigger).toHaveBeenCalledWith(force, "force");
    });

    it("does not fire the hold trigger after a force trigger", async () => {
      const { element, onTrigger } = await setup();

      element.dispatchEvent(pointer("pointerdown"));
      element.dispatchEvent(forceEvent("webkitmouseforcedown"));
      vi.advanceTimersByTime(1000);

      expect(onTrigger).toHaveBeenCalledTimes(1);
    });

    it("ignores force events without an active press", async () => {
      const { element, onTrigger } = await setup();

      element.dispatchEvent(forceEvent("webkitmouseforcedown"));

      expect(onTrigger).not.toHaveBeenCalled();
    });

    it("ignores force events when forceTouch is false", async () => {
      const { element, onTrigger } = await setup({ forceTouch: false });

      element.dispatchEvent(pointer("pointerdown"));
      element.dispatchEvent(forceEvent("webkitmouseforcedown"));
      expect(onTrigger).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(onTrigger).toHaveBeenCalledWith(expect.anything(), "hold");
    });

    it("prevents default on webkitmouseforcewillbegin to suppress Look Up", async () => {
      const { element } = await setup();
      const willBegin = forceEvent("webkitmouseforcewillbegin");

      element.dispatchEvent(willBegin);

      expect(willBegin.defaultPrevented).toBe(true);
    });

    it("leaves webkitmouseforcewillbegin alone when forceTouch is false", async () => {
      const { element } = await setup({ forceTouch: false });
      const willBegin = forceEvent("webkitmouseforcewillbegin");

      element.dispatchEvent(willBegin);

      expect(willBegin.defaultPrevented).toBe(false);
    });
  });

  describe("click swallow", () => {
    it("swallows the click that follows a trigger", async () => {
      const { element, button, childClick } = await setup();

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);
      pointerClick(button);

      expect(childClick).not.toHaveBeenCalled();
    });

    it("lets a keyboard click through after a trigger", async () => {
      const { element, button, childClick } = await setup();

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);
      button.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, detail: 0 }),
      );

      expect(childClick).toHaveBeenCalledTimes(1);
    });

    it("swallows a click that lands outside the target", async () => {
      const { element } = await setup();
      const outsideClick = vi.fn();
      document.body.addEventListener("click", outsideClick);

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);
      pointerClick(document.body);

      expect(outsideClick).not.toHaveBeenCalled();
      document.body.removeEventListener("click", outsideClick);
    });

    it("swallows a click that arrives after the release (mobile compat click)", async () => {
      const { element, button, childClick } = await setup();

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);
      element.dispatchEvent(pointer("pointerup"));
      // touch browsers dispatch the click in a later task than touchend
      vi.advanceTimersByTime(300);
      pointerClick(button);

      expect(childClick).not.toHaveBeenCalled();
    });

    it("disarms on the next pointerdown anywhere on the page", async () => {
      const { element } = await setup();
      const outsideClick = vi.fn();
      document.body.addEventListener("click", outsideClick);

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);
      element.dispatchEvent(pointer("pointerup"));
      document.body.dispatchEvent(pointer("pointerdown"));
      pointerClick(document.body);

      expect(outsideClick).toHaveBeenCalledTimes(1);
      document.body.removeEventListener("click", outsideClick);
    });

    it("lets a click through when no trigger happened", async () => {
      const { element, button, childClick } = await setup();

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(200);
      element.dispatchEvent(pointer("pointerup"));
      pointerClick(button);

      expect(childClick).toHaveBeenCalledTimes(1);
    });

    it("swallows only one click", async () => {
      const { element, button, childClick } = await setup();

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);
      pointerClick(button);
      pointerClick(button);

      expect(childClick).toHaveBeenCalledTimes(1);
    });

    it("disarms the swallow on the next pointerdown", async () => {
      const { element, button, childClick } = await setup();

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);
      // touch browsers may never send the click — next press starts clean
      element.dispatchEvent(pointer("pointerdown"));
      element.dispatchEvent(pointer("pointerup"));
      pointerClick(button);

      expect(childClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("text selection", () => {
    function selectStart(element: Element) {
      const event = new Event("selectstart", {
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(event);
      return event;
    }

    it("tracks isHolding from down until release, across the trigger", async () => {
      const { element, isHolding } = await setup();

      expect(isHolding()).toBe(false);
      element.dispatchEvent(pointer("pointerdown"));
      expect(isHolding()).toBe(true);

      vi.advanceTimersByTime(500);
      expect(isHolding()).toBe(true);

      element.dispatchEvent(pointer("pointerup"));
      expect(isHolding()).toBe(false);
    });

    it("clears isHolding when the finger lifts outside the target", async () => {
      const { element, isHolding } = await setup();

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);
      // e.g. released over a modal overlay the trigger opened
      document.body.dispatchEvent(pointer("pointerup"));

      expect(isHolding()).toBe(false);
    });

    it("clears isHolding when the press is cancelled", async () => {
      const { element, isHolding } = await setup();

      element.dispatchEvent(pointer("pointerdown"));
      element.dispatchEvent(pointer("pointercancel"));

      expect(isHolding()).toBe(false);
    });

    it("blocks selectstart while holding, even after the trigger", async () => {
      const { element, button } = await setup();

      element.dispatchEvent(pointer("pointerdown"));
      expect(selectStart(button).defaultPrevented).toBe(true);

      vi.advanceTimersByTime(500);
      expect(selectStart(button).defaultPrevented).toBe(true);
    });

    it("allows selectstart when idle and after release", async () => {
      const { element, button } = await setup();

      expect(selectStart(button).defaultPrevented).toBe(false);

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);
      element.dispatchEvent(pointer("pointerup"));

      expect(selectStart(button).defaultPrevented).toBe(false);
    });

    it("clears a selection inside the target on trigger", async () => {
      const { element, button } = await setup();
      const range = document.createRange();
      range.selectNodeContents(button);
      window.getSelection()!.addRange(range);

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);

      expect(window.getSelection()!.rangeCount).toBe(0);
    });

    it("keeps a selection outside the target on trigger", async () => {
      const { element } = await setup();
      const outside = document.createElement("p");
      outside.textContent = "outside";
      document.body.appendChild(outside);
      const range = document.createRange();
      range.selectNodeContents(outside);
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);

      expect(window.getSelection()!.rangeCount).toBe(1);
    });
  });

  describe("contextmenu", () => {
    it("prevents the context menu after the trigger until release", async () => {
      const { element } = await setup();
      const menu = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
      });

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);
      element.dispatchEvent(menu);

      expect(menu.defaultPrevented).toBe(true);
    });

    it("prevents the context menu while pressing", async () => {
      const { element } = await setup();
      const menu = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
      });

      element.dispatchEvent(pointer("pointerdown"));
      element.dispatchEvent(menu);

      expect(menu.defaultPrevented).toBe(true);
    });

    it("leaves the context menu alone when idle", async () => {
      const { element } = await setup();
      const menu = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
      });

      element.dispatchEvent(menu);

      expect(menu.defaultPrevented).toBe(false);
    });
  });

  describe("nesting and lifecycle", () => {
    it("only the innermost wrapper handles a press", async () => {
      const outerTrigger = vi.fn();
      const innerTrigger = vi.fn();

      const Nested = defineComponent({
        setup() {
          const outer = ref<HTMLElement | null>(null);
          const inner = ref<HTMLElement | null>(null);
          useLongPress(outer, { onTrigger: outerTrigger });
          useLongPress(inner, { onTrigger: innerTrigger });
          return () =>
            h("div", { ref: outer }, [
              h("div", { ref: inner, class: "inner" }),
            ]);
        },
      });

      const wrapper = mount(Nested, { attachTo: document.body });
      await nextTick();
      wrapper.find(".inner").element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);

      expect(innerTrigger).toHaveBeenCalledTimes(1);
      expect(outerTrigger).not.toHaveBeenCalled();
    });

    it("does not trigger after unmount mid-press", async () => {
      const { wrapper, element, onTrigger } = await setup();

      element.dispatchEvent(pointer("pointerdown"));
      wrapper.unmount();
      vi.advanceTimersByTime(1000);

      expect(onTrigger).not.toHaveBeenCalled();
    });
  });
});
