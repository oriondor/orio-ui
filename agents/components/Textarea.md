---
kind: component
category: Form inputs
purpose: textarea, multi-line text, long text input
short: multi-line text input wrapping ControlElement; supports inner-floating label and vertical resize
invariants: true
---

# Textarea — agent-only invariants

`<orio-textarea>` is the multi-line counterpart to `<orio-input>`. Same
ControlElement wrapping, same layout modes, same slot-bag flow. Read
`ControlElement.md` and `Input.md` first — most of the contract
lives there.

## Invariants

- **Extends `ControlProps`** with one override: `layout?: InputLayout`
  where `InputLayout = ControlLayout | "inner"`. The `"inner"` mode floats
  the label inside the textarea chrome (same trick as Input).
- **`layout="inner"` translates to `vertical`** on the inner ControlElement
  and adds an `.inner` class. The label reposition is driven by `:deep()`
  styles, not a duplicate label DOM.
- **v-model is `string`** (default `""`).
- **`rows="4"` is the hard default** rendered on the `<textarea>`. Override
  via `$attrs` — `<orio-textarea :rows="2">` flows through.
- **`resize: vertical`** is set in CSS. The user can drag the bottom edge
  but cannot resize horizontally.
- **Horizontal layout aligns the label to the top.** When `layout="horizontal"`,
  the `.control-label` is padded with `--control-py` and the row uses
  `align-items: flex-start` — so the label sits next to the top of a tall
  textarea, not centered vertically.
- **`$attrs` is spread before the control bag** on the inner `<textarea>`:
  `v-bind="{ ...$attrs, ...control }"`. Native attrs (`placeholder`,
  `maxlength`, `rows`, `wrap`) work on `<orio-textarea>` and reach the
  underlying element.

## Gotchas

- **Resize handle ignores `layout="inner"`.** The drag handle still appears
  bottom-right — the inner label can overlap an aggressively resized
  textarea's content. Cap `max-height` if that matters.
- **`rows` only sets the initial height** (in line-heights). After the
  user resizes, the manual height wins. To reset, re-mount the component.
- **The textarea is `width: 100%`** of the slot wrapper, which itself
  follows the wrapper border. Setting `cols` has no effect on rendered
  width.

## Quick reference

```vue
<script setup lang="ts">
const note = defineModel<string>({ default: "" });
</script>

<template>
  <orio-textarea
    v-model="note"
    :label="$t('order.notes.label')"
    :placeholder="$t('order.notes.placeholder')"
    layout="inner"
    :rows="6"
    maxlength="500"
  />
</template>
```

## Related

- `<orio-input>` — single-line text. Same contract.
- `<orio-control-element>` — the wrapper; owns label/error/a11y.
- Public API reference: `docs/components/textarea.md`.
