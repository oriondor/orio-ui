---
kind: component
category: Form inputs
purpose: OTP input, one-time password, verification code, PIN code, segmented code boxes
short: fixed-length code input split into auto-advancing per-character segments for OTP / PIN entry
invariants: true
---

# SegmentedInput — agent-only invariants

`<orio-segmented-input>` renders `segments` × `<orio-input>` boxes and joins
them into a single v-model string. Built for OTP / verification-code entry.

## Invariants

- **Does NOT extend `ControlProps`** — unlike other form inputs there is no
  `label`, `layout`, `disabled`, or ControlElement wrapper. Add your own
  label / a11y wrapper in the consumer.
- **v-model is the plain concatenation** of all segment values
  (`string | number`, default `""`). External model writes re-split across
  segments (`segmentSize` characters each).
- **Sparse fills collapse.** Segments `["1", "", "3"]` join to `"13"`, which
  immediately re-splits as `["1", "3", ""]` — characters shift left past
  empty segments. The model can never hold positional gaps.
- **Keyboard handling is a window-level `onKeyDown`** that bails unless one
  of its own segments is focused. Auto-advance happens on keydown when the
  focused segment is already full (the key lands in the next segment);
  Backspace on an empty segment moves focus back.
- **`type="number"`** (default) `preventDefault`s non-digit printable keys
  and sets `inputmode="numeric"` on every segment. Modifier shortcuts
  (Cmd/Ctrl/Alt) and navigation keys pass through. `type="string"` accepts
  anything.
- **`start` / `end` events** fire when focus would step before the first
  segment (Backspace) or past the last one (typed into the final full
  segment). Use `end` for auto-submit.
- The first segment has `autocomplete="one-time-code"`; the rest are
  `autocomplete="off"`.
- **Paste is intercepted** (`@paste.prevent` on the wrapper): the pasted
  text replaces `modelValue` wholesale — digits-only filtered for
  `type="number"`, trimmed for `type="string"`, truncated to
  `segments × segmentSize`. A paste that fills every segment emits `end`.

## Gotchas

- **Paste replaces the whole value**, regardless of which segment is
  focused — it does not insert at the focused position.
- **SMS autofill** (`one-time-code`) inserts via the input value setter, not
  a paste event — it still lands in segment 0 and is truncated by
  `maxlength`.
- `segments` / `segmentSize` accept `number | string` (loose HTML-attr
  usage) and are `Number()`-coerced internally.
- Programmatic focus of a segment goes through the exposed `focused` ref of
  `Input.vue` (`inputComponent.focused = true`), not `element.focus()`.
- Multiple instances on one page are safe — each window listener no-ops
  unless one of its own segments is focused.

## Quick reference

```vue
<orio-segmented-input
  v-model="code"
  :segments="6"
  :segment-size="1"
  type="number"
  @end="submitCode()"
/>
```
