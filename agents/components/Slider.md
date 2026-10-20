---
kind: component
category: Form inputs
purpose: range slider, range input, value slider
short: single-value range slider over a native `<input type="range">` wrapping ControlElement; accent fill via CSS `v-bind(percent)`
invariants: true
---

# Slider — agent-only invariants

`<orio-slider>` is a single-value slider wrapping `ControlElement`. Read
`ControlElement.md` first — label, error, size, layout and a11y live there.

## Invariants

- **Native `<input type="range">` underneath.** Keyboard, touch and screen
  reader support come from the browser; do not add key handlers.
- **v-model is `number`** (default `0`). Props `min` (0), `max` (100),
  `step` (1) on top of `ControlProps`.
- **Values are normalized**: emitted values and the rendered position are
  clamped to `min`–`max` and snapped to `min + k * step`, rounded to the
  larger decimal precision of `min` and `step` (no `0.30000000000000004`).
  A zero, negative or non-finite `step` falls back to `1`, on both the
  normalizer and the native input. An out-of-range `modelValue` renders
  clamped but is **not** re-emitted until the user moves the thumb.
- **The `control` bag is spread onto the `<input>`** with `$attrs`, like
  Input: `disabled`, `name`, `aria-*` land on the native element.
- **Works inside `<orio-form>`** — pass `name`; auto-bind uses
  `modelValue` / `update:modelValue`.
- **Size tokens** `--control-slider-thumb` / `--control-slider-track` come
  from `useControlSize` (`sizeTokens`), so `size` xs–xl scales thumb and track.

## Gotchas

- WebKit fill is a `linear-gradient` driven by `v-bind(percent)` in the
  `<style>` block (a hashed CSS var on the component root); Firefox uses
  `::-moz-range-progress`. `useCssVars` is a no-op in Vue's cjs build, so
  unit tests read `wrapper.vm.percent`, not the DOM. Do not override `background`
  on the input or the WebKit fill disappears.
- No built-in value label. Put a readout in `#after` / `#before`.
- No dual-thumb range mode — two sliders or a different component.

## Quick reference

```vue
<!-- from docs/components/slider.md -->
<orio-slider v-model="area" label="Area" :min="20" :max="200" :step="5">
  <template #after>
    <orio-view-text>{{ area }} m²</orio-view-text>
  </template>
</orio-slider>
```
