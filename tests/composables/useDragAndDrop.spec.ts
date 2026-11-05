import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import Draggable from "../../src/runtime/components/Draggable.vue";
import DropZone from "../../src/runtime/components/DropZone.vue";
import LongPress from "../../src/runtime/components/LongPress.vue";

function pointer(
  type: string,
  x: number,
  y: number,
  pointerType: "mouse" | "touch" = "mouse",
) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    clientX: x,
    clientY: y,
  });
  Object.defineProperty(event, "isPrimary", { value: true });
  Object.defineProperty(event, "pointerId", { value: 1 });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  return event;
}

// mouse/touch clicks carry detail >= 1; keyboard activation has detail 0
function pointerClick(element: Element) {
  element.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 }),
  );
}

// a card in one zone and two zones; elementFromPoint maps x to a zone
async function setup(
  zoneGroup?: string,
  draggableProps: Record<string, unknown> = {},
) {
  const onDrop = vi.fn();
  const onOtherDrop = vi.fn();
  const onDragEnd = vi.fn();
  const wrapper = mount(
    defineComponent({
      render: () => [
        h(
          Draggable,
          { data: { id: 7 }, group: "cards", onDragEnd, ...draggableProps },
          () => h("button", { class: "card" }, "Card"),
        ),
        h(DropZone, { group: zoneGroup, class: "zone", onDrop }, () =>
          h("p", { class: "inner" }, "Zone"),
        ),
        h(DropZone, { class: "other", onDrop: onOtherDrop }),
      ],
    }),
    {
      attachTo: document.body,
      global: { components: { "orio-long-press": LongPress } },
    },
  );
  const card = wrapper.find(".card").element;
  const zone = wrapper.find(".zone").element;
  const inner = wrapper.find(".inner").element;
  const other = wrapper.find(".other").element;
  document.elementFromPoint = (x: number) =>
    x >= 200 ? other : x >= 100 ? inner : card;
  // vueuse attaches element listeners after the mount flush
  await nextTick();
  return { wrapper, card, zone, other, onDrop, onOtherDrop, onDragEnd };
}

describe("Draggable + DropZone", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("drops the data on the zone under the pointer", async () => {
    const { wrapper, card, zone, onDrop, onOtherDrop, onDragEnd } =
      await setup();
    card.dispatchEvent(pointer("pointerdown", 0, 0));
    window.dispatchEvent(pointer("pointermove", 150, 0));
    await nextTick();
    expect(wrapper.find(".draggable").classes()).toContain("dragging");
    expect(zone.classList).toContain("drag-over");
    expect(document.body.querySelectorAll(".card")).toHaveLength(2); // ghost

    window.dispatchEvent(pointer("pointerup", 150, 0));
    await nextTick();
    expect(onDrop).toHaveBeenCalledWith({ id: 7 }, expect.any(MouseEvent));
    expect(onOtherDrop).not.toHaveBeenCalled();
    expect(onDragEnd).toHaveBeenCalledWith(true);
    expect(document.body.querySelectorAll(".card")).toHaveLength(1);
    expect(zone.classList).not.toContain("drag-over");
  });

  it("does not start a mouse drag below the threshold", async () => {
    const { card, onDragEnd } = await setup();
    card.dispatchEvent(pointer("pointerdown", 0, 0));
    window.dispatchEvent(pointer("pointermove", 3, 0));
    window.dispatchEvent(pointer("pointerup", 3, 0));
    expect(onDragEnd).not.toHaveBeenCalled();
  });

  it("swallows the click that follows a drag", async () => {
    const { card } = await setup();
    const onClick = vi.fn();
    card.addEventListener("click", onClick);
    card.dispatchEvent(pointer("pointerdown", 0, 0));
    window.dispatchEvent(pointer("pointermove", 50, 0));
    window.dispatchEvent(pointer("pointerup", 50, 0));
    pointerClick(card);
    expect(onClick).not.toHaveBeenCalled();
    pointerClick(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("never swallows a keyboard click", async () => {
    const { card } = await setup();
    const onClick = vi.fn();
    card.addEventListener("click", onClick);
    card.dispatchEvent(pointer("pointerdown", 0, 0));
    window.dispatchEvent(pointer("pointermove", 50, 0));
    window.dispatchEvent(pointer("pointerup", 50, 0));
    card.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("a pointercancel arms no swallow", async () => {
    const { card } = await setup();
    const onClick = vi.fn();
    card.addEventListener("click", onClick);
    card.dispatchEvent(pointer("pointerdown", 0, 0));
    window.dispatchEvent(pointer("pointermove", 50, 0));
    window.dispatchEvent(pointer("pointercancel", 50, 0));
    pointerClick(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("no drop when the zone stops accepting before release", async () => {
    const isZoneDisabled = ref(false);
    const onDrop = vi.fn();
    const onDragEnd = vi.fn();
    const wrapper = mount(
      defineComponent({
        render: () => [
          h(Draggable, { onDragEnd }, () => h("span", { class: "card" })),
          h(DropZone, {
            class: "zone",
            disabled: isZoneDisabled.value,
            onDrop,
          }),
        ],
      }),
      { attachTo: document.body },
    );
    const zone = wrapper.find(".zone").element;
    document.elementFromPoint = () => zone;
    await nextTick();
    wrapper.find(".card").element.dispatchEvent(pointer("pointerdown", 0, 0));
    window.dispatchEvent(pointer("pointermove", 50, 0));
    isZoneDisabled.value = true;
    await nextTick();
    window.dispatchEvent(pointer("pointerup", 50, 0));
    expect(onDrop).not.toHaveBeenCalled();
    expect(onDragEnd).toHaveBeenCalledWith(false);
  });

  it("reports a miss when released outside any zone", async () => {
    const { card, onDrop, onDragEnd } = await setup();
    card.dispatchEvent(pointer("pointerdown", 0, 0));
    window.dispatchEvent(pointer("pointermove", 50, 0));
    window.dispatchEvent(pointer("pointerup", 50, 0));
    expect(onDrop).not.toHaveBeenCalled();
    expect(onDragEnd).toHaveBeenCalledWith(false);
  });

  it("skips a zone of another group", async () => {
    const { card, zone, onDrop } = await setup("files");
    card.dispatchEvent(pointer("pointerdown", 0, 0));
    window.dispatchEvent(pointer("pointermove", 150, 0));
    await nextTick();
    expect(zone.classList).not.toContain("drag-active");
    window.dispatchEvent(pointer("pointerup", 150, 0));
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("marks every accepting zone active while dragging", async () => {
    const { card, zone, other } = await setup();
    card.dispatchEvent(pointer("pointerdown", 0, 0));
    window.dispatchEvent(pointer("pointermove", 50, 0));
    await nextTick();
    expect(zone.classList).toContain("drag-active");
    expect(other.classList).toContain("drag-active");
    window.dispatchEvent(pointer("pointerup", 50, 0));
  });

  it("Escape cancels without dropping", async () => {
    const { card, onDrop, onDragEnd } = await setup();
    card.dispatchEvent(pointer("pointerdown", 0, 0));
    window.dispatchEvent(pointer("pointermove", 150, 0));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    window.dispatchEvent(pointer("pointerup", 150, 0));
    expect(onDrop).not.toHaveBeenCalled();
    expect(onDragEnd).toHaveBeenCalledWith(false);
  });

  describe("touch", () => {
    it("starts after the hold and blocks scrolling", async () => {
      const { card, onDrop } = await setup();
      card.dispatchEvent(pointer("pointerdown", 0, 0, "touch"));
      vi.advanceTimersByTime(300);
      const touchMove = new Event("touchmove", { cancelable: true });
      window.dispatchEvent(touchMove);
      expect(touchMove.defaultPrevented).toBe(true);
      window.dispatchEvent(pointer("pointermove", 150, 0, "touch"));
      window.dispatchEvent(pointer("pointerup", 150, 0, "touch"));
      expect(onDrop).toHaveBeenCalled();
    });

    it("moving during the hold is a scroll, not a drag", async () => {
      const { card, onDragEnd } = await setup();
      card.dispatchEvent(pointer("pointerdown", 0, 0, "touch"));
      window.dispatchEvent(pointer("pointermove", 0, 20, "touch"));
      vi.advanceTimersByTime(300);
      const touchMove = new Event("touchmove", { cancelable: true });
      window.dispatchEvent(touchMove);
      expect(touchMove.defaultPrevented).toBe(false);
      expect(onDragEnd).not.toHaveBeenCalled();
    });

    it("delay replaces the default hold", async () => {
      const { card, onDragEnd } = await setup(undefined, { delay: 600 });
      card.dispatchEvent(pointer("pointerdown", 0, 0, "touch"));
      vi.advanceTimersByTime(300);
      window.dispatchEvent(pointer("pointerup", 0, 0, "touch"));
      expect(onDragEnd).not.toHaveBeenCalled();

      card.dispatchEvent(pointer("pointerdown", 0, 0, "touch"));
      vi.advanceTimersByTime(600);
      window.dispatchEvent(pointer("pointerup", 0, 0, "touch"));
      expect(onDragEnd).toHaveBeenCalledWith(false);
    });
  });

  describe("longpress activation", () => {
    it("mouse movement before the hold does not start a drag", async () => {
      const { wrapper, card } = await setup(undefined, {
        activation: "longpress",
      });
      card.dispatchEvent(pointer("pointerdown", 0, 0));
      window.dispatchEvent(pointer("pointermove", 150, 0));
      await nextTick();
      expect(wrapper.find(".draggable").classes()).not.toContain("dragging");
    });

    it("starts after the long-press delay and drops", async () => {
      const { wrapper, card, onDrop } = await setup(undefined, {
        activation: "longpress",
        delay: 400,
      });
      card.dispatchEvent(pointer("pointerdown", 0, 0));
      await nextTick();
      expect(wrapper.find(".long-press").classes()).toContain("pressing");
      vi.advanceTimersByTime(400);
      await nextTick();
      window.dispatchEvent(pointer("pointermove", 150, 0));
      window.dispatchEvent(pointer("pointerup", 150, 0));
      expect(onDrop).toHaveBeenCalledWith({ id: 7 }, expect.anything());
    });

    it("the drag copy is not shrunk", async () => {
      const { card } = await setup(undefined, { activation: "longpress" });
      card.dispatchEvent(pointer("pointerdown", 0, 0));
      await nextTick();
      vi.advanceTimersByTime(500);
      await nextTick();
      const copy = document.body.querySelector(':scope > [aria-hidden="true"]');
      expect(copy).not.toBeNull();
      expect(copy!.querySelector(".long-press")!.classList).not.toContain(
        "pressing",
      );
    });

    it("Space hold on a focused child keeps its click", async () => {
      const { card, onDragEnd } = await setup(undefined, {
        activation: "longpress",
      });
      const key = (type: string) =>
        new KeyboardEvent(type, { key: " ", bubbles: true, cancelable: true });
      const down = key("keydown");
      card.dispatchEvent(down);
      expect(down.defaultPrevented).toBe(false);
      vi.advanceTimersByTime(500);
      await nextTick();
      const up = key("keyup");
      card.dispatchEvent(up);
      expect(up.defaultPrevented).toBe(false);
      expect(onDragEnd).not.toHaveBeenCalled();
    });

    it("passes long-press tuning through", async () => {
      const { wrapper } = await setup(undefined, {
        activation: "longpress",
        scale: 0.8,
        progress: true,
      });
      const longPress = wrapper.find(".long-press");
      expect(longPress.classes()).toContain("progress");
      expect(longPress.attributes("style")).toContain(
        "--long-press-scale: 0.8",
      );
    });

    it("drops on the zone under the release, not the last move", async () => {
      const { card, onDrop, onOtherDrop } = await setup(undefined, {
        activation: "longpress",
      });
      card.dispatchEvent(pointer("pointerdown", 0, 0));
      vi.advanceTimersByTime(500);
      await nextTick();
      window.dispatchEvent(pointer("pointerup", 250, 0));
      expect(onOtherDrop).toHaveBeenCalled();
      expect(onDrop).not.toHaveBeenCalled();
    });

    it("Safari force click starts the drag at once", async () => {
      const { card, onDrop } = await setup(undefined, {
        activation: "longpress",
      });
      card.dispatchEvent(pointer("pointerdown", 0, 0));
      card.dispatchEvent(
        new MouseEvent("webkitmouseforcedown", { bubbles: true }),
      );
      await nextTick();
      window.dispatchEvent(pointer("pointermove", 150, 0));
      window.dispatchEvent(pointer("pointerup", 150, 0));
      expect(onDrop).toHaveBeenCalled();
    });
  });

  it("disabled draggable never starts", async () => {
    const wrapper = mount(Draggable, {
      props: { disabled: true },
      slots: { default: "<span class='card'>Card</span>" },
      attachTo: document.body,
    });
    await nextTick();
    wrapper.find(".card").element.dispatchEvent(pointer("pointerdown", 0, 0));
    window.dispatchEvent(pointer("pointermove", 50, 0));
    await nextTick();
    expect(wrapper.classes()).not.toContain("dragging");
    expect(wrapper.emitted("dragStart")).toBeUndefined();
  });
});
