/**
 * Decimal-exponent rounding: avoids binary float errors (1.005 -> 1.01),
 * half away from zero. Never returns -0.
 */
export function roundTo(value: number, places: number) {
  const sign = value < 0 ? -1 : 1;
  // Split "1e-7" so the exponent can be shifted instead of appended to.
  const [mantissa, exponent = "0"] = String(Math.abs(value)).split("e");
  const shifted = Math.round(
    Number(`${mantissa}e${Number(exponent) + places}`),
  );
  // Beyond 2^53 the shift is lossy and String() goes exponential ("1e+21"),
  // which would break the re-parse; such values have no fraction to round.
  if (!Number.isSafeInteger(shifted)) return value;
  // `+ 0` turns -0 (e.g. -0.4 at 0 places) into 0.
  return sign * Number(`${shifted}e-${places}`) + 0;
}

/** Moves the decimal point by `places` through the exponent, no float multiply. */
export function shiftDecimal(value: number, places: number) {
  const [mantissa, exponent = "0"] = String(value).split("e");
  return Number(`${mantissa}e${Number(exponent) + places}`);
}

/** Plain digits of a finite number, never exponent notation ("1e-7" -> "0.0000001"). */
export function plainDecimal(value: number) {
  if (!Number.isFinite(value)) return "";
  const text = String(value);
  if (!text.includes("e")) return text;
  const [mantissa, exponent] = text.split("e");
  // Positive exponents only occur from 1e21: always whole numbers.
  if (Number(exponent) > 0) return BigInt(value).toString();
  const digits = mantissa.replace(/[-.]/g, "");
  return `${value < 0 ? "-" : ""}0.${"0".repeat(-Number(exponent) - 1)}${digits}`;
}
