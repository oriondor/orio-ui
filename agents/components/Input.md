---
kind: component
category: Form inputs
purpose: text input, single-line input
short: text input wrapping ControlElement; supports inner-floating label layout
invariants: true
---

# Input — agent-only invariants

`<orio-input>` is the text input wrapping `ControlElement`. Read
`ControlElement.md` first — most of the contract lives there.

## Invariants

- **Extends `ControlProps`** with one override: `layout?: InputLayout` where
  `InputLayout = ControlLayout | "inner"`. The extra `"inner"` is an
  Input-specific mode that floats the label inside the input chrome.
- **`layout="inner"` translates internally** to `layout="vertical"` on
  ControlElement and adds an `.inner` class on the wrapper. The label
  reposition is driven by `:deep()` styles on ControlElement internals — no
  duplicate label DOM is created.
- **The `control` slot bag is spread onto the inner `<input>`** alongside
  `$attrs`: `v-bind="{ ...$attrs, ...control }"`. Attrs like `type`,
  `autocomplete`, `placeholder`, `inputmode` work on `<orio-input>` and land
  on the underlying `<input>`.
- **v-model is `string`** (default `""`). For numeric input use
  `<orio-number-input>` instead.
- **`defineExpose({ input, focused })`** — `input` is the template ref to the
  native `<input>`; `focused` is the **writable** `Ref<boolean>` from
  `useFocus`. Reading reflects focus state; assigning `true`/`false` focuses or
  blurs the element. Drive programmatic focus via `focused`, not `input.focus()`.

## Gotchas

- The `.slot-wrapper` uses `display: flex; align-items: center;` so `before`
  and `after` slots sit inline with the input. Don't add wrapping divs inside
  those slots — they'll break alignment.
- `:placeholder-shown` is used internally for the inner-label "empty" state.
  If you pass an empty placeholder, the inner-label trick still works because
  the wrapper sets `placeholder=" "` upstream when needed.
- The default browser input border is removed; the visible border lives on
  `.slot-wrapper`. Custom inputs swapped in via slots will not inherit it —
  prefer `before`/`after` slots over replacing the input.

## Quick reference

```vue
<orio-input
  v-model="email"
  label="Email"
  layout="inner"
  type="email"
  autocomplete="email"
  :error="emailError"
>
  <template #before>
    <orio-icon name="mail" />
  </template>
</orio-input>
```
