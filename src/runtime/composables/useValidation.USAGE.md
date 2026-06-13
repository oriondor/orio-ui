---
kind: composable
category: Composables
purpose: form validation, declarative form rules, field validation, error state
short: declarative rule-based form validation with reactive errors keyed by field id and auto scroll-to-first-error
invariants: true
---

# useValidation — agent-only invariants

`useValidation(rules?)` returns `{ checkValidity, errors, clearError,
clearAllErrors, changeRules }`. Errors are keyed by a field `id` that must
match a real DOM element id so the composable can scroll the offending
field into view.

## Invariants

- **`rules: ValidationRule[]`**: `{ model, id, validator, message? }`.
  - `model: MaybeRef<any>` — the value to validate. Unwrapped via
    `unref` at check time.
  - `id: string` — the DOM id of the field. Must be unique and must
    match an element in the DOM at validation time so `scrollIntoView`
    works.
  - `validator(model) => boolean` — returns true if valid.
  - `message?: string` — error message; falls back to
    `t("validation.fieldError")`.
- **`errors`** is a reactive `Record<string, string | null>`. Truthy
  string = error; `null` = no error.
- **`checkValidity()`** clears all errors, runs every rule with
  `reduceRight`, and returns true if all passed.
- **`reduceRight` is used so that all rules execute** even after one
  fails. The reducer is `(valid, rule) => validate(rule) && valid` —
  `validate` runs unconditionally; the boolean is just aggregated.
- **The first failing rule (in reduceRight order = bottom-up of the
  array) is scrolled into view.** Later rules' errors are still set
  but don't trigger another scroll because `errors[id]` is already
  set (the guard inside `validate`).
- **`changeRules(newRules)`** swaps the rule set at runtime — useful
  when validation depends on a step / mode.
- **i18n fallback**: `useI18n().t` is used when available; outside an
  i18n context it falls back to the bundled `en.json`'s
  `validation.fieldError` key.
- **Exported helpers**: `isFilled(value)` (length-based truthy),
  `isEmail(value)` (regex; empty string is treated as valid for
  optional fields).

## Gotchas

- **`id` must match a real DOM element.** If it doesn't,
  `scrollIntoView` is a no-op but the error still records. Test that
  `id`s collide with rendered form controls — orio form components
  generally need the same `id` passed via `ControlProps`.
- **`reduceRight` order is reversed** relative to the rules array.
  The "first" rule to fail (scroll target) is the LAST one in the
  array. Order rules with the highest-priority field at the bottom
  if scroll behavior matters.
- **Errors don't auto-clear when the user fixes the field.** The
  caller must call `clearError(id)` on input, or re-run `checkValidity`
  on every change.
- **No async validators.** `validator` must be synchronous; for
  server-side checks, run them outside this composable.
- **No structural rules** (required-if, cross-field). Compose them
  inside individual validators.

## Quick reference

```ts
import { useValidation, isFilled, isEmail } from "../composables/useValidation";

const email = ref("");
const name = ref("");

const { checkValidity, errors, clearError } = useValidation([
  { model: email, id: "email", validator: isEmail,
    message: $t("validation.email") },
  { model: name, id: "name", validator: isFilled },
]);

async function submit() {
  if (!checkValidity()) return;
  await api.save({ email: email.value, name: name.value });
}
```

```vue
<template>
  <orio-input id="email" v-model="email" :error="errors.email"
    @update:model-value="clearError('email')" />
  <orio-input id="name" v-model="name" :error="errors.name"
    @update:model-value="clearError('name')" />
  <orio-button @click="submit">Submit</orio-button>
</template>
```

## Related

- `<orio-form>` — pairs with this for full-form validation.
- `<orio-control-element>` — accepts the `error` string from
  `errors[id]`.
- Public API reference: `docs/composables/use-validation.md`.
