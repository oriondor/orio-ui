import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Tooltip from "../../src/runtime/components/Tooltip.vue";

describe("Tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows tooltip after delay and hides on mouseleave", async () => {
    const wrapper = mount(Tooltip, {
      props: { text: "Helpful", delay: 200 },
      slots: { default: "<button>Hover</button>" },
      global: {
        stubs: { Teleport: true },
      },
      attachTo: document.body,
    });

    await wrapper.find(".trigger").trigger("mouseenter");
    expect(wrapper.find(".tooltip").exists()).toBe(false);

    vi.advanceTimersByTime(200);
    await nextTick();

    expect(wrapper.find(".tooltip").exists()).toBe(true);

    await wrapper.find(".trigger").trigger("mouseleave");
    await nextTick();

    expect(wrapper.find(".tooltip").exists()).toBe(false);

    wrapper.unmount();
  });

  it("does not show tooltip when disabled", async () => {
    const wrapper = mount(Tooltip, {
      props: { text: "Disabled", delay: 0, disabled: true },
      slots: { default: "<button>Hover</button>" },
      global: {
        stubs: { Teleport: true },
      },
      attachTo: document.body,
    });

    await wrapper.find(".trigger").trigger("mouseenter");
    await nextTick();

    expect(wrapper.find(".tooltip").exists()).toBe(false);

    wrapper.unmount();
  });

  it("applies placement class for arrow", async () => {
    const wrapper = mount(Tooltip, {
      props: { text: "Positioned", delay: 0, placement: "right" },
      slots: { default: "<button>Hover</button>" },
      global: {
        stubs: { Teleport: true },
      },
      attachTo: document.body,
    });

    await wrapper.find(".trigger").trigger("mouseenter");
    await nextTick();

    const arrow = wrapper.find(".arrow");
    expect(arrow.exists()).toBe(true);
    expect(arrow.classes()).toContain("arrow-right");

    wrapper.unmount();
  });
});
