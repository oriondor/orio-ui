import { plainDecimal } from "./decimal";

// The browser locale does not exist on the server. Until mounted, server and
// first client render share this fallback, so hydration cannot mismatch.
export const FALLBACK_LOCALE = "en-US";
const MAX_PLACES = 20;
// Major mode: at most 15 significant digits survive decimal -> double -> decimal.
const MAX_DIGITS = 15;

export interface MoneyFormats {
  places: number;
  affix: { text: string; position: "before" | "after" } | null;
  tokens: string[];
  groupMark: string;
  raw: Intl.NumberFormat;
  grouped: Intl.NumberFormat;
}

/** Text that cannot be turned into a model value (yet). */
export type MoneyFailure = "incomplete" | "invalid" | "tooLarge";

// Any whitespace (incl. NBSP, NNBSP) is one space; typographic apostrophe is "'".
const canonical = (raw: string) =>
  raw.replace(/\s/g, " ").replace(/\u2019/g, "'");
// Every \p{Nd} block is a contiguous run of 0-9: the digit is the offset into it.
const toAsciiDigit = (char: string) => {
  const codePoint = char.codePointAt(0)!;
  let offset = 0;
  while (/^\p{Nd}$/u.test(String.fromCodePoint(codePoint - offset - 1))) {
    offset++;
  }
  return String(offset % 10);
};

// Decimals must fit Intl (0..100) and stay sane: 0..20 integers only.
function resolvePlaces(requested: number | undefined, fallback: number) {
  if (requested === undefined) return fallback;
  if (
    Number.isInteger(requested) &&
    requested >= 0 &&
    requested <= MAX_PLACES
  ) {
    return requested;
  }
  console.warn(
    `[orio-number-input-money] decimalPlaces must be an integer 0-${MAX_PLACES}, got ${requested}`,
  );
  return fallback;
}

// latn: values the component formats use Latin digits (parsing reads native ones).
function numberFormats(locale: string, places: number) {
  const base = { numberingSystem: "latn" };
  return {
    raw: new Intl.NumberFormat(locale, {
      ...base,
      useGrouping: false,
      maximumFractionDigits: places,
    }),
    grouped: new Intl.NumberFormat(locale, {
      ...base,
      minimumFractionDigits: places,
      maximumFractionDigits: places,
    }),
  };
}

function buildFormats(
  locale: string,
  currency: string,
  currencyDisplay: Intl.NumberFormatOptions["currencyDisplay"],
  decimalPlaces: number | undefined,
): MoneyFormats {
  const currencyFormat = (display: typeof currencyDisplay) =>
    new Intl.NumberFormat(locale, {
      numberingSystem: "latn",
      style: "currency",
      currency,
      currencyDisplay: display,
    });
  const shown = currencyFormat(currencyDisplay);
  const places = resolvePlaces(
    decimalPlaces,
    shown.resolvedOptions().maximumFractionDigits!,
  );
  const parts = shown.formatToParts(1234.5);
  const affixIndex = parts.findIndex((part) => part.type === "currency");
  const integerIndex = parts.findIndex((part) => part.type === "integer");
  // Accepted currency tokens: whatever is displayed, plus symbol, narrow symbol and code.
  const tokens = [
    parts[affixIndex]?.value,
    ...(["symbol", "narrowSymbol", "code"] as const).map(
      (display) =>
        currencyFormat(display)
          .formatToParts(1)
          .find((part) => part.type === "currency")?.value,
    ),
    currency.toUpperCase(),
  ].filter((token): token is string => Boolean(token));
  return {
    places,
    affix: {
      text: parts[affixIndex]?.value ?? "",
      position: affixIndex < integerIndex ? "before" : "after",
    },
    tokens: [...new Set(tokens.map(canonical))].sort(
      (a, b) => b.length - a.length,
    ),
    groupMark: canonical(
      new Intl.NumberFormat(locale, { numberingSystem: "latn" })
        .formatToParts(1234567.5)
        .find((part) => part.type === "group")?.value ?? "",
    ),
    ...numberFormats(locale, places),
  };
}

/** Formats for a currency and locale; unknown ones (RangeError) fall back to plain en-US. */
export function moneyFormats(
  locale: string,
  currency: string,
  currencyDisplay: Intl.NumberFormatOptions["currencyDisplay"],
  decimalPlaces: number | undefined,
): MoneyFormats {
  try {
    return buildFormats(locale, currency, currencyDisplay, decimalPlaces);
  } catch (error) {
    console.warn("[orio-number-input-money] cannot format", error);
    const places = resolvePlaces(decimalPlaces, 2);
    return {
      places,
      affix: null,
      tokens: [],
      groupMark: ",",
      ...numberFormats(FALLBACK_LOCALE, places),
    };
  }
}

// The one ceiling for text and model values, in both modes: at most 15
// significant digits AND the scaled minor-unit integer is a safe integer.
const withinCeiling = (integer: string, fraction: string, places: number) =>
  `${integer}${fraction.replace(/0+$/, "")}`.replace(/^0+/, "").length <=
    MAX_DIGITS &&
  Number.isSafeInteger(Number(`${integer}${fraction.padEnd(places, "0")}`));

/**
 * Exact decimal text of a model value that can be shown without rounding, or
 * why it cannot (non-finite, too many decimals, beyond the ceiling).
 */
export function inspectModel(
  value: number,
  places: number,
  minorUnits: boolean,
): { text: string; reason: null } | { text: null; reason: MoneyFailure } {
  const failed = (reason: MoneyFailure) => ({ text: null, reason }) as const;
  if (!Number.isFinite(value)) return failed("invalid");
  let text: string;
  if (minorUnits) {
    if (!Number.isInteger(value)) return failed("invalid");
    if (!Number.isSafeInteger(value)) return failed("tooLarge");
    const digits = String(Math.abs(value)).padStart(places + 1, "0");
    const split = digits.length - places;
    text = `${value < 0 ? "-" : ""}${digits.slice(0, split)}${
      places ? `.${digits.slice(split)}` : ""
    }`;
  } else {
    text = plainDecimal(value);
  }
  const [integer, fraction = ""] = text.replace("-", "").split(".");
  if (!minorUnits && fraction.length > places) return failed("invalid");
  return withinCeiling(integer, fraction, places)
    ? { text, reason: null }
    : failed("tooLarge");
}

/** Model -> display text: raw while editing, grouped otherwise. */
export function formatMoney(
  value: number | null,
  formats: MoneyFormats,
  minorUnits: boolean,
  editing: boolean,
) {
  if (value === null) return "";
  const { text } = inspectModel(value, formats.places, minorUnits);
  // Never round or guess: show the outside value's own digits (empty if non-finite).
  if (text === null) return plainDecimal(value);
  // Exact: Intl formats the decimal string itself (no float round trip).
  return (editing ? formats.raw : formats.grouped).format(
    text as unknown as number,
  );
}

// First group 1-3 digits without a leading zero, middle groups 2-3 (Indian
// 12,34,567), last group exactly 3.
const validGroups = (integer: string, mark: string) => {
  const groups = integer.split(mark);
  return (
    groups.length > 1 &&
    /^[1-9]\d{0,2}$/.test(groups[0]) &&
    groups.slice(1, -1).every((group) => /^\d{2,3}$/.test(group)) &&
    /^\d{3}$/.test(groups.at(-1)!)
  );
};

/**
 * Digits and separators -> integer and fraction digits. The format is read
 * from the text; the field locale (`groupMark`) only breaks a true tie ("1,234").
 */
function splitNumber(
  text: string,
  groupMark: string,
): { integer: string; fraction: string } | "incomplete" | "invalid" {
  const marks = text.replace(/\d/g, "");
  const kinds = [...new Set(marks)];
  if (kinds.length === 0) return { integer: text, fraction: "" };
  if (kinds.length > 2) return "invalid";
  if (kinds.length === 2) {
    // The last mark is the decimal (once); the other must be valid grouping.
    const decimal = marks.at(-1)!;
    if (decimal !== "." && decimal !== ",") return "invalid";
    if (marks.split(decimal).length > 2) return "invalid";
    const other = kinds.find((kind) => kind !== decimal)!;
    const at = text.lastIndexOf(decimal);
    const integer = text.slice(0, at);
    return validGroups(integer, other)
      ? { integer: integer.split(other).join(""), fraction: text.slice(at + 1) }
      : "invalid";
  }
  const [mark] = kinds;
  // Space and apostrophe are only ever grouping; so is a repeated mark.
  if (marks.length > 1 || (mark !== "." && mark !== ",")) {
    if (validGroups(text, mark)) {
      return { integer: text.split(mark).join(""), fraction: "" };
    }
    // "1,234,5", "12,34,5": a prefix of a valid grouped number is incomplete.
    const groups = text.split(mark);
    const last = groups.at(-1)!;
    return last.length < 3 &&
      validGroups(groups.slice(0, -1).join(mark) + mark + "000", mark)
      ? "incomplete"
      : "invalid";
  }
  const [integer, fraction] = text.split(mark);
  // Could be grouping only as "d 3-digit group"; then the field locale decides.
  const tie = fraction.length === 3 && /^[1-9]\d{0,2}$/.test(integer);
  return tie && mark === groupMark
    ? { integer: `${integer}${fraction}`, fraction: "" }
    : { integer, fraction };
}

/**
 * Text -> model: a number, `null` (empty), or why it is not a value:
 * "incomplete" may still become valid, "invalid" never can, "tooLarge" is
 * beyond the ceiling. Model units follow `minorUnits`; `allowNegative` says
 * whether the lower bound permits a minus.
 */
export function parseMoney(
  raw: string,
  formats: Pick<MoneyFormats, "tokens" | "places" | "groupMark">,
  minorUnits: boolean,
  allowNegative: boolean,
): number | null | MoneyFailure {
  const { tokens, places, groupMark } = formats;
  let text = canonical(
    raw
      .replace(/[\u200E\u200F\u061C]/g, "") // bidi marks
      .replace(/\p{Nd}/gu, toAsciiDigit)
      .replace(/\u066B/g, ".")
      .replace(/\u066C/g, "'")
      .replace(/\u2212/g, "-"),
  ).trim();

  // Sign and one currency token are accepted at the edges only.
  let negative = false;
  let tokenSeen = false;
  for (;;) {
    if (!negative && text.startsWith("-")) {
      negative = true;
      text = text.slice(1).trim();
      continue;
    }
    const token = tokenSeen
      ? undefined
      : (tokens.find((candidate) => text.startsWith(candidate)) ??
        tokens.find((candidate) => text.endsWith(candidate)));
    if (!token) break;
    tokenSeen = true;
    text = (
      text.startsWith(token)
        ? text.slice(token.length)
        : text.slice(0, -token.length)
    ).trim();
  }
  // Without negatives allowed a minus can never become valid.
  if (negative && !allowNegative) return "invalid";
  if (text === "") return negative || tokenSeen ? "incomplete" : null;

  // A started currency token ("U", "5 US") is incomplete, not wrong.
  const started = tokenSeen
    ? undefined
    : tokens
        .flatMap((token) =>
          Array.from({ length: token.length - 1 }, (_, at) =>
            token.slice(0, at + 1),
          ),
        )
        .find((prefix) => text.endsWith(prefix));
  if (started !== undefined) {
    const rest = text.slice(0, -started.length).trim();
    if (rest === "") return "incomplete";
    text = rest;
  }
  if (!/^[\d.,' ]+$/.test(text)) return "invalid";

  // An Arabic decimal mark is explicit: "١٫٢٣٤" is never grouping.
  const split = splitNumber(text, raw.includes("\u066B") ? "" : groupMark);
  if (typeof split === "string") return split;
  const { integer } = split;
  let { fraction } = split;
  if (integer === "" && fraction === "") return "incomplete";
  // Extra fraction digits are dropped when all zeros, an error otherwise.
  if (fraction.length > places) {
    if (/[1-9]/.test(fraction.slice(places))) return "invalid";
    fraction = fraction.slice(0, places);
  }
  if (!withinCeiling(integer, fraction, places)) return "tooLarge";
  // The text was complete, only a currency token was still missing.
  if (started !== undefined) return "incomplete";
  const sign = negative ? "-" : "";
  // `+ 0` keeps -0 out of the model.
  return minorUnits
    ? Number(`${sign}${integer || "0"}${fraction.padEnd(places, "0")}`) + 0
    : Number(`${sign}${integer || "0"}.${fraction || "0"}`) + 0;
}
