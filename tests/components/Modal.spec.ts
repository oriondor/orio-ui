import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Modal from "../../src/runtime/components/Modal.vue";
import { ref } from "vue";

vi.mock("@vueuse/core", () => ({
  useWindowSize: () => ({ width: { value: 800 }, height: { value: 600 } }),
  useTimeoutFn: (fn: () => void) => {
    fn();
    return { start: () => {}, stop: () => {} };
  },
  useScrollLock: () => ref(false),
}));

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
});
