---
kind: experiment
category: Layout & containers
purpose: popover, anchored floating panel, native popover API, dropdown menu base
short: experimental popover built on the native HTML Popover API instead of teleport + JS positioning
invariants: true
---

# Popover (experiment) — agent-only invariants

Lives in `src/runtime/experiments/`, published as `orio-ui/experiments`.
Explores replacing the shipped `<orio-popover>` (teleport + measured placement)
with the browser's native Popover API.

## Invariants

- **Unstable by contract.** Shipped, but props/names/behaviour may change in any
  release including a patch. Do not treat it as public API.
- **Never auto-imported.** It sits outside `runtime/components/`, which is the
  only directory `module.ts` passes to `addComponentsDir`. Consumers must
  `import { Popover } from "orio-ui/experiments"`. There is no
  `<orio-popover>`-style global tag for it in consumer apps.
- **Barrel is `src/runtime/experiments.ts`.** A new experiment is invisible to
  consumers until it is exported there — the subpath resolves to that file
  alone, not to a directory glob.
- **`<orio-x-popover>` is docs-only.** `docs/.vitepress/theme/index.ts` globs
  the experiments dir and registers each one under the `OrioX` prefix so demo
  pages can render them. That prefix does not exist outside the docs site.
- **Two slots, `trigger` and `body`.** Each receives its own attribute bag —
  `trigger` gets `{ popovertarget, class }`, `body` gets `{ id, class, popover }`.
  You **must** `v-bind` the bag onto a real element; the pairing is what makes
  the popover open. Unslotted, the fallbacks are `<orio-button>` and a surfaced
  `<div>`, so the bare component already renders something usable.
- **The default trigger relies on the module's auto-import.** `<orio-button>` is
  a global tag registered by `module.ts`, not an explicit import — matching the
  rest of the library. Outside a Nuxt app with the module installed, slot the
  trigger yourself.
- **State is the browser's, not Vue's.** No `showPopover` ref, no `toggle` slot
  prop, no `v-model`. Open/close is `popovertarget` clicks or the imperative
  `showPopover()` / `hidePopover()` DOM methods.
- **`id` is auto-generated via `useId`.** It is the key for *everything*: the
  `popovertarget`/`id` pairing, the injected style-tag selectors, and the
  per-instance anchor name `--popover-trigger-<id>`. Two instances sharing an id
  means both panels anchor to one trigger. Pass `id` only when you need a stable
  handle, and keep it CSS-ident-safe — it is interpolated into selectors
  unescaped.
- **Everything is a per-instance `<style>` tag**, injected with `useStyleTag`,
  not scoped CSS — scoped styles would carry the *parent's* scope id, since slot
  content compiles in the parent. It selects the trigger via
  `:is(button, input)[popovertarget="<id>"]` and the panel via
  `.popover-body#<id>`, so the consumer's own markup is what gets styled — no
  wrapper element required. The `:is(button, input)` guard matters: if the
  attribute also falls through to a wrapper element, an unguarded selector would
  put the same `anchor-name` on two elements and the panel would anchor to the
  wrong one.
- **Two kinds of rule, two specificities.** Anchor positioning
  (`position-anchor`, `position-area`, `margin`, `position-try-fallbacks`) is
  emitted at normal specificity because it has to win. Surface and motion
  defaults are emitted inside `:where(...)`, i.e. specificity zero, so any
  consumer class overrides them. Keep that split when adding rules — a default
  outside `:where()` becomes unoverridable at id specificity.
- **Panel motion is discrete-transition CSS**, not a Vue `<Transition>`:
  `@starting-style` for the entry values plus `overlay`/`display` in the
  transition list with `allow-discrete`. A Vue transition cannot drive the top
  layer. `--popover-enter-distance` (0.5rem) is the slide distance and is
  overridable per instance.
- **The panel must be `position: fixed`, never `absolute`.** Under `absolute`
  the containing block is the initial containing block, whose scrollable
  overflow region spans the whole document — a panel hanging below the fold
  overflows nothing, so `position-try-fallbacks` never fires and the panel opens
  off-screen. Measured in Chrome 151: identical CSS flips under `fixed` and
  never flips under `absolute`.
- **`flip` is tri-state (`PopoverFlip`), not a boolean.** `"auto"` (default) =
  flip on open plus the silent reopen while open; `"initial"` = flip on open
  only; `"off"` = no `position-try-fallbacks` emitted at all. Anything other
  than `"off"` emits fallbacks block-axis-first for `top`/`bottom` and
  inline-axis-first for `left`/`right`; only `"auto"` attaches scroll and resize
  listeners.
- **`inheritAttrs: false` is required, not stylistic.** The template has two
  roots (trigger + panel), so fallthrough attrs have nowhere to land.
- **`position` is a closed union (`PopoverPosition`), not `string`.** It is
  interpolated raw into `position-area`, so widening it to csstype's
  `Property.PositionArea` (which ends in `(string & {})`) would reopen a CSS
  injection hole. Add keywords to the union deliberately.
- **Panel renders in the top layer**, above everything, no z-index needed and no
  teleport. Parent CSS scoping does not reach it — style `.popover-body` from a
  parent with `:deep()` or globally.

## Gotchas

- **Placement needs CSS anchor positioning**, which is not in every browser the
  library targets. Where `anchor-name` / `position-area` are unsupported the
  panel falls back to the native centered-in-viewport position — no JS fallback
  exists. Check support before promoting this out of `experiments/`.
- **The browser decides the side at open time only.** Measured in Chrome 151
  over CDP with real frames: the panel tracks its anchor during scroll
  (compositor-driven), but the fallback choice is sticky, and forcing a style
  invalidation — rewriting `position-area`, toggling `position-try-fallbacks` —
  does **not** re-run it. Only a fresh layout at show time does. `flip="auto"`
  works around this with a silent `hidePopover()`/`showPopover()` pair; do not
  replace it with a style-invalidation trick, that path was measured and fails.
  `flip="initial"` is the same CSS without the workaround, and `flip="off"`
  omits `position-try-fallbacks` altogether — three states, because the two
  booleans they replaced had a meaningless fourth combination.
- **The silent reopen must stay inside one task.** Hide and show are called
  back-to-back so no frame paints the closed state (measured: zero hidden
  frames). Anything `await`ed between them — or moving the show into a
  `requestAnimationFrame` — makes the panel visibly blink. The `popover-instant`
  class suppresses transitions across the swap and is removed on the next frame;
  it is emitted at id specificity so it beats the `:where()` motion defaults.
- **The swap has three side effects that are compensated, not avoided.** Hiding
  a popover returns focus to the invoker (focus is restored if it was inside the
  panel), the display change resets `scrollTop`/`scrollLeft` (both are saved and
  reapplied), and a `beforetoggle`/`toggle` pair fires (swallowed by a
  document-level capture listener while `isRecalculating` is set — non-bubbling
  events still have a capture phase, so it runs before any consumer listener on
  the panel). Removing any of those compensations regresses something subtle.
- **Recalculation is scroll-idle and overflow-gated.** It runs 100 ms after the
  last scroll event, and only when the panel's rect actually leaves the
  viewport — one relayout per gesture. Running it per frame would put the panel
  in and out of the top layer sixty times a second.
- **Everything in that path no-ops without the Popover API.** `supportsPopover()`
  guards it, because `:popover-open` throws as an unknown selector in jsdom and
  consumers run component tests there.
- **Flipping is the browser's, so it is invisible to Vue.** Nothing exposes the
  resolved placement — there is no `currentPosition` equivalent. If a consumer
  needs to know which side won, that has to be built.
- **The panel does not hide when its trigger scrolls away.**
  `position-visibility: anchors-visible` would do it; it is deliberately not set
  yet.
- **`popover="auto"` gives light-dismiss and Esc for free** — the shipped
  component hand-rolls click-outside and has no Esc. That is the main reason
  this experiment exists.
- **No label support.** An earlier draft wrapped everything in
  `<orio-control-element>`; that was dropped because it is a form-control label
  wrapper, not a popover host. There is currently no way to attach a label, and
  the trigger bag carries no `aria-expanded` / `aria-haspopup` yet.
- **No focus management.** Native popovers do not trap focus (`popover="auto"`
  is not a dialog). Use `<orio-modal>` when you need a trap.

## Quick reference

Lifted from the first live demo on `docs/experiments/popover.md` (there it is
`<orio-x-popover>`, the docs-only alias; consumers import `Popover`):

```vue
<script setup lang="ts">
import { Popover } from "orio-ui/experiments";
</script>

<template>
  <Popover position="bottom span-right">
    <template #trigger="triggerProps">
      <orio-button variant="secondary" v-bind="triggerProps">Bottom</orio-button>
    </template>
    <template #body="bodyProps">
      <div v-bind="bodyProps" style="min-width: 200px;">
        <p>Native popover content.</p>
        <p>Click outside or press Esc to dismiss.</p>
      </div>
    </template>
  </Popover>
</template>
```

## Graduating

Move `index.vue` to `src/runtime/components/Popover.vue`, move this file to
`agents/components/Popover.md`, move the demo page to `docs/components/`,
export it from `src/runtime/index.ts`, and drop the entry from
`src/runtime/experiments.ts`. Auto-import and the generated routing index pick
it up automatically at that point.

## Related

- `<orio-popover>` — the shipped teleport-based component this may replace.
- `<orio-tooltip>` — hover/focus hints.
- `<orio-modal>` — backdrop, focus trap, centered dialog.
- Demo page: `docs/experiments/popover.md`.
