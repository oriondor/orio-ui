# orio-ui

Nuxt module exposing a Vue 3 component library. Auto-import prefix: `Orio` →
`<orio-button>`, `<orio-canvas-stage>`, etc.

## Component routing index

Source under `src/runtime/components/`. Public docs under `docs/components/`.
Agent-only invariants under `<Component>.USAGE.md` (next to single-file `.vue`)
or `USAGE.md` (inside folder components). USAGE.md is lazy-loaded — only read
the one you need.

### Layout & containers
- `AnimatedContainer.vue` — slot wrapper with enter/leave transitions.
- `DashedContainer.vue` — dashed-border drop/empty zone.
- `ZoomableContainer.vue` — pinch/scroll zoom viewport.
- `Canvas/` — pannable workspace with pluggable tools + detached toolbar registry. **Has USAGE.md.**
- `Modal.vue` — teleported overlay dialog with open-from-origin animation. **Has USAGE.md.**
- `Popover.vue` — anchored floating panel.
- `Tooltip.vue` — hover/focus hint.

### Form inputs (wrapped by ControlElement)
- `ControlElement.vue` — label/legend wrapper, owns a11y attrs, exposes `control` slot prop. **Has USAGE.md.**
- `Input.vue` — single-line text input. **Has USAGE.md.**
- `Textarea.vue` — multi-line text.
- `NumberInput/` — numeric input (`Horizontal.vue`, `Vertical.vue` variants).
- `Selector.vue` — dropdown select.
- `TaggableSelector.vue` — multi-select with tag chips.
- `CheckBox.vue` / `CheckboxGroup.vue` — checkboxes; group uses `ControlElement` with `group` prop.
- `RadioButton.vue` — radio input.
- `SwitchButton.vue` — toggle switch.
- `Form.vue` — form wrapper / submission.

### Date
- `Calendar.vue` — month grid with roving-focus keyboard a11y. **Has USAGE.md.**
- `date/Picker.vue` — single date picker (Calendar + Trigger). **Has USAGE.md.**
- `date/RangePicker.vue` — date range picker.
- `date/PickerTrigger.vue` — popover trigger button used by both pickers.

### Buttons & indicators
- `Button.vue` — primary action button.
- `NavButton.vue` — navigation/link button.
- `Badge.vue` — small status indicator.
- `Tag.vue` — chip/label.
- `Banner.vue` — page-level notice.
- `EmptyState.vue` — empty-list placeholder.
- `LoadingSpinner.vue` — loading indicator.
- `Icon.vue` — icon renderer (reads from `utils/iconRegistry`).

### Media & misc
- `gallery/Carousel.vue` + `gallery/CarouselPreview.vue` — image carousel.
- `upload/index.vue` — file upload widget.
- `ListItem.vue` — list row.
- `LocaleSwitcher.vue` — i18n locale toggle.
- `view/Text.vue`, `view/Dates.vue`, `view/Separator.vue`, `view/KeyBinds.vue` — read-only display primitives.

## Composables

Under `src/runtime/composables/`. Public docs under `docs/composables/`.

- `useApi` — fetch helper.
- `useControlSize` — provide/inject control size tokens (used by ControlElement).
- `useDecimalFormatter` — locale-aware number formatting.
- `useFilter` — named filter group with v-bind bags, active chips, optional URL sync. **Has dedicated onboarder agent.**
- `useFuzzySearch` — client-side fuzzy match.
- `useInertia` — momentum/decay for pan gestures (Canvas, ZoomableContainer).
- `useListKeyboard` — arrow-key navigation for flat lists.
- `useModal` — programmatic modal API.
- `usePinchZoom` — pinch-to-zoom gesture (ZoomableContainer, Canvas).
- `usePressAndHold` — long-press gesture detection.
- `useRovingGrid` — roving-focus tabindex for 2D grids (Calendar).
- `useSound` — audio cue playback.
- `useTheme` — theme tokens.
- `useUrlSync` — sync reactive state to URL query.
- `useValidation` — form validation.

## References

- `.cheatsheets/` — architecture, design system, CSS patterns, component patterns, composables, testing. **Consult before any task.**
- `docs/components/*.md` — public API per component.
- `docs/composables/*.md` — public API per composable.

## Agents

Narrow subagents live in `.claude/agents/`:

- `component-finder` (haiku, read-only) — resolves vague requests to source path + USAGE.md path + relevant composable docs. No reads beyond locating.
- `component-worker` (opus) — picks the matching component, reads its USAGE.md and source, then implements (e.g. wires the component into a consumer app).
- `use-filter-onboarder` (opus) — integrates `useFilter` end-to-end: defines the group, binds pickers, builds chip bars, wires URL sync. Triggered by "add filters", "wire up useFilter", "filter bar with chips".

Routing/component agents hold the full component list in their prompt prefix for cache-friendly reuse. The onboarder holds the `useFilter` API + canonical patterns in its prefix for the same reason.
