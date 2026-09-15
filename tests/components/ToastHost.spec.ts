import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, ref } from "vue";
import Host from "../../src/runtime/components/Toast/components/Host.vue";
import { useToast } from "../../src/runtime/composables/useToast";
import { i18n } from "../../src/runtime/i18n";

const global = {
  plugins: [i18n],
  stubs: { teleport: true, transition: false, "transition-group": false },
};

function mountHost() {
  return mount(Host, { global, attachTo: document.body });
}

describe("Toast Host", () => {
  beforeEach(() => {
    useToast().clearToasts();
    useToast().setToastDefaults({
      variant: "info",
      position: "bottom-end",
      timeout: 5000,
      closable: true,
      showTimeout: false,
      limit: 5,
    });
  });

  afterEach(() => {
    useToast().clearToasts();
    document.body.innerHTML = "";
  });

  it("renders nothing while the queue is empty", () => {
    const wrapper = mountHost();

    expect(wrapper.find(".toast-stack").exists()).toBe(false);
  });

  it("renders a stack carrying the position of its toasts", async () => {
    const wrapper = mountHost();
    useToast().showToast({ message: "Saved", timeout: 0 });
    await nextTick();

    const stack = wrapper.find(".toast-stack");
    expect(stack.exists()).toBe(true);
    expect(stack.classes()).toContain("bottom-end");
    expect(stack.text()).toContain("Saved");
  });

  it("splits toasts into one stack per position", async () => {
    const wrapper = mountHost();
    useToast().showToast({ message: "Bottom", timeout: 0 });
    useToast().showToast({
      message: "Top",
      timeout: 0,
      position: "top-center",
    });
    await nextTick();

    const stacks = wrapper.findAll(".toast-stack");
    expect(stacks).toHaveLength(2);
    expect(wrapper.find(".toast-stack.top-center").text()).toContain("Top");
  });

  it("keeps toasts of one stack in the order they arrived", async () => {
    const wrapper = mountHost();
    useToast().showToast({ message: "First", timeout: 0 });
    useToast().showToast({ message: "Second", timeout: 0 });
    await nextTick();

    const messages = wrapper
      .findAll(".toast-message")
      .map((element) => element.text());
    expect(messages).toEqual(["First", "Second"]);
  });

  it("teleports each target group separately", async () => {
    const panel = document.createElement("div");
    document.body.appendChild(panel);

    const wrapper = mountHost();
    useToast().showToast({ message: "Body", timeout: 0 });
    useToast().showToast({ message: "Panel", timeout: 0, target: panel });
    await nextTick();

    expect(wrapper.findAll("teleport-stub")).toHaveLength(2);
  });

  it("resolves a target given as a selector", async () => {
    const panel = document.createElement("div");
    panel.id = "panel";
    document.body.appendChild(panel);

    const wrapper = mountHost();
    useToast().showToast({ message: "Panel", timeout: 0, target: "#panel" });
    await nextTick();

    expect(wrapper.find("teleport-stub").attributes("to")).toBe("#panel");
  });

  it("positions a static target so its toasts can anchor to it", async () => {
    const panel = document.createElement("div");
    document.body.appendChild(panel);

    mountHost();
    useToast().showToast({ message: "Panel", timeout: 0, target: panel });
    await nextTick();

    expect(panel.style.position).toBe("relative");
  });

  it("leaves an already positioned target alone", async () => {
    const panel = document.createElement("div");
    panel.style.position = "absolute";
    document.body.appendChild(panel);

    mountHost();
    useToast().showToast({ message: "Panel", timeout: 0, target: panel });
    await nextTick();

    expect(panel.style.position).toBe("absolute");
  });

  it("removes the toast when its close button is clicked", async () => {
    const wrapper = mountHost();
    useToast().showToast({ message: "Saved", timeout: 0 });
    await nextTick();

    await wrapper.find(".toast-close button").trigger("click");

    expect(useToast().toasts.value).toHaveLength(0);
  });

  it("runs the action handler and closes the toast", async () => {
    const restore = vi.fn();
    const wrapper = mountHost();
    useToast().showToast({
      message: "File deleted",
      timeout: 0,
      actions: [{ label: "Undo", onClick: restore }],
    });
    await nextTick();

    await wrapper.find(".toast-actions button").trigger("click");
    await nextTick();

    expect(restore).toHaveBeenCalledOnce();
    expect(useToast().toasts.value).toHaveLength(0);
  });

  it("holds the countdown while the pointer rests on a stack", async () => {
    vi.useFakeTimers();
    const wrapper = mountHost();
    useToast().showToast({ message: "Saved", timeout: 3000 });
    await nextTick();

    await wrapper.find(".toast-stack").trigger("mouseenter");
    vi.advanceTimersByTime(60000);
    expect(useToast().toasts.value).toHaveLength(1);

    await wrapper.find(".toast-stack").trigger("mouseleave");
    vi.advanceTimersByTime(3000);
    expect(useToast().toasts.value).toHaveLength(0);

    vi.useRealTimers();
  });

  it("holds the countdown while a stack holds focus", async () => {
    vi.useFakeTimers();
    const wrapper = mountHost();
    useToast().showToast({ message: "Saved", timeout: 3000 });
    await nextTick();

    await wrapper.find(".toast-stack").trigger("focusin");
    vi.advanceTimersByTime(60000);
    expect(useToast().toasts.value).toHaveLength(1);

    await wrapper.find(".toast-stack").trigger("focusout");
    vi.advanceTimersByTime(3000);
    expect(useToast().toasts.value).toHaveLength(0);

    vi.useRealTimers();
  });

  it("passes the countdown bar settings down to the card", async () => {
    const wrapper = mountHost();
    useToast().showToast({
      message: "Saved",
      timeout: 4000,
      showTimeout: true,
    });
    await nextTick();

    const progress = wrapper.find(".toast-progress");
    expect(progress.exists()).toBe(true);
    expect(progress.attributes("style")).toContain("4000ms");
  });

  it("freezes the bars of a stack while the pointer rests on it", async () => {
    const wrapper = mountHost();
    useToast().showToast({
      message: "Saved",
      timeout: 4000,
      showTimeout: true,
    });
    await nextTick();

    await wrapper.find(".toast-stack").trigger("mouseenter");
    expect(wrapper.find(".toast-progress").classes()).toContain("paused");

    await wrapper.find(".toast-stack").trigger("mouseleave");
    expect(wrapper.find(".toast-progress").classes()).not.toContain("paused");
  });

  it("freezes the bars of one stack only", async () => {
    const wrapper = mountHost();
    useToast().showToast({
      message: "Bottom",
      timeout: 4000,
      showTimeout: true,
    });
    useToast().showToast({
      message: "Top",
      timeout: 4000,
      showTimeout: true,
      position: "top-center",
    });
    await nextTick();

    await wrapper.find(".toast-stack.bottom-end").trigger("mouseenter");

    expect(
      wrapper.find(".toast-stack.bottom-end .toast-progress").classes(),
    ).toContain("paused");
    expect(
      wrapper.find(".toast-stack.top-center .toast-progress").classes(),
    ).not.toContain("paused");
  });

  it("follows a target ref that resolves after the toast is shown", async () => {
    const panel = ref<HTMLElement | null>(null);
    const wrapper = mountHost();
    useToast().showToast({ message: "Panel", timeout: 0, target: panel });
    await nextTick();

    expect(wrapper.find("teleport-stub").attributes("to")).toBe("body");

    const element = document.createElement("div");
    document.body.appendChild(element);
    panel.value = element;
    await nextTick();

    expect(wrapper.find("teleport-stub").attributes("to")).not.toBe("body");
  });
});
