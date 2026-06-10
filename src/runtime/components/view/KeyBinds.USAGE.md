---
kind: component
category: Media & misc
purpose: keyboard bindings hint display, shortcut display, kbd renderer
short: parses a backtick-delimited shortcut string and renders each key as `<kbd>` with separators inline
invariants: true
---

# view/KeyBinds — agent-only invariants

`<orio-view-key-binds>` parses a backtick-delimited string like
`` "`Ctrl` + `Z`" `` and renders each backticked token as a `<kbd>`
element with the surrounding text as separator.

## Invariants

- **`bind` is the single string prop.** Tokens between backticks (`` `…` ``)
  become `<kbd>` elements; everything else renders as a `.separator`
  `<span>`.
- **Regex is `/`([^`]+)`/g`** — non-greedy match inside backticks.
  Empty backticks (`` `` ``) and unmatched openings are passed through
  as plain text.
- **No tokenization beyond backticks.** `"+"`, `" "`, `","`, `"or"`
  between keys all render as plain separator text. Style them via the
  `.separator` class.
- **Output structure**: one `<span class="keybinds">` wrapper, with
  `<kbd>` and `<span class="separator">` children inline. Wrapper is
  `inline-flex` with 0.2rem gap.
- **Kbd styling** is fixed: rgba white background tint, small font,
  border. Designed for dark surfaces — over a light background, the
  contrast may be poor; override `kbd` styles via global CSS.

## Gotchas

- **The string is rendered as-is.** No localization, no key-symbol
  substitution (e.g. `Cmd` does not become `⌘`). Build that mapping in
  the consumer if needed.
- **No `aria-label`.** Screen readers read each `<kbd>` token aloud
  with the separator text — usually fine for `"Ctrl + Z"`, less great
  for `" or "`-separated alternates.
- **Mismatched backticks render as text.** `` "`Ctrl + Z" `` (missing
  closing tick) becomes plain text starting from the unmatched
  backtick.

## Quick reference

```vue
<template>
  <orio-view-key-binds bind="`Ctrl` + `Z`" />
  <orio-view-key-binds bind="press `Esc` to close" />
  <orio-view-key-binds bind="`Cmd` + `Shift` + `P` or `F1`" />
</template>
```

## Related

- Public API reference: `docs/components/view/key-binds.md` (if
  present).
