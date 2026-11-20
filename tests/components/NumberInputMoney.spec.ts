import { afterEach, describe, it, expect, vi } from "vitest";
import { config, mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { createSSRApp, h } from "vue";
import Money from "../../src/runtime/components/NumberInput/Money.vue";
import { i18n } from "../../src/runtime/i18n";

function make(props: Record<string, unknown> = {}, slots = {}) {
  const wrapper = mount(Money, {
    attachTo: document.body,
    slots,
    props: {
      currency: "USD",
      locale: "en-US",
      modelValue: null,
      "onUpdate:modelValue": (value: unknown) =>
        wrapper.setProps({ modelValue: value as number | null }),
      ...props,
    },
  });
  return wrapper;
}
type Wrapper = ReturnType<typeof make>;

async function type(wrapper: Wrapper, text: string) {
  const input = wrapper.find("input");
  input.element.focus();
  await input.setValue(text);
}
async function blur(wrapper: Wrapper) {
  await wrapper.find("input").trigger("blur");
}
const model = (wrapper: Wrapper) => wrapper.props("modelValue");
const shown = (wrapper: Wrapper) =>
  (wrapper.find("input").element as HTMLInputElement).value;

function affixOf(locale: string, currency: string) {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    numberingSystem: "latn",
  }).formatToParts(1234.5);
  return {
    text: parts.find((part) => part.type === "currency")!.value,
    position:
      parts.findIndex((part) => part.type === "currency") <
      parts.findIndex((part) => part.type === "integer")
        ? "before"
        : "after",
  };
}

function symbolOf(
  locale: string,
  currency: string,
  currencyDisplay: "symbol" | "narrowSymbol",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay,
  })
    .formatToParts(1)
    .find((part) => part.type === "currency")!.value;
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  i18n.global.locale.value = "en";
});

describe("R14 input attrs", () => {
  it("text, decimal inputmode, autocomplete off; overridable", () => {
    const input = make().find("input");
    expect(input.attributes("type")).toBe("text");
    expect(input.attributes("inputmode")).toBe("decimal");
    expect(input.attributes("autocomplete")).toBe("off");
    expect(
      make({ inputmode: "numeric" }).find("input").attributes("inputmode"),
    ).toBe("numeric");
  });
});

describe("R11/R12/R13 model", () => {
  it("R12: major units, empty is null, -0 is 0", async () => {
    const wrapper = make();
    await type(wrapper, "12.50");
    expect(model(wrapper)).toBe(12.5);
    await type(wrapper, "");
    expect(model(wrapper)).toBeNull();
    const negatives = make({ min: -Infinity });
    await type(negatives, "-0");
    expect(Object.is(model(negatives), 0)).toBe(true);
  });

  it.each([
    ["USD", "en-US", undefined, "12.50", 1250],
    ["USD", "en-US", undefined, "0.29", 29],
    ["USD", "en-US", undefined, "1.01", 101],
    ["JPY", "ja-JP", undefined, "1250", 1250],
    ["KWD", "en-US", undefined, "1.250", 1250],
    ["HUF", "en-US", 2, "1.05", 105],
  ])(
    "R13: %s typed %s -> minor units %s",
    async (currency, locale, decimalPlaces, text, expected) => {
      const wrapper = make({
        currency,
        locale,
        decimalPlaces,
        minorUnits: true,
      });
      await type(wrapper, text);
      expect(model(wrapper)).toBe(expected);
    },
  );

  it.each([
    ["USD", 29, "0.29"],
    ["USD", 1250, "12.50"],
    ["KWD", 1250, "1.250"],
    ["JPY", 1250, "1,250"],
  ])("R13: %s model %s displays %s exactly", (currency, value, text) => {
    const wrapper = make({ currency, minorUnits: true, modelValue: value });
    expect(shown(wrapper)).toBe(text);
  });

  it("R11: default places per currency, decimalPlaces overrides", async () => {
    const jpy = make({ currency: "JPY" });
    await type(jpy, "12.5");
    expect(jpy.find(".control-error").exists()).toBe(true);
    const kwd = make({ currency: "KWD" });
    await type(kwd, "1.234");
    expect(model(kwd)).toBe(1.234);
    const huf = make({ currency: "HUF", decimalPlaces: 2 });
    await type(huf, "1.23");
    expect(model(huf)).toBe(1.23);
  });

  it("R20/E1: 1.005 USD is an error, no rounding", async () => {
    const wrapper = make({ minorUnits: true, modelValue: 5 });
    await type(wrapper, "1.005");
    expect(model(wrapper)).toBe(5);
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
  });

  it("E1: beyond the ceiling (H2) is an error in minor units", async () => {
    const wrapper = make({ minorUnits: true, modelValue: 5 });
    await type(wrapper, "90071992547409.93");
    expect(model(wrapper)).toBe(5);
    expect(wrapper.find(".control-error").exists()).toBe(true);
    await type(wrapper, "9007199254740.91");
    expect(model(wrapper)).toBe(900719925474091);
  });
});

describe("R15 affix", () => {
  it.each([
    ["en-US", "USD"],
    ["uk", "UAH"],
    ["de", "EUR"],
    ["ar", "EGP"],
  ])("%s %s affix side and text follow formatToParts", (locale, currency) => {
    const wrapper = make({ locale, currency });
    const expected = affixOf(locale, currency);
    const affix = wrapper.find(".affix");
    expect(affix.text()).toBe(expected.text);
    expect(affix.attributes("aria-hidden")).toBe("true");
    const children = [...wrapper.find(".slot-wrapper").element.children];
    const affixIndex = children.indexOf(affix.element);
    const inputIndex = children.indexOf(wrapper.find("input").element);
    expect(affixIndex < inputIndex ? "before" : "after").toBe(
      expected.position,
    );
  });

  it("en USD is a prefix, uk UAH and de EUR suffixes", () => {
    expect(affixOf("en-US", "USD").position).toBe("before");
    expect(affixOf("uk", "UAH").position).toBe("after");
    expect(affixOf("de", "EUR").position).toBe("after");
  });

  it("affix stays when empty; value not in the input text", () => {
    const wrapper = make();
    expect(wrapper.find(".affix").exists()).toBe(true);
    expect(shown(wrapper)).toBe("");
  });

  it("currency name reaches AT via aria-describedby, not the value", () => {
    const wrapper = make({ modelValue: 5 });
    const id = wrapper.find("input").attributes("aria-describedby")!;
    const description = document.getElementById(id.split(" ").at(-1)!)!;
    expect(description.textContent).toContain("US Dollar");
    expect(shown(wrapper)).not.toContain("$");
  });

  it("uk describes the currency in Ukrainian", () => {
    i18n.global.locale.value = "uk";
    const wrapper = make({ locale: "uk", currency: "UAH" });
    const id = wrapper.find("input").attributes("aria-describedby")!;
    expect(document.getElementById(id)!.textContent).toMatch(/^\s*Валюта:/);
  });

  it("pointerdown on the affix focuses the input, not when disabled", async () => {
    const wrapper = make();
    await wrapper.find(".affix").trigger("pointerdown");
    expect(document.activeElement).toBe(wrapper.find("input").element);
    const disabled = make({ disabled: true });
    (document.activeElement as HTMLElement).blur();
    await disabled.find(".affix").trigger("pointerdown");
    expect(document.activeElement).not.toBe(disabled.find("input").element);
  });

  it("E7: unknown currency does not crash; no affix, 2 places, warn", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const wrapper = make({ currency: "NOPE!" });
    expect(wrapper.find(".affix").exists()).toBe(false);
    expect(warn).toHaveBeenCalled();
    await type(wrapper, "1.25");
    expect(model(wrapper)).toBe(1.25);
    await type(wrapper, "1.255");
    expect(wrapper.find(".control-error").exists()).toBe(true);
  });
});

describe("R16 blur formats, focus raw", () => {
  it.each([
    ["en-US", "USD", 1234.5, "1,234.50", "1234.5"],
    ["de", "EUR", 1234.5, "1.234,50", "1234,5"],
    ["uk", "UAH", 1234.5, "1\u00A0234,50", "1234,5"],
  ])("%s", async (locale, currency, value, formatted, raw) => {
    const wrapper = make({ locale, currency, modelValue: value });
    expect(shown(wrapper)).toBe(formatted);
    wrapper.find("input").element.focus();
    await wrapper.find("input").trigger("focus");
    expect(shown(wrapper)).toBe(raw);
    await blur(wrapper);
    expect(shown(wrapper)).toBe(formatted);
  });

  it("R23: valid typed value is not rewritten while focused", async () => {
    const wrapper = make();
    await type(wrapper, "12.");
    await nextTick();
    expect(shown(wrapper)).toBe("12.");
    await type(wrapper, "1,234");
    await nextTick();
    expect(shown(wrapper)).toBe("1,234");
    expect(model(wrapper)).toBe(1234);
  });
});

describe("R17-R20 parsing", () => {
  it.each([
    ["en-US", "USD", "$1,234.50", 1234.5],
    ["uk", "UAH", `1\u00A0234,50 ${symbolOf("uk", "UAH", "symbol")}`, 1234.5],
    [
      "uk",
      "UAH",
      `1\u00A0234,50 ${symbolOf("uk", "UAH", "narrowSymbol")}`,
      1234.5,
    ],
    ["uk", "UAH", "1 234,50", 1234.5],
    ["uk", "UAH", "1\u00A0234,50", 1234.5],
    ["uk", "UAH", "1\u202F234,50", 1234.5],
    ["en-US", "USD", " $ 5 ", 5],
    ["de-CH", "CHF", "1'234", 1234],
    ["de-CH", "CHF", "1\u2019234.5", 1234.5],
    ["de", "EUR", "1.234,50", 1234.5],
    ["en-US", "USD", "1,234", 1234],
    ["de", "EUR", "1.234", 1234],
    ["en-US", "USD", "1,234,567", 1234567],
    // P1: the format is read from the text, the locale only breaks a tie
    ["en-IN", "INR", "\u20B912,34,567.00", 1234567],
    ["en-US", "USD", "12,34,567.00", 1234567],
    ["de", "EUR", "1234.5", 1234.5],
    ["uk", "UAH", "1.5", 1.5],
    ["en-US", "USD", "12,5", 12.5],
    ["en-US", "USD", "0,500", 0.5],
    ["de", "EUR", "0.500", 0.5],
    ["en-US", "USD", "12.500", 12.5], // P2: extra zeros dropped
    ["de", "EUR", "1.234.567", 1234567],
    ["en-US", "USD", "1.234.567", 1234567],
    ["en-US", "USD", "100 200", 100200],
    ["en-US", "USD", "1.234,5", 1234.5],
    ["en-US", "USD", "USD 5", 5],
    ["en-US", "USD", "\u22125", -5],
    ["en-US", "USD", "\u200E-5", -5],
    ["en-US", "USD", "-$5", -5],
    ["en-US", "USD", "$-5", -5],
    ["en-US", "USD", "\u0661\u0662\u066B\u0665", 12.5],
    ["en-US", "USD", "\u0661\u066C\u0662\u0663\u0664\u066B\u0665", 1234.5],
  ])("%s %s pastes %j -> %s", async (locale, currency, text, expected) => {
    const wrapper = make({ locale, currency, min: -Infinity, modelValue: 99 });
    await type(wrapper, text);
    if (expected === undefined) {
      expect(model(wrapper)).toBe(99);
      expect(wrapper.find(".control-error").exists()).toBe(true);
    } else {
      expect(model(wrapper)).toBe(expected);
      expect(wrapper.find(".control-error").exists()).toBe(false);
    }
  });

  it.each([
    ["en-US", "USD", "1,23,4,"],
    ["en-US", "USD", "1,2345"],
    ["en-US", "USD", "1,2,3"],
    ["en-US", "USD", "1.2.3"],
    ["en-US", "USD", "12.505"], // R20
    ["en-US", "USD", "1.234"], // R20
    ["en-US", "USD", "00,123"], // P1/P2: non-zero extra digits
    ["en-US", "USD", "0,123.45"], // leading-zero group
    ["de", "EUR", "1,234"], // tie -> decimal, non-zero extra
    ["en-US", "USD", "\u20AC5"], // E5 other currency
    ["en-US", "USD", "5a"],
    ["en-US", "USD", "1e5"],
    ["en-US", "USD", "$10 $50"],
    ["en-US", "USD", "1USD5"],
    ["en-US", "USD", "1'2'3"],
    ["de-CH", "CHF", "1'2'3"],
    ["en-US", "USD", "1 2 3"],
    ["en-US", "USD", "1$2"],
    ["en-US", "USD", "5USD5"],
    ["en-US", "USD", "$$5"],
    ["uk", "UAH", "1 23,5"],
    ["en-US", "USD", "-5"], // F3: min 0, a minus is never valid
    ["en-US", "USD", "-1,234"],
  ])("%s %s rejects %j and keeps the model", async (locale, currency, text) => {
    const wrapper = make({ locale, currency, modelValue: 7 });
    await type(wrapper, text);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
  });
});

describe("incomplete input is judged on blur", () => {
  it.each([
    ["."],
    ["1,234,5"],
    ["1,234,56"],
    ["12,34,5"],
    ["1,234,"],
    ["$"],
    ["U"],
    ["US"],
    ["5 US"],
    ["$ "],
  ])(
    "%j: no visible error while typing, model kept, submit blocked, error on blur",
    async (text) => {
      const wrapper = make({ modelValue: 7 });
      await type(wrapper, text);
      await nextTick();
      const input = wrapper.find("input").element as HTMLInputElement;
      expect(wrapper.find(".control-error").exists()).toBe(false);
      expect(wrapper.find("input").attributes("aria-invalid")).toBeUndefined();
      expect(model(wrapper)).toBe(7);
      // G1: the stale model must not slip through Enter / requestSubmit
      expect(input.checkValidity()).toBe(false);
      expect(wrapper.vm.invalid).toBe(true);
      await blur(wrapper);
      expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
      expect(shown(wrapper)).toBe(text);
      expect(model(wrapper)).toBe(7);
    },
  );

  it("12. is a complete 12: model follows, valid, no error on blur", async () => {
    const wrapper = make({ modelValue: 7 });
    await type(wrapper, "12.");
    await nextTick();
    expect(model(wrapper)).toBe(12);
    expect(wrapper.vm.invalid).toBe(false);
    await blur(wrapper);
    expect(wrapper.find(".control-error").exists()).toBe(false);
    expect(shown(wrapper)).toBe("12.00");
  });

  it("G6: U and US are incomplete, UX is an error, USD 5 parses", async () => {
    const wrapper = make({ modelValue: 7 });
    await type(wrapper, "UX");
    expect(wrapper.find(".control-error").exists()).toBe(true);
    await type(wrapper, "USD 5");
    expect(model(wrapper)).toBe(5);
    expect(wrapper.vm.invalid).toBe(false);
  });

  it("1,23 completes to 1,234 without ever flashing an error", async () => {
    const wrapper = make();
    for (const text of ["1", "1,", "1,2", "1,23", "1,234"]) {
      await type(wrapper, text);
      expect(wrapper.find(".control-error").exists()).toBe(false);
    }
    expect(model(wrapper)).toBe(1234);
  });

  it("lone minus is incomplete only when negatives are allowed", async () => {
    const negatives = make({ min: -Infinity, modelValue: 7 });
    await type(negatives, "-");
    expect(negatives.find(".control-error").exists()).toBe(false);
    expect(model(negatives)).toBe(7);
    await type(negatives, "-5");
    expect(model(negatives)).toBe(-5);
    const plain = make({ modelValue: 7 });
    await type(plain, "-");
    expect(plain.find(".control-error").exists()).toBe(true);
  });

  it("input that can never become valid errors at once", async () => {
    for (const text of [
      "5a",
      "1.2.3",
      "\u20AC5",
      "1.505",
      "1,23,4,",
      "1,2,3",
      "-",
      "-5",
    ]) {
      const wrapper = make({ modelValue: 7 });
      await type(wrapper, text);
      expect(wrapper.find(".control-error").exists(), text).toBe(true);
    }
  });
});

describe("R21 error state", () => {
  it("aria-invalid + aria-describedby -> error; clears on valid and on empty", async () => {
    const wrapper = make({ modelValue: 7 });
    await type(wrapper, "abc");
    const input = wrapper.find("input");
    expect(input.attributes("aria-invalid")).toBe("true");
    const errorEl = wrapper.find(".control-error");
    expect(errorEl.text()).toContain("valid amount");
    expect(input.attributes("aria-describedby")).toContain(
      errorEl.attributes("id"),
    );
    await type(wrapper, "8");
    expect(input.attributes("aria-invalid")).toBeUndefined();
    await type(wrapper, "abc");
    await type(wrapper, "");
    expect(wrapper.find(".control-error").exists()).toBe(false);
  });

  it("error text is translated (uk)", async () => {
    i18n.global.locale.value = "uk";
    const wrapper = make();
    await type(wrapper, "abc");
    expect(wrapper.find(".control-error").text()).toContain("Введіть");
  });

  it("consumer error wins over the built-in one", async () => {
    const wrapper = make({ error: "Too low" });
    await type(wrapper, "abc");
    expect(wrapper.find(".control-error").text()).toBe("Too low");
  });

  it("blur with unparsable text keeps text and error", async () => {
    const wrapper = make({ modelValue: 7 });
    await type(wrapper, "abc");
    await blur(wrapper);
    expect(shown(wrapper)).toBe("abc");
    expect(wrapper.find(".control-error").exists()).toBe(true);
    expect(model(wrapper)).toBe(7);
  });

  it("external model change clears the error and re-renders", async () => {
    const wrapper = make({ modelValue: 7 });
    await type(wrapper, "abc");
    await wrapper.setProps({ modelValue: 9 });
    expect(wrapper.find(".control-error").exists()).toBe(false);
    expect(shown(wrapper)).toBe("9");
  });
});

describe("R22 min/max", () => {
  it("min 0 default: a minus errors at once; min above 0 clamps on blur", async () => {
    const wrapper = make({ modelValue: 7 });
    await type(wrapper, "-5");
    expect(wrapper.find(".control-error").exists()).toBe(true);
    expect(model(wrapper)).toBe(7);
    const floor = make({ min: 10 });
    await type(floor, "5");
    await blur(floor);
    expect(model(floor)).toBe(10);
    expect(shown(floor)).toBe("10.00");
  });

  it("negatives opt-in with min < 0, max clamps", async () => {
    const wrapper = make({ min: -100, max: 50 });
    await type(wrapper, "-5");
    await blur(wrapper);
    expect(model(wrapper)).toBe(-5);
    await type(wrapper, "99");
    await blur(wrapper);
    expect(model(wrapper)).toBe(50);
  });

  it("empty stays null on blur", async () => {
    const wrapper = make({ modelValue: 3 });
    await type(wrapper, "");
    await blur(wrapper);
    expect(model(wrapper)).toBeNull();
    expect(shown(wrapper)).toBe("");
  });
});

describe("R24 controls slot", () => {
  it("no steppers by default; slot steps 1 major unit", async () => {
    expect(make().findAll("button")).toHaveLength(0);
    let api: { increase: () => void; decrease: () => void; isAtMax: boolean };
    const wrapper = make(
      { modelValue: 1.5, max: 3 },
      {
        controls: (slotProps: typeof api) => {
          api = slotProps;
          return "";
        },
      },
    );
    api!.increase();
    await nextTick();
    expect(model(wrapper)).toBe(2.5);
    api!.increase();
    await nextTick();
    expect(model(wrapper)).toBe(3);
    expect(api!.isAtMax).toBe(true);
  });

  it("step is in major units even with minor-units; readonly/disabled block", async () => {
    let api: { increase: () => void };
    const wrapper = make(
      { minorUnits: true, modelValue: 1250, step: 0.1 },
      { controls: (slotProps: typeof api) => ((api = slotProps), "") },
    );
    api!.increase();
    await nextTick();
    expect(model(wrapper)).toBe(1260);
    const readonly = make(
      { modelValue: 1, readonly: true },
      { controls: (slotProps: typeof api) => ((api = slotProps), "") },
    );
    api!.increase();
    await nextTick();
    expect(model(readonly)).toBe(1);
  });
});

describe("R25 outside changes", () => {
  it("model, locale and currency changes re-render when unfocused (E6)", async () => {
    const wrapper = make({ modelValue: 1234.5 });
    expect(shown(wrapper)).toBe("1,234.50");
    await wrapper.setProps({ modelValue: 2 });
    expect(shown(wrapper)).toBe("2.00");
    await wrapper.setProps({ locale: "de" });
    expect(shown(wrapper)).toBe("2,00");
    await wrapper.setProps({ currency: "JPY" });
    expect(shown(wrapper)).toBe("2");
  });
});

describe("E8 attrs flow to the input", () => {
  it("disabled, readonly, required", () => {
    const input = make({ disabled: true, readonly: true, required: true }).find(
      "input",
    );
    expect(input.attributes("disabled")).toBeDefined();
    expect(input.attributes("readonly")).toBeDefined();
    expect(input.attributes("required")).toBeDefined();
  });

  it("a consumer aria-describedby is kept next to the currency", () => {
    const input = make({ "aria-describedby": "hint" }).find("input");
    expect(input.attributes("aria-describedby")).toMatch(/^hint /);
  });
});

describe("R10/R26 locale", () => {
  it("omitted locale follows the browser locale after mount", async () => {
    vi.stubGlobal("navigator", { language: "de-DE" });
    const wrapper = mount(Money, {
      attachTo: document.body,
      props: { currency: "EUR", modelValue: 1234.5 },
    });
    await nextTick();
    expect(shown(wrapper)).toBe("1.234,50");
  });

  it("SSR renders without a browser and matches the first client render", async () => {
    const render = () => {
      const app = createSSRApp({
        render: () => h(Money, { currency: "EUR", modelValue: 1234.5 }),
      }).use(i18n);
      Object.entries(config.global.components ?? {}).forEach(([name, comp]) =>
        app.component(name, comp),
      );
      return app;
    };
    const html = await renderToString(render());
    // fallback en-US, never navigator: no window access, deterministic
    expect(html).toContain("1,234.50");
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.append(container);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("navigator", { language: "de-DE" });
    render().mount(container);
    expect(warn.mock.calls.filter(([m]) => /hydrat/i.test(String(m)))).toEqual(
      [],
    );
    expect(container.querySelector("input")!.value).toBe("1,234.50");
  });
});

describe("review round 1", () => {
  const warnQuietly = () =>
    vi.spyOn(console, "warn").mockImplementation(() => {});

  it("F2: rejected texts keep the model and never emit", async () => {
    // covered by the rejects table; one explicit guard for the emit contract
    const wrapper = make({ modelValue: 7 });
    await type(wrapper, "1 2 3");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(model(wrapper)).toBe(7);
  });

  it("F3: with min < 0 a lone minus is incomplete", async () => {
    const wrapper = make({ min: -10 });
    await type(wrapper, "-");
    expect(wrapper.find(".control-error").exists()).toBe(false);
  });

  it("F4: a #controls step clears the parse error", async () => {
    let api: { increase: () => void };
    const wrapper = make(
      { modelValue: 3 },
      { controls: (slotProps: typeof api) => ((api = slotProps), "") },
    );
    await type(wrapper, "abc");
    expect(wrapper.find(".control-error").exists()).toBe(true);
    api!.increase();
    await nextTick();
    expect(model(wrapper)).toBe(4);
    expect(wrapper.find(".control-error").exists()).toBe(false);
    expect(shown(wrapper)).toBe("4");
  });

  it.each([
    ["major, 3 decimals on USD", { modelValue: 12.345 }],
    ["JPY with a fraction", { currency: "JPY", modelValue: 12.5 }],
    ["minor units not whole", { minorUnits: true, modelValue: 1250.6 }],
    ["minor units beyond 2^53", { minorUnits: true, modelValue: 1e21 }],
    ["major beyond 15 digits", { modelValue: 1234567890123456 }],
    ["major 1e21", { modelValue: 1e21 }],
    ["NaN", { modelValue: NaN }],
    ["Infinity", { modelValue: Infinity }],
  ])(
    "F5: %s is an error state, never rewritten or emitted",
    async (_name, props) => {
      const warn = warnQuietly();
      const wrapper = make(props);
      await nextTick();
      expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
      expect(shown(wrapper)).not.toMatch(/NaN|Infinity|\u221E/);
      expect(warn).toHaveBeenCalled();
      await type(wrapper, shown(wrapper));
      await blur(wrapper);
      expect(wrapper.vm.invalid).toBe(true);
      expect(
        wrapper.emitted("update:modelValue")?.length ?? 0,
      ).toBeLessThanOrEqual(1);
    },
  );

  it("F5: shows the exact digits of an unshowable value, empty for non-finite", () => {
    warnQuietly();
    expect(shown(make({ modelValue: 12.345 }))).toBe("12.345");
    expect(shown(make({ minorUnits: true, modelValue: 1e21 }))).toBe(
      "1000000000000000000000",
    );
    expect(shown(make({ modelValue: NaN }))).toBe("");
    expect(shown(make({ modelValue: Infinity }))).toBe("");
  });

  it("F5: blur and stepping do not rewrite an unshowable model", async () => {
    warnQuietly();
    let api: { increase: () => void };
    const wrapper = make(
      { modelValue: 12.345 },
      { controls: (slotProps: typeof api) => ((api = slotProps), "") },
    );
    wrapper.find("input").element.focus();
    await blur(wrapper);
    api!.increase();
    await nextTick();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(shown(wrapper)).toBe("12.345");
  });

  it("F6: major mode rejects more than 15 significant digits", async () => {
    const major = make({ modelValue: 7 });
    await type(major, "90071992547409.91");
    expect(major.find(".control-error").exists()).toBe(true);
    expect(model(major)).toBe(7);
    await type(major, "9007199254740.99");
    expect(model(major)).toBe(9007199254740.99);
  });

  it("F7: setCustomValidity on parse error and out of range, cleared otherwise", async () => {
    const wrapper = make({ max: 50 });
    const input = wrapper.find("input").element as HTMLInputElement;
    expect(input.validationMessage).toBe("");
    await type(wrapper, "abc");
    await nextTick();
    expect(input.validationMessage).toContain("valid amount");
    expect(input.checkValidity()).toBe(false);
    expect(wrapper.vm.invalid).toBe(true);
    await type(wrapper, "99");
    await nextTick();
    expect(input.validationMessage).toContain("outside");
    expect(wrapper.vm.invalid).toBe(true);
    expect(model(wrapper)).toBe(99);
    await type(wrapper, "40");
    await nextTick();
    expect(input.validationMessage).toBe("");
    expect(wrapper.vm.invalid).toBe(false);
  });

  it.each([101, -1, NaN, 2.5])(
    "F8: decimalPlaces %s does not throw",
    (decimalPlaces) => {
      const warn = warnQuietly();
      const wrapper = make({ decimalPlaces, modelValue: 1.5 });
      expect(shown(wrapper)).toBe("1.50");
      expect(warn).toHaveBeenCalled();
    },
  );

  it("F8: decimalPlaces up to 20 is accepted without a warning", () => {
    const warn = warnQuietly();
    expect(shown(make({ decimalPlaces: 20, modelValue: 0.00001 }))).toBe(
      "0.00001000000000000000",
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it("F9: an empty consumer error keeps the built-in one", async () => {
    const wrapper = make({ error: "" });
    await type(wrapper, "abc");
    expect(wrapper.find(".control-error").exists()).toBe(true);
  });

  it("F10: focused is writable", async () => {
    const wrapper = make();
    wrapper.vm.focused = true;
    await nextTick();
    expect(document.activeElement).toBe(wrapper.find("input").element);
  });

  it("F11: the currency name follows the UI language, not the field locale", () => {
    i18n.global.locale.value = "uk";
    const wrapper = make({ locale: "en-US", currency: "USD" });
    const id = wrapper.find("input").attributes("aria-describedby")!;
    expect(document.getElementById(id)!.textContent).toContain(
      new Intl.DisplayNames("uk", { type: "currency" }).of("USD")!,
    );
  });

  it("F12: zero decimals has its own message (en + uk)", async () => {
    const wrapper = make({ currency: "JPY" });
    await type(wrapper, "12.5");
    expect(wrapper.find(".control-error").text()).toBe(
      "Enter a whole amount, without decimals",
    );
    i18n.global.locale.value = "uk";
    await nextTick();
    expect(wrapper.find(".control-error").text()).toContain("цілу");
  });
});

describe("round 2 decisions", () => {
  const clipboardEvent = (type: "copy" | "cut") => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    const data = new Map<string, string>();
    Object.defineProperty(event, "clipboardData", {
      value: { setData: (key: string, value: string) => data.set(key, value) },
    });
    return { event, data };
  };

  it("G3: stepping at the ceiling does not emit", async () => {
    let api: { increase: () => void };
    const wrapper = make(
      { modelValue: 12345678901234.5, step: 0.01 },
      { controls: (slotProps: typeof api) => ((api = slotProps), "") },
    );
    // Starts from a showable value, so the refusal is the ceiling's doing.
    expect(wrapper.find("input").attributes("aria-invalid")).not.toBe("true");
    api!.increase();
    await nextTick();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it.each([NaN, Infinity, -Infinity])(
    "G4: step %s does nothing",
    async (step) => {
      let api: { increase: () => void; decrease: () => void };
      const wrapper = make(
        { modelValue: 5, step },
        { controls: (slotProps: typeof api) => ((api = slotProps), "") },
      );
      api!.increase();
      api!.decrease();
      await nextTick();
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    },
  );

  it("G5: untouched value below min is out of range, not a parse error, clamped on blur", async () => {
    const wrapper = make({ modelValue: -5 });
    const input = wrapper.find("input").element as HTMLInputElement;
    await nextTick();
    expect(input.checkValidity()).toBe(false);
    input.focus();
    await wrapper.find("input").trigger("focus");
    await blur(wrapper);
    expect(wrapper.find(".control-error").exists()).toBe(false);
    expect(model(wrapper)).toBe(0);
    expect(shown(wrapper)).toBe("0.00");
  });

  it("G7: ceiling has its own message (en + uk)", async () => {
    const wrapper = make({ modelValue: 7 });
    await type(wrapper, "90071992547409.91");
    expect(wrapper.find(".control-error").text()).toBe("Amount is too large");
    await blur(wrapper);
    expect(wrapper.find(".control-error").text()).toBe("Amount is too large");
    i18n.global.locale.value = "uk";
    await nextTick();
    expect(wrapper.find(".control-error").text()).toBe("Сума завелика");
  });

  it("G8: validationMessage follows a language switch while out of range", async () => {
    const wrapper = make({ modelValue: 99, max: 50 });
    const input = wrapper.find("input").element as HTMLInputElement;
    await nextTick();
    expect(input.validationMessage).toBe("Amount is outside the allowed range");
    i18n.global.locale.value = "uk";
    await nextTick();
    expect(input.validationMessage).toBe("Сума поза допустимим діапазоном");
  });

  it.each([
    ["major", { modelValue: 1234.5 }, "1234.5"],
    ["blurred, shows 1,234.50", { modelValue: 1234.5 }, "1234.5"],
    ["minor units", { modelValue: 123450, minorUnits: true }, "1234.5"],
    ["whole", { modelValue: 1250, minorUnits: true }, "12.5"],
    ["negative", { modelValue: -3, min: -Infinity }, "-3"],
  ])("P3: copy puts raw text on the clipboard (%s)", (_name, props, raw) => {
    const wrapper = make(props);
    const { event, data } = clipboardEvent("copy");
    wrapper.find("input").element.dispatchEvent(event);
    expect(data.get("text/plain")).toBe(raw);
    expect(event.defaultPrevented).toBe(true);
  });

  it("P3: blurred copy of 1,234.50 gives 1234.5", () => {
    const wrapper = make({ modelValue: 1234.5 });
    expect(shown(wrapper)).toBe("1,234.50");
    const { event, data } = clipboardEvent("copy");
    wrapper.find("input").element.dispatchEvent(event);
    expect(data.get("text/plain")).toBe("1234.5");
  });

  it("P3: cut copies raw and clears the field", async () => {
    const wrapper = make({ modelValue: 1234.5 });
    const input = wrapper.find("input").element as HTMLInputElement;
    input.focus();
    input.select();
    const { event, data } = clipboardEvent("cut");
    input.dispatchEvent(event);
    await nextTick();
    expect(data.get("text/plain")).toBe("1234.5");
    expect(model(wrapper)).toBeNull();
  });

  it("P3: empty field and partial selection fall back to the browser", () => {
    const empty = clipboardEvent("copy");
    make().find("input").element.dispatchEvent(empty.event);
    expect(empty.data.size).toBe(0);
    const wrapper = make({ modelValue: 1234.5 });
    const input = wrapper.find("input").element as HTMLInputElement;
    input.setSelectionRange(0, 2);
    const partial = clipboardEvent("copy");
    input.dispatchEvent(partial.event);
    expect(partial.data.size).toBe(0);
  });
});

describe("round 3 decisions", () => {
  const clipboardEvent = () => {
    const event = new Event("copy", { bubbles: true, cancelable: true });
    const data = new Map<string, string>();
    Object.defineProperty(event, "clipboardData", {
      value: { setData: (key: string, value: string) => data.set(key, value) },
    });
    return { event, data };
  };

  it.each([["$"], ["5a"], ["1,234,5"]])(
    "H1: copy of text that is not the model (%s) is native",
    async (text) => {
      const wrapper = make({ modelValue: 7 });
      const input = wrapper.find("input").element as HTMLInputElement;
      await type(wrapper, text);
      input.select();
      const { event, data } = clipboardEvent();
      input.dispatchEvent(event);
      expect(data.size).toBe(0);
      expect(event.defaultPrevented).toBe(false);
    },
  );

  it.each([
    ["major, outside 90071992547410", { modelValue: 90071992547410 }],
    ["major, outside 1e16", { modelValue: 1e16 }],
    ["minor, outside 1e16", { modelValue: 1e16, minorUnits: true }],
    ["minor, 16 digits", { modelValue: 1234567890123456, minorUnits: true }],
  ])("H2: %s is unshowable with the too-large message", (_name, props) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const wrapper = make(props);
    expect(wrapper.find(".control-error").text()).toBe("Amount is too large");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    warn.mockRestore();
  });

  it("H2: stepping from 90071992547409 is refused", async () => {
    let api: { increase: () => void };
    const wrapper = make(
      { modelValue: 90071992547409 },
      { controls: (slotProps: typeof api) => ((api = slotProps), "") },
    );
    api!.increase();
    await nextTick();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.find(".control-error").exists()).toBe(false);
  });

  it("H3: the visible input has no name, a hidden one carries the raw value", async () => {
    const wrapper = make({ name: "price", modelValue: 1234.5 });
    const form = document.createElement("form");
    document.body.append(form);
    form.append(wrapper.element);
    expect(
      wrapper.find("input:not([type=hidden])").attributes("name"),
    ).toBeUndefined();
    expect(new FormData(form).get("price")).toBe("1234.5");
    await type(wrapper, "$");
    expect(new FormData(form).get("price")).toBe("");
    await type(wrapper, "5a");
    expect(new FormData(form).get("price")).toBe("");
    await type(wrapper, "7,5");
    expect(new FormData(form).get("price")).toBe("7.5");
  });

  it("I1: the hidden input joins a form outside the component via the form attr", () => {
    const form = document.createElement("form");
    form.id = "outside-form";
    document.body.append(form);
    const wrapper = make({
      name: "price",
      modelValue: 9.5,
      form: "outside-form",
    });
    document.body.append(wrapper.element);
    expect(new FormData(form).get("price")).toBe("9.5");
  });

  it("H3: minor units submit the integer", () => {
    const wrapper = make({ name: "cents", modelValue: 1250, minorUnits: true });
    const form = document.createElement("form");
    document.body.append(form);
    form.append(wrapper.element);
    expect(new FormData(form).get("cents")).toBe("1250");
  });

  it.each([["1 2"], ["1 23"], ["1'"], ["12 5"], ["1'2"]])(
    "H4: %s is incomplete while typing, error on blur",
    async (text) => {
      const wrapper = make({ modelValue: 7 });
      await type(wrapper, text);
      expect(wrapper.find(".control-error").exists()).toBe(false);
      expect(
        (wrapper.find("input").element as HTMLInputElement).checkValidity(),
      ).toBe(false);
      await blur(wrapper);
      expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
    },
  );

  it.each([
    ["uk", "UAH", "1 234"],
    ["de-CH", "CHF", "1'234"],
  ])("H4: typing %s %s %j never errors", async (locale, currency, text) => {
    const wrapper = make({ locale, currency });
    for (let length = 1; length <= text.length; length++) {
      await type(wrapper, text.slice(0, length));
      expect(wrapper.find(".control-error").exists()).toBe(false);
    }
    expect(model(wrapper)).toBe(1234);
  });

  describe("coderabbit follow-ups", () => {
    it("minor units: a bare sign with fraction digits is 0, not NaN", async () => {
      const wrapper = make({
        currency: "JPY",
        minorUnits: true,
        min: -100,
        modelValue: null,
      });
      await type(wrapper, "-.0");
      expect(model(wrapper)).toBe(0);
    });

    it("blur does not commit a clamp bound the field cannot show", async () => {
      const wrapper = make({ minorUnits: true, max: 10.5, modelValue: 5000 });
      await type(wrapper, "20");
      const emitted = wrapper.emitted("update:modelValue")!.length;
      await blur(wrapper);
      expect(wrapper.emitted("update:modelValue")!.length).toBe(emitted);
      expect(model(wrapper)).toBe(2000);
      expect(shown(wrapper)).toBe("20.00");
      expect(wrapper.find(".control-error").exists()).toBe(true);
      expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
      expect(wrapper.find("input").attributes("aria-describedby")).toBeTruthy();
      await wrapper.setProps({ max: 5000 });
      expect(wrapper.find(".control-error").exists()).toBe(false);
      expect(wrapper.find("input").attributes("aria-invalid")).not.toBe("true");
    });

    it.each([
      ["en-US", "USD", "1,234", 1234],
      ["de-DE", "EUR", "1,234", 99],
      ["de-DE", "EUR", "1.234", 1234],
      ["en-US", "USD", "1.234", 99],
    ])("tie %s %s %j -> %s", async (locale, currency, text, expected) => {
      const wrapper = make({ locale, currency, modelValue: 99 });
      await type(wrapper, text);
      expect(model(wrapper)).toBe(expected);
    });
  });
});

describe("CodeRabbit round", () => {
  const copyOf = (wrapper: Wrapper) => {
    const input = wrapper.find("input").element as HTMLInputElement;
    input.focus();
    input.setSelectionRange(0, input.value.length);
    const event = new Event("copy", { bubbles: true, cancelable: true });
    const data = new Map<string, string>();
    Object.defineProperty(event, "clipboardData", {
      value: { setData: (key: string, value: string) => data.set(key, value) },
    });
    input.dispatchEvent(event);
    return data.get("text/plain")!;
  };
  const stepper = (props: Record<string, unknown>) => {
    let api: { increase: () => void };
    const wrapper = make(props, {
      controls: (slotProps: typeof api) => ((api = slotProps), ""),
    });
    return { wrapper, increase: () => api!.increase() };
  };

  it("C5: KWD de-DE copy of 1.234 pastes back as 1.234, not 1234", async () => {
    const copied = copyOf(
      make({ currency: "KWD", locale: "de-DE", modelValue: 1.234 }),
    );
    const target = make({ currency: "KWD", locale: "de-DE" });
    await type(target, copied);
    expect(model(target)).toBe(1.234);
  });

  it("C6: blur of a readonly field restores the text and never clamps", async () => {
    const wrapper = make({ modelValue: -50, readonly: true });
    wrapper.find("input").element.focus();
    await wrapper.find("input").trigger("focus");
    await blur(wrapper);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(shown(wrapper)).toBe("-50.00");
  });

  it("C7: type stays text, inputmode and autocomplete are overridable", () => {
    const wrapper = make({
      modelValue: 1,
      type: "number",
      inputmode: "numeric",
      autocomplete: "transaction-amount",
    });
    const input = wrapper.find("input");
    expect(input.attributes("type")).toBe("text");
    expect(input.attributes("inputmode")).toBe("numeric");
    expect(input.attributes("autocomplete")).toBe("transaction-amount");
  });

  it("C10: minor-units hidden value is empty when the shown text is not the model", async () => {
    const wrapper = make({
      modelValue: 300,
      minorUnits: true,
      name: "amt",
      "onUpdate:modelValue": () => {},
    });
    await type(wrapper, "5");
    const hidden = wrapper.find('input[type="hidden"]')
      .element as HTMLInputElement;
    expect(model(wrapper)).toBe(300);
    expect(hidden.value).toBe("");
  });

  it.each([
    [0.005, false, 1],
    [0.005, true, 100],
  ])(
    "C11: step %s finer than USD's cents is refused",
    async (step, minorUnits, modelValue) => {
      const { wrapper, increase } = stepper({ modelValue, step, minorUnits });
      increase();
      await nextTick();
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    },
  );

  it("C11: KWD still steps by 0.001", async () => {
    const { wrapper, increase } = stepper({
      currency: "KWD",
      modelValue: 1,
      step: 0.001,
    });
    increase();
    await nextTick();
    expect(model(wrapper)).toBe(1.001);
  });
});
