import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Select from "../../src/runtime/experiments/select/index.vue";
import ListItem from "../../src/runtime/components/ListItem.vue";
import EmptyState from "../../src/runtime/components/EmptyState.vue";
import ControlElement from "../../src/runtime/components/ControlElement.vue";
import { i18n } from "../../src/runtime/i18n";

/**
 * jsdom has no Popover API, so the panel is always in the DOM and never
 * "opens". Stub the two methods the component calls, and let `matches` answer
 * the `:popover-open` query the Popover guard makes.
 */
function stubPopoverApi() {
  const element = HTMLElement.prototype as unknown as Record<string, unknown>;
  const showPopover = vi.fn();
  const hidePopover = vi.fn();

  element.showPopover = showPopover;
  element.hidePopover = hidePopover;

  return { showPopover, hidePopover };
}

afterEach(() => {
  const element = HTMLElement.prototype as unknown as Record<string, unknown>;
  delete element.showPopover;
  delete element.hidePopover;
});

const mountSelect = (props: Record<string, unknown>) =>
  mount(Select, {
    props,
    global: {
      plugins: [i18n],
      components: {
        "orio-control-element": ControlElement,
        "orio-list-item": ListItem,
        "orio-empty-state": EmptyState,
        "orio-icon": { template: "<i />" },
        "orio-view-text": { template: "<span><slot /></span>" },
        "orio-check-box": { template: "<input type='checkbox' />" },
      },
    },
  });

describe("experiments/Select", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  const stringOptions = ["Option 1", "Option 2"];
  const objectOptions = [
    { id: 1, name: "First" },
    { id: 2, name: "Second" },
  ];

  describe("Trigger label", () => {
    it("shows the placeholder when nothing is selected", () => {
      const wrapper = mountSelect({ options: stringOptions, modelValue: null });

      expect(wrapper.find(".select-trigger").text()).toContain(
        "Select an option",
      );
    });

    it("prefers an explicit placeholder over the translated default", () => {
      const wrapper = mountSelect({
        options: stringOptions,
        modelValue: null,
        placeholder: "Pick one",
      });

      expect(wrapper.find(".select-trigger").text()).toContain("Pick one");
    });

    it("renders the selected string option", () => {
      const wrapper = mountSelect({
        options: stringOptions,
        modelValue: "Option 2",
      });

      expect(wrapper.find(".select-trigger").text()).toContain("Option 2");
    });

    it("renders object options through optionName", () => {
      const wrapper = mountSelect({
        options: objectOptions,
        modelValue: objectOptions[1],
        optionName: "name",
      });

      expect(wrapper.find(".select-trigger").text()).toContain("Second");
    });

    it("falls back to JSON for object options without optionName", () => {
      const wrapper = mountSelect({
        options: objectOptions,
        modelValue: objectOptions[0],
      });

      expect(wrapper.find(".select-trigger").text()).toContain('{"id":1');
    });
  });

  describe("Options list", () => {
    it("renders one option row per item with listbox roles", () => {
      const wrapper = mountSelect({ options: stringOptions, modelValue: null });

      expect(wrapper.find("[role='listbox']").exists()).toBe(true);
      expect(wrapper.findAll("[role='option']")).toHaveLength(2);
    });

    it("marks the selected option with aria-selected", () => {
      const wrapper = mountSelect({
        options: objectOptions,
        modelValue: objectOptions[0],
        optionName: "name",
      });

      const rows = wrapper.findAll("[role='option']");
      expect(rows[0]!.attributes("aria-selected")).toBe("true");
      expect(rows[1]!.attributes("aria-selected")).toBe("false");
    });

    it("compares object options by field, not identity", () => {
      // A fresh object with the same id must still read as selected.
      const wrapper = mountSelect({
        options: objectOptions,
        modelValue: { id: 2, name: "Second" },
        optionName: "name",
      });

      expect(
        wrapper.findAll("[role='option']")[1]!.attributes("aria-selected"),
      ).toBe("true");
    });

    it("renders the empty state when there are no options", () => {
      const wrapper = mountSelect({ options: [], modelValue: null });

      expect(wrapper.find("[role='listbox']").exists()).toBe(false);
      expect(wrapper.text()).toContain("No options found");
    });
  });

  describe("Selection", () => {
    it("emits the chosen option and closes the panel", async () => {
      const { hidePopover } = stubPopoverApi();
      const wrapper = mountSelect({ options: stringOptions, modelValue: null });

      await wrapper.findAll("[role='option']")[1]!.trigger("click");

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Option 2"]);
      expect(hidePopover).toHaveBeenCalled();
    });

    it("emits the whole object for object options", async () => {
      stubPopoverApi();
      const wrapper = mountSelect({
        options: objectOptions,
        modelValue: null,
        optionName: "name",
      });

      await wrapper.findAll("[role='option']")[0]!.trigger("click");

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([
        objectOptions[0],
      ]);
    });
  });

  describe("Keyboard", () => {
    it("opens the panel on ArrowDown while closed", async () => {
      const { showPopover } = stubPopoverApi();
      const wrapper = mountSelect({ options: stringOptions, modelValue: null });

      await wrapper.find(".select-trigger").trigger("keydown", {
        key: "ArrowDown",
      });

      expect(showPopover).toHaveBeenCalled();
    });

    it("selects the highlighted option on Enter while open", async () => {
      stubPopoverApi();
      const wrapper = mountSelect({ options: stringOptions, modelValue: null });

      // Mimic the native toggle event the panel fires when it opens; the
      // component reads `newState`, which is the only open-state signal.
      const panel = wrapper.find(".select-content");
      await panel.trigger("toggle", { newState: "open" });
      await nextTick();

      const trigger = wrapper.find(".select-trigger");
      await trigger.trigger("keydown", { key: "ArrowDown" });
      await trigger.trigger("keydown", { key: "Enter" });

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });

    it("ignores Enter when there are no options", async () => {
      const { hidePopover } = stubPopoverApi();
      const wrapper = mountSelect({ options: [], modelValue: null });

      const panel = wrapper.find(".select-content");
      await panel.trigger("toggle", { newState: "open" });
      await nextTick();

      await wrapper
        .find(".select-trigger")
        .trigger("keydown", { key: "Enter" });

      expect(wrapper.emitted("update:modelValue")).toBeFalsy();
      expect(hidePopover).not.toHaveBeenCalled();
    });
  });

  describe("Slot props", () => {
    it("exposes camelCase names to the option slot", () => {
      // Pins the documented slot contract: consumers destructure camelCase.
      const wrapper = mount(Select, {
        props: { options: stringOptions, modelValue: "Option 1" },
        slots: {
          option: `<template #option="{ getOptionLabel, option, selected }">
            <span class="row">{{ getOptionLabel(option) }}:{{ selected }}</span>
          </template>`,
        },
        global: {
          plugins: [i18n],
          components: {
            "orio-control-element": ControlElement,
            "orio-list-item": ListItem,
            "orio-empty-state": EmptyState,
            "orio-icon": { template: "<i />" },
            "orio-check-box": { template: "<input type='checkbox' />" },
            "orio-view-text": { template: "<span><slot /></span>" },
          },
        },
      });

      expect(wrapper.findAll(".row").map((row) => row.text())).toEqual([
        "Option 1:true",
        "Option 2:false",
      ]);
    });
  });

  describe("Empty-string options", () => {
    // "" is a real option, not "nothing selected" — falsy checks used to turn
    // it into the placeholder and drop its selected state.
    it("renders an empty option and keeps its row selected", () => {
      const wrapper = mountSelect({
        options: ["", "Option 2"],
        modelValue: "",
      });

      expect(wrapper.find(".select-trigger").text()).not.toContain(
        "Select an option",
      );
      expect(
        wrapper.findAll("[role='option']")[0]!.attributes("aria-selected"),
      ).toBe("true");
    });
  });

  describe("Control wiring", () => {
    it("keeps select-only props off the ControlElement wrapper", () => {
      const wrapper = mountSelect({
        options: stringOptions,
        modelValue: null,
        label: "Country",
        optionName: "name",
        placeholder: "Pick one",
      });

      const control = wrapper.findComponent(ControlElement);
      expect(control.props("label")).toBe("Country");

      const forwarded = Object.keys(control.props());
      expect(forwarded).not.toContain("options");
      expect(forwarded).not.toContain("field");
      expect(forwarded).not.toContain("optionName");
      expect(forwarded).not.toContain("placeholder");
    });

    it("marks the trigger as a listbox owner", () => {
      const wrapper = mountSelect({ options: stringOptions, modelValue: null });

      const trigger = wrapper.find(".select-trigger");
      expect(trigger.attributes("aria-haspopup")).toBe("listbox");
      expect(trigger.attributes("aria-expanded")).toBe("false");
      expect(trigger.attributes("popovertarget")).toBeTruthy();
    });
  });
});
