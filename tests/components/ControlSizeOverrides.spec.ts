import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import Button from "../../src/runtime/components/Button.vue";
import ControlElement from "../../src/runtime/components/ControlElement.vue";

// jsdom does not resolve var() or inherit custom properties, so resolve one
// level of `var(--public, fallback)` against the inline styles of the
// element and its ancestors — the same lookup the browser does.
function resolveToken(element: HTMLElement, name: string) {
  const raw = element.style.getPropertyValue(name);
  const match = raw.match(/^var\((--[\w-]+), (.*)\)$/);
  if (!match) return raw;
  const [, publicName, fallback] = match;
  let node: HTMLElement | null = element;
  while (node) {
    const value = node.style.getPropertyValue(publicName);
    if (value) return value;
    node = node.parentElement;
  }
  return fallback;
}

function mountInside(ancestorStyle: string, buttonStyle = "") {
  return mount(
    defineComponent({
      components: { OrioButton: Button },
      setup: () => ({ ancestorStyle, buttonStyle }),
      template: `<div class="actions" :style="ancestorStyle">
        <section><orio-button :style="buttonStyle">Save</orio-button></section>
      </div>`,
    }),
    {
      global: {
        components: { "orio-control-element": ControlElement },
        stubs: { "orio-icon": true, "orio-loading-spinner": true },
      },
    },
  );
}

function control(wrapper: ReturnType<typeof mountInside>) {
  return wrapper.find(".control").element as HTMLElement;
}

describe("--orio-control-* overrides", () => {
  it("keeps the size default when no override is set", () => {
    const wrapper = mountInside("");

    expect(resolveToken(control(wrapper), "--control-radius")).toBe(
      "var(--border-radius-md)",
    );
    expect(resolveToken(control(wrapper), "--control-px")).toBe("0.75rem");
  });

  it("lets an ancestor override reach a nested orio-button", () => {
    const wrapper = mountInside("--orio-control-radius: 60px");

    expect(resolveToken(control(wrapper), "--control-radius")).toBe("60px");
    expect(resolveToken(control(wrapper), "--control-px")).toBe("0.75rem");
  });

  it("lets a style on the control itself beat the ancestor", () => {
    const wrapper = mountInside(
      "--orio-control-radius: 60px",
      "--control-radius: 2px",
    );

    expect(resolveToken(control(wrapper), "--control-radius")).toBe("2px");
  });
});
