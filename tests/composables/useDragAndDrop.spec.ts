import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import Draggable from "../../src/runtime/components/Draggable.vue";
import DropZone from "../../src/runtime/components/DropZone.vue";

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

// a card in one zone and two zones; elementFromPoint maps x to a zone
async function setup(zoneGroup?: string) {
  const onDrop = vi.fn();
  const onOtherDrop = vi.fn();
  const onDragEnd = vi.fn();
  const wrapper = mount(
    defineComponent({
      render: () => [
        h(Draggable, { data: { id: 7 }, group: "cards", onDragEnd }, () =>
          h("button", { class: "card" }, "Card"),
        ),
        h(DropZone, { group: zoneGroup, class: "zone", onDrop }, () =>
          h("p", { class: "inner" }, "Zone"),
        ),
        h(DropZone, { class: "other", onDrop: onOtherDrop }),
      ],
    }),
    { attachTo: document.body },
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
    card.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onClick).not.toHaveBeenCalled();
    card.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onClick).toHaveBeenCalledTimes(1);
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
