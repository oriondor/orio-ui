import { describe, it, expect } from "vitest";
import { useDecimalFormatter } from "../../src/runtime/composables/useDecimalFormatter";

const { toNumber } = useDecimalFormatter();

describe("toNumber", () => {
  it("parses US and EU separators", () => {
    expect(toNumber("1,234.56")).toBe(1234.56);
    expect(toNumber("1.234,56")).toBe(1234.56);
    expect(toNumber("1,234")).toBe(1.234);
  });

  it("accepts U+2212 minus (sv, fi, nb)", () => {
    expect(toNumber("−5")).toBe(-5);
    expect(toNumber("−1,5")).toBe(-1.5);
  });

  it("round-trips Intl output in every listed locale", () => {
    ["sv", "fi", "nb", "de", "en", "uk"].forEach((locale) => {
      const text = new Intl.NumberFormat(locale, {
        useGrouping: false,
        maximumFractionDigits: 20,
      }).format(-12.5);
      expect(toNumber(text)).toBe(-12.5);
    });
  });
});
