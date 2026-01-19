import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Badge from "../../src/runtime/components/Badge.vue";

describe("Badge", () => {
  describe("Standalone mode", () => {
    it("renders badge content", () => {
      const wrapper = mount(Badge, {
        slots: { default: "5" },
      });

      expect(wrapper.text()).toBe("5");
      expect(wrapper.find(".badge").exists()).toBe(true);
      expect(wrapper.find(".badge-wrapper").exists()).toBe(false);
    });

    it("applies default variant (primary)", () => {
      const wrapper = mount(Badge, {
        slots: { default: "New" },
      });

      expect(wrapper.find(".badge").classes()).toContain("primary");
    });

    it("applies default type", () => {
      const wrapper = mount(Badge, {
        slots: { default: "New" },
      });

      expect(wrapper.find(".badge").classes()).toContain("default");
    });
  });

  describe("Wrapper mode", () => {
    it("wraps content and positions badge", () => {
      const wrapper = mount(Badge, {
        slots: {
          default: "3",
          wrapping: "<button>Notifications</button>",
        },
      });

      expect(wrapper.find(".badge-wrapper").exists()).toBe(true);
      expect(wrapper.find(".badge.positioned").exists()).toBe(true);
      expect(wrapper.find("button").text()).toBe("Notifications");
      expect(wrapper.find(".badge").text()).toBe("3");
    });
  });

  describe("Dot mode", () => {
    it("renders as dot when no default content", () => {
      const wrapper = mount(Badge);

      expect(wrapper.find(".badge.dot").exists()).toBe(true);
    });

    it("does not render as dot when default content exists", () => {
      const wrapper = mount(Badge, {
        slots: { default: "99+" },
      });

      expect(wrapper.find(".badge.dot").exists()).toBe(false);
    });

    it("renders as dot in wrapper mode without content", () => {
      const wrapper = mount(Badge, {
        slots: {
          wrapping: "<span>Icon</span>",
        },
      });

      expect(wrapper.find(".badge.dot").exists()).toBe(true);
      expect(wrapper.find(".badge.positioned").exists()).toBe(true);
    });
  });

  describe("Variants", () => {
    it("applies danger variant", () => {
      const wrapper = mount(Badge, {
        props: { variant: "danger" },
        slots: { default: "!" },
      });

      expect(wrapper.find(".badge").classes()).toContain("danger");
    });

    it("applies alert variant", () => {
      const wrapper = mount(Badge, {
        props: { variant: "alert" },
        slots: { default: "!" },
      });

      expect(wrapper.find(".badge").classes()).toContain("alert");
    });

    it("applies primary variant", () => {
      const wrapper = mount(Badge, {
        props: { variant: "primary" },
        slots: { default: "!" },
      });

      expect(wrapper.find(".badge").classes()).toContain("primary");
    });

    it("applies grey variant", () => {
      const wrapper = mount(Badge, {
        props: { variant: "grey" },
        slots: { default: "!" },
      });

      expect(wrapper.find(".badge").classes()).toContain("grey");
    });
  });

  describe("Types", () => {
    it("applies default type", () => {
      const wrapper = mount(Badge, {
        props: { type: "default" },
        slots: { default: "1" },
      });

      expect(wrapper.find(".badge").classes()).toContain("default");
    });

    it("applies pill type", () => {
      const wrapper = mount(Badge, {
        props: { type: "pill" },
        slots: { default: "99+" },
      });

      expect(wrapper.find(".badge").classes()).toContain("pill");
    });
  });
});
