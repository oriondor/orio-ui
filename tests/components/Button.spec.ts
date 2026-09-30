import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import Button from "../../src/runtime/components/Button.vue";

const ControlStub = {
  template: '<div class="control-stub"><slot /></div>',
};

const IconStub = {
  template: '<span class="icon-stub" :data-name="name"></span>',
  props: ["name"],
};

const LoadingStub = {
  template: '<span class="loading-stub"></span>',
};

describe("Button", () => {
  it("emits click when enabled and not loading", async () => {
    const onClick = vi.fn();
    const wrapper = mount(Button, {
      props: { onClick },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
          "orio-loading-spinner": LoadingStub,
        },
      },
    });

    await wrapper.find("button").trigger("click");

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not emit click when disabled", async () => {
    const onClick = vi.fn();
    const wrapper = mount(Button, {
      props: { disabled: true, onClick },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
          "orio-loading-spinner": LoadingStub,
        },
      },
    });

    await wrapper.find("button").trigger("click");

    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not emit click when loading", async () => {
    const onClick = vi.fn();
    const wrapper = mount(Button, {
      props: { loading: true, onClick },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
          "orio-loading-spinner": LoadingStub,
        },
      },
    });

    await wrapper.find("button").trigger("click");

    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders loading spinner instead of icon while loading", () => {
    const wrapper = mount(Button, {
      props: { loading: true, icon: "check" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
          "orio-loading-spinner": LoadingStub,
        },
      },
    });

    expect(wrapper.find(".loading-stub").exists()).toBe(true);
    expect(wrapper.find(".icon-stub").exists()).toBe(false);
  });

  it("applies icon-only class when only icon is rendered", () => {
    const wrapper = mount(Button, {
      props: { icon: "check" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
          "orio-loading-spinner": LoadingStub,
        },
      },
    });

    expect(wrapper.find("button").classes()).toContain("icon-only");
  });

  it("applies variant class", () => {
    const wrapper = mount(Button, {
      props: { variant: "secondary" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
          "orio-loading-spinner": LoadingStub,
        },
      },
    });

    expect(wrapper.find("button").classes()).toContain("secondary");
  });

  it("applies pill class when pill is true", () => {
    const wrapper = mount(Button, {
      props: { pill: true, icon: "check" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
          "orio-loading-spinner": LoadingStub,
        },
      },
    });

    expect(wrapper.find("button").classes()).toContain("pill");
  });

  it("does not apply pill class by default", () => {
    const wrapper = mount(Button, {
      props: { icon: "check" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
          "orio-loading-spinner": LoadingStub,
        },
      },
    });

    expect(wrapper.find("button").classes()).not.toContain("pill");
  });
});

describe("Button as a link", () => {
  const stubs = {
    "orio-control-element": ControlStub,
    "orio-icon": IconStub,
    "orio-loading-spinner": LoadingStub,
  };

  it("renders a real anchor with href when `to` is set", () => {
    const wrapper = mount(Button, {
      props: { to: "/reserve" },
      slots: { default: "Book" },
      global: { stubs },
    });

    const link = wrapper.find("a");
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe("/reserve");
    expect(link.classes()).toContain("primary");
    expect(link.text()).toBe("Book");
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("passes protocol links like tel: through untouched", () => {
    const wrapper = mount(Button, {
      props: { to: "tel:+31165564090" },
      global: { stubs },
    });

    expect(wrapper.find("a").attributes("href")).toBe("tel:+31165564090");
  });

  it("still emits click from the link", async () => {
    const onClick = vi.fn();
    const wrapper = mount(Button, {
      props: { to: "/menu", onClick },
      global: { stubs },
    });

    await wrapper.find("a").trigger("click");

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("falls back to a disabled button when disabled or loading", () => {
    for (const props of [
      { to: "/menu", disabled: true },
      { to: "/menu", loading: true },
    ]) {
      const wrapper = mount(Button, { props, global: { stubs } });
      expect(wrapper.find("a").exists()).toBe(false);
      expect(wrapper.find("button").exists()).toBe(true);
    }
  });
});

describe("Button link navigation", () => {
  const stubs = {
    "orio-control-element": ControlStub,
    "orio-icon": IconStub,
    "orio-loading-spinner": LoadingStub,
  };

  async function mountWithRouter(to: string) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", component: { template: "<div />" } },
        { path: "/menu", component: { template: "<div />" } },
      ],
    });
    await router.push("/");
    const push = vi.spyOn(router, "push");
    const wrapper = mount(Button, {
      props: { to },
      global: { stubs, plugins: [router] },
    });
    return { wrapper, push };
  }

  it("navigates internal links through the router without a reload", async () => {
    const { wrapper, push } = await mountWithRouter("/menu");
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
    });
    wrapper.find("a").element.dispatchEvent(event);
    expect(push).toHaveBeenCalledWith("/menu");
    expect(event.defaultPrevented).toBe(true);
  });

  it("leaves modifier-clicks to the browser (new tab)", async () => {
    const { wrapper, push } = await mountWithRouter("/menu");
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
      metaKey: true,
    });
    wrapper.find("a").element.dispatchEvent(event);
    expect(push).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it.each([
    ["https://example.com"],
    ["tel:+31165564090"],
    ["mailto:a@b.nl"],
    ["#section"],
  ])("leaves %s to the browser", async (to) => {
    const { wrapper, push } = await mountWithRouter(to);
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
    });
    wrapper.find("a").element.dispatchEvent(event);
    expect(push).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
