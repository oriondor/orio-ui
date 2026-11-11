import { afterEach, describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import NumberInput from "../../src/runtime/components/NumberInput/index.vue";
import NumberInputHorizontal from "../../src/runtime/components/NumberInput/Horizontal.vue";
import NumberInputVertical from "../../src/runtime/components/NumberInput/Vertical.vue";
import { i18n } from "../../src/runtime/i18n";

function make(props: Record<string, unknown> = {}) {
  const wrapper = mount(NumberInput, {
    attachTo: document.body,
    props: {
      modelValue: null,
      "onUpdate:modelValue": (value: unknown) =>
        wrapper.setProps({ modelValue: value as number | null }),
      ...props,
    },
  });
  return wrapper;
}

async function type(wrapper: ReturnType<typeof make>, text: string) {
  const input = wrapper.find("input");
  input.element.focus();
  await input.setValue(text);
}

const lastEmit = (wrapper: ReturnType<typeof make>) =>
  wrapper.emitted("update:modelValue")?.at(-1)?.[0];

afterEach(() => {
  i18n.global.locale.value = "en";
});

describe("NumberInput text mode", () => {
  it("renders type=text inputmode=decimal, empty for null (R3/R4)", () => {
    const input = make().find("input");
    expect(input.attributes("type")).toBe("text");
    expect(input.attributes("inputmode")).toBe("decimal");
    expect(input.element.value).toBe("");
  });

  it("E1: clearing emits null and blur keeps it empty", async () => {
    const wrapper = make({ modelValue: 5 });
    await type(wrapper, "");
    expect(lastEmit(wrapper)).toBeNull();
    await wrapper.find("input").trigger("blur");
    expect(lastEmit(wrapper)).toBeNull();
    expect(wrapper.find("input").element.value).toBe("");
  });

  it("E2: trailing separator parses, text kept on blur", async () => {
    const wrapper = make();
    await type(wrapper, "1,");
    expect(lastEmit(wrapper)).toBe(1);
    expect(wrapper.find("input").element.value).toBe("1,");
    await wrapper.find("input").trigger("blur");
    expect(wrapper.find("input").element.value).toBe("1,");
  });

  it("E3/E4: invalid text keeps model; blur reverts display", async () => {
    const wrapper = make({ modelValue: 7 });
    await type(wrapper, "-");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await type(wrapper, "abc");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    await wrapper.find("input").trigger("blur");
    expect(wrapper.find("input").element.value).toBe("7");
  });

  it("E5: min clamps on blur, no min leaves value", async () => {
    const clamped = make({ min: 10 });
    await type(clamped, "5");
    await clamped.find("input").trigger("blur");
    expect(lastEmit(clamped)).toBe(10);
    expect(clamped.find("input").element.value).toBe("10");

    const free = make();
    await type(free, "5");
    await free.find("input").trigger("blur");
    expect(free.emitted("update:modelValue")).toHaveLength(1);
    expect(lastEmit(free)).toBe(5);
  });

  it("E6: step 0.1 three times from 0 is exactly 0.3", async () => {
    const wrapper = make({ modelValue: 0, step: 0.1 });
    for (const _ of [1, 2, 3]) {
      await wrapper.find("input").trigger("keydown", { key: "ArrowUp" });
    }
    expect(lastEmit(wrapper)).toBe(0.3);
  });

  it("E7: 1.005 at 2 places rounds to 1.01 on blur", async () => {
    const wrapper = make({ decimalPlaces: 2 });
    await type(wrapper, "1.005");
    await wrapper.find("input").trigger("blur");
    expect(lastEmit(wrapper)).toBe(1.01);
    expect(wrapper.find("input").element.value).toBe("1.01");
  });

  it("R7: valid value is not rewritten on blur", async () => {
    const wrapper = make({ decimalPlaces: 2 });
    await type(wrapper, "1.50");
    await wrapper.find("input").trigger("blur");
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    expect(wrapper.find("input").element.value).toBe("1.50");
  });

  it("E8: stepping from null starts at min ?? 0", async () => {
    const withMin = make({ min: 5 });
    await withMin.find("input").trigger("keydown", { key: "ArrowUp" });
    expect(lastEmit(withMin)).toBe(6);
    const noMin = make();
    await noMin.find("input").trigger("keydown", { key: "ArrowUp" });
    expect(lastEmit(noMin)).toBe(1);
  });

  it("R8: ArrowUp prevents default; disabled does not step", async () => {
    const wrapper = make({ modelValue: 1 });
    const event = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      cancelable: true,
    });
    wrapper.find("input").element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    const disabled = make({ modelValue: 1, disabled: true });
    await disabled.find("input").trigger("keydown", { key: "ArrowUp" });
    expect(disabled.emitted("update:modelValue")).toBeUndefined();
  });

  it("E9: external change while focused wins; own echo does not clobber", async () => {
    const wrapper = make();
    await type(wrapper, "1,");
    expect(wrapper.find("input").element.value).toBe("1,");
    await wrapper.setProps({ modelValue: 9 });
    expect(wrapper.find("input").element.value).toBe("9");
  });

  it("E11: negative and same model in de/en typing", async () => {
    const wrapper = make();
    await type(wrapper, "-1,5");
    expect(lastEmit(wrapper)).toBe(-1.5);
    await type(wrapper, "-1.5");
    expect(lastEmit(wrapper)).toBe(-1.5);
  });

  it("E12: display uses locale separator, re-renders on switch", async () => {
    const wrapper = make({ modelValue: 1234.5 });
    expect(wrapper.find("input").element.value).toBe("1234.5");
    i18n.global.locale.value = "de";
    await nextTick();
    expect(wrapper.find("input").element.value).toBe("1234,5");
  });

  it("F2: sv display (U+2212 minus) round-trips; typing and blur keep -5", async () => {
    i18n.global.locale.value = "sv";
    const wrapper = make({ modelValue: -5, max: 3 });
    const input = wrapper.find("input");
    expect(input.element.value).toBe("\u22125");
    input.element.focus();
    await input.setValue("\u221250");
    expect(lastEmit(wrapper)).toBe(-50);
    await input.setValue("\u22125");
    await input.trigger("blur");
    expect(wrapper.props("modelValue")).toBe(-5);
  });

  it("F4: roundTo never yields -0 and handles exponent-form numbers", async () => {
    const zero = make({ modelValue: -0.4 });
    await type(zero, "-0.4");
    await zero.find("input").trigger("blur");
    expect(Object.is(zero.props("modelValue"), 0)).toBe(true);
    expect(zero.find("input").element.value).toBe("0");
    const tiny = make({ decimalPlaces: 2 });
    await type(tiny, "0.0000001");
    await tiny.find("input").trigger("blur");
    expect(tiny.props("modelValue")).toBe(0);
    const tinyKept = make({ decimalPlaces: 8 });
    await type(tinyKept, "0.0000001");
    await tinyKept.find("input").trigger("blur");
    expect(tinyKept.props("modelValue")).toBe(1e-7);
  });

  it("F6: readonly blocks arrow stepping and exposed steppers", async () => {
    const wrapper = make({ modelValue: 1, readonly: true });
    await wrapper.find("input").trigger("keydown", { key: "ArrowUp" });
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    const horizontal = mount(NumberInputHorizontal, {
      props: { modelValue: 1, readonly: true },
    });
    await horizontal.findAll("button")[1].trigger("mousedown");
    expect(horizontal.emitted("update:modelValue")).toBeUndefined();
  });

  it("F7: consumer inputmode wins over the default", () => {
    const wrapper = make({ inputmode: "numeric" });
    expect(wrapper.find("input").attributes("inputmode")).toBe("numeric");
  });

  it("F9: type=number clears a bad-input leftover on blur", async () => {
    const wrapper = make({ type: "number" });
    const input = wrapper.find("input");
    input.element.focus();
    Object.defineProperty(input.element, "validity", {
      value: { badInput: true },
    });
    // jsdom sanitises "-" away; emulate the browser keeping it visible.
    Object.defineProperty(input.element, "value", {
      value: "-",
      writable: true,
    });
    await input.trigger("blur");
    expect(input.element.value).toBe("");
  });

  it("E10: type=number is native and empty stays null", async () => {
    const wrapper = make({ type: "number", modelValue: 3 });
    const input = wrapper.find("input");
    expect(input.attributes("type")).toBe("number");
    expect(input.attributes("inputmode")).toBeUndefined();
    await input.setValue("");
    expect(lastEmit(wrapper)).toBeNull();
    await input.trigger("blur");
    expect(lastEmit(wrapper)).toBeNull();
    await input.setValue("4");
    expect(lastEmit(wrapper)).toBe(4);
  });
});

describe("NumberInput round-2 fixes", () => {
  it("R2-1: number mode never rewrites text that parses to the model", async () => {
    const wrapper = make({ type: "number", step: 0.01, decimalPlaces: 2 });
    const input = wrapper.find("input");
    await type(wrapper, "1");
    await type(wrapper, "");
    await type(wrapper, "1.0");
    await nextTick();
    expect(input.element.value).toBe("1.0");
    expect(lastEmit(wrapper)).toBe(1);
  });

  it("R2-1: sign survives -0 then -0.5 in number mode", async () => {
    const wrapper = make({ type: "number", step: 0.1, decimalPlaces: 1 });
    await type(wrapper, "-0");
    await type(wrapper, "-0.5");
    await nextTick();
    expect(wrapper.find("input").element.value).toBe("-0.5");
    expect(lastEmit(wrapper)).toBe(-0.5);
  });

  it("R2-2: model never holds -0 (text, number, blur)", async () => {
    const text = make({ decimalPlaces: 1 });
    await type(text, "-0");
    expect(Object.is(lastEmit(text), -0)).toBe(false);
    await text.find("input").trigger("blur");
    expect(Object.is(lastEmit(text), -0)).toBe(false);
    const number = make({ type: "number" });
    await type(number, "-0");
    expect(Object.is(lastEmit(number), 0)).toBe(true);
  });

  it("R2-3: huge values stay finite and are clamped", async () => {
    const wrapper = make({ max: 100 });
    await type(wrapper, "1000000000000000000000");
    await wrapper.find("input").trigger("blur");
    expect(lastEmit(wrapper)).toBe(100);
    expect(wrapper.find("input").element.value).toBe("100");
  });
});

describe("NumberInputVertical", () => {
  it("R9: passes type through and emits null", async () => {
    const wrapper = mount(NumberInputVertical, {
      props: { modelValue: 2, type: "number" },
    });
    expect(wrapper.find("input").attributes("type")).toBe("number");
    await wrapper.find("input").setValue("");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([null]);
  });
});
