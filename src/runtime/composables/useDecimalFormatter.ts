type DecimalFormatOptions = {
  locale?: string;
  decimals?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

function getSystemLocale(): string {
  if (typeof navigator === "undefined") return "de-DE";
  return navigator.languages?.[0] ?? navigator.language;
}

export function useDecimalFormatter() {
  function toNumber(input: string | number): number | null {
    if (typeof input === "number") {
      return Number.isFinite(input) ? input : null;
    }

    if (typeof input !== "string") return null;

    const cleaned = input.replace(/[^\d.,-]/g, "").trim();

    if (!cleaned) return null;

    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");

    let normalized = cleaned;

    if (lastComma > lastDot) {
      // 1.234,56 -> 1234.56
      normalized = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      // 1,234.56 -> 1234.56
      normalized = cleaned.replace(/,/g, "");
    }

    const result = Number(normalized);
    return Number.isFinite(result) ? result : null;
  }

  function formatDecimal(
    input: string | number,
    options: DecimalFormatOptions = {},
  ): string | null {
    const locale = options.locale ?? getSystemLocale();

    // Simple override -> sets both min & max
    const decimals = options.decimals ?? 2;

    const minimumFractionDigits = options.minimumFractionDigits ?? decimals;

    const maximumFractionDigits = options.maximumFractionDigits ?? decimals;

    const value = toNumber(input);
    if (value === null) return null;

    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value);
  }

  return {
    toNumber,
    formatDecimal,
  };
}
