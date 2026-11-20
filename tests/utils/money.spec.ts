import { describe, expect, it } from "vitest";
import { moneyFormats, parseMoney } from "../../src/runtime/utils/money";

const usd = moneyFormats("en-US", "USD", "symbol", undefined);
const parse = (raw: string, minorUnits = false, formats = usd) =>
  parseMoney(raw, formats, minorUnits, true);

describe("parseMoney", () => {
  it("reads major and minor units exactly", () => {
    expect(parse("12.50")).toBe(12.5);
    expect(parse("0.29", true)).toBe(29);
    expect(parse("")).toBeNull();
  });

  it.each(["-", ".", "-.", "$", "5 US"])(
    "treats partial %j as incomplete in both units",
    (raw) => {
      expect(parse(raw, false)).toBe("incomplete");
      expect(parse(raw, true)).toBe("incomplete");
    },
  );

  it("reads -.0 as 0 in both units (no NaN, no -0)", () => {
    expect(Object.is(parse("-.0", false), 0)).toBe(true);
    expect(Object.is(parse("-.0", true), 0)).toBe(true);
  });

  it("breaks a 1,234 tie by the field locale", () => {
    expect(parse("1,234")).toBe(1234);
    const german = moneyFormats("de-DE", "EUR", "symbol", undefined);
    expect(parse("1,234", false, german)).toBe("invalid");
    expect(parse("1.234", false, german)).toBe(1234);
  });

  it("rejects extra non-zero decimals, drops zero ones", () => {
    expect(parse("12.500")).toBe(12.5);
    expect(parse("12.505")).toBe("invalid");
  });

  it("uses no decimals for JPY", () => {
    const yen = moneyFormats("en-US", "JPY", "symbol", undefined);
    expect(parse("1234", false, yen)).toBe(1234);
    expect(parse("12.5", false, yen)).toBe("invalid");
  });

  it("flags values beyond the ceiling", () => {
    expect(parse("1234567890123456")).toBe("tooLarge");
    expect(parse("90071992547409.93", true)).toBe("tooLarge");
  });

  it("rejects a minus when negatives are not allowed", () => {
    expect(parseMoney("-5", usd, false, false)).toBe("invalid");
  });
});

describe("Arabic separators", () => {
  const german = moneyFormats("de-DE", "KWD", "symbol", undefined);
  it("reads U+066B as an explicit decimal, never a tie", () => {
    expect(parse("١٫٢٣٤", false, german)).toBe(1.234);
  });
  it("reads U+066C as grouping only", () => {
    expect(parse("١٬٢٣٤", false, german)).toBe(1234);
    expect(parse("١٬٢٣٤", false, usd)).toBe(1234);
  });
});
