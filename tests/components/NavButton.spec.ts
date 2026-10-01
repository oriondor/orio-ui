import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import NavButton from "../../src/runtime/components/NavButton.vue";

const ControlStub = {
  template: '<div class="control-stub"><slot /></div>',
};

const IconStub = {
  template: '<span class="icon-stub" :data-name="name"></span>',
  props: ["name"],
};

describe("NavButton", () => {
  it("emits click when enabled", async () => {
    const onClick = vi.fn();
    const wrapper = mount(NavButton, {
      props: { onClick },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
        },
      },
    });

    await wrapper.find("a").trigger("click");

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not emit click when disabled", async () => {
    const onClick = vi.fn();
    const wrapper = mount(NavButton, {
      props: { disabled: true, onClick },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
        },
      },
    });

    await wrapper.find("a").trigger("click");

    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders an anchor with button role and no href without `to`", () => {
    const wrapper = mount(NavButton, {
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
        },
      },
    });

    const button = wrapper.find("a");
    expect(button.attributes("href")).toBeUndefined();
    expect(button.attributes("role")).toBe("button");
    expect(button.attributes("tabindex")).toBe("0");
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("activates on Enter keydown", async () => {
    const onClick = vi.fn();
    const wrapper = mount(NavButton, {
      props: { onClick },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
        },
      },
    });

    await wrapper.find("a").trigger("keydown", { key: "Enter" });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("activates once on Space keyup, not on held keydowns", async () => {
    const onClick = vi.fn();
    const wrapper = mount(NavButton, {
      props: { onClick },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
        },
      },
    });

    const button = wrapper.find("a");
    const keydowns = [false, true, true].map((repeat) => {
      const event = new KeyboardEvent("keydown", {
        key: " ",
        repeat,
        cancelable: true,
      });
      button.element.dispatchEvent(event);
      return event;
    });

    expect(onClick).not.toHaveBeenCalled();
    keydowns.forEach((event) => expect(event.defaultPrevented).toBe(true));

    await button.trigger("keyup", { key: " " });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("marks disabled with aria-disabled and removes it from tab order", async () => {
    const onClick = vi.fn();
    const wrapper = mount(NavButton, {
      props: { disabled: true, onClick },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
        },
      },
    });

    const button = wrapper.find("a");
    expect(button.attributes("aria-disabled")).toBe("true");
    expect(button.attributes("tabindex")).toBe("-1");
    expect(button.attributes("disabled")).toBeUndefined();

    await button.trigger("keydown", { key: "Enter" });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("marks active state and aria-current", () => {
    const wrapper = mount(NavButton, {
      props: { active: true },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
        },
      },
    });

    const button = wrapper.find("a");
    expect(button.classes()).toContain("active");
    expect(button.attributes("aria-current")).toBe("page");
  });

  it("applies icon-only class when only icon is rendered", () => {
    const wrapper = mount(NavButton, {
      props: { icon: "home" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
        },
      },
    });

    expect(wrapper.find("a").classes()).toContain("icon-only");
  });
});

describe("NavButton as a link", () => {
  const stubs = {
    "orio-control-element": ControlStub,
    "orio-icon": IconStub,
  };

  it("renders a real anchor with href when `to` is set", () => {
    const wrapper = mount(NavButton, {
      props: { to: "/menu" },
      slots: { default: "Menu" },
      global: { stubs },
    });

    const link = wrapper.find("a");
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe("/menu");
    expect(link.text()).toBe("Menu");
    expect(link.attributes("role")).toBeUndefined();
    expect(link.attributes("tabindex")).toBeUndefined();
  });

  it("keeps active styling and aria-current on the link", () => {
    const wrapper = mount(NavButton, {
      props: { to: "/menu", active: true },
      global: { stubs },
    });

    const link = wrapper.find("a");
    expect(link.classes()).toContain("active");
    expect(link.attributes("aria-current")).toBe("page");
  });

  it("drops the href and acts as a disabled button when disabled", () => {
    const wrapper = mount(NavButton, {
      props: { to: "/menu", disabled: true },
      global: { stubs },
    });

    const link = wrapper.find("a");
    expect(link.attributes("href")).toBeUndefined();
    expect(link.attributes("role")).toBe("button");
    expect(link.attributes("aria-disabled")).toBe("true");
  });

  it("leaves Enter on a link to the browser", async () => {
    const wrapper = mount(NavButton, {
      props: { to: "/menu" },
      global: { stubs },
    });

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      cancelable: true,
    });
    wrapper.find("a").element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});

describe("NavButton link navigation", () => {
  const stubs = {
    "orio-control-element": ControlStub,
    "orio-icon": IconStub,
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
    const wrapper = mount(NavButton, {
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
