import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Tag from "../../src/runtime/components/Tag.vue";
import { i18n } from "../../src/runtime/i18n";

describe("Tag", () => {
  it("renders text content", () => {
    const wrapper = mount(Tag, { props: { text: "New" } });
    expect(wrapper.text()).toContain("New");
  });

  it("applies variant class", () => {
    const wrapper = mount(Tag, { props: { text: "Hot", variant: "accent" } });
    expect(wrapper.find(".tag").classes()).toContain("tag--accent");
  });

  it("renders no button by default", () => {
    const wrapper = mount(Tag, { props: { text: "Vue" } });
    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.text()).toBe("Vue");
  });

  it("removable renders a labelled native button", () => {
    const wrapper = mount(Tag, { props: { text: "Vue", removable: true } });
    const button = wrapper.get("button");
    expect(button.attributes("type")).toBe("button");
    expect(button.attributes("aria-label")).toBe("Remove Vue");
  });

  it("emits remove once on click, not reaching the parent", async () => {
    let parentClicks = 0;
    const wrapper = mount(Tag, {
      props: { text: "Vue", removable: true },
      attrs: { onClick: () => parentClicks++ },
    });
    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("remove")).toHaveLength(1);
    expect(parentClicks).toBe(0);
  });

  it("Enter and Space keydown on the button do not bubble to ancestors", async () => {
    const outer: string[] = [];
    const host = document.createElement("div");
    host.addEventListener("keydown", (event) => outer.push(event.key));
    document.body.append(host);
    const wrapper = mount(Tag, {
      props: { text: "Vue", removable: true },
      attachTo: host,
    });
    await wrapper.get("button").trigger("keydown", { key: "Enter" });
    await wrapper.get("button").trigger("keydown", { key: " " });
    expect(outer).toEqual([]);
    wrapper.unmount();
    host.remove();
  });

  it("Tab and Escape keydown on the button still bubble", async () => {
    const outer: string[] = [];
    const host = document.createElement("div");
    host.addEventListener("keydown", (event) => outer.push(event.key));
    document.body.append(host);
    const wrapper = mount(Tag, {
      props: { text: "Vue", removable: true },
      attachTo: host,
    });
    await wrapper.get("button").trigger("keydown", { key: "Tab" });
    await wrapper.get("button").trigger("keydown", { key: "Escape" });
    expect(outer).toEqual(["Tab", "Escape"]);
    wrapper.unmount();
    host.remove();
  });

  it("uses the uk aria-label", () => {
    i18n.global.locale.value = "uk";
    const wrapper = mount(Tag, { props: { text: "Vue", removable: true } });
    expect(wrapper.get("button").attributes("aria-label")).toBe("Видалити Vue");
    i18n.global.locale.value = "en";
  });
});
