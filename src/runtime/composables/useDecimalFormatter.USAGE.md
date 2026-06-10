---
kind: composable
category: Composables
purpose: locale-aware number formatting, decimal parser, currency-safe parser
short: parse numeric strings (US or EU separator) and format via Intl.NumberFormat with locale defaults
invariants: true
---

# useDecimalFormatter — agent-only invariants

Returns `{ toNumber, formatDecimal }`. Stateless, no Vue reactivity —
call it once and reuse the two helpers.

## Invariants

- **`toNumber(input: string | number)`**:
  - Numbers pass through as-is (non-finite → `null`).
  - Strings are stripped of any character except digits, `,`, `.`, `-`.
  - **Decimal separator auto-detected** by checking the position of the
    last `,` and last `.`:
    - If last `,` is after last `.` → European format. Strip `.` (thousands)
      and convert `,` to `.` (decimal).
    - Otherwise → US format. Strip `,` and keep `.`.
  - Returns `null` for empty / unparseable input.
- **`formatDecimal(input, options?)`**:
  - `locale`: defaults to `navigator.languages[0] ?? navigator.language`
    on client, `"de-DE"` on server.
  - `decimals`: shortcut that sets both `minimumFractionDigits` and
    `maximumFractionDigits` (default `2`).
  - Explicit `minimumFractionDigits` / `maximumFractionDigits` override
    the `decimals` shortcut.
  - Returns `null` if `toNumber` fails.
- **Uses `Intl.NumberFormat`** under the hood — output respects the
  locale's group separator and decimal mark.

## Gotchas

- **Auto-separator detection is heuristic.** `"1,000"` is ambiguous; the
  parser treats it as US (1000), not EU (1.0). For unambiguous behavior,
  strip separators before passing.
- **No currency symbol handling.** `"$1,234.56"` is stripped to
  `"1234.56"` and parsed. To format as currency, build your own with
  `Intl.NumberFormat(locale, { style: "currency", currency: "USD" })`.
- **SSR fallback locale is `"de-DE"`**, not `"en-US"`. EU number
  formatting in SSR pre-hydration may surprise US consumers — pass
  `locale` explicitly to avoid hydration mismatches.
- **Negative numbers**: `-` is allowed in the cleaning regex anywhere in
  the string. `"100-50"` becomes `"100-50"` then `Number("100-50") = NaN`
  → null. No expression evaluation.

## Quick reference

```ts
import { useDecimalFormatter } from "../composables/useDecimalFormatter";

const { toNumber, formatDecimal } = useDecimalFormatter();

toNumber("1.234,56");      // 1234.56  (EU)
toNumber("1,234.56");      // 1234.56  (US)
toNumber("abc");           // null

formatDecimal(1234.5, { locale: "de-DE" });      // "1.234,50"
formatDecimal(1234.5, { locale: "en-US" });      // "1,234.50"
formatDecimal(1234.567, { decimals: 0 });        // "1,235"
formatDecimal("$1,234.567", { maximumFractionDigits: 1 }); // "1,234.6"
```

## Related

- `<orio-number-input>` — uses similar fraction-digit semantics via its
  `decimalPlaces` prop.
- Public API reference: `docs/composables/use-decimal-formatter.md`.
