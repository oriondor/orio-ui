import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, ref } from "vue";
import Popover from "../../src/runtime/components/Popover.vue";

vi.mock("@vueuse/core", () => ({
  useElementBounding: () => ({
    width: ref(0),
    height: ref(0),
  }),
}));

describe("Popover", () => {
  it("opens popover on trigger click", async () => {
    const wrapper = mount(Popover, {
      slots: {
        default: '<button class="trigger-btn">Open</button>',
        content: '<div class="popover-content">Hello</div>',
      },
      global: {
        stubs: { Teleport: true, Transition: false },
      },
      attachTo: document.body,
    });

    await wrapper.find(".trigger-btn").trigger("click");
    await nextTick();

    expect(wrapper.find(".popover").exists()).toBe(true);

    wrapper.unmount();
  });

  it("does not open when disabled", async () => {
    const wrapper = mount(Popover, {
      props: { disabled: true },
      slots: {
        default: '<button class="trigger-btn">Open</button>',
        content: '<div class="popover-content">Hello</div>',
      },
      global: {
        stubs: { Teleport: true, Transition: false },
      },
      attachTo: document.body,
    });

    await wrapper.find(".trigger-btn").trigger("click");
    await nextTick();

    expect(wrapper.find(".popover").exists()).toBe(false);

    wrapper.unmount();
  });
});
