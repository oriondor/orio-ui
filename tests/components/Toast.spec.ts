import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Toast from "../../src/runtime/components/Toast/index.vue";
import { i18n } from "../../src/runtime/i18n";
import type { ToastAction } from "../../src/runtime/composables/useToast";

const global = { plugins: [i18n] };

describe("Toast", () => {
  it("renders the message", () => {
    const wrapper = mount(Toast, {
      props: { message: "Changes saved" },
      global,
    });

    expect(wrapper.text()).toContain("Changes saved");
  });

  it("renders the title above the message", () => {
    const wrapper = mount(Toast, {
      props: { title: "Upload failed", message: "Try again" },
      global,
    });

    expect(wrapper.find(".toast-title").text()).toBe("Upload failed");
    expect(wrapper.find(".toast-message").text()).toBe("Try again");
  });

  it("applies the variant class", () => {
    const wrapper = mount(Toast, {
      props: { message: "Gone", variant: "danger" },
      global,
    });

    expect(wrapper.find(".toast").classes()).toContain("danger");
  });

  it("announces danger toasts assertively", () => {
    const wrapper = mount(Toast, {
      props: { message: "Gone", variant: "danger" },
      global,
    });

    expect(wrapper.find(".toast").attributes("role")).toBe("alert");
  });

  it("announces other toasts politely", () => {
    const wrapper = mount(Toast, {
      props: { message: "Saved", variant: "success" },
      global,
    });

    expect(wrapper.find(".toast").attributes("role")).toBe("status");
  });

  it("emits close when the close button is clicked", async () => {
    const wrapper = mount(Toast, {
      props: { message: "Saved" },
      global,
    });

    await wrapper.find(".toast-close button").trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("hides the close button when not closable", () => {
    const wrapper = mount(Toast, {
      props: { message: "Saved", closable: false },
      global,
    });

    expect(wrapper.find(".toast-close").exists()).toBe(false);
  });

  it("renders one button per action and emits the clicked action", async () => {
    const actions: ToastAction[] = [
      { label: "Undo", onClick: () => {} },
      { label: "Details", onClick: () => {} },
    ];
    const wrapper = mount(Toast, {
      props: { message: "File deleted", actions },
      global,
    });

    const buttons = wrapper.findAll(".toast-actions button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0].text()).toBe("Undo");

    await buttons[1].trigger("click");

    expect(wrapper.emitted("action")).toEqual([[actions[1]]]);
  });

  it("omits the actions area when there are no actions", () => {
    const wrapper = mount(Toast, {
      props: { message: "Saved" },
      global,
    });

    expect(wrapper.find(".toast-actions").exists()).toBe(false);
  });

  it("lets the actions slot replace the rendered buttons", () => {
    const actions: ToastAction[] = [{ label: "Undo", onClick: () => {} }];
    const wrapper = mount(Toast, {
      props: { message: "File deleted", actions },
      global,
      slots: {
        actions: `<template #actions="{ actions }">
          <span class="custom-actions">{{ actions.length }}</span>
        </template>`,
      },
    });

    expect(wrapper.find(".custom-actions").text()).toBe("1");
    expect(wrapper.find(".toast-actions button").exists()).toBe(false);
  });

  it("renders an actions slot given without any actions prop", () => {
    const wrapper = mount(Toast, {
      props: { message: "Storage almost full" },
      global,
      slots: { actions: '<button class="upgrade">Upgrade</button>' },
    });

    expect(wrapper.find(".toast-actions .upgrade").exists()).toBe(true);
  });

  it("lets the default slot replace the message body", () => {
    const wrapper = mount(Toast, {
      props: { message: "Ignored" },
      global,
      slots: { default: '<em class="custom-body">Custom</em>' },
    });

    expect(wrapper.find(".custom-body").text()).toBe("Custom");
    expect(wrapper.text()).not.toContain("Ignored");
  });

  it("draws a countdown bar when a timeout is shown", () => {
    const wrapper = mount(Toast, {
      props: { message: "Saved", showTimeout: true, timeout: 4000 },
      global,
    });

    expect(wrapper.find(".toast-progress").exists()).toBe(true);
  });

  it("runs the bar for exactly the toast's timeout", () => {
    const wrapper = mount(Toast, {
      props: { message: "Saved", showTimeout: true, timeout: 4000 },
      global,
    });

    expect(wrapper.find(".toast-progress").attributes("style")).toContain(
      "4000ms",
    );
  });

  it("omits the bar when the timeout is not shown", () => {
    const wrapper = mount(Toast, {
      props: { message: "Saved", timeout: 4000 },
      global,
    });

    expect(wrapper.find(".toast-progress").exists()).toBe(false);
  });

  it("omits the bar for a sticky toast, since nothing counts down", () => {
    const wrapper = mount(Toast, {
      props: { message: "Sticky", showTimeout: true, timeout: 0 },
      global,
    });

    expect(wrapper.find(".toast-progress").exists()).toBe(false);
  });

  it("freezes the bar while the toast is paused", async () => {
    const wrapper = mount(Toast, {
      props: { message: "Saved", showTimeout: true, timeout: 4000 },
      global,
    });

    expect(wrapper.find(".toast-progress").classes()).not.toContain("paused");

    await wrapper.setProps({ paused: true });

    expect(wrapper.find(".toast-progress").classes()).toContain("paused");
  });

  it("labels the close button through i18n", () => {
    const wrapper = mount(Toast, {
      props: { message: "Saved" },
      global,
    });

    expect(wrapper.find(".toast-close button").attributes("aria-label")).toBe(
      "Close notification",
    );
  });
});
